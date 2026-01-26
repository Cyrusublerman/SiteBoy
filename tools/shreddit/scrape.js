#!/usr/bin/env node

const puppeteer = require('puppeteer');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const fs = require('fs').promises;
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const url = args[0];
const outputFormat = args.includes('--json') ? 'json' : args.includes('--markdown') ? 'markdown' : 'both';
const outputDir = args.includes('--output') ? args[args.indexOf('--output') + 1] : './output';

if (!url) {
  console.error('Usage: node scrape.js <reddit-url> [--json|--markdown] [--output <dir>]');
  console.error('Example: node scrape.js https://reddit.com/r/programming/comments/abc123/');
  process.exit(1);
}

// Validate Reddit URL
const redditUrlRegex = /^(?:https?:\/\/)?(?:(?:www|old|np|i)\.)?(?:reddit\.com|redd\.it)\/[^\s?#]+(?:[^\s]*)?$/i;
if (!redditUrlRegex.test(url)) {
  console.error('Error: Invalid Reddit URL');
  process.exit(1);
}

let db;

async function initDatabase() {
  db = await open({
    filename: path.join(__dirname, 'shreddit.db'),
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT UNIQUE,
      title TEXT,
      content TEXT,
      scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      data_json TEXT
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      thing_id TEXT,
      post_id INTEGER,
      parent_thing_id TEXT,
      author TEXT,
      content TEXT,
      scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(post_id) REFERENCES posts(id)
    );
  `);

  console.log('✓ Database initialized');
}

async function scrapeRedditPost(url) {
  console.log(`\n🔍 Scraping: ${url}\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  let page;
  try {
    page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36');
    
    console.log('⏳ Loading page...');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for main post area
    await page.waitForSelector('shreddit-post, .shreddit-post, #shreddit-post, h1', { timeout: 10000 }).catch(() => {});

    // Extract title
    console.log('📝 Extracting title...');
    const title = await page.evaluate(() => {
      const el = document.querySelector('shreddit-post > h1') || 
                 document.querySelector('shreddit-post h1') || 
                 document.querySelector('h1');
      return el ? el.innerText.trim() : null;
    });

    // Extract content
    console.log('📄 Extracting content...');
    const content = await page.evaluate(() => {
      const selectors = [
        'shreddit-post > shreddit-post-text-boady > text-neutral-content > div > div',
        'shreddit-post shreddit-post-text-boady text-neutral-content div > div',
        'shreddit-post text-neutral-content div > div',
        'shreddit-post > .shreddit-post-text-body',
        'shreddit-post'
      ];

      let container = null;
      for (const sel of selectors) {
        try {
          const found = document.querySelector(sel);
          if (found) { container = found; break; }
        } catch (e) {}
      }

      if (!container) {
        const sp = document.querySelector('shreddit-post');
        if (sp) {
          const tryDiv = sp.querySelector('div');
          container = tryDiv || sp;
        } else {
          container = document.body;
        }
      }

      const paragraphs = Array.from(container.querySelectorAll('p'));
      if (paragraphs.length === 0) {
        const txt = container.innerText || '';
        return txt.trim();
      }
      const texts = paragraphs.map(p => p.innerText.trim()).filter(Boolean);
      return texts.join('\n\n');
    });

    // Extract comments
    console.log('💬 Extracting comments...');
    const comments = await page.evaluate(() => {
      function extractFromCommentElement(elem) {
        const thingId = elem.getAttribute('thingId') || elem.getAttribute('data-thingid') || null;
        const author = elem.getAttribute('author') || elem.getAttribute('data-author') || null;

        let contentText = '';
        const mdDiv = elem.querySelector('div.md') || 
                      elem.querySelector('[slot="comment"] .md') || 
                      elem.querySelector('.md.text-14-scalable');
        if (mdDiv) {
          const ps = Array.from(mdDiv.querySelectorAll('p')).map(p => p.innerText.trim()).filter(Boolean);
          contentText = ps.join('\n\n');
        } else {
          const ps = Array.from(elem.querySelectorAll('p')).map(p => p.innerText.trim()).filter(Boolean);
          contentText = ps.join('\n\n') || (elem.innerText || '').trim();
        }

        const childComments = Array.from(elem.querySelectorAll(':scope > shreddit-comment, :scope > .shreddit-comment, shreddit-comment')).filter(c => c !== elem);
        const replies = childComments.map(c => extractFromCommentElement(c));

        return {
          thingId,
          author,
          content: contentText,
          replies,
        };
      }

      const topLevel = Array.from(document.querySelectorAll('shreddit-comment, .shreddit-comment')).filter(el => {
        let parent = el.parentElement;
        while (parent) {
          if (parent.matches && (parent.matches('shreddit-comment') || parent.matches('.shreddit-comment'))) return false;
          parent = parent.parentElement;
        }
        return true;
      });

      const commentsToProcess = topLevel.length ? topLevel : Array.from(document.querySelectorAll('shreddit-comment, .shreddit-comment'));
      const extracted = commentsToProcess.map(c => extractFromCommentElement(c));
      return extracted;
    });

    console.log(`✓ Found ${comments.length} top-level comments\n`);

    const result = {
      url,
      title,
      content,
      comments,
      scraped_at: new Date().toISOString(),
      stats: {
        top_level_comments: comments.length,
        total_comments: countTotalComments(comments),
        max_depth: getMaxDepth(comments),
      }
    };

    // Save to database
    await saveToDatabase(result);

    // Save to output files
    await saveToFiles(result);

    return result;

  } catch (err) {
    console.error(`\n❌ Error: ${err.message}`);
    throw err;
  } finally {
    if (page) await page.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
  }
}

function countTotalComments(comments) {
  let count = comments.length;
  for (const comment of comments) {
    if (comment.replies && comment.replies.length) {
      count += countTotalComments(comment.replies);
    }
  }
  return count;
}

function getMaxDepth(comments, currentDepth = 1) {
  if (!comments || comments.length === 0) return currentDepth - 1;
  let maxDepth = currentDepth;
  for (const comment of comments) {
    if (comment.replies && comment.replies.length) {
      const depth = getMaxDepth(comment.replies, currentDepth + 1);
      maxDepth = Math.max(maxDepth, depth);
    }
  }
  return maxDepth;
}

async function saveToDatabase(result) {
  console.log('💾 Saving to database...');
  
  // Check if post exists
  const existing = await db.get('SELECT id FROM posts WHERE url = ?', result.url);
  let postId;

  if (existing) {
    postId = existing.id;
    await db.run(
      'UPDATE posts SET title = ?, content = ?, data_json = ?, scraped_at = CURRENT_TIMESTAMP WHERE id = ?',
      result.title,
      result.content,
      JSON.stringify(result),
      postId
    );
    console.log(`✓ Updated post ID ${postId}`);
  } else {
    const res = await db.run(
      'INSERT INTO posts (url, title, content, data_json) VALUES (?, ?, ?, ?)',
      result.url,
      result.title,
      result.content,
      JSON.stringify(result)
    );
    postId = res.lastID;
    console.log(`✓ Saved new post ID ${postId}`);
  }

  // Save comments recursively
  await db.run('DELETE FROM comments WHERE post_id = ?', postId);
  await insertCommentsTree(result.comments, postId, null);
  console.log(`✓ Saved ${result.stats.total_comments} comments`);
}

async function insertCommentsTree(items, postId, parentThingId = null) {
  for (const item of items) {
    if (!item || (!item.thingId && !item.content)) continue;
    
    try {
      await db.run(
        'INSERT INTO comments (thing_id, post_id, parent_thing_id, author, content) VALUES (?, ?, ?, ?, ?)',
        item.thingId,
        postId,
        parentThingId,
        item.author,
        item.content
      );
    } catch (err) {
      console.error('DB error inserting comment:', err.message);
    }

    if (item.replies && item.replies.length) {
      await insertCommentsTree(item.replies, postId, item.thingId || parentThingId);
    }
  }
}

async function saveToFiles(result) {
  await fs.mkdir(outputDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const sanitizedTitle = (result.title || 'untitled')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 50);
  const basename = `${timestamp}_${sanitizedTitle}`;

  // Save JSON
  if (outputFormat === 'json' || outputFormat === 'both') {
    const jsonPath = path.join(outputDir, `${basename}.json`);
    await fs.writeFile(jsonPath, JSON.stringify(result, null, 2));
    console.log(`✓ Saved JSON: ${jsonPath}`);
  }

  // Save Markdown
  if (outputFormat === 'markdown' || outputFormat === 'both') {
    const mdPath = path.join(outputDir, `${basename}.md`);
    const markdown = convertToMarkdown(result);
    await fs.writeFile(mdPath, markdown);
    console.log(`✓ Saved Markdown: ${mdPath}`);
  }
}

function convertToMarkdown(result) {
  let md = `# ${result.title || 'Untitled'}\n\n`;
  md += `**Source:** ${result.url}\n`;
  md += `**Scraped:** ${result.scraped_at}\n`;
  md += `**Stats:** ${result.stats.total_comments} comments, ${result.stats.max_depth} levels deep\n\n`;
  md += `---\n\n`;

  if (result.content) {
    md += `## Content\n\n${result.content}\n\n`;
  }

  md += `## Comments\n\n`;
  md += renderCommentsMarkdown(result.comments);

  return md;
}

function renderCommentsMarkdown(comments, depth = 0) {
  if (!comments || comments.length === 0) return '';
  
  let md = '';
  const indent = '  '.repeat(depth);

  for (const comment of comments) {
    md += `${indent}- **${comment.author || 'unknown'}**\n`;
    if (comment.content) {
      const contentLines = comment.content.split('\n');
      contentLines.forEach(line => {
        md += `${indent}  ${line}\n`;
      });
    }
    md += '\n';

    if (comment.replies && comment.replies.length) {
      md += renderCommentsMarkdown(comment.replies, depth + 1);
    }
  }

  return md;
}

// Main execution
(async () => {
  try {
    await initDatabase();
    const result = await scrapeRedditPost(url);
    
    console.log('\n📊 Summary:');
    console.log(`   Title: ${result.title}`);
    console.log(`   Comments: ${result.stats.total_comments} (${result.stats.top_level_comments} top-level)`);
    console.log(`   Max depth: ${result.stats.max_depth}`);
    console.log('\n✅ Complete!\n');
    
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Fatal error:', err.message);
    process.exit(1);
  }
})();




