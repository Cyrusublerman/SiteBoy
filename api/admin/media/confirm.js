import { requireAdmin, errorResponse, jsonResponse } from '../../_lib/auth.js';
import { vercelHandler } from '../../_lib/adapter.js';
import {
  abandonMultipart,
  confirmPendingUpload,
  finishMultipart,
  MediaLifecycleError,
  processDeletionQueue,
  restoreGalleryItem,
  retainGalleryItem,
} from './_lifecycle.js';

async function handlePost(request) {
  const actor = await requireAdmin(request);
  if (actor.error) return actor.error;

  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('invalid json', 400);
  }

  const action = body.action || 'confirm';
  const actorId = actor.userId || actor.user?.id;
  try {
    if (action === 'multipart-complete') {
      return jsonResponse(await finishMultipart({
        actorId,
        itemId: body.itemId,
        key: body.key,
        uploadId: body.uploadId,
        parts: body.parts,
        request,
      }));
    }
    if (action === 'multipart-abort') {
      return jsonResponse(await abandonMultipart({
        actorId,
        itemId: body.itemId,
        key: body.key,
        uploadId: body.uploadId,
        request,
      }));
    }
    if (action === 'delete') {
      return jsonResponse(await retainGalleryItem({ actorId, itemId: body.itemId, request }));
    }
    if (action === 'restore') {
      return jsonResponse(await restoreGalleryItem({ actorId, itemId: body.itemId, request }));
    }
    if (action === 'purge') {
      return jsonResponse(await processDeletionQueue({
        actorId,
        itemId: body.itemId,
        force: true,
        request,
      }));
    }
    if (action !== 'confirm' && action !== 'poster-confirm') {
      return errorResponse('unknown media confirmation action', 400);
    }
    if (!body.key || !body.itemId) return errorResponse('key and itemId required', 400);
    const result = await confirmPendingUpload({
      actorId,
      itemId: body.itemId,
      key: body.key,
      posterForItemId: action === 'poster-confirm' ? body.posterForItemId : null,
      metadata: {
        collection: body.collection,
        title: body.title,
        description: body.description,
        sourceTool: body.sourceTool,
        tags: body.tags,
        width: body.width,
        height: body.height,
        duration: body.duration,
        slug: body.slug,
        format: body.format,
      },
      request,
    });
    return jsonResponse(result);
  } catch (err) {
    if (err instanceof MediaLifecycleError) {
      return errorResponse(err.message, err.status);
    }
    return errorResponse(err.message || 'confirm failed', 500);
  }
}

export default vercelHandler(async (req) => {
  if (req.method !== 'POST') return errorResponse('method not allowed', 405);
  return handlePost(req);
});
