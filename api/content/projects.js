import { schema } from '../_lib/db.js';
import { createCrudHandlers, dispatchCrud } from '../_lib/crud.js';

const handlers = createCrudHandlers({
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
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;

export default async function handler(request) {
  return dispatchCrud(handlers, request);
}
