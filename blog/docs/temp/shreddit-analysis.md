# Shreddit Repository Analysis

## Core Functionality
Reddit post/comment scraper → SQLite storage → web UI for viewing archived content.

## Architecture

### Stack
- **Queue**: BullMQ (Redis-backed job queue)
- **Scraper**: Puppeteer (headless Chrome)
- **Storage**: SQLite3
- **Server**: Express + Bull Board UI
- **Input**: Clipboard monitor OR urls.txt file

### Data Flow
```
Input Source → BullMQ Queue → Worker (Puppeteer) → SQLite → Express UI
```

### Key Components

1. **Clipboard Monitor** (optional, 3s interval)
   - Regex: `/^(?:https?:\/\/)?(?:(?:www|old|np|i)\.)?(?:reddit\.com|redd\.it)\/[^\s?#]+(?:[^\s]*)?$/i`
   - Auto-enqueues Reddit URLs from clipboard

2. **URL File Processor**
   - Reads `urls.txt` (one URL per line)
   - Supports `.json` listing URLs (paginated subreddit scraping)
   - Supports direct post URLs

3. **Puppeteer Worker**
   - Scrapes: `shreddit-post` → title, content (paragraphs)
   - Scrapes: `shreddit-comment` → recursive comment tree (thingId, author, content, replies)
   - Stores hierarchical comment structure via `parent_thingId`

4. **SQLite Schema**
   ```sql
   posts: id, url (UNIQUE), title, content, created_at
   comments: id, thingId, post_id, parent_thingId, author, content, created_at
   ```

5. **Web UI** (Tailwind CSS)
   - `/posts` → list view
   - `/posts/:id` → post + threaded comments
   - `/admin/queues` → Bull Board (job monitoring)

## Integration Opportunities for SiteBoy

### 1. Data Analysis Tool (Primary Use Case)
**Purpose**: Visualise Reddit discourse patterns, sentiment, thread depth, user engagement.

**Implementation Path**:
- Create `RedditAnalysisTool` extending `ToolBase`
- Import Shreddit's SQLite DB (read-only)
- Visualisations:
  - Comment tree depth heatmap (canvas)
  - Author participation graph (force-directed network)
  - Temporal activity timeline
  - Keyword frequency analysis
  - Sentiment distribution (if NLP added)

**Architecture Compliance**:
- Tool: `assets/js/tools/reddit-analysis-tool.js`
- Algorithms: `assets/js/shared/algorithms/graph-layout.js`, `text-analysis.js`
- Components: Use `SpecializedComponents` (Chart, CanvasWidget)
- No DOM manipulation (ComponentLibrary only)
- VGA palette for all visualisations

### 2. Content Archive Browser
**Purpose**: Browse/search archived Reddit content within SiteBoy UI.

**Implementation**:
- JSON page: `/reddit-archive`
- Blocks: SearchBar, PostList (Grid), CommentTree (custom component)
- SQLite query via backend API or direct DB read
- Render via `ComponentLibrary` components only

### 3. Data Collection Backend (Separate Process)
**Purpose**: Run Shreddit as background service, SiteBoy reads results.

**Integration**:
- Keep Shreddit as standalone Node process
- SiteBoy reads `data.db` (read-only mode)
- No code merge; clean separation of concerns

## Technical Considerations

### Dependencies Not in SiteBoy
- `bullmq`, `@bull-board/*` (Redis queue system)
- `puppeteer` (headless browser)
- `sqlite3`, `sqlite` (database)
- `clipboardy` (clipboard access)

### Adaptation Required
1. **Remove Express UI** → Use SiteBoy's router/ComponentLibrary
2. **Remove Puppeteer** → Keep as separate service OR remove (use pre-scraped DB)
3. **Remove BullMQ** → Not needed if using pre-scraped data
4. **Keep SQLite** → Read-only queries for analysis

### File Ownership Mapping
- **Data queries** → New file: `assets/js/core/data-foundation.js` (SQLite abstraction)
- **Graph algorithms** → `assets/js/shared/algorithms/graph-layout.js`
- **Text analysis** → `assets/js/shared/algorithms/text-analysis.js`
- **Tool UI** → `assets/js/tools/reddit-analysis-tool.js` (extends ToolBase)
- **Visualisation components** → Extend `SpecializedComponents`

## Implementation: CLI Tool in `/tools` Folder

**Status**: ✅ COMPLETE

### Location
`tools/shreddit/` - Backend utility for agent use (NOT integrated into static site)

### Architecture
- **Standalone Node.js CLI script** (`scrape.js`)
- **No web UI, no Bull queue, no clipboard monitoring**
- **Simple command-line interface**: `node scrape.js <url>`
- **Triple output**: SQLite DB + JSON + Markdown

### Usage Pattern
```bash
# Agent receives instruction:
"Using Shreddit, get this post: https://reddit.com/r/rust/comments/abc/"

# Agent executes:
cd tools/shreddit && node scrape.js <url>

# Agent reads output:
output/YYYY-MM-DDTHH-MM-SS_post-title.json
# or queries SQLite for historical data

# Agent processes further:
- Sentiment analysis
- Comment tree visualization
- Author statistics
- Content extraction
```

### Output Formats
1. **SQLite** (`shreddit.db`) - Persistent storage, queryable history
2. **JSON** - Structured data for programmatic analysis
3. **Markdown** - Human-readable with nested comments

### Data Structure
```javascript
{
  url, title, content,
  comments: [{ thingId, author, content, replies: [...] }],
  stats: { top_level_comments, total_comments, max_depth },
  scraped_at
}
```

### Future Integration (Optional)
If needed later, could build SiteBoy tool to visualize historical scrapes:
- Read `tools/shreddit/shreddit.db`
- Create `RedditAnalysisTool` with ComponentLibrary
- Visualize comment trees, author networks, temporal patterns
- All within VGA/mono aesthetic using existing foundations

## Code Reuse Strategy

### DO Reuse
- SQLite query patterns (adapt to data-foundation.js)
- Comment tree reconstruction logic (functional algorithm)
- Hierarchical data structure (nodeMap pattern)

### DO NOT Reuse
- Express routes (use SiteBoy router)
- Puppeteer scraping (keep separate OR remove)
- Bull Board UI (use SiteBoy ComponentLibrary)
- Tailwind HTML generation (use ComponentLibrary)

## VGA Palette Mapping
Reddit UI → SiteBoy VGA:
- Upvote orange → `var(--vga-orange)` or `#ff5500` → **FORBIDDEN** → Use `#ff0000` (VGA red)
- Downvote blue → `#0000ff` (VGA blue)
- Background slate → `#c0c0c0` (VGA silver) or `#ffffff` (white)
- Text → `#000000` (black) or `#808080` (grey)
- Borders → `#808080` (grey)

## Conclusion
Shreddit provides valuable Reddit archival capability. Best integration: **separate scraper process + SiteBoy read-only analysis tool**. Maintains architectural purity while enabling powerful discourse analysis visualisations within SiteBoy's VGA/mono aesthetic.

