import { schema } from '../_lib/db.js';
import { createCrudHandlers, dispatchCrud } from '../_lib/crud.js';
import { vercelHandler } from '../_lib/adapter.js';

const RESOURCE_DEFINITIONS = Object.freeze({
  'gallery-items': {
    table: schema.galleryItems,
    kind: 'gallery_item',
    mapInsert: (body) => ({
      id: body.id,
      gallerySlug: body.gallerySlug ?? body.gallery_slug ?? 'default',
      sortIndex: body.sortIndex ?? body.sort_index ?? 0,
      filename: body.filename ?? 'untitled',
      urlsJsonb: body.urlsJsonb ?? body.urls_jsonb ?? {},
      metadataJsonb: body.metadataJsonb ?? body.metadata_jsonb ?? {},
      status: body.status ?? 'published',
    }),
  },
  links: {
    table: schema.links,
    kind: 'link',
    mapInsert: (body) => ({
      id: body.id,
      sourceKind: body.sourceKind ?? body.source_kind,
      sourceId: body.sourceId ?? body.source_id,
      targetKind: body.targetKind ?? body.target_kind,
      targetId: body.targetId ?? body.target_id,
      rel: body.rel ?? 'tagged',
    }),
  },
  notes: {
    table: schema.notes,
    kind: 'note',
    mapInsert: (body) => ({
      id: body.id,
      slug: body.slug ?? body.id,
      title: body.title ?? 'Untitled',
      bodyMd: body.bodyMd ?? body.body_md ?? null,
      metadataJsonb: body.metadataJsonb ?? body.metadata_jsonb ?? {},
      status: body.status ?? 'draft',
    }),
  },
  products: {
    table: schema.products,
    kind: 'product',
    mapInsert: (body) => ({
      id: body.id,
      slug: body.slug ?? body.id,
      title: body.title ?? 'Untitled',
      descriptionMd: body.descriptionMd ?? body.description_md ?? null,
      priceCents: body.priceCents ?? body.price_cents ?? null,
      metadataJsonb: body.metadataJsonb ?? body.metadata_jsonb ?? {},
      status: body.status ?? 'draft',
    }),
  },
  projects: {
    table: schema.projects,
    kind: 'project',
    mapInsert: (body) => ({
      id: body.id,
      slug: body.slug ?? body.id,
      title: body.title ?? 'Untitled',
      summaryMd: body.summaryMd ?? body.summary_md ?? null,
      bodyMd: body.bodyMd ?? body.body_md ?? null,
      frontmatterJsonb: body.frontmatterJsonb ?? body.frontmatter_jsonb ?? {},
      status: body.status ?? 'draft',
      sortIndex: body.sortIndex ?? body.sort_index ?? 0,
    }),
  },
  tags: {
    table: schema.tags,
    kind: 'tag',
    mapInsert: (body) => ({
      id: body.id,
      slug: body.slug ?? body.id,
      label: body.label ?? body.slug ?? 'Untitled',
    }),
  },
});

const handlerCache = new Map();

export const CONTENT_RESOURCE_NAMES = Object.freeze(Object.keys(RESOURCE_DEFINITIONS));

export function normaliseResourceName(value) {
  const raw = Array.isArray(value) ? value[0] : value;
  return String(raw ?? '').trim().toLowerCase();
}

export function resourceNameFromRequest(request) {
  return normaliseResourceName(request?.query?.resource);
}

export function getResourceDefinition(resourceName) {
  return RESOURCE_DEFINITIONS[normaliseResourceName(resourceName)] ?? null;
}

export function getResourceHandlers(resourceName) {
  const name = normaliseResourceName(resourceName);
  const definition = getResourceDefinition(name);
  if (!definition) return null;
  if (!handlerCache.has(name)) {
    handlerCache.set(name, createCrudHandlers(definition));
  }
  return handlerCache.get(name);
}

export async function dispatchContentResource(request) {
  const resource = resourceNameFromRequest(request);
  const handlers = getResourceHandlers(resource);
  if (!handlers) {
    return Response.json(
      {
        error: 'Unknown content resource',
        resource: resource || null,
        supported: CONTENT_RESOURCE_NAMES,
      },
      { status: 404 },
    );
  }
  return dispatchCrud(handlers, request);
}

export default vercelHandler(dispatchContentResource);
