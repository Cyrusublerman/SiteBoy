import { schema } from '../_lib/db.js';
import { createCrudHandlers, dispatchCrud } from '../_lib/crud.js';

const handlers = createCrudHandlers({
  table: schema.tags,
  kind: 'tag',
  mapInsert: (body) => ({
    id: body.id,
    slug: body.slug ?? body.id,
    label: body.label ?? body.slug ?? 'Untitled',
  }),
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;

export default async function handler(request) {
  return dispatchCrud(handlers, request);
}
