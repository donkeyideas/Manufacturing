import { Router } from 'express';
import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../../database/connection.js';
import { blogPosts } from '../../database/schema.js';
import { asyncHandler } from '../../core/asyncHandler.js';
import { AppError } from '../../core/errorHandler.js';
import { requireAuth, type AuthenticatedRequest } from '../../core/auth.js';
import { validateBody } from '../../core/validate.js';

export const blogRouter = Router();

// ─── Public: List Published Posts ───

blogRouter.get(
  '/posts',
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const offset = Number(req.query.offset) || 0;

    const rows = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        authorId: blogPosts.authorId,
        featuredImageUrl: blogPosts.featuredImageUrl,
        tags: blogPosts.tags,
        wordCount: blogPosts.wordCount,
        publishedAt: blogPosts.publishedAt,
      })
      .from(blogPosts)
      .where(eq(blogPosts.status, 'published'))
      .orderBy(desc(blogPosts.publishedAt))
      .limit(limit)
      .offset(offset);

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(blogPosts)
      .where(eq(blogPosts.status, 'published'));

    res.json({ success: true, data: rows, total: Number(countResult.count) });
  }),
);

// ─── Public: Get Single Post by Slug ───

blogRouter.get(
  '/posts/:slug',
  asyncHandler(async (req, res) => {
    const slug = String(req.params.slug);

    const [post] = await db
      .select()
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, 'published')))
      .limit(1);

    if (!post) throw new AppError(404, 'Blog post not found');

    res.json({ success: true, data: post });
  }),
);

// ─── Auth Required: Create Post ───

blogRouter.post(
  '/posts',
  requireAuth,
  validateBody({
    title: { required: true, type: 'string', maxLength: 500 },
    slug: { required: true, type: 'string', maxLength: 500 },
    content: { required: true, type: 'string' },
  }),
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const {
      title, slug, content, excerpt, status,
      featuredImageUrl, tags, metaTitle, metaDescription,
      targetKeyword, wordCount,
    } = req.body;

    // Check for duplicate slug within tenant
    const [existing] = await db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.tenantId, user!.tenantId)))
      .limit(1);

    if (existing) throw new AppError(409, 'A post with this slug already exists');

    const publishedAt = status === 'published' ? new Date() : null;

    const [post] = await db.insert(blogPosts).values({
      tenantId: user!.tenantId,
      title,
      slug,
      content,
      excerpt: excerpt || null,
      status: status || 'draft',
      authorId: user!.userId,
      featuredImageUrl: featuredImageUrl || null,
      tags: tags ? JSON.stringify(tags) : null,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      targetKeyword: targetKeyword || null,
      wordCount: wordCount || content.split(/\s+/).length,
      publishedAt,
    }).returning();

    res.status(201).json({ success: true, data: post });
  }),
);

// ─── Auth Required: Update Post ───

blogRouter.put(
  '/posts/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const id = String(req.params.id);
    const {
      title, slug, content, excerpt, status,
      featuredImageUrl, tags, metaTitle, metaDescription,
      targetKeyword, wordCount,
    } = req.body;

    // Build the update payload, only including provided fields
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (title !== undefined) updates.title = title;
    if (slug !== undefined) updates.slug = slug;
    if (content !== undefined) {
      updates.content = content;
      updates.wordCount = wordCount || content.split(/\s+/).length;
    }
    if (excerpt !== undefined) updates.excerpt = excerpt;
    if (featuredImageUrl !== undefined) updates.featuredImageUrl = featuredImageUrl;
    if (tags !== undefined) updates.tags = JSON.stringify(tags);
    if (metaTitle !== undefined) updates.metaTitle = metaTitle;
    if (metaDescription !== undefined) updates.metaDescription = metaDescription;
    if (targetKeyword !== undefined) updates.targetKeyword = targetKeyword;

    if (status !== undefined) {
      updates.status = status;
      if (status === 'published') {
        updates.publishedAt = new Date();
      }
    }

    const [updated] = await db
      .update(blogPosts)
      .set(updates)
      .where(and(eq(blogPosts.id, id), eq(blogPosts.tenantId, user!.tenantId)))
      .returning();

    if (!updated) throw new AppError(404, 'Blog post not found');
    res.json({ success: true, data: updated });
  }),
);

// ─── Auth Required: Delete Post ───

blogRouter.delete(
  '/posts/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const id = String(req.params.id);

    const [deleted] = await db
      .delete(blogPosts)
      .where(and(eq(blogPosts.id, id), eq(blogPosts.tenantId, user!.tenantId)))
      .returning();

    if (!deleted) throw new AppError(404, 'Blog post not found');
    res.json({ success: true, message: 'Post deleted' });
  }),
);
