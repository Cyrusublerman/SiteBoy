# Shreddit Agent Workflow Examples

## Basic Scrape
```
User: "Using Shreddit, get this post: https://reddit.com/r/rust/comments/abc123/"

Agent:
1. cd tools/shreddit && node scrape.js https://reddit.com/r/rust/comments/abc123/
2. Output: ./output/YYYY-MM-DDTHH-MM-SS_post-title.json
3. Confirmation: "Scraped post 'Why Rust is Great' - 47 comments, 5 levels deep"
```

## Scrape + Analysis
```
User: "Get the top post from r/programming and analyze comment sentiment"

Agent:
1. node scrape.js <url> --json --output ./temp
2. Read JSON: ./temp/*.json
3. Extract all comment.content strings
4. Run sentiment analysis (external tool/API)
5. Report: "67% positive, 23% neutral, 10% negative"
```

## Scrape Multiple Posts
```
User: "Scrape these three posts and compare discussion depth"

Agent:
1. For each URL:
   - node scrape.js <url>
   - Extract stats.max_depth and stats.total_comments
2. Report:
   - Post A: 234 comments, 8 levels
   - Post B: 89 comments, 4 levels
   - Post C: 512 comments, 12 levels
```

## Query Historical Scrapes
```
User: "What posts have we scraped about Rust?"

Agent:
sqlite3 tools/shreddit/shreddit.db "SELECT id, title, url, scraped_at FROM posts WHERE title LIKE '%Rust%' OR url LIKE '%/r/rust/%';"
```

## Extract Author Statistics
```
User: "Who are the most active commenters in our scraped data?"

Agent:
sqlite3 tools/shreddit/shreddit.db "SELECT author, COUNT(*) as comments FROM comments GROUP BY author ORDER BY comments DESC LIMIT 10;"
```

## Comment Tree Analysis
```
User: "Scrape this thread and visualize the comment tree structure"

Agent:
1. node scrape.js <url> --json
2. Read JSON comments array
3. Build tree visualization:
   - Parse recursive replies
   - Calculate branch statistics
   - Identify longest thread chains
   - Output: ASCII tree or graph data
```

## Content Analysis
```
User: "Get this AskReddit thread and find the most upvoted advice"

Agent:
1. node scrape.js <url>
2. Parse comments for patterns (keywords, length, depth)
3. Note: Upvote counts NOT scraped (requires API)
4. Alternative: Analyze by comment length/depth as proxy
```

## Data Export for External Tools
```
User: "Export all scraped Rust discussions to CSV for analysis in Excel"

Agent:
1. Query SQLite:
   sqlite3 -header -csv tools/shreddit/shreddit.db "SELECT * FROM posts WHERE title LIKE '%rust%';" > rust_posts.csv
   sqlite3 -header -csv tools/shreddit/shreddit.db "SELECT * FROM comments WHERE post_id IN (SELECT id FROM posts WHERE title LIKE '%rust%');" > rust_comments.csv
2. Output: Two CSV files ready for Excel
```

## Markdown Output for Documentation
```
User: "Create a documentation page from this Reddit discussion"

Agent:
1. node scrape.js <url> --markdown
2. Output: Clean Markdown with hierarchical comments
3. Move to docs: cp output/*.md blog/docs/research/
4. Edit frontmatter as needed
```



