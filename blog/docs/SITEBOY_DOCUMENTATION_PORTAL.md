# SiteBoy Documentation Portal

Central entry for `blog/docs/`. Last refreshed: 2026-06-18 (W5 / G3).

---

## Build path

1. **Orientation** — [rationale.md](rationale.md), [guides/index.md](guides/index.md), [Processes/index.md](Processes/index.md)
2. **Architecture** — [site/ui-interface-overview.md](site/ui-interface-overview.md), [guides/standards/coding-standards.md](guides/standards/coding-standards.md), [guides/f-system.md](guides/f-system.md)
3. **Tool / page rules** — [guides/standards/tool-standards.md](guides/standards/tool-standards.md), [guides/page-design-guide.md](guides/page-design-guide.md), [guides/lazy-loading.md](guides/lazy-loading.md), [guides/shared-utilities.md](guides/shared-utilities.md)
4. **Phases** — [guides/phases/](guides/phases/) + [guides/checklists/](guides/checklists/)
5. **Catalogs** — [components/index.md](components/index.md), [algorithms/index.md](algorithms/index.md), [pages/](pages/)
6. **Archive** — [old-docs/](old-docs/) (legacy only)

---

## Site specs & ADRs

| Doc | Purpose |
| --- | --- |
| [site/store-spec.md](site/store-spec.md) | Store section cart + Stripe stub contract |
| [site/notes-tool-scope.md](site/notes-tool-scope.md) | Notes tool (F2) scope |
| [site/gallery-status.md](site/gallery-status.md) | Gallery pipeline status |
| [site/adr-A1-host.md](site/adr-A1-host.md) | Dynamic host (Vercel) |
| [site/adr-A2-auth.md](site/adr-A2-auth.md) | Auth mechanism |
| [site/adr-A3-store.md](site/adr-A3-store.md) | Backend data store |
| [site/adr-A4-storage.md](site/adr-A4-storage.md) | Binary asset bucket |
| [site/adr-C1-gallery.md](site/adr-C1-gallery.md) | Gallery taxonomy + schema |

---

## Guides & standards

- Index: [guides/index.md](guides/index.md)
- Routing map: [guides/ai-routing-map.md](guides/ai-routing-map.md)
- Standards: [guides/standards/](guides/standards/) — design-law, component-patterns, border-system, semiotics, text-treatment, gpu-compute, compute-scheduler, p5-generator-standards, etc.
- Checklists: [guides/checklists/](guides/checklists/)
- Project pages: [guides/project-page-build-guide.md](guides/project-page-build-guide.md)

---

## Components & algorithms

- [components/index.md](components/index.md), [components/COMPONENT-REFERENCE.md](components/COMPONENT-REFERENCE.md)
- [algorithms/index.md](algorithms/index.md)

---

## Operations & roadmap

- TODO dashboard: [todo/index.md](todo/index.md)
- Compliance audit (W5): [site/audit-report-2026-06-18.md](site/audit-report-2026-06-18.md)
- Temp working notes: [temp/](temp/) (<30 day retention per G2)

---

## Legacy archive

Historical docs live under [old-docs/](old-docs/). Do not treat as current unless promoted.

| Area | Path |
| --- | --- |
| Onboarding | [old-docs/legacy-onboarding/](old-docs/legacy-onboarding/) |
| Gallery | [old-docs/legacy-gallery/](old-docs/legacy-gallery/) |
| Migration / R2 | [old-docs/legacy-migration/](old-docs/legacy-migration/) |
| Photo processing | [old-docs/legacy-photo-processing/](old-docs/legacy-photo-processing/) |
| Tools readme | [old-docs/legacy-tools/](old-docs/legacy-tools/) |
| Master guide | [old-docs/legacy-docs/docs/siteboy-master-guide.md](old-docs/legacy-docs/docs/siteboy-master-guide.md) |

---

## Maintenance

- Update this portal when promoting docs from `temp/` or adding ADRs under `site/`.
- Keep [index.md](index.md) in sync with the sections above.
