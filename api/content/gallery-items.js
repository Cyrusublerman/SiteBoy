import { schema } from '../_lib/db.js';
import { createCrudHandlers, dispatchCrud } from '../_lib/crud.js';

const handlers = createCrudHandlers({
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
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;

export default async function handler(request) {
  return dispatchCrud(handlers, request);
}
