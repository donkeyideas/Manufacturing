import { Router } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '../../database/connection.js';
import { adminBlogPosts } from '../../database/schema.js';
import { asyncHandler } from '../../core/asyncHandler.js';
import { AppError } from '../../core/errorHandler.js';
import { validateBody } from '../../core/validate.js';
import { requireAdmin } from './adminAuth.js';

export const blogRouter = Router();

// GET /api/admin/blog
blogRouter.get(
  '/',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const posts = await db
      .select()
      .from(adminBlogPosts)
      .orderBy(desc(adminBlogPosts.createdAt));
    // Parse JSON string fields for the frontend
    const parsed = posts.map((p) => ({
      ...p,
      tags: p.tags ? JSON.parse(p.tags) : [],
      seoKeywords: p.seoKeywords ? JSON.parse(p.seoKeywords) : [],
    }));
    res.json({ success: true, data: parsed });
  }),
);

// GET /api/admin/blog/categories
blogRouter.get(
  '/categories',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    // Return static categories (can be made dynamic later)
    const categories = [
      { name: 'Technology', slug: 'technology' },
      { name: 'Manufacturing', slug: 'manufacturing' },
      { name: 'Business', slug: 'business' },
      { name: 'Industry Trends', slug: 'industry-trends' },
      { name: 'Case Studies', slug: 'case-studies' },
      { name: 'Product Updates', slug: 'product-updates' },
    ];
    res.json({ success: true, data: categories });
  }),
);

// GET /api/admin/blog/:id
blogRouter.get(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const [post] = await db
      .select()
      .from(adminBlogPosts)
      .where(eq(adminBlogPosts.id, id))
      .limit(1);
    if (!post) throw new AppError(404, 'Blog post not found');
    res.json({
      success: true,
      data: {
        ...post,
        tags: post.tags ? JSON.parse(post.tags) : [],
        seoKeywords: post.seoKeywords ? JSON.parse(post.seoKeywords) : [],
      },
    });
  }),
);

// POST /api/admin/blog
blogRouter.post(
  '/',
  requireAdmin,
  validateBody({
    title: { required: true, type: 'string' },
    slug: { required: true, type: 'string' },
  }),
  asyncHandler(async (req, res) => {
    const {
      title, slug, content, excerpt, status, category,
      tags, featuredImageUrl, seoTitle, seoDescription,
      seoKeywords, ogImageUrl, wordCount, authorName,
    } = req.body;

    const [post] = await db.insert(adminBlogPosts).values({
      title,
      slug,
      content: content || '',
      excerpt: excerpt || null,
      status: status || 'draft',
      category: category || null,
      tags: tags ? JSON.stringify(tags) : null,
      featuredImageUrl: featuredImageUrl || null,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      seoKeywords: seoKeywords ? JSON.stringify(seoKeywords) : null,
      ogImageUrl: ogImageUrl || null,
      wordCount: wordCount || 0,
      seoScore: 0,
      authorName: authorName || null,
      publishedAt: status === 'published' ? new Date() : null,
    }).returning();

    res.status(201).json({ success: true, data: post });
  }),
);

// PUT /api/admin/blog/:id
blogRouter.put(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
      title, slug, content, excerpt, status, category,
      tags, featuredImageUrl, seoTitle, seoDescription,
      seoKeywords, ogImageUrl, wordCount, seoScore, authorName,
    } = req.body;

    // Get current post to check publish status change
    const [current] = await db.select().from(adminBlogPosts).where(eq(adminBlogPosts.id, id)).limit(1);
    if (!current) throw new AppError(404, 'Blog post not found');

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (title !== undefined) updates.title = title;
    if (slug !== undefined) updates.slug = slug;
    if (content !== undefined) updates.content = content;
    if (excerpt !== undefined) updates.excerpt = excerpt;
    if (status !== undefined) updates.status = status;
    if (category !== undefined) updates.category = category;
    if (tags !== undefined) updates.tags = JSON.stringify(tags);
    if (featuredImageUrl !== undefined) updates.featuredImageUrl = featuredImageUrl;
    if (seoTitle !== undefined) updates.seoTitle = seoTitle;
    if (seoDescription !== undefined) updates.seoDescription = seoDescription;
    if (seoKeywords !== undefined) updates.seoKeywords = JSON.stringify(seoKeywords);
    if (ogImageUrl !== undefined) updates.ogImageUrl = ogImageUrl;
    if (wordCount !== undefined) updates.wordCount = wordCount;
    if (seoScore !== undefined) updates.seoScore = seoScore;
    if (authorName !== undefined) updates.authorName = authorName;

    // Set publishedAt when first published
    if (status === 'published' && current.status !== 'published') {
      updates.publishedAt = new Date();
    }

    const [updated] = await db
      .update(adminBlogPosts)
      .set(updates)
      .where(eq(adminBlogPosts.id, id))
      .returning();

    res.json({
      success: true,
      data: {
        ...updated,
        tags: updated.tags ? JSON.parse(updated.tags) : [],
        seoKeywords: updated.seoKeywords ? JSON.parse(updated.seoKeywords) : [],
      },
    });
  }),
);

// DELETE /api/admin/blog/:id
blogRouter.delete(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    await db.delete(adminBlogPosts).where(eq(adminBlogPosts.id, id));
    res.json({ success: true });
  }),
);
