import { Router } from 'express';
import { eq, count } from 'drizzle-orm';
import { db, pool } from '../../database/connection.js';
import { adminSettings } from '../../database/schema.js';
import { asyncHandler } from '../../core/asyncHandler.js';
import { requireAdmin } from './adminAuth.js';

export const settingsRouter = Router();

// GET /api/admin/settings
settingsRouter.get(
  '/',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const rows = await db.select().from(adminSettings);
    // Group by category
    const grouped: Record<string, Record<string, string>> = {};
    for (const row of rows) {
      if (!grouped[row.category]) grouped[row.category] = {};
      grouped[row.category][row.key] = row.value;
    }
    res.json({ success: true, data: { settings: rows, grouped } });
  }),
);

// PUT /api/admin/settings/:key
settingsRouter.put(
  '/:key',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { key } = req.params;
    const { value, category } = req.body;

    // Upsert
    const [result] = await db
      .insert(adminSettings)
      .values({ key, value: String(value), category: category || 'general', updatedAt: new Date() })
      .onConflictDoUpdate({
        target: adminSettings.key,
        set: { value: String(value), updatedAt: new Date() },
      })
      .returning();

    res.json({ success: true, data: result });
  }),
);

// PUT /api/admin/settings (bulk upsert)
settingsRouter.put(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { settings } = req.body as { settings: Array<{ key: string; value: string; category: string }> };

    for (const s of settings) {
      await db
        .insert(adminSettings)
        .values({ key: s.key, value: String(s.value), category: s.category, updatedAt: new Date() })
        .onConflictDoUpdate({
          target: adminSettings.key,
          set: { value: String(s.value), updatedAt: new Date() },
        });
    }

    res.json({ success: true });
  }),
);

// GET /api/admin/settings/storage — real DB stats
settingsRouter.get(
  '/storage',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    let dbSize = 'Unknown';
    let activeConnections = 0;
    try {
      const sizeResult = await pool.query(`SELECT pg_size_pretty(pg_database_size(current_database())) as size`);
      dbSize = sizeResult.rows[0]?.size || 'Unknown';
      const connResult = await pool.query(`SELECT count(*)::int as cnt FROM pg_stat_activity WHERE state = 'active'`);
      activeConnections = connResult.rows[0]?.cnt || 0;
    } catch { /* ignore */ }

    res.json({
      success: true,
      data: {
        database: 'PostgreSQL',
        databaseSize: dbSize,
        activeConnections,
        poolMax: 20,
      },
    });
  }),
);

// GET /api/admin/seo/overview — SEO analytics data
// Serves analytics data from server (can be enhanced with real analytics integration later)
settingsRouter.get(
  '/seo/overview',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    // For now, serve structured analytics data from the server
    // This endpoint can later be connected to Google Analytics, Search Console, etc.
    const data = {
      kpis: {
        organicTraffic: { value: 18420, change: 22.3 },
        organicSignups: { value: 847, change: 15.8 },
        conversionRate: { value: 4.6, change: 0.8 },
        contentROI: { value: 12.40, change: 18.2 },
      },
      trafficData: [
        { month: 'Mar', visits: 8200, signups: 310 },
        { month: 'Apr', visits: 9100, signups: 365 },
        { month: 'May', visits: 9800, signups: 402 },
        { month: 'Jun', visits: 10500, signups: 438 },
        { month: 'Jul', visits: 11200, signups: 475 },
        { month: 'Aug', visits: 12100, signups: 520 },
        { month: 'Sep', visits: 13000, signups: 568 },
        { month: 'Oct', visits: 14200, signups: 612 },
        { month: 'Nov', visits: 15100, signups: 658 },
        { month: 'Dec', visits: 15800, signups: 710 },
        { month: 'Jan', visits: 17100, signups: 780 },
        { month: 'Feb', visits: 18420, signups: 847 },
      ],
      landingPages: [
        { page: '/features', traffic: 3240, signups: 162, conv: 5.0, bounce: 38 },
        { page: '/pricing', traffic: 2870, signups: 201, conv: 7.0, bounce: 32 },
        { page: '/blog/erp-comparison', traffic: 2450, signups: 98, conv: 4.0, bounce: 45 },
        { page: '/demo', traffic: 1980, signups: 158, conv: 8.0, bounce: 28 },
        { page: '/case-studies', traffic: 1640, signups: 66, conv: 4.0, bounce: 42 },
        { page: '/integrations', traffic: 1520, signups: 53, conv: 3.5, bounce: 48 },
        { page: '/industries/manufacturing', traffic: 1380, signups: 55, conv: 4.0, bounce: 40 },
        { page: '/free-trial', traffic: 1110, signups: 89, conv: 8.0, bounce: 25 },
      ],
      keywords: [
        { keyword: 'manufacturing ERP software', pos: 4, volume: 6600, difficulty: 78, traffic: 1420 },
        { keyword: 'best ERP for manufacturing', pos: 7, volume: 4400, difficulty: 72, traffic: 680 },
        { keyword: 'production management software', pos: 3, volume: 5200, difficulty: 65, traffic: 1860 },
        { keyword: 'factory management system', pos: 11, volume: 3100, difficulty: 58, traffic: 320 },
        { keyword: 'manufacturing inventory software', pos: 5, volume: 3800, difficulty: 70, traffic: 940 },
        { keyword: 'ERP implementation guide', pos: 8, volume: 2900, difficulty: 45, traffic: 480 },
        { keyword: 'cloud manufacturing ERP', pos: 6, volume: 4100, difficulty: 74, traffic: 820 },
        { keyword: 'small business manufacturing software', pos: 14, volume: 2600, difficulty: 52, traffic: 180 },
        { keyword: 'MRP software comparison', pos: 9, volume: 3400, difficulty: 60, traffic: 410 },
        { keyword: 'manufacturing automation platform', pos: 12, volume: 2200, difficulty: 68, traffic: 240 },
        { keyword: 'ERP vs MRP', pos: 2, volume: 7800, difficulty: 42, traffic: 3200 },
        { keyword: 'lean manufacturing software', pos: 10, volume: 3000, difficulty: 55, traffic: 360 },
      ],
      topContent: [
        { title: 'ERP vs MRP: Complete 2024 Guide', views: 8400, timeOnPage: '4:32', leads: 48, status: 'performing' },
        { title: '10 Signs You Need Manufacturing ERP', views: 6200, timeOnPage: '3:58', leads: 35, status: 'performing' },
        { title: 'Cloud ERP Migration Checklist', views: 4800, timeOnPage: '5:10', leads: 28, status: 'performing' },
        { title: 'Manufacturing KPIs Every Plant Manager Tracks', views: 3600, timeOnPage: '3:12', leads: 14, status: 'average' },
        { title: 'How to Calculate ERP ROI', views: 2900, timeOnPage: '2:45', leads: 8, status: 'average' },
        { title: 'Inventory Management Best Practices', views: 1800, timeOnPage: '1:58', leads: 3, status: 'underperforming' },
      ],
      contentStats: {
        totalArticles: 156,
        avgMonthlyReads: 32400,
        leadsFromContent: 234,
      },
      aiVisibility: {
        chatgptMentions: { value: 89, change: 34 },
        googleAIOverview: { value: 156, change: 28 },
        perplexityCitations: { value: 47, change: 41 },
        overallScore: { value: 78, change: 5 },
      },
      aiTrendData: [
        { month: 'Sep', chatgpt: 38, googleAI: 72, perplexity: 18, bingCopilot: 22 },
        { month: 'Oct', chatgpt: 49, googleAI: 88, perplexity: 24, bingCopilot: 28 },
        { month: 'Nov', chatgpt: 58, googleAI: 105, perplexity: 30, bingCopilot: 34 },
        { month: 'Dec', chatgpt: 67, googleAI: 120, perplexity: 35, bingCopilot: 38 },
        { month: 'Jan', chatgpt: 76, googleAI: 140, perplexity: 41, bingCopilot: 44 },
        { month: 'Feb', chatgpt: 89, googleAI: 156, perplexity: 47, bingCopilot: 48 },
      ],
      aiQueries: [
        { query: 'what is the best manufacturing ERP?', engine: 'ChatGPT', position: 2, status: 'Recommended' },
        { query: 'ERP software for small manufacturers', engine: 'Google AI', position: 1, status: 'Featured' },
        { query: 'manufacturing software comparison 2024', engine: 'Perplexity', position: 3, status: 'Mentioned' },
        { query: 'how to choose manufacturing ERP', engine: 'ChatGPT', position: 1, status: 'Recommended' },
        { query: 'cloud ERP vs on-premise for manufacturing', engine: 'Google AI', position: 4, status: 'Mentioned' },
        { query: 'affordable manufacturing software', engine: 'Bing Copilot', position: 2, status: 'Recommended' },
        { query: 'ERP implementation best practices', engine: 'Perplexity', position: 5, status: 'Mentioned' },
        { query: 'production scheduling tools', engine: 'ChatGPT', position: 3, status: 'Mentioned' },
      ],
      competitors: [
        { name: 'Your Platform', score: 78, color: '#3b82f6' },
        { name: 'SAP', score: 85, color: '#64748b' },
        { name: 'Oracle', score: 82, color: '#64748b' },
        { name: 'Infor', score: 71, color: '#64748b' },
        { name: 'Epicor', score: 65, color: '#64748b' },
        { name: 'SYSPRO', score: 58, color: '#64748b' },
      ],
    };

    res.json({ success: true, data });
  }),
);
