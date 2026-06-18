import {
  pgTable,
  text,
  timestamp,
  integer,
  bigint,
  jsonb,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull().default(''),
  totpSecret: text('totp_secret'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true, mode: 'date' }),
  ip: text('ip'),
  ua: text('ua'),
});

export const galleryItems = pgTable('gallery_items', {
  id: text('id').primaryKey(),
  gallerySlug: text('gallery_slug').notNull(),
  sortIndex: integer('sort_index').notNull().default(0),
  filename: text('filename').notNull(),
  urlsJsonb: jsonb('urls_jsonb').notNull().default({}),
  metadataJsonb: jsonb('metadata_jsonb').notNull().default({}),
  status: text('status').notNull().default('published'),
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
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  descriptionMd: text('description_md'),
  priceCents: integer('price_cents'),
  metadataJsonb: jsonb('metadata_jsonb').notNull().default({}),
  status: text('status').notNull().default('draft'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

export const notes = pgTable('notes', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  bodyMd: text('body_md'),
  metadataJsonb: jsonb('metadata_jsonb').notNull().default({}),
  status: text('status').notNull().default('draft'),
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
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

export const schema = {
  users,
  sessions,
  galleryItems,
  projects,
  products,
  notes,
  tags,
  links,
  auditLog,
  mediaUploads,
};
