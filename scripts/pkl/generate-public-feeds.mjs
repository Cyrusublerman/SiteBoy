#!/usr/bin/env node

import { gunzipSync } from 'node:zlib';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

function xmlEscape(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function cdata(value) {
  return String(value ?? '').replaceAll(']]>', ']]]]><![CDATA[>');
}

function siteBaseUrl() {
  const explicit = process.env.SITEBOY_PUBLIC_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, '');
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, '').replace(/\/$/, '')}`;
  return 'http://localhost:5173';
}

function publicationDate(publication) {
  const value = publication.created || publication.updated || '1970-01-01';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

function feedText(publication, graph) {
  return String(publication.body ?? '').replace(/^::figure\[([^\]]+)\]\s*$/gm, (_match, uid) => {
    const figure = graph.objects.find((object) => object.uid === uid && object.object_type === 'figure');
    return figure ? `[Figure: ${figure.title}](${figure.route})` : `[Unavailable figure: ${uid}]`;
  });
}

async function loadGraph(inputPath) {
  const resolved = path.resolve(inputPath ?? 'public/generated/pkl');
  const info = await stat(resolved);
  if (info.isFile()) {
    return JSON.parse(await readFile(resolved, 'utf8'));
  }

  const manifest = JSON.parse(await readFile(path.join(resolved, 'manifest.json'), 'utf8'));
  const graphFile = manifest.graph_file || 'public-graph.json';
  const encoding = manifest.graph_encoding || 'json';
  const raw = await readFile(path.join(resolved, graphFile));
  if (encoding === 'json') return JSON.parse(raw.toString('utf8'));
  if (encoding === 'gzip-base64') {
    const compressed = Buffer.from(raw.toString('ascii').replace(/\s+/g, ''), 'base64');
    return JSON.parse(gunzipSync(compressed).toString('utf8'));
  }
  throw new Error(`Unsupported PKL graph encoding: ${encoding}`);
}

async function main() {
  const graphInput = process.argv[2] ?? 'public/generated/pkl';
  const outputDirectory = path.resolve(process.argv[3] ?? 'public');
  const graph = await loadGraph(graphInput);
  const baseUrl = siteBaseUrl();
  const publications = graph.objects
    .filter((object) => object.object_type === 'publication')
    .sort((a, b) => publicationDate(b) - publicationDate(a));

  const title = 'Alexander Einoder — Blog';
  const description = 'Publications generated from the Personal Knowledge Library.';
  const blogUrl = `${baseUrl}/blog`;
  const generated = graph.generated_at || new Date().toISOString();

  const rssItems = publications.map((publication) => {
    const url = `${baseUrl}${publication.route}`;
    return `    <item>
      <title>${xmlEscape(publication.title)}</title>
      <link>${xmlEscape(url)}</link>
      <guid isPermaLink="true">${xmlEscape(url)}</guid>
      <pubDate>${publicationDate(publication).toUTCString()}</pubDate>
      <description><![CDATA[${cdata(publication.summary || '')}]]></description>
      <content:encoded><![CDATA[${cdata(feedText(publication, graph))}]]></content:encoded>
    </item>`;
  }).join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${xmlEscape(title)}</title>
    <link>${xmlEscape(blogUrl)}</link>
    <description>${xmlEscape(description)}</description>
    <language>en-AU</language>
    <lastBuildDate>${new Date(generated).toUTCString()}</lastBuildDate>
${rssItems}
  </channel>
</rss>
`;

  const atomEntries = publications.map((publication) => {
    const url = `${baseUrl}${publication.route}`;
    const updated = new Date(publication.updated || publication.created || generated).toISOString();
    const published = publicationDate(publication).toISOString();
    return `  <entry>
    <title>${xmlEscape(publication.title)}</title>
    <id>urn:pkl:${xmlEscape(publication.uid)}:${publication.public_revision}</id>
    <link href="${xmlEscape(url)}"/>
    <published>${published}</published>
    <updated>${updated}</updated>
    <summary type="text">${xmlEscape(publication.summary || '')}</summary>
    <content type="text">${xmlEscape(feedText(publication, graph))}</content>
  </entry>`;
  }).join('\n');

  const atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${xmlEscape(title)}</title>
  <id>${xmlEscape(blogUrl)}</id>
  <link href="${xmlEscape(blogUrl)}"/>
  <link href="${xmlEscape(`${baseUrl}/atom.xml`)}" rel="self" type="application/atom+xml"/>
  <updated>${new Date(generated).toISOString()}</updated>
${atomEntries}
</feed>
`;

  const jsonFeed = {
    version: 'https://jsonfeed.org/version/1.1',
    title,
    home_page_url: blogUrl,
    feed_url: `${baseUrl}/feed.json`,
    description,
    language: 'en-AU',
    authors: [{ name: 'Alexander Einoder' }],
    items: publications.map((publication) => ({
      id: `urn:pkl:${publication.uid}:${publication.public_revision}`,
      url: `${baseUrl}${publication.route}`,
      title: publication.title,
      summary: publication.summary || undefined,
      content_text: feedText(publication, graph),
      date_published: publicationDate(publication).toISOString(),
      date_modified: new Date(publication.updated || publication.created || generated).toISOString(),
      authors: [{ name: publication.author || 'Alexander Einoder' }],
      tags: publication.tags ?? []
    }))
  };

  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    writeFile(path.join(outputDirectory, 'rss.xml'), rss, 'utf8'),
    writeFile(path.join(outputDirectory, 'atom.xml'), atom, 'utf8'),
    writeFile(path.join(outputDirectory, 'feed.json'), `${JSON.stringify(jsonFeed, null, 2)}\n`, 'utf8')
  ]);

  console.log(JSON.stringify({
    ok: true,
    publications: publications.length,
    baseUrl,
    outputs: ['rss.xml', 'atom.xml', 'feed.json']
  }));
}

main().catch((error) => {
  console.error(error.stack ?? error.message ?? String(error));
  process.exitCode = 1;
});
