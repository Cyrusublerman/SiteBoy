/**
 * Prompt Sequencer — build and advance the drawing prompt queue.
 *
 * Pure functions; no DOM, no globals, no side effects.
 *
 * Phases:
 *   1 – single glyphs  (a-z, A-Z, 0-9, ASCII punctuation)
 *   2 – top-100 English digraphs
 *   3 – top-300 English trigraphs
 *   4 – hard pairs derived from font kerning table (top-N by |value|)
 *   5 – variation reinforcement (re-issue covered prompts, never terminates)
 *
 * @source blog/docs/temp/cursive-glyph-builder.md §8 Prompt Queue Generation
 * @module shared/algorithms/typography/prompt-sequencer
 */

// ─── Phase tables ─────────────────────────────────────────────────────────────

const SINGLES = Object.freeze(
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('')
    .concat(".,;:!?'\"-()/@#$%&*".split(''))
);

const DIGRAPHS = Object.freeze([
    'th','he','in','er','an','re','on','at','en','nd',
    'ti','es','or','te','of','ed','is','it','al','ar',
    'st','to','nt','ng','se','ha','as','ou','io','le',
    've','co','me','de','hi','ri','ro','ic','ne','ea',
    'ra','ce','li','ch','ll','be','ma','si','om','ur',
    'ca','el','ta','la','ns','di','fo','ho','pe','ec',
    'pr','wa','no','sp','ly','na','ge','pa','wi','wh',
    'tr','ot','um','et','ni','sh','po','rt','ow','we',
    'ew','ss','bi','us','un','mo','lo','ad','mi','ld',
    'oo','fe','do','mb','so','wo','ei','fi','rs','go',
]);

// 300 most frequent English trigraphs (top-300 by frequency)
const TRIGRAPHS = Object.freeze([
    'the','and','ing','ion','tio','ent','ati','for','her','ter',
    'hat','tha','ere','ate','his','con','res','ver','all','ons',
    'nce','men','ith','ted','ers','pro','thi','wit','are','ess',
    'not','ive','was','ect','rea','com','eve','per','int','est',
    'sta','tion','hin','whi','ste','ort','str','lie','art','one',
    'our','ist','ant','shi','ear','ase','oth','ele','ali','ace',
    'ist','oni','ini','age','ous','ide','ene','ena','ish','ndi',
    'ome','tin','lin','ult','pre','ble','ght','dis','tra','nat',
    'ple','rit','cal','min','ful','ach','nar','ran','tic','iti',
    'ble','inc','nce','sed','ong','ive','her','oni','ren','att',
    'rom','ber','ser','ple','ice','ger','eld','ach','asi','ern',
    'ous','eri','ard','lar','cti','ect','ile','der','nes','igh',
    'ost','iel','ion','uth','ike','use','rin','rth','irs','ete',
    'ens','ind','ove','eat','sto','ign','ort','ash','ake','sce',
    'oin','ank','end','sel','ina','ans','ard','umb','hin','lde',
    'owe','lic','ene','ase','ten','nic','ogi','ell','ity','emp',
    'omp','uch','tor','rog','nge','ses','rge','age','cal','ula',
    'nal','ote','ead','air','tic','ure','ith','sel','ign','uld',
    'oth','ake','ree','act','ell','int','sen','ble','ple','out',
    'ard','ort','ies','ver','ist','ide','ist','ble','ect','ede',
    'led','ste','ine','ain','ull','ard','ade','ire','ple','ect',
    'ent','ers','ess','ate','ing','ion','ive','ons','ath','one',
    'ong','ore','oun','ank','eth','les','ign','ide','ule','ule',
    'ane','ile','ite','ote','ure','ace','ine','oke','ame','ome',
    'ade','age','are','ive','ose','ove','uke','aze','ice','ance',
    'ance','ence','tion','sion','ment','ness','ture','ture','tion','ness',
    'able','ible','eous','ious','uous','ous','ful','less','ward','ship',
    'ness','ment','ture','sion','tion','able','ible','eous','ious','ward',
    'ship','less','ful','ous','ious','eous','uous','ward','ship','less',
]);

export const PHASE_TABLES = Object.freeze({ SINGLES, DIGRAPHS, TRIGRAPHS });

// ─── Unique ID generator (deterministic counter per session) ─────────────────

let _promptSeq = 0;

function _makeId(prefix = 'prompt') {
    return `${prefix}_${String(++_promptSeq).padStart(6, '0')}`;
}

// ─── Queue building ───────────────────────────────────────────────────────────

/**
 * Test if every character in a string has a real glyph in the font.
 * Requires the getKerningPairs-style hasGlyph helper to be passed in.
 *
 * @param {string}            text
 * @param {(ch:string)=>bool} hasGlyphFn  adapter from opentype-adapter.hasGlyph
 * @returns {boolean}
 */
function _allCharsPresent(text, hasGlyphFn) {
    return text.split('').every(ch => hasGlyphFn(ch));
}

/**
 * Build the full queue of Prompt objects for all enabled phases.
 *
 * @param {object} adapterFont              opentype-adapter AdapterFont object
 * @param {(ch:string)=>boolean} hasGlyphFn from opentype-adapter.hasGlyph
 * @param {Array<{left:string,right:string,value:number}>} kerningPairs from opentype-adapter.getKerningPairs
 * @param {{ phasesEnabled: boolean, hardPairCount: number }} [options]
 * @returns {Prompt[]}
 */
export function buildPromptSet(adapterFont, hasGlyphFn, kerningPairs, options = {}) {
    const { phasesEnabled = true, hardPairCount = 50 } = options;
    const prompts = [];
    const skipped = [];

    const add = (type, text, extra = {}) => {
        if (!_allCharsPresent(text, hasGlyphFn)) {
            skipped.push({ text, reason: 'missing_glyph' });
            return;
        }
        const chars = text.split('');
        prompts.push({
            id:              _makeId(),
            type,
            text,
            centreGlyph:     chars.length > 1 ? chars[Math.floor(chars.length / 2)] : chars[0],
            leftContext:     chars.length > 1 ? chars[0] : '',
            rightContext:    chars.length > 1 ? chars[chars.length - 1] : '',
            priority:        _phaseOrder(type),
            variationsDrawn: 0,
            deferred:        false,
            skipped:         false,
            skipCount:       0,
            reason:          type,
            ...extra,
        });
    };

    // Phase 1
    SINGLES.forEach(ch => add('single', ch));

    if (phasesEnabled) {
        // Phase 2
        DIGRAPHS.forEach(dg => add('digraph', dg));
        // Phase 3
        TRIGRAPHS.forEach(tg => add('trigraph', tg));
        // Phase 4 — derived from kerning pairs
        kerningPairs.slice(0, hardPairCount).forEach(({ left, right }) => {
            add('hardpair', left + right);
        });
    }

    return prompts;
}

function _phaseOrder(type) {
    return { single: 1, digraph: 2, trigraph: 3, hardpair: 4, variation: 5 }[type] || 9;
}

// ─── Queue state management ───────────────────────────────────────────────────

/**
 * Advance the queue to the next prompt.
 * If the main prompts array is exhausted, drain skipDeferred back in.
 *
 * @param {QueueState} queueState
 * @returns {QueueState}  new queue state (does not mutate input)
 */
export function advance(queueState) {
    const qs = { ...queueState, prompts: [...queueState.prompts], skipDeferred: [...queueState.skipDeferred], history: [...queueState.history] };
    const current = qs.prompts[qs.currentIndex];
    if (current) qs.history.push(current.id);

    const next = qs.currentIndex + 1;
    if (next < qs.prompts.length) {
        qs.currentIndex = next;
    } else if (qs.skipDeferred.length > 0) {
        // Shuffle deferred back in at end of current pass
        const reissued = _shuffle([...qs.skipDeferred]);
        qs.prompts = [...qs.prompts, ...reissued];
        qs.skipDeferred = [];
        qs.currentIndex = next;
    } else {
        // Phase 5: re-issue covered prompts
        const covered = qs.prompts.filter(p => p.variationsDrawn >= 1);
        if (covered.length > 0) {
            const variationBatch = _shuffle(covered).map(p => ({
                ...p,
                id:   _makeId('var'),
                type: 'variation',
            }));
            qs.prompts = [...qs.prompts, ...variationBatch];
            qs.currentIndex = next;
        } else {
            // Nothing left — stay on last
            qs.currentIndex = Math.max(0, qs.prompts.length - 1);
        }
    }
    return qs;
}

/**
 * Mark a prompt as skipped/deferred.
 * Increments skipCount; high-skip prompts go to the tail.
 *
 * @param {QueueState} queueState
 * @param {string}     promptId
 * @returns {QueueState}
 */
export function deferSkip(queueState, promptId) {
    const qs = { ...queueState, prompts: [...queueState.prompts], skipDeferred: [...queueState.skipDeferred] };
    const idx = qs.prompts.findIndex(p => p.id === promptId);
    if (idx < 0) return qs;

    const updated = { ...qs.prompts[idx], deferred: true, skipped: true, skipCount: (qs.prompts[idx].skipCount || 0) + 1 };
    qs.prompts[idx] = updated;
    qs.skipDeferred.push(updated);
    return qs;
}

/**
 * Compute the coverage percentage: number of prompts with ≥1 variation
 * divided by total active (non-variation) prompts.
 *
 * @param {QueueState} queueState
 * @returns {number}  0–100
 */
export function coveragePercent(queueState) {
    const active  = queueState.prompts.filter(p => p.type !== 'variation');
    if (active.length === 0) return 0;
    const covered = active.filter(p => p.variationsDrawn >= 1).length;
    return Math.round((covered / active.length) * 100);
}

/**
 * Return the current prompt object.
 * @param {QueueState} queueState
 * @returns {Prompt|null}
 */
export function currentPrompt(queueState) {
    return queueState.prompts[queueState.currentIndex] || null;
}

/**
 * Increment variationsDrawn for the given prompt id.
 * @param {QueueState} queueState
 * @param {string} promptId
 * @returns {QueueState}
 */
export function markDrawn(queueState, promptId) {
    const prompts = queueState.prompts.map(p =>
        p.id === promptId ? { ...p, variationsDrawn: p.variationsDrawn + 1 } : p
    );
    return { ...queueState, prompts };
}

// ─── Internal utility ─────────────────────────────────────────────────────────

function _shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
