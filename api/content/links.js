import { schema } from '../_lib/db.js';
import { createCrudHandlers, dispatchCrud } from '../_lib/crud.js';

const handlers = createCrudHandlers({
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
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;

export default async function handler(request) {
  return dispatchCrud(handlers, request);
}
