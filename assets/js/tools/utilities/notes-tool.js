/**
 * Notes Tool — corpus search / library skeleton (F2)
 *
 * @see blog/docs/site/notes-tool-scope.md
 * @version 0.1.0
 */

import { ToolBase } from '../core/tool-base.js';

const TOOL_CONFIG = {
    title: 'NOTES',
    sidebar: [
        ['SEARCH', [
            ['Query', [
                ['text', 'Search', '', { key: 'searchQuery', placeholder: 'Keywords…' }],
                ['button', 'Search', null, { key: 'runSearch' }],
                ['label', 'No results', { variant: 'caption', key: 'searchResults' }]
            ]]
        ]],
        ['LIBRARY', [
            ['Corpus', [
                ['label', '0 notes (stub)', { variant: 'status', key: 'libraryStatus' }],
                ['label', 'Ingest pipeline pending A3', { variant: 'caption', key: 'libraryHint' }]
            ]]
        ]],
        ['INFO', [
            ['Scope', [
                ['label', 'Notes-processing tool suite — skeleton', { variant: 'caption', key: 'infoScope' }],
                ['label', 'Formats: .md, .txt (v1)', { variant: 'caption', key: 'infoFormats' }]
            ]]
        ]]
    ],
    canvas: { mode: 'none' },
    onInit: (values) => {
        values.searchResults = 'Enter a query and press Search.';
        values.libraryStatus = '0 notes (stub)';
    },
    onUpdate: (key, value, allValues, tool) => {
        if (key === 'runSearch') {
            const q = (allValues.searchQuery || '').trim();
            const msg = q
                ? `Stub: 0 matches for "${q}" (index pending F2.c).`
                : 'Enter a query.';
            tool.setValue('searchResults', msg);
        }
    }
};

export class NotesTool {
    constructor(container, deps = {}) {
        this.container = container;
        this.deps = deps;
        this.componentInstances = [];
        this.tool = null;
    }

    render() {
        this.destroy();
        this.container.classList.add('tool-viewport');
        this.tool = new ToolBase(TOOL_CONFIG, this.deps);
        this.tool.mount(this.container);
        this.componentInstances.push(this.tool);
        window.debugLog('TOOLS', 'Notes tool skeleton mounted');
    }

    destroy() {
        if (this.tool?.destroy) {
            this.tool.destroy();
        }
        this.tool = null;
        this.componentInstances = [];
        if (this.container) {
            this.container.classList.remove('tool-viewport');
            this.container.innerHTML = '';
        }
    }
}

export default NotesTool;
