import { beforeEach, describe, expect, it } from 'vitest';
import { JSDOM } from 'jsdom';
import { sanitiseSvg, stripLeadingHeading } from '../assets/js/shared/pkl-public-ui.js';

beforeEach(() => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.DOMParser = dom.window.DOMParser;
});

describe('PKL public UI', () => {
  it('removes a duplicated leading Markdown title', () => {
    expect(stripLeadingHeading('# Example\n\nFirst paragraph.')).toBe('First paragraph.');
    expect(stripLeadingHeading('First paragraph.')).toBe('First paragraph.');
  });

  it('sanitises executable SVG content while preserving local references', () => {
    const svg = sanitiseSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" onload="alert(1)">
        <script>alert(1)</script>
        <defs><path id="shape" d="M0 0L1 1"/></defs>
        <use href="#shape"/>
        <a href="https://example.com"><text>external</text></a>
        <rect onclick="alert(1)" width="10" height="10"/>
      </svg>
    `);

    expect(svg).not.toBeNull();
    expect(svg.querySelector('script')).toBeNull();
    expect(svg.hasAttribute('onload')).toBe(false);
    expect(svg.querySelector('rect').hasAttribute('onclick')).toBe(false);
    expect(svg.querySelector('use').getAttribute('href')).toBe('#shape');
    expect(svg.querySelector('a').hasAttribute('href')).toBe(false);
  });

  it('rejects non-SVG input', () => {
    expect(sanitiseSvg('<html><body>not svg</body></html>')).toBeNull();
  });
});
