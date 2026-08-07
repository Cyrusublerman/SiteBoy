import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import {
  BLOCK_WARNING_CODES,
  formatBlockWarning,
  parseBlockDocument,
  stringifyBlockDocument,
} from '../assets/js/shared/algorithms/markup/block-parser.js';
import {
  parseAndSanitiseBlocks,
  sanitiseBlockDocument,
  sanitiseBlockProps,
} from '../assets/js/shared/algorithms/markup/block-sanitiser.js';
import {
  ALLOWED_ELEMENTS,
  escapeHtml,
  sanitiseHtml,
  sanitiseUrl,
  stripHtml,
} from '../assets/js/shared/algorithms/markup/html-sanitiser.js';
import {
  BLOCK_TYPE_NAMES,
  canonicaliseBlockType,
  isKnownBlockType,
} from '../assets/js/shared/algorithms/markup/block-types.js';

/**
 * Parse HTML in a brand-new document. Reusing one body via repeated
 * `innerHTML` assignments has produced false-positive attribute findings.
 *
 * @param {string} html - Fragment to parse.
 * @returns {Document} Fresh document whose body holds `html`.
 */
const parseFresh = (html) => new JSDOM(
  `<!DOCTYPE html><html><body>${html}</body></html>`,
  { url: 'https://example.test/' },
).window.document;

/**
 * Collect executable / denied sinks from a fragment, using a fresh DOM.
 *
 * @param {string} html - Candidate sanitiser output.
 * @returns {string[]} Finding labels; empty when clean.
 */
const auditFreshDom = (html) => {
  const document_ = parseFresh(html);
  const findings = [];
  for (const element of document_.body.querySelectorAll('*')) {
    if (!ALLOWED_ELEMENTS.has(element.localName)
      && ['script', 'style', 'iframe', 'object', 'embed', 'form', 'svg', 'math',
        'link', 'meta', 'base', 'template', 'frame', 'frameset'].includes(element.localName)) {
      findings.push(`tag:${element.localName}`);
    }
    for (const attribute of [...element.attributes]) {
      const name = attribute.name.toLowerCase();
      if (name.startsWith('on')) findings.push(`on:${element.localName}[${attribute.name}]`);
      if (name === 'style') findings.push(`style:${element.localName}`);
      const value = attribute.value.replace(/[\u0000-\u0020]+/g, '').toLowerCase();
      if (/^(javascript|vbscript|data):/.test(value)) {
        findings.push(`url:${element.localName}[${attribute.name}]`);
      }
    }
  }
  return findings;
};

const block = (type, payload) => `:::block ${type}\n${JSON.stringify(payload, null, 2)}\n:::`;

const nodesOfKind = (document, kind) => document.nodes.filter(node => node.kind === kind);

const WELL_FORMED = {
  gallery: { slug: 'photography/large-format', title: 'Large format', limit: 24 },
  carousel: { slug: 'studio-tests', items: [{ src: '/assets/img/a.jpg', alt: 'A' }] },
  collapsible: { title: 'Method', body: 'Step one & step two.', open: false },
  iframe: { src: '/embeds/plot.html', title: 'Plot', width: 640, height: 480, sandbox: ['allow-scripts'] },
  p5: { sketch: 'assets/js/sketches/flow.js', title: 'Flow', controlled: true },
  algorithm: {
    module: 'assets/js/shared/algorithms/noise/noise-functions.js',
    export: 'fbm2D',
    params: { octaves: 4, seed: 'alpha', warp: true },
  },
  graph: { variant: 'bar', data: [{ label: 'A', value: 3 }, { label: 'B', value: 5 }] },
  'vga-grid': { columns: 2, rows: 2, cells: [0, 9, 15, 1] },
};

describe(':::block parser — well-formed input', () => {
  it('registers exactly the specified block types', () => {
    expect(BLOCK_TYPE_NAMES).toEqual([
      'algorithm', 'carousel', 'collapsible', 'gallery', 'graph', 'iframe', 'p5', 'vga-grid',
    ]);
  });

  it('parses every specified block type into a block node with its JSON payload', () => {
    for (const [type, props] of Object.entries(WELL_FORMED)) {
      const document = parseBlockDocument(`Intro.\n\n${block(type, props)}\n\nOutro.`);
      const blocks = nodesOfKind(document, 'block');
      expect(document.warnings).toEqual([]);
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe(type);
      expect(blocks[0].props).toEqual(props);
    }
  });

  it('preserves prose around blocks in source order', () => {
    const document = parseBlockDocument(`before\n${block('gallery', WELL_FORMED.gallery)}\nafter`);
    expect(document.nodes.map(node => node.kind)).toEqual(['text', 'block', 'text']);
    expect(document.nodes[0].value).toBe('before');
    expect(document.nodes[2].value).toBe('after');
  });

  it('accepts an empty payload as an empty object', () => {
    const document = parseBlockDocument(':::block gallery\n:::');
    expect(document.warnings).toEqual([]);
    expect(document.nodes[0].props).toEqual({});
  });

  it('resolves the plan\'s human-facing type names through aliases', () => {
    expect(canonicaliseBlockType('GalleryEmbed')).toBe('gallery');
    expect(canonicaliseBlockType('Dropdown section')).toBe('collapsible');
    expect(canonicaliseBlockType('VGA grid')).toBe('vga-grid');
    expect(canonicaliseBlockType('P5Embed')).toBe('p5');
    expect(isKnownBlockType('nope')).toBe(false);
  });

  it('round-trips a document through stringify', () => {
    const source = `intro\n${block('graph', WELL_FORMED.graph)}\noutro`;
    expect(stringifyBlockDocument(parseBlockDocument(source))).toBe(source);
  });

  it('tracks 1-based line numbers for blocks', () => {
    const document = parseBlockDocument(`a\nb\n:::block gallery\n{"slug":"x"}\n:::`);
    const [node] = nodesOfKind(document, 'block');
    expect(node.line).toBe(3);
    expect(node.endLine).toBe(5);
  });
});

describe(':::block parser — nesting', () => {
  it('does not treat a fence inside a markdown code block as a directive', () => {
    const source = '```\n:::block gallery\n{"slug":"x"}\n:::\n```';
    const document = parseBlockDocument(source);
    expect(nodesOfKind(document, 'block')).toEqual([]);
    expect(document.warnings).toEqual([]);
    expect(document.nodes[0].value).toBe(source);
  });

  it('carries a nested block encoded inside a JSON string without opening a fence', () => {
    const nested = ':::block gallery\n{"slug":"inner"}\n:::';
    const document = parseBlockDocument(block('collapsible', { title: 'T', body: nested }));
    const blocks = nodesOfKind(document, 'block');
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe('collapsible');
    expect(blocks[0].props.body).toBe(nested);
  });

  it('treats a second opening fence before a close as payload, not as nesting', () => {
    const document = parseBlockDocument(':::block gallery\n:::block graph\n{"variant":"bar"}\n:::');
    expect(nodesOfKind(document, 'block')).toEqual([]);
    expect(document.warnings[0].code).toBe(BLOCK_WARNING_CODES.MALFORMED_JSON);
  });
});

describe(':::block parser — malformed input never throws', () => {
  const hostileSources = [
    '',
    ':::',
    ':::block',
    ':::block \n:::',
    ':::block gallery',
    ':::block gallery\n{',
    ':::block gallery\n[1,2,3]\n:::',
    ':::block gallery\n"a string"\n:::',
    ':::block gallery\nnull\n:::',
    ':::block <script>\n{}\n:::',
    ':::block gallery slug="x"\n{}\n:::',
    ':::block unheard-of\n{}\n:::',
    ':::block gallery\n{}\n:::\n:::\n:::',
    '```\n:::block gallery',
  ];

  it.each(hostileSources)('degrades without throwing: %j', (source) => {
    expect(() => parseBlockDocument(source)).not.toThrow();
    const document = parseBlockDocument(source);
    expect(document.version).toBe(1);
    expect(Array.isArray(document.nodes)).toBe(true);
    expect(() => parseAndSanitiseBlocks(source)).not.toThrow();
  });

  it.each([null, undefined, 42, {}, [], Symbol('x')])('returns an empty document for %j', (input) => {
    expect(parseBlockDocument(input)).toEqual({ version: 1, nodes: [], warnings: [] });
  });

  it('reports an unterminated block and preserves its source', () => {
    const document = parseBlockDocument('lead\n:::block gallery\n{"slug":"x"}');
    const [warning] = document.warnings;
    expect(warning.code).toBe(BLOCK_WARNING_CODES.UNTERMINATED_BLOCK);
    expect(warning.line).toBe(2);
    expect(warning.raw).toBe(':::block gallery\n{"slug":"x"}');
    expect(nodesOfKind(document, 'block')).toEqual([]);
  });

  it('reports invalid JSON without discarding the source', () => {
    const document = parseBlockDocument(':::block graph\n{variant: bar}\n:::');
    expect(document.warnings[0].code).toBe(BLOCK_WARNING_CODES.MALFORMED_JSON);
    expect(document.warnings[0].raw).toContain('{variant: bar}');
  });

  it('rejects a non-object JSON payload', () => {
    expect(parseBlockDocument(':::block graph\n[]\n:::').warnings[0].code)
      .toBe(BLOCK_WARNING_CODES.PAYLOAD_NOT_OBJECT);
  });

  it('reports a missing type', () => {
    expect(parseBlockDocument(':::block\n{}\n:::').warnings[0].code)
      .toBe(BLOCK_WARNING_CODES.MISSING_TYPE);
  });

  it('rejects attribute syntax on the info line', () => {
    expect(parseBlockDocument(':::block iframe src="x"\n{}\n:::').warnings[0].code)
      .toBe(BLOCK_WARNING_CODES.UNEXPECTED_ATTRIBUTES);
  });

  it('rejects a type token containing markup characters', () => {
    expect(parseBlockDocument(':::block <img/>\n{}\n:::').warnings[0].code)
      .toBe(BLOCK_WARNING_CODES.MALFORMED_TYPE);
  });

  it('reports an unknown type and never emits it as a block', () => {
    const document = parseBlockDocument(':::block nope\n{"a":1}\n:::');
    expect(nodesOfKind(document, 'block')).toEqual([]);
    expect(document.warnings[0].code).toBe(BLOCK_WARNING_CODES.UNKNOWN_TYPE);
    expect(document.warnings[0].blockType).toBe('nope');
  });

  it('renders warnings as plain text with no markup characters', () => {
    const document = parseBlockDocument(':::block <b>\n{}\n:::');
    const text = formatBlockWarning(document.warnings[0]);
    expect(text).not.toMatch(/[<>&]/);
    expect(text).toContain('malformed-type');
  });

  it('recovers and keeps parsing after a malformed block', () => {
    const source = `:::block nope\n{}\n:::\n\n${block('gallery', WELL_FORMED.gallery)}`;
    const document = parseBlockDocument(source);
    expect(document.warnings).toHaveLength(1);
    expect(nodesOfKind(document, 'block')).toHaveLength(1);
  });
});

describe('block prop sanitiser — allow-list enforcement', () => {
  it('accepts every well-formed block and preserves its props', () => {
    for (const [type, props] of Object.entries(WELL_FORMED)) {
      const result = sanitiseBlockProps(type, props);
      expect(result.ok, `${type}: ${result.reason}`).toBe(true);
      expect(result.dropped).toEqual([]);
    }
  });

  it('drops props absent from the schema', () => {
    const result = sanitiseBlockProps('gallery', { slug: 'a', onclick: 'alert(1)', style: 'x' });
    expect(result.ok).toBe(true);
    expect(result.props).toEqual({ slug: 'a' });
    expect(result.dropped).toEqual(['onclick', 'style']);
  });

  it('rejects a block missing a required prop', () => {
    expect(sanitiseBlockProps('gallery', { title: 'x' }).ok).toBe(false);
    expect(sanitiseBlockProps('graph', { variant: 'bar' }).ok).toBe(false);
  });

  it('enforces requireAny groups', () => {
    expect(sanitiseBlockProps('carousel', { title: 'x' }).ok).toBe(false);
    expect(sanitiseBlockProps('carousel', { slug: 'x' }).ok).toBe(true);
  });

  it('rejects out-of-range numbers and non-integers', () => {
    expect(sanitiseBlockProps('vga-grid', { columns: 0, rows: 2, cells: [1] }).ok).toBe(false);
    expect(sanitiseBlockProps('vga-grid', { columns: 2.5, rows: 2, cells: [1] }).ok).toBe(false);
  });

  it('confines vga-grid cells to the sixteen palette indices', () => {
    const result = sanitiseBlockProps('vga-grid', { columns: 2, rows: 2, cells: [0, 15, 16, -1, 'ff0000'] });
    expect(result.props.cells).toEqual([0, 15]);
  });

  it('rejects path traversal and out-of-tree algorithm modules', () => {
    expect(sanitiseBlockProps('algorithm', { module: '../../etc/passwd', export: 'x' }).ok).toBe(false);
    expect(sanitiseBlockProps('algorithm', { module: 'assets/js/core/app.js', export: 'x' }).ok).toBe(false);
    expect(sanitiseBlockProps('algorithm', { module: 'https://evil.test/x.js', export: 'x' }).ok).toBe(false);
  });

  it('rejects a non-identifier algorithm export', () => {
    const module = 'assets/js/shared/algorithms/noise/noise-functions.js';
    expect(sanitiseBlockProps('algorithm', { module, export: 'fbm2D()' }).ok).toBe(false);
    expect(sanitiseBlockProps('algorithm', { module, export: 'a;b' }).ok).toBe(false);
  });

  it('keeps only identifier-keyed JSON primitives in algorithm params', () => {
    const result = sanitiseBlockProps('algorithm', {
      module: 'assets/js/shared/algorithms/noise/noise-functions.js',
      export: 'fbm2D',
      params: {
        ok: 1,
        'bad-key': 2,
        __proto__: { polluted: true },
        label: '<b>plain</b>',
        payload: '<script>alert(1)</script>',
        nested: { deep: 1 },
        list: [1, 2, 3],
      },
    });
    expect(Object.keys(result.props.params).sort()).toEqual(['label', 'list', 'ok', 'payload']);
    expect(result.props.params.label).toBe('plain');
    expect(result.props.params.payload).toBe('');
    expect(Object.prototype.hasOwnProperty.call(result.props.params, 'polluted')).toBe(false);
  });

  it('denies an absolute embed source when the host allow-list is empty', () => {
    const props = { src: 'https://evil.test/x', title: 'T' };
    expect(sanitiseBlockProps('iframe', props).ok).toBe(false);
  });

  it('accepts an allow-listed https embed host and denies every other', () => {
    const options = { embedHostAllowList: ['player.example.net'] };
    expect(sanitiseBlockProps('iframe', { src: 'https://player.example.net/v/1', title: 'T' }, options).ok).toBe(true);
    expect(sanitiseBlockProps('iframe', { src: 'http://player.example.net/v/1', title: 'T' }, options).ok).toBe(false);
    expect(sanitiseBlockProps('iframe', { src: 'https://player.example.net.evil.test/v', title: 'T' }, options).ok).toBe(false);
    expect(sanitiseBlockProps('iframe', { src: 'https://user@player.example.net/v', title: 'T' }, options).ok).toBe(false);
  });

  it('accepts a same-origin relative embed source', () => {
    expect(sanitiseBlockProps('iframe', { src: '/embeds/a.html', title: 'T' }).ok).toBe(true);
    expect(sanitiseBlockProps('iframe', { src: '//evil.test/a.html', title: 'T' }).ok).toBe(false);
  });

  it('removes allow-same-origin whenever allow-scripts survives', () => {
    const result = sanitiseBlockProps('iframe', {
      src: '/e.html',
      title: 'T',
      sandbox: ['allow-scripts', 'allow-same-origin', 'allow-everything'],
    });
    expect(result.props.sandbox).toEqual(['allow-scripts']);
  });

  it('strips markup from text and markdown props without escaping markdown text', () => {
    const result = sanitiseBlockProps('collapsible', {
      title: 'Hello <script>alert(1)</script> world',
      body: 'A & B <img src=x onerror=alert(1)> done',
    });
    expect(result.props.title).toBe('Hello  world');
    expect(result.props.body).toBe('A & B  done');
    expect(result.props.body).not.toContain('onerror');
  });

  it('rejects an unknown type', () => {
    expect(sanitiseBlockProps('nope', {}).ok).toBe(false);
    expect(sanitiseBlockProps('gallery', null).ok).toBe(false);
    expect(sanitiseBlockProps('gallery', ['slug']).ok).toBe(false);
  });

  it('converts a rejected block into a warning node rather than dropping it silently', () => {
    const document = sanitiseBlockDocument(parseBlockDocument(':::block gallery\n{"slug":"NOT A SLUG"}\n:::'));
    expect(document.nodes).toHaveLength(1);
    expect(document.nodes[0].kind).toBe('warning');
    expect(document.nodes[0].code).toBe(BLOCK_WARNING_CODES.INVALID_PROPS);
  });
});

describe('URL filter — scheme allow-list', () => {
  const denied = [
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    '  javascript:alert(1)',
    'java\tscript:alert(1)',
    'java\nscript:alert(1)',
    'java\u0000script:alert(1)',
    '&#106;avascript:alert(1)',
    '&#x6A;avascript:alert(1)',
    '&#0000106;avascript:alert(1)',
    'jav&#x0A;ascript:alert(1)',
    'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
    'data:image/svg+xml,<svg onload=alert(1)>',
    'vbscript:msgbox(1)',
    'file:///etc/passwd',
    'blob:https://example.test/uuid',
    'about:blank',
    '//evil.test/path',
    '\\\\evil.test\\share',
    'jAvAsCrIpT\u0009:alert(1)',
  ];

  it.each(denied)('denies %j', (url) => {
    expect(sanitiseUrl(url)).toBeNull();
  });

  const allowed = [
    'https://example.test/a?b=c#d',
    'http://example.test/a',
    'mailto:a@example.test',
    '/root/relative.png',
    './sibling.png',
    'plain/relative.png',
    '#anchor',
    '?query=1',
  ];

  it.each(allowed)('allows %j', (url) => {
    expect(sanitiseUrl(url)).not.toBeNull();
  });

  it('denies mailto when the position forbids it', () => {
    expect(sanitiseUrl('mailto:a@example.test', { allowMailto: false })).toBeNull();
  });

  it('rejects a non-string', () => {
    expect(sanitiseUrl(null)).toBeNull();
    expect(sanitiseUrl({ toString: () => 'https://ok.test' })).toBeNull();
  });
});

const hostileHtml = [
    '<script>alert(1)</script>',
    '<SCRIPT SRC=//evil.test/x.js></SCRIPT>',
    '<scr<script>ipt>alert(1)</script>',
    '<img src=x onerror=alert(1)>',
    '<img src="x" ONERROR="alert(1)">',
    '<img src=`x` onerror=alert(1)>',
    '<svg/onload=alert(1)>',
    '<svg><script>alert(1)</script></svg>',
    '<math><mtext><script>alert(1)</script></mtext></math>',
    '<iframe src="javascript:alert(1)"></iframe>',
    '<iframe srcdoc="<script>alert(1)</script>"></iframe>',
    '<object data="javascript:alert(1)"></object>',
    '<embed src="javascript:alert(1)">',
    '<a href="javascript:alert(1)">x</a>',
    '<a href="&#106;avascript:alert(1)">x</a>',
    '<a href="jav&#x09;ascript:alert(1)">x</a>',
    '<a href="data:text/html,<script>alert(1)</script>">x</a>',
    '<body onload=alert(1)>',
    '<style>@import "//evil.test/x.css";</style>',
    '<div style="background:url(javascript:alert(1))">x</div>',
    '<link rel=stylesheet href="//evil.test/x.css">',
    '<meta http-equiv="refresh" content="0;url=javascript:alert(1)">',
    '<base href="//evil.test/">',
    '<form action="javascript:alert(1)"><button formaction="javascript:alert(1)">x</button></form>',
    '<input autofocus onfocus=alert(1)>',
    '<textarea></textarea><script>alert(1)</script>',
    '<template><script>alert(1)</script></template>',
    '<noscript><script>alert(1)</script></noscript>',
    '<xmp><script>alert(1)</script></xmp>',
    '<!--<script>alert(1)</script>-->',
    '<![CDATA[<script>alert(1)</script>]]>',
    '<p onclick="alert(1)" onmouseover=alert(1)>x</p>',
    '<div data-x="1" id="y" class="z" style="color:red">x</div>',
    '<a href="/ok" target="_blank" onclick="alert(1)">x</a>',
    '<plaintext><script>alert(1)</script>',
    '<isindex action="javascript:alert(1)">',
    '<table background="javascript:alert(1)"><tr><td>x</td></tr></table>',
    '<video><source onerror=alert(1)></video>',
    '<audio src=x onerror=alert(1)>',
    '<marquee onstart=alert(1)>x</marquee>',
    '<a href="/ok"><script>alert(1)</script>text</a>',
    '<img src="/ok.png" srcset="x.png 1x, javascript:alert(1) 2x">',
    '<div><div><div unclosed',
    '<p>a</div></p></span>b',
];

describe('HTML sanitiser — hostile input denies every execution vector', () => {
  it.each(hostileHtml)('neutralises %j', (input) => {
    const output = sanitiseHtml(input);
    expect(output.toLowerCase()).not.toContain('<script');
    expect(output.toLowerCase()).not.toContain('javascript:');
    expect(output.toLowerCase()).not.toContain('data:');
    expect(output.toLowerCase()).not.toContain('<iframe');
    expect(output.toLowerCase()).not.toContain('<svg');
    expect(output.toLowerCase()).not.toContain('<style');
    expect(output.toLowerCase()).not.toContain('srcset');
    expect(output).not.toMatch(/\son[a-z]+\s*=/i);
    expect(output).not.toMatch(/\sstyle\s*=/i);
    expect(output).not.toMatch(/\s(?:id|class|data-[a-z-]+)\s*=/i);
  });

  it('discards the content of dangerous elements, not just their tags', () => {
    expect(sanitiseHtml('<script>alert(1)</script>')).toBe('');
    expect(sanitiseHtml('<style>body{}</style>')).toBe('');
    expect(sanitiseHtml('before<script>alert(1)</script>after')).toBe('beforeafter');
  });

  it('unwraps unknown but harmless elements, keeping escaped text', () => {
    expect(sanitiseHtml('<custom-widget>hi</custom-widget>')).toBe('hi');
    expect(sanitiseHtml('<section><p>hi</p></section>')).toBe('<p>hi</p>');
  });

  it('keeps allow-listed structure and attributes', () => {
    expect(sanitiseHtml('<p><strong>a</strong> <em>b</em></p>')).toBe('<p><strong>a</strong> <em>b</em></p>');
    expect(sanitiseHtml('<a href="/x" title="t">go</a>'))
      .toBe('<a href="/x" title="t" rel="noopener noreferrer ugc">go</a>');
    expect(sanitiseHtml('<img src="/a.png" alt="a" width="10">'))
      .toBe('<img src="/a.png" alt="a" width="10">');
  });

  it('drops an image whose source was denied rather than emitting a husk', () => {
    expect(sanitiseHtml('<img src="javascript:alert(1)" alt="a">')).toBe('');
    expect(sanitiseHtml('<img alt="a">')).toBe('');
  });

  it('keeps anchor text when the href is denied', () => {
    expect(sanitiseHtml('<a href="javascript:alert(1)">click</a>')).toBe('<a>click</a>');
  });

  it('escapes stray markup characters in text', () => {
    expect(sanitiseHtml('5 < 6 & 7 > 4')).toBe('5 &lt; 6 &amp; 7 &gt; 4');
    expect(escapeHtml('<&>')).toBe('&lt;&amp;&gt;');
  });

  it('closes elements left open by malformed input', () => {
    expect(sanitiseHtml('<p>a')).toBe('<p>a</p>');
    expect(sanitiseHtml('<em><strong>a</em>')).toBe('<em><strong>a</strong></em>');
  });

  it('never throws and always returns a string', () => {
    const fuzz = ['<', '<<<<', '</>', '<a', '<a href=', '<a href="', '<!--', '<!', '<?php echo 1;?>', '>'];
    for (const input of fuzz) {
      expect(typeof sanitiseHtml(input)).toBe('string');
      expect(typeof stripHtml(input)).toBe('string');
    }
    expect(sanitiseHtml('<a'.repeat(200))).toBeTypeOf('string');
    expect(sanitiseHtml('<div>'.repeat(500) + 'x')).toContain('x');
  });

  it('exposes an allow-list containing no executable or embedding elements', () => {
    for (const forbidden of ['script', 'style', 'iframe', 'object', 'embed', 'form', 'svg', 'math', 'link', 'meta']) {
      expect(ALLOWED_ELEMENTS.has(forbidden)).toBe(false);
    }
  });
});

describe('HTML sanitiser — independent verification via a fresh HTML parser', () => {
  it.each(hostileHtml)('yields a DOM with no executable node for %j', (input) => {
    const output = sanitiseHtml(input);
    expect(auditFreshDom(output)).toEqual([]);

    const document_ = parseFresh(output);
    for (const element of document_.body.querySelectorAll('*')) {
      expect(ALLOWED_ELEMENTS.has(element.localName)).toBe(true);
    }
    expect(document_.querySelectorAll('script, style, iframe, object, embed, form, svg')).toHaveLength(0);
  });

  it('is structurally stable: a second pass introduces no new element', () => {
    const shape = (html) => [...parseFresh(html).body.querySelectorAll('*')]
      .map(element => `${element.localName}[${[...element.attributes].map(a => a.name).sort().join(',')}]`);

    for (const input of hostileHtml) {
      const once = sanitiseHtml(input);
      expect(shape(sanitiseHtml(once))).toEqual(shape(once));
    }
  });
});

describe('stripHtml — markdown-safe removal', () => {
  it('removes markup without escaping the surviving text', () => {
    expect(stripHtml('A & B <b>bold</b> C')).toBe('A & B bold C');
    expect(stripHtml('<script>alert(1)</script>keep')).toBe('keep');
  });

  it('leaves markdown punctuation untouched', () => {
    const markdown = '# Head\n\n- a & b\n- `code < 5`\n\n[link](/x)';
    expect(stripHtml(markdown)).toBe(markdown);
  });

  it('preserves CommonMark autolinks', () => {
    expect(stripHtml('see <https://example.test/a?b=c>')).toBe('see <https://example.test/a?b=c>');
    expect(stripHtml('mail <a@example.test>')).toBe('mail <a@example.test>');
  });

  it('still removes dangerous elements under strict tag-name matching', () => {
    expect(stripHtml('<script>alert(1)</script>x')).toBe('x');
    expect(stripHtml('<svg onload=alert(1)></svg>x')).toBe('x');
    expect(stripHtml('<iframe src="javascript:alert(1)"></iframe>x')).toBe('x');
  });

  it('neutralises non-conformant tag names that still open an element', () => {
    // The HTML tag-name state ends only at whitespace, `/` or `>`, so `<p"x …>`
    // is an unknown element carrying a live handler even though `p"x` is not a
    // conformant element name and strict matching rejects it. Autolink-shaped
    // tags with URL attributes are the same class: attribute-free autolinks
    // must survive, but `href=javascript:` must not.
    const hostile = [
      '<p"x onmouseover=alert(1)>t',
      "<span'x onclick=alert(1)>t",
      '<b=x onmouseover=alert(1)>t',
      '<a&x onclick=alert(1)>t',
      '<h1"x style="position:fixed;inset:0;z-index:9">t',
      '<https://x onmouseover=alert(1)>t',
      '<https://x href=javascript:alert(1)>t',
      '<https://x href="javascript:alert(1)">t',
      '<a:b href=javascript:alert(1)>t',
      '<a"x href=javascript:alert(1)>t',
      '<foo:bar src=javascript:alert(1)>t',
      '<https://x formaction=javascript:alert(1)>t',
      '<https://x srcdoc="<script>alert(1)</script>">t',
    ];

    for (const input of hostile) {
      const output = stripHtml(input);
      // Fresh DOM per payload — string presence of `javascript:` after `&lt;`
      // escaping is inert text, not a live sink.
      expect(auditFreshDom(output), input).toEqual([]);
    }
  });

  it('leaves attribute-free unknown tags alone so autolinks survive', () => {
    expect(stripHtml('see <https://example.test/a?b=c>')).toBe('see <https://example.test/a?b=c>');
    expect(stripHtml('see <https://example.test/a?b=c&d=e>')).toBe('see <https://example.test/a?b=c&d=e>');
    expect(stripHtml('mail <a@example.test>')).toBe('mail <a@example.test>');
    expect(stripHtml('mail <mailto:a@example.test>')).toBe('mail <mailto:a@example.test>');
    expect(stripHtml('a < b and c > d')).toBe('a < b and c > d');
    expect(stripHtml('<3 hearts')).toBe('<3 hearts');
  });

  it('keeps text props free of live URL and handler attributes', () => {
    const hostileTitles = [
      'Hi <https://x href=javascript:alert(1)> there',
      'Hi <a"x href=javascript:alert(1)> there',
      'Hi <p"x onmouseover=alert(1)> there',
    ];
    for (const title of hostileTitles) {
      const result = sanitiseBlockProps('collapsible', { title, body: 'ok' });
      expect(result.ok, title).toBe(true);
      expect(auditFreshDom(result.props.title), title).toEqual([]);
    }
  });
});

describe('end-to-end parse and sanitise', () => {
  it('produces a renderable document from mixed trusted and hostile source', () => {
    const source = [
      'Prose with <script>alert(1)</script> inline.',
      '',
      block('gallery', { slug: 'photography', onclick: 'alert(1)' }),
      '',
      ':::block script\n{}\n:::',
      '',
      block('iframe', { src: 'javascript:alert(1)', title: 'T' }),
      '',
      block('graph', WELL_FORMED.graph),
    ].join('\n');

    const document = parseAndSanitiseBlocks(source);
    const serialised = JSON.stringify(document);

    expect(serialised).not.toContain('alert(1)');
    expect(serialised).not.toContain('javascript:');
    expect(document.nodes.filter(n => n.kind === 'block').map(n => n.type)).toEqual(['gallery', 'graph']);
    expect(document.warnings.map(w => w.code)).toEqual([
      BLOCK_WARNING_CODES.UNKNOWN_TYPE,
      BLOCK_WARNING_CODES.INVALID_PROPS,
    ]);
    expect(document.nodes[0].value).toContain('Prose with');
    expect(document.nodes[0].value).not.toContain('script');
  });

  it('is deterministic across repeated runs', () => {
    const source = `${block('p5', WELL_FORMED.p5)}\ntext`;
    expect(JSON.stringify(parseAndSanitiseBlocks(source)))
      .toBe(JSON.stringify(parseAndSanitiseBlocks(source)));
  });
});
