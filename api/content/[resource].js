import { schema } from '../_lib/db.js';
import { createCrudHandlers, dispatchCrud } from '../_lib/crud.js';
import { vercelHandler } from '../_lib/adapter.js';

const PUBLICATION_STATUSES = Object.freeze(['draft', 'published', 'archived']);
const GALLERY_KINDS = Object.freeze([
  'photos', 'digital', 'render', 'book', 'physical', 'objects', 'project',
]);
const DISPLAY_MODES = Object.freeze(['grid', 'carousel', 'slideshow', 'hidden']);

const RESOURCE_DEFINITIONS = Object.freeze({
  galleries: {
    table: schema.galleries,
    kind: 'gallery',
    publicRead: 'published',
    versioned: true,
    fieldPolicy: {
      strings: ['slug', 'kind', 'title'],
      text: ['descriptionMd'],
      arrays: ['sortJsonb'],
      enums: { status: PUBLICATION_STATUSES, kind: GALLERY_KINDS },
    },
    createFieldMap: {
      slug: 'slug', kind: 'kind', title: 'title', descriptionMd: 'descriptionMd',
      sortJsonb: 'sortJsonb', status: 'status',
    },
    updateFieldMap: {
      slug: 'slug', kind: 'kind', title: 'title', descriptionMd: 'descriptionMd',
      sortJsonb: 'sortJsonb', status: 'status',
    },
    buildInsert: (fields, id) => ({
      id,
      slug: fields.slug ?? id,
      kind: fields.kind ?? 'photos',
      title: fields.title ?? 'Untitled',
      descriptionMd: fields.descriptionMd ?? '',
      sortJsonb: fields.sortJsonb ?? [],
      status: fields.status ?? 'draft',
      version: 1,
    }),
  },
  'gallery-items': {
    table: schema.galleryItems,
    kind: 'gallery_item',
    publicRead: 'published',
    versioned: true,
    fieldPolicy: {
      strings: ['gallerySlug', 'filename', 'slug', 'title'],
      text: ['altText'],
      nullableStrings: [
        'description', 'mediaUrl', 'thumbUrl', 'format', 'sourceTool', 'collection', 'groupKey',
      ],
      arrays: ['tags'],
      objects: ['urlsJsonb', 'metadataJsonb'],
      finiteNumbers: ['sortIndex', 'width', 'height', 'duration'],
      enums: { status: PUBLICATION_STATUSES, displayMode: DISPLAY_MODES },
    },
    createFieldMap: {
      gallerySlug: 'gallerySlug',
      sortIndex: 'sortIndex',
      filename: 'filename',
      urlsJsonb: 'urlsJsonb',
      metadataJsonb: 'metadataJsonb',
      status: 'status',
      slug: 'slug',
      title: 'title',
      description: 'description',
      mediaUrl: 'mediaUrl',
      thumbUrl: 'thumbUrl',
      format: 'format',
      sourceTool: 'sourceTool',
      tags: 'tags',
      collection: 'collection',
      width: 'width',
      height: 'height',
      duration: 'duration',
      displayMode: 'displayMode',
      groupKey: 'groupKey',
      altText: 'altText',
    },
    updateFieldMap: {
      gallerySlug: 'gallerySlug',
      sortIndex: 'sortIndex',
      filename: 'filename',
      urlsJsonb: 'urlsJsonb',
      metadataJsonb: 'metadataJsonb',
      status: 'status',
      slug: 'slug',
      title: 'title',
      description: 'description',
      mediaUrl: 'mediaUrl',
      thumbUrl: 'thumbUrl',
      format: 'format',
      sourceTool: 'sourceTool',
      tags: 'tags',
      collection: 'collection',
      width: 'width',
      height: 'height',
      duration: 'duration',
      displayMode: 'displayMode',
      groupKey: 'groupKey',
      altText: 'altText',
    },
    buildInsert: (fields, id) => ({
      id,
      gallerySlug: fields.gallerySlug ?? 'default',
      sortIndex: fields.sortIndex ?? 0,
      filename: fields.filename ?? 'untitled',
      urlsJsonb: fields.urlsJsonb ?? {},
      metadataJsonb: fields.metadataJsonb ?? {},
      status: fields.status ?? 'draft',
      slug: fields.slug ?? id,
      title: fields.title ?? 'Untitled',
      description: fields.description ?? null,
      mediaUrl: fields.mediaUrl ?? null,
      thumbUrl: fields.thumbUrl ?? null,
      format: fields.format ?? null,
      sourceTool: fields.sourceTool ?? null,
      tags: fields.tags ?? [],
      collection: fields.collection ?? fields.gallerySlug ?? 'default',
      width: fields.width ?? null,
      height: fields.height ?? null,
      duration: fields.duration ?? null,
      displayMode: fields.displayMode ?? 'grid',
      groupKey: fields.groupKey ?? null,
      altText: fields.altText ?? fields.title ?? fields.filename ?? 'Untitled',
      version: 1,
    }),
  },
  articles: {
    table: schema.articles,
    kind: 'article',
    publicRead: 'published',
    versioned: true,
    fieldPolicy: {
      strings: ['slug', 'category', 'title'],
      text: ['bodyMd'],
      isoDates: ['publishedAt'],
      objects: ['frontmatterJsonb'],
      enums: { status: PUBLICATION_STATUSES },
    },
    normaliseFields: (fields) => ({
      ...fields,
      ...(Object.hasOwn(fields, 'publishedAt') && {
        publishedAt: fields.publishedAt === null ? null : new Date(fields.publishedAt),
      }),
    }),
    createFieldMap: {
      slug: 'slug', category: 'category', title: 'title', bodyMd: 'bodyMd',
      frontmatterJsonb: 'frontmatterJsonb', status: 'status', publishedAt: 'publishedAt',
    },
    updateFieldMap: {
      slug: 'slug', category: 'category', title: 'title', bodyMd: 'bodyMd',
      frontmatterJsonb: 'frontmatterJsonb', status: 'status', publishedAt: 'publishedAt',
    },
    buildInsert: (fields, id) => ({
      id,
      slug: fields.slug ?? id,
      category: fields.category ?? 'blog',
      title: fields.title ?? 'Untitled',
      bodyMd: fields.bodyMd ?? '',
      frontmatterJsonb: fields.frontmatterJsonb ?? {},
      status: fields.status ?? 'draft',
      publishedAt: fields.publishedAt ?? null,
      version: 1,
    }),
  },
  links: {
    table: schema.links,
    kind: 'link',
    publicRead: 'none',
    createFieldMap: {
      sourceKind: 'sourceKind',
      sourceId: 'sourceId',
      targetKind: 'targetKind',
      targetId: 'targetId',
      rel: 'rel',
    },
    updateFieldMap: {
      sourceKind: 'sourceKind',
      sourceId: 'sourceId',
      targetKind: 'targetKind',
      targetId: 'targetId',
      rel: 'rel',
    },
    buildInsert: (fields, id) => ({
      id,
      sourceKind: fields.sourceKind,
      sourceId: fields.sourceId,
      targetKind: fields.targetKind,
      targetId: fields.targetId,
      rel: fields.rel ?? 'tagged',
    }),
  },
  notes: {
    table: schema.notes,
    kind: 'note',
    publicRead: 'published',
    versioned: true,
    fieldPolicy: {
      strings: ['slug', 'title', 'category'],
      text: ['bodyMd', 'excerptMd'],
      objects: ['metadataJsonb'],
      enums: { status: PUBLICATION_STATUSES },
    },
    createFieldMap: {
      slug: 'slug',
      title: 'title',
      bodyMd: 'bodyMd',
      metadataJsonb: 'metadataJsonb',
      status: 'status',
      category: 'category',
      excerptMd: 'excerptMd',
    },
    updateFieldMap: {
      slug: 'slug',
      title: 'title',
      bodyMd: 'bodyMd',
      metadataJsonb: 'metadataJsonb',
      status: 'status',
      category: 'category',
      excerptMd: 'excerptMd',
    },
    buildInsert: (fields, id) => ({
      id,
      slug: fields.slug ?? id,
      title: fields.title ?? 'Untitled',
      bodyMd: fields.bodyMd ?? null,
      metadataJsonb: fields.metadataJsonb ?? {},
      status: fields.status ?? 'draft',
      category: fields.category ?? 'general',
      excerptMd: fields.excerptMd ?? '',
      version: 1,
    }),
  },
  'page-blocks': {
    table: schema.pageBlocks,
    kind: 'page_block',
    publicRead: 'published',
    versioned: true,
    fieldPolicy: {
      strings: ['pageSlug', 'title'],
      arrays: ['blocksJsonb'],
      enums: { status: PUBLICATION_STATUSES },
    },
    createFieldMap: {
      pageSlug: 'pageSlug', title: 'title', blocksJsonb: 'blocksJsonb', status: 'status',
    },
    updateFieldMap: {
      pageSlug: 'pageSlug', title: 'title', blocksJsonb: 'blocksJsonb', status: 'status',
    },
    buildInsert: (fields, id) => ({
      id,
      pageSlug: fields.pageSlug ?? id,
      title: fields.title ?? 'Untitled',
      blocksJsonb: fields.blocksJsonb ?? [],
      status: fields.status ?? 'draft',
      version: 1,
    }),
  },
  products: {
    table: schema.products,
    kind: 'product',
    publicRead: 'published',
    versioned: true,
    fieldPolicy: {
      strings: ['slug', 'title', 'sku', 'currency'],
      text: ['descriptionMd'],
      nullableStrings: ['imageUrl'],
      objects: ['metadataJsonb'],
      nonNegativeIntegers: ['priceCents', 'stockQuantity'],
      enums: { status: PUBLICATION_STATUSES },
    },
    createFieldMap: {
      slug: 'slug',
      title: 'title',
      descriptionMd: 'descriptionMd',
      priceCents: 'priceCents',
      metadataJsonb: 'metadataJsonb',
      status: 'status',
      sku: 'sku',
      currency: 'currency',
      stockQuantity: 'stockQuantity',
      imageUrl: 'imageUrl',
    },
    updateFieldMap: {
      slug: 'slug',
      title: 'title',
      descriptionMd: 'descriptionMd',
      priceCents: 'priceCents',
      metadataJsonb: 'metadataJsonb',
      status: 'status',
      sku: 'sku',
      currency: 'currency',
      stockQuantity: 'stockQuantity',
      imageUrl: 'imageUrl',
    },
    buildInsert: (fields, id) => ({
      id,
      slug: fields.slug ?? id,
      title: fields.title ?? 'Untitled',
      descriptionMd: fields.descriptionMd ?? null,
      priceCents: fields.priceCents ?? 0,
      metadataJsonb: fields.metadataJsonb ?? {},
      status: fields.status ?? 'draft',
      sku: fields.sku ?? fields.slug ?? id,
      currency: fields.currency ?? 'AUD',
      stockQuantity: fields.stockQuantity ?? 0,
      imageUrl: fields.imageUrl ?? null,
      version: 1,
    }),
  },
  projects: {
    table: schema.projects,
    kind: 'project',
    publicRead: 'published',
    versioned: true,
    fieldPolicy: {
      strings: ['slug', 'title', 'kind', 'route'],
      nullableStrings: ['summaryMd', 'bodyMd', 'manifestPath'],
      objects: ['frontmatterJsonb'],
      arrays: ['sectionsJsonb'],
      nonNegativeIntegers: ['sortIndex'],
      enums: {
        status: PUBLICATION_STATUSES,
        kind: ['manifest', 'bespoke', 'idea'],
      },
    },
    createFieldMap: {
      slug: 'slug',
      title: 'title',
      summaryMd: 'summaryMd',
      bodyMd: 'bodyMd',
      frontmatterJsonb: 'frontmatterJsonb',
      status: 'status',
      sortIndex: 'sortIndex',
      kind: 'kind',
      route: 'route',
      manifestPath: 'manifestPath',
      sectionsJsonb: 'sectionsJsonb',
    },
    updateFieldMap: {
      slug: 'slug',
      title: 'title',
      summaryMd: 'summaryMd',
      bodyMd: 'bodyMd',
      frontmatterJsonb: 'frontmatterJsonb',
      status: 'status',
      sortIndex: 'sortIndex',
      kind: 'kind',
      route: 'route',
      manifestPath: 'manifestPath',
      sectionsJsonb: 'sectionsJsonb',
    },
    buildInsert: (fields, id) => ({
      id,
      slug: fields.slug ?? id,
      title: fields.title ?? 'Untitled',
      summaryMd: fields.summaryMd ?? null,
      bodyMd: fields.bodyMd ?? null,
      frontmatterJsonb: fields.frontmatterJsonb ?? {},
      status: fields.status ?? 'draft',
      sortIndex: fields.sortIndex ?? 0,
      kind: fields.kind ?? 'manifest',
      route: fields.route ?? `/#projects/${fields.slug ?? id}`,
      manifestPath: fields.manifestPath ?? null,
      sectionsJsonb: fields.sectionsJsonb ?? [],
      version: 1,
    }),
  },
  tags: {
    table: schema.tags,
    kind: 'tag',
    publicRead: 'none',
    createFieldMap: {
      slug: 'slug',
      label: 'label',
    },
    updateFieldMap: {
      slug: 'slug',
      label: 'label',
    },
    buildInsert: (fields, id) => ({
      id,
      slug: fields.slug ?? id,
      label: fields.label ?? fields.slug ?? 'Untitled',
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
