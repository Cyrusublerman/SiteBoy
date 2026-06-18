import { schema } from '../_lib/db.js';
import { createCrudHandlers, dispatchCrud } from '../_lib/crud.js';

const handlers = createCrudHandlers({
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
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;

export default async function handler(request) {
  return dispatchCrud(handlers, request);
}
