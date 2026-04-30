/**
 * time-anchors.js
 * Known historical/scientific events with millisecond timestamps from Unix epoch.
 * Each entry: { id, label, ms, scale }
 *   id     — unique camelCase identifier
 *   label  — display string (short, factual)
 *   ms     — offset in milliseconds from Unix epoch (negative = before 1970)
 *   scale  — one of: 'seconds' | 'minutes' | 'hours' | 'days' | 'months' |
 *             'years' | 'decades' | 'centuries' | 'millennia' |
 *             'megayears' | 'gigayears'
 *
 * Only events whose occurrence date is known to the precision implied by `scale`
 * are included. Geological/cosmological dates use the scientific consensus midpoint.
 */

const SEC  = 1000;
const MIN  = 60 * SEC;
const HR   = 60 * MIN;
const DAY  = 24 * HR;
const YEAR = 365.25 * DAY;

// Helper: years-before-present → ms from Unix epoch (present = 2000 CE ≈ J2000)
const J2000_UNIX_MS = 946728000000;
const yBP = (y) => J2000_UNIX_MS - y * YEAR;
// Helper: ISO date string → ms
const iso = (s) => new Date(s).getTime();

export const TIME_ANCHORS = [
    // ── seconds ──────────────────────────────────────────────────────────────
    { id: 'apolloMoonLanding',       label: 'Apollo 11 lunar touchdown',            ms: iso('1969-07-20T20:17:40Z'), scale: 'seconds'  },
    { id: 'firstMessageArpanet',     label: 'First ARPANET message sent',           ms: iso('1969-10-29T22:30:00Z'), scale: 'seconds'  },
    { id: 'y2kMidnight',             label: 'Y2K rollover midnight UTC',            ms: iso('2000-01-01T00:00:00Z'), scale: 'seconds'  },
    { id: 'cernHiggsBosonDetect',    label: 'Higgs boson signal confirmed (CERN)',  ms: iso('2012-07-04T09:00:00Z'), scale: 'seconds'  },
    { id: 'gravWaveDetectionLIGO',   label: 'LIGO first gravitational wave signal', ms: iso('2015-09-14T09:50:45Z'), scale: 'seconds'  },

    // ── minutes ──────────────────────────────────────────────────────────────
    { id: 'titanicSinks',            label: 'RMS Titanic sinks',                    ms: iso('1912-04-15T02:20:00Z'), scale: 'minutes'  },
    { id: 'jfkAssassination',        label: 'Kennedy assassination',                ms: iso('1963-11-22T18:30:00Z'), scale: 'minutes'  },
    { id: 'berlinWallFall',          label: 'Berlin Wall first breach',             ms: iso('1989-11-09T22:54:00Z'), scale: 'minutes'  },
    { id: 'mt9elevenstrike',         label: 'First WTC tower struck, 9/11',         ms: iso('2001-09-11T12:46:00Z'), scale: 'minutes'  },
    { id: 'curiosityLanding',        label: 'Curiosity rover touchdown on Mars',    ms: iso('2012-08-06T05:17:00Z'), scale: 'minutes'  },

    // ── hours ─────────────────────────────────────────────────────────────────
    { id: 'hiroshimaBomb',           label: 'Hiroshima atomic bomb detonation',     ms: iso('1945-08-06T08:15:00Z'), scale: 'hours'    },
    { id: 'gagarinLaunch',           label: 'Gagarin launches to orbit',            ms: iso('1961-04-12T06:07:00Z'), scale: 'hours'    },
    { id: 'chernobylExplosion',      label: 'Chernobyl reactor 4 explosion',        ms: iso('1986-04-26T01:23:00Z'), scale: 'hours'    },
    { id: 'voyager1Launch',          label: 'Voyager 1 launch',                     ms: iso('1977-09-05T12:56:01Z'), scale: 'hours'    },
    { id: 'emuWarCommenced',         label: 'Great Emu War commenced',              ms: iso('1932-11-02T00:00:00Z'), scale: 'hours'    },

    // ── days ──────────────────────────────────────────────────────────────────
    { id: 'vEDay',                   label: 'VE Day — Nazi Germany surrenders',     ms: iso('1945-05-08T00:00:00Z'), scale: 'days'     },
    { id: 'moonwalkEva',             label: 'Armstrong moonwalk EVA',               ms: iso('1969-07-21T02:56:15Z'), scale: 'days'     },
    { id: 'sputnikLaunch',           label: 'Sputnik 1 launch',                     ms: iso('1957-10-04T19:28:34Z'), scale: 'days'     },
    { id: 'dnaDoubleHelix',          label: 'Watson & Crick describe DNA helix',    ms: iso('1953-04-25T00:00:00Z'), scale: 'days'     },
    { id: 'marsOdysseyArrival',      label: 'Mars Odyssey orbit insertion',         ms: iso('2001-10-24T02:18:00Z'), scale: 'days'     },

    // ── months ───────────────────────────────────────────────────────────────
    { id: 'worldWar2Start',          label: 'WW2 begins (Poland invaded)',          ms: iso('1939-09-01T00:00:00Z'), scale: 'months'   },
    { id: 'neilArmstrongDeath',      label: 'Neil Armstrong dies',                 ms: iso('2012-08-25T00:00:00Z'), scale: 'months'   },
    { id: 'covidWHOPandemic',        label: 'WHO declares COVID-19 pandemic',       ms: iso('2020-03-11T00:00:00Z'), scale: 'months'   },
    { id: 'hstLaunch',               label: 'Hubble Space Telescope launch',        ms: iso('1990-04-24T00:00:00Z'), scale: 'months'   },
    { id: 'internetPublicLaunch',    label: 'World Wide Web goes public',           ms: iso('1991-08-06T00:00:00Z'), scale: 'months'   },

    // ── years ─────────────────────────────────────────────────────────────────
    { id: 'gutenbergPress',          label: 'Gutenberg press operational',          ms: iso('1450-01-01T00:00:00Z'), scale: 'years'    },
    { id: 'galileoTelescope',        label: 'Galileo first telescopic sky survey',  ms: iso('1610-01-01T00:00:00Z'), scale: 'years'    },
    { id: 'newtonPrincipia',         label: 'Newton's Principia published',         ms: iso('1687-07-05T00:00:00Z'), scale: 'years'    },
    { id: 'darwinOriginPublished',   label: 'Darwin's Origin of Species published', ms: iso('1859-11-24T00:00:00Z'), scale: 'years'    },
    { id: 'einsteinsSpecialRel',     label: 'Einstein's special relativity paper',  ms: iso('1905-06-30T00:00:00Z'), scale: 'years'    },

    // ── decades ───────────────────────────────────────────────────────────────
    { id: 'frenchRevolution',        label: 'French Revolution',                    ms: iso('1789-07-14T00:00:00Z'), scale: 'decades'  },
    { id: 'industrialRevBegins',     label: 'Industrial Revolution begins (UK)',    ms: iso('1760-01-01T00:00:00Z'), scale: 'decades'  },
    { id: 'worldWar1Start',          label: 'WW1 begins',                           ms: iso('1914-07-28T00:00:00Z'), scale: 'decades'  },
    { id: 'coldWarEnds',             label: 'Cold War ends (USSR dissolution)',     ms: iso('1991-12-25T00:00:00Z'), scale: 'decades'  },
    { id: 'firstAtomBombTest',       label: 'Trinity atomic bomb test',             ms: iso('1945-07-16T05:29:21Z'), scale: 'decades'  },

    // ── centuries ─────────────────────────────────────────────────────────────
    { id: 'maghnaCartaSigned',       label: 'Magna Carta signed',                   ms: iso('1215-06-15T00:00:00Z'), scale: 'centuries' },
    { id: 'blackDeathPeak',          label: 'Black Death peak mortality in Europe', ms: iso('1350-01-01T00:00:00Z'), scale: 'centuries' },
    { id: 'columbusAmericas',        label: 'Columbus reaches the Americas',        ms: iso('1492-10-12T00:00:00Z'), scale: 'centuries' },
    { id: 'romeFoundedTradn',        label: 'Traditional founding of Rome',         ms: yBP(2776),                   scale: 'centuries' },
    { id: 'islamFounding',           label: 'Founding of Islam (Hijra)',             ms: iso('0622-07-16T00:00:00Z'), scale: 'centuries' },

    // ── millennia ─────────────────────────────────────────────────────────────
    { id: 'cuneiformWriting',        label: 'Cuneiform writing first used',         ms: yBP(5400),                   scale: 'millennia' },
    { id: 'egyptianPyramids',        label: 'Great Pyramid of Giza completed',      ms: yBP(4500),                   scale: 'millennia' },
    { id: 'agricultureOrigin',       label: 'Agriculture origins (Fertile Crescent)', ms: yBP(10000),               scale: 'millennia' },
    { id: 'endLastIceAge',           label: 'End of last glacial maximum',          ms: yBP(11700),                  scale: 'millennia' },
    { id: 'homoSapiensOOAfrica',     label: 'Homo sapiens out-of-Africa migration', ms: yBP(70000),                  scale: 'millennia' },

    // ── megayears (millions of years before present) ──────────────────────────
    { id: 'dinoBirdEvolution',       label: 'First birds evolve from theropods',    ms: yBP(150e6),                  scale: 'megayears' },
    { id: 'floweringPlants',         label: 'Flowering plants (angiosperms) appear', ms: yBP(130e6),                 scale: 'megayears' },
    { id: 'chicxulubImpact',         label: 'Chicxulub impact — K-Pg extinction',   ms: yBP(66e6),                   scale: 'megayears' },
    { id: 'greatOxidationEvent',     label: 'Great Oxidation Event',               ms: yBP(2400e6),                 scale: 'megayears' },
    { id: 'firstMulticellularLife',  label: 'First multicellular life',             ms: yBP(600e6),                  scale: 'megayears' },

    // ── gigayears (billions of years before present) ──────────────────────────
    { id: 'earthFormed',             label: 'Earth formed',                         ms: yBP(4540e6),                 scale: 'gigayears' },
    { id: 'moonFormed',              label: 'Moon formed (Theia impact)',           ms: yBP(4510e6),                 scale: 'gigayears' },
    { id: 'sunFormed',               label: 'Sun formed',                           ms: yBP(4603e6),                 scale: 'gigayears' },
    { id: 'firstStarsUniverse',      label: 'First stars in the universe',         ms: yBP(13600e6),                scale: 'gigayears' },
    { id: 'bigBang',                 label: 'Big Bang',                             ms: yBP(13800e6),                scale: 'gigayears' },
];

// Scale ordering for display
export const SCALES = [
    'seconds', 'minutes', 'hours', 'days', 'months',
    'years', 'decades', 'centuries', 'millennia', 'megayears', 'gigayears'
];

/**
 * getElapsedLabel(ms, scale) → e.g. "43 years ago" or "in 3 days"
 * @param {number} ms    — anchor timestamp (ms from Unix epoch)
 * @param {string} scale — one of SCALES
 * @returns {string}
 */
export function getElapsedLabel(ms, scale) {
    const nowMs = Date.now();
    const diff  = nowMs - ms; // positive = past
    const abs   = Math.abs(diff);
    const sign  = diff >= 0 ? 'ago' : 'from now';
    const divisors = {
        seconds:   SEC,
        minutes:   MIN,
        hours:     HR,
        days:      DAY,
        months:    DAY * 30.44,
        years:     YEAR,
        decades:   YEAR * 10,
        centuries: YEAR * 100,
        millennia: YEAR * 1000,
        megayears: YEAR * 1e6,
        gigayears: YEAR * 1e9,
    };
    const div = divisors[scale] ?? YEAR;
    const n   = (abs / div).toLocaleString(undefined, { maximumFractionDigits: 1 });
    return `${n} ${scale} ${sign}`;
}

/**
 * getAnchorsByScale(scale) → filtered and sorted array for a given scale tier.
 */
export function getAnchorsByScale(scale) {
    return TIME_ANCHORS.filter(a => a.scale === scale)
        .sort((a, b) => a.ms - b.ms);
}
