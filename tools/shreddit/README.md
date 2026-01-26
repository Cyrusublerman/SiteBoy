# Shreddit CLI

Reddit post/comment scraper → SQLite + JSON/Markdown output.

## Install
```bash
cd tools/shreddit
npm install
```

## Usage
```bash
# Basic (saves both JSON and Markdown)
node scrape.js https://reddit.com/r/programming/comments/abc123/

# JSON only
node scrape.js <url> --json

# Markdown only
node scrape.js <url> --markdown

# Custom output directory
node scrape.js <url> --output ./data
```

## Output
- **SQLite**: `shreddit.db` (persistent storage, query historical scrapes)
- **JSON**: `output/YYYY-MM-DDTHH-MM-SS_post-title.json`
- **Markdown**: `output/YYYY-MM-DDTHH-MM-SS_post-title.md`

## Data Structure
```javascript
{
  url: string,
  title: string,
  content: string,
  comments: [
    {
      thingId: string,
      author: string,
      content: string,
      replies: [ /* recursive */ ]
    }
  ],
  scraped_at: ISO8601,
  stats: {
    top_level_comments: number,
    total_comments: number,
    max_depth: number
  }
}
```

## Agent Usage
```
"Using Shreddit, scrape https://reddit.com/r/rust/comments/xyz/ and analyze comment sentiment"
```

Agent executes:
1. `cd tools/shreddit && node scrape.js <url> --json`
2. Reads output JSON
3. Processes with analysis tools

## SQLite Schema
```sql
posts: id, url (UNIQUE), title, content, data_json, scraped_at
comments: id, thing_id, post_id, parent_thing_id, author, content, scraped_at
```

## Query Examples
```bash
# List all scraped posts
sqlite3 tools/shreddit/shreddit.db "SELECT id, title, scraped_at FROM posts;"

# Get post with comments
sqlite3 tools/shreddit/shreddit.db "SELECT data_json FROM posts WHERE url LIKE '%abc123%';" | jq .

# Comment count by author
sqlite3 tools/shreddit/shreddit.db "SELECT author, COUNT(*) as count FROM comments GROUP BY author ORDER BY count DESC LIMIT 10;"
```

## Notes
- Requires headless Chrome (Puppeteer)
- Reddit rate limiting: ~1 post/3s recommended
- Comment depth preserved via `parent_thing_id` hierarchy
- Markdown output uses 2-space indentation per nesting level




