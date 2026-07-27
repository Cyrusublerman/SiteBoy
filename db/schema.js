import {
  pgTable,
  text,
  timestamp,
  integer,
  bigint,
  jsonb,
  doublePrecision,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull().default(''),
  totpSecret: text('totp_secret'),
  totpSecretEnc: text('totp_secret_enc'),
  totpPendingSecretEnc: text('totp_pending_secret_enc'),
  totpEnabledAt: timestamp('totp_enabled_at', { withTimezone: true, mode: 'date' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true, mode: 'date' }),
  ip: text('ip'),
  ua: text('ua'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

export const recoveryCodes = pgTable('recovery_codes', {
  id: bigint('id', { mode: 'number' }).primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  codeHash: text('code_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  consumedAt: timestamp('consumed_at', { withTimezone: true, mode: 'date' }),
});

export const schemaMigrations = pgTable('schema_migrations', {
  filename: text('filename').primaryKey(),
  checksum: text('checksum').notNull(),
  appliedAt: timestamp('applied_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

export const galleryItems = pgTable('gallery_items', {
  id: text('id').primaryKey(),
  gallerySlug: text('gallery_slug').notNull(),
  sortIndex: integer('sort_index').notNull().default(0),
  filename: text('filename').notNull(),
  urlsJsonb: jsonb('urls_jsonb').notNull().default({}),
  metadataJsonb: jsonb('metadata_jsonb').notNull().default({}),
  status: text('status').notNull().default('draft'),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  mediaUrl: text('media_url'),
  thumbUrl: text('thumb_url'),
  format: text('format'),
  sourceTool: text('source_tool'),
  tags: jsonb('tags').notNull().default([]),
  collection: text('collection'),
  width: integer('width'),
  height: integer('height'),
  duration: doublePrecision('duration'),
  sha256: text('sha256'),
  thumbStatus: text('thumb_status').notNull().default('pending'),
  thumbAttempts: integer('thumb_attempts').notNull().default(0),
  thumbErrorCode: text('thumb_error_code'),
  displayMode: text('display_mode').notNull().default('grid'),
  groupKey: text('group_key'),
  altText: text('alt_text').notNull().default(''),
  version: integer('version').notNull().default(1),
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

export const galleries = pgTable('galleries', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  kind: text('kind').notNull().default('photos'),
  title: text('title').notNull(),
  descriptionMd: text('description_md').notNull().default(''),
  sortJsonb: jsonb('sort_jsonb').notNull().default([]),
  status: text('status').notNull().default('draft'),
  version: integer('version').notNull().default(1),
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  summaryMd: text('summary_md'),
  bodyMd: text('body_md'),
  frontmatterJsonb: jsonb('frontmatter_jsonb').notNull().default({}),
  status: text('status').notNull().default('draft'),
  sortIndex: integer('sort_index').notNull().default(0),
  kind: text('kind').notNull().default('manifest'),
  route: text('route').notNull().default(''),
  manifestPath: text('manifest_path'),
  sectionsJsonb: jsonb('sections_jsonb').notNull().default([]),
  version: integer('version').notNull().default(1),
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  descriptionMd: text('description_md'),
  priceCents: integer('price_cents').notNull().default(0),
  metadataJsonb: jsonb('metadata_jsonb').notNull().default({}),
  sku: text('sku').notNull().default('').unique(),
  currency: text('currency').notNull().default('AUD'),
  stockQuantity: integer('stock_quantity').notNull().default(0),
  imageUrl: text('image_url'),
  status: text('status').notNull().default('draft'),
  version: integer('version').notNull().default(1),
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

export const notes = pgTable('notes', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  bodyMd: text('body_md').notNull().default(''),
  metadataJsonb: jsonb('metadata_jsonb').notNull().default({}),
  category: text('category').notNull().default('general'),
  excerptMd: text('excerpt_md').notNull().default(''),
  status: text('status').notNull().default('draft'),
  version: integer('version').notNull().default(1),
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

export const articles = pgTable('articles', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  category: text('category').notNull(),
  title: text('title').notNull(),
  bodyMd: text('body_md').notNull(),
  frontmatterJsonb: jsonb('frontmatter_jsonb').notNull().default({}),
  status: text('status').notNull().default('draft'),
  publishedAt: timestamp('published_at', { withTimezone: true, mode: 'date' }),
  version: integer('version').notNull().default(1),
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

export const pageBlocks = pgTable('page_blocks', {
  id: text('id').primaryKey(),
  pageSlug: text('page_slug').notNull().unique(),
  title: text('title').notNull(),
  blocksJsonb: jsonb('blocks_jsonb').notNull().default([]),
  status: text('status').notNull().default('draft'),
  version: integer('version').notNull().default(1),
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

export const contentVersions = pgTable('content_versions', {
  id: text('id').primaryKey(),
  resourceKind: text('resource_kind').notNull(),
  resourceId: text('resource_id').notNull(),
  version: integer('version').notNull(),
  snapshotJsonb: jsonb('snapshot_jsonb').notNull(),
  action: text('action').notNull(),
  editorId: text('editor_id').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

export const deletionQueue = pgTable('deletion_queue', {
  id: text('id').primaryKey(),
  resourceKind: text('resource_kind').notNull(),
  resourceId: text('resource_id').notNull(),
  storageKey: text('storage_key'),
  status: text('status').notNull().default('pending'),
  lifecycleStatus: text('lifecycle_status').notNull().default('retained'),
  attempts: integer('attempts').notNull().default(0),
  lastError: text('last_error'),
  errorCode: text('error_code'),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  retentionUntil: timestamp('retention_until', { withTimezone: true, mode: 'date' }),
  processedAt: timestamp('processed_at', { withTimezone: true, mode: 'date' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

export const tags = pgTable('tags', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  label: text('label').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

export const links = pgTable('links', {
  id: text('id').primaryKey(),
  sourceKind: text('source_kind').notNull(),
  sourceId: text('source_id').notNull(),
  targetKind: text('target_kind').notNull(),
  targetId: text('target_id').notNull(),
  rel: text('rel').notNull().default('tagged'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

export const auditLog = pgTable('audit_log', {
  id: text('id').primaryKey(),
  actorId: text('actor_id').references(() => users.id),
  action: text('action').notNull(),
  targetKind: text('target_kind'),
  targetId: text('target_id'),
  beforeHash: text('before_hash'),
  afterHash: text('after_hash'),
  ip: text('ip'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

export const mediaUploads = pgTable('media_uploads', {
  id: text('id').primaryKey(),
  r2Key: text('r2_key').notNull().unique(),
  mime: text('mime').notNull(),
  bytes: bigint('bytes', { mode: 'number' }).notNull().default(0),
  sha256: text('sha256'),
  uploadedBy: text('uploaded_by').references(() => users.id),
  status: text('status').notNull().default('confirmed'),
  expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }),
  confirmedAt: timestamp('confirmed_at', { withTimezone: true, mode: 'date' }),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  multipartUploadId: text('multipart_upload_id'),
  completedPartsJsonb: jsonb('completed_parts_jsonb').notNull().default([]),
  attempts: integer('attempts').notNull().default(0),
  lastErrorCode: text('last_error_code'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

export const schema = {
  users,
  sessions,
  recoveryCodes,
  schemaMigrations,
  galleries,
  galleryItems,
  projects,
  products,
  notes,
  articles,
  pageBlocks,
  contentVersions,
  deletionQueue,
  tags,
  links,
  auditLog,
  mediaUploads,
};
