import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import {
  handleAIChatQuery, analyzeFeedbackWithAI, detectLanguageAndTranslate,
  transcribeAudioFeedback, analyzeTargetProductWithAI
} from './server/ai.js';
import { User, Feedback, FeedbackStatus, SentimentType, PriorityLevel, PermissionKey } from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Basic CORS & Security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Rewrite /api/... (non-v1) to /api/v1/... for clean REST compatibility
  app.use((req, res, next) => {
    if (req.url.startsWith('/api/') && !req.url.startsWith('/api/v1/') && !req.url.startsWith('/api/docs')) {
      req.url = req.url.replace('/api/', '/api/v1/');
    }
    next();
  });

  // In-Memory Rate Limiter (Token Bucket / Sliding Window)
  const rateLimitWindowMs = 15 * 60 * 1000;
  const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();
  app.use('/api', (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();
    let entry = ipRequestCounts.get(ip);
    if (!entry || entry.resetTime < now) {
      entry = { count: 1, resetTime: now + rateLimitWindowMs };
      ipRequestCounts.set(ip, entry);
    } else {
      entry.count++;
    }
    const limit = 500;
    res.setHeader('X-RateLimit-Limit', limit.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - entry.count).toString());
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000).toString());
    if (entry.count > limit) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Please slow down and try again later.',
        retryAfterSeconds: Math.ceil((entry.resetTime - now) / 1000)
      });
    }
    next();
  });

  // Current logged in mock user session helper
  function getActor(req: Request): User {
    const email = (req.headers['x-user-email'] as string) || 'admin@example.com';
    const user = db.getUser(email);
    return user || db.getUsers()[0];
  }

  // RBAC Permission Enforcement Middleware
  function requirePermission(permission: PermissionKey) {
    return (req: Request, res: Response, next: NextFunction) => {
      const actor = getActor(req);
      if (!db.hasPermission(actor.role, permission)) {
        return res.status(403).json({
          success: false,
          error: `Forbidden: User role '${actor.role}' lacks required permission '${permission}'.`,
          code: 'FORBIDDEN_PERMISSION_DENIED',
          requiredPermission: permission,
          currentRole: actor.role
        });
      }
      next();
    };
  }

  // ==========================================
  // REAL-TIME SERVER-SENT EVENTS (SSE) STREAM
  // ==========================================
  app.get('/api/v1/stream', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Send initial connected ping
    res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);

    const unsubscribe = db.subscribe((event, data) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    });

    req.on('close', () => {
      unsubscribe();
      res.end();
    });
  });

  // ==========================================
  // AUTH & SESSION APIS
  // ==========================================
  app.post('/api/v1/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = db.getUser(email);
    if (!user) {
      // Allow demo login for any sample email or fallback to admin
      const fallbackUser = db.getUsers()[0];
      return res.json({
        success: true,
        user: fallbackUser,
        token: `mock_jwt_token_${fallbackUser.id}`,
        organization: db.getOrganization()
      });
    }
    return res.json({
      success: true,
      user,
      token: `mock_jwt_token_${user.id}`,
      organization: db.getOrganization()
    });
  });

  app.get('/api/v1/auth/me', (req: Request, res: Response) => {
    const actor = getActor(req);
    res.json({
      success: true,
      user: actor,
      organization: db.getOrganization(),
      users: db.getUsers()
    });
  });

  app.post('/api/v1/auth/role-switch', (req: Request, res: Response) => {
    const { role, userId } = req.body;
    const actor = getActor(req);
    const updated = db.updateUserRole(userId || actor.id, role, actor);
    res.json({ success: true, user: updated });
  });

  // ==========================================
  // ROLE-SPECIFIC DASHBOARD APIS (4 EXPERIENCES)
  // ==========================================
  // 1. ADMIN DASHBOARD: Platform Governance & Control
  app.get('/api/v1/dashboard/admin', (req: Request, res: Response) => {
    const actor = getActor(req);
    if (actor.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Admin dashboard access restricted to ADMIN role. Current role: ${actor.role}`,
        code: 'FORBIDDEN_ROLE_RESTRICTED'
      });
    }
    const data = db.getAdminDashboardData();
    res.json({ success: true, data });
  });

  // 2. MANAGER DASHBOARD: Business Decisions & Triage
  app.get('/api/v1/dashboard/manager', (req: Request, res: Response) => {
    const actor = getActor(req);
    if (actor.role !== 'ADMIN' && actor.role !== 'MANAGER') {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Manager dashboard access restricted to MANAGER and ADMIN roles. Current role: ${actor.role}`,
        code: 'FORBIDDEN_ROLE_RESTRICTED'
      });
    }
    const data = db.getManagerDashboardData();
    res.json({ success: true, data });
  });

  // 3. ANALYST DASHBOARD: Deep Investigation & Evidence Workspace
  app.get('/api/v1/dashboard/analyst', (req: Request, res: Response) => {
    const actor = getActor(req);
    if (actor.role !== 'ADMIN' && actor.role !== 'MANAGER' && actor.role !== 'ANALYST') {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Analyst workspace restricted to ANALYST, MANAGER, and ADMIN roles. Current role: ${actor.role}`,
        code: 'FORBIDDEN_ROLE_RESTRICTED'
      });
    }
    const data = db.getAnalystDashboardData();
    res.json({ success: true, data });
  });

  // 4. VIEWER DASHBOARD: Executive Visibility (Read-Only)
  app.get('/api/v1/dashboard/viewer', (req: Request, res: Response) => {
    const data = db.getViewerDashboardData();
    res.json({ success: true, data });
  });

  // ==========================================
  // RBAC & PERMISSIONS MANAGEMENT APIS
  // ==========================================
  app.get('/api/v1/rbac/permissions', (req: Request, res: Response) => {
    const permissions = db.getRolePermissions();
    res.json({ success: true, data: permissions });
  });

  app.put('/api/v1/rbac/permissions', requirePermission('role.manage'), (req: Request, res: Response) => {
    const actor = getActor(req);
    const updated = db.updateRolePermissions(req.body, actor);
    res.json({ success: true, data: updated });
  });

  // ==========================================
  // RECOMMENDATION APPROVAL WORKFLOW APIS
  // ==========================================
  app.post('/api/v1/recommendations/:id/approve', requirePermission('recommendation.approve'), (req: Request, res: Response) => {
    const actor = getActor(req);
    const { actionTaken } = req.body;
    const result = db.approveRecommendationAction(req.params.id, actor, actionTaken);
    res.json({ success: true, data: result });
  });

  app.post('/api/v1/recommendations/:id/reject', requirePermission('recommendation.approve'), (req: Request, res: Response) => {
    const actor = getActor(req);
    const { reason } = req.body;
    const result = db.rejectRecommendationAction(req.params.id, actor, reason);
    res.json({ success: true, data: result });
  });

  // ==========================================
  // SYSTEM & AI CONFIGURATION APIS
  // ==========================================
  app.get('/api/v1/settings/ai-config', (req: Request, res: Response) => {
    const config = db.getAIConfiguration();
    res.json({ success: true, data: config });
  });

  app.put('/api/v1/settings/ai-config', requirePermission('system.configure'), (req: Request, res: Response) => {
    const actor = getActor(req);
    const result = db.updateAIConfiguration(req.body, actor);
    res.json({ success: true, ...result });
  });

  // AI Chat & Query API
  app.post('/api/v1/ai/chat', async (req: Request, res: Response) => {
    try {
      const { query, history } = req.body;
      const result = await db.handleConversationalQuery(query, history || []);
      res.json({ success: true, response: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });


  // ==========================================
  // FEEDBACK APIS (CRUD, Filter, Search, Sort)
  // ==========================================
  app.get('/api/v1/feedback', (req: Request, res: Response) => {
    const {
      page, limit, search, sentiment, priority, intent,
      productId, status, source, startDate, endDate, sortBy
    } = req.query;

    const result = db.getFeedbacks({
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
      search: search as string,
      sentiment: sentiment as SentimentType,
      priority: priority as PriorityLevel,
      intent: intent as string,
      productId: productId as string,
      status: status as FeedbackStatus,
      source: source as string,
      startDate: startDate as string,
      endDate: endDate as string,
      sortBy: sortBy as any
    });

    res.json({ success: true, ...result });
  });

  app.get('/api/v1/feedback/:id', (req: Request, res: Response) => {
    const feedback = db.getFeedbackById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ success: false, error: 'Feedback not found' });
    }
    const similar = db.findSimilarFeedback(feedback.text);
    res.json({ success: true, feedback, similarFeedback: similar ? similar.feedback : null });
  });

  app.post('/api/v1/feedback', async (req: Request, res: Response) => {
    try {
      const { customerName, customerEmail, productId, rating, text, source, tags } = req.body;
      if (!customerName || !customerEmail || !text || !rating) {
        return res.status(400).json({ success: false, error: 'Missing required feedback fields' });
      }

      const feedback = await db.createFeedback({
        customerName,
        customerEmail,
        productId: productId || db.getProducts()[0].id,
        rating: Number(rating),
        text,
        source: source || 'MANUAL',
        tags: tags || []
      });

      res.status(201).json({ success: true, feedback });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // Public feedback submission (no auth required)
  app.post('/api/v1/public/feedback', async (req: Request, res: Response) => {
    try {
      const { customerName, customerEmail, productId, rating, text } = req.body;
      if (!customerName || !customerEmail || !text || !rating) {
        return res.status(400).json({ success: false, error: 'Name, email, rating, and feedback are required.' });
      }

      const feedback = await db.createFeedback({
        customerName,
        customerEmail,
        productId: productId || db.getProducts()[0].id,
        rating: Number(rating),
        text,
        source: 'PUBLIC_FORM',
      });

      res.status(201).json({
        success: true,
        message: 'Thank you! Your feedback has been received and analyzed by our AI intelligence pipeline.',
        feedbackId: feedback.id
      });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  app.patch('/api/v1/feedback/:id/status', (req: Request, res: Response) => {
    const actor = getActor(req);
    const { status } = req.body;
    const updated = db.updateFeedbackStatus(req.params.id, status, actor);
    if (!updated) return res.status(404).json({ success: false, error: 'Feedback not found' });
    res.json({ success: true, feedback: updated });
  });

  app.patch('/api/v1/feedback/:id/tags', (req: Request, res: Response) => {
    const actor = getActor(req);
    const { tags } = req.body;
    if (!Array.isArray(tags)) return res.status(400).json({ success: false, error: 'Tags must be an array of strings' });
    const updated = db.updateFeedbackTags(req.params.id, tags, actor);
    if (!updated) return res.status(404).json({ success: false, error: 'Feedback not found' });
    res.json({ success: true, feedback: updated });
  });

  app.delete('/api/v1/feedback/:id', (req: Request, res: Response) => {
    const actor = getActor(req);
    const ok = db.deleteFeedback(req.params.id, actor);
    if (!ok) return res.status(404).json({ success: false, error: 'Feedback not found' });
    res.json({ success: true, message: 'Feedback deleted successfully' });
  });

  // ==========================================
  // CSV BATCH IMPORT PIPELINE
  // ==========================================
  app.post('/api/v1/feedback/import-csv', async (req: Request, res: Response) => {
    try {
      const { rows } = req.body; // Array of { customer_name, email, rating, feedback, product, date }
      if (!Array.isArray(rows) || rows.length === 0) {
        return res.status(400).json({ success: false, error: 'Invalid or empty CSV rows array' });
      }

      const products = db.getProducts();
      const createdItems = [];

      for (const row of rows.slice(0, 100)) { // limit to 100 per batch for speed
        const matchedProd = products.find(p => p.name.toLowerCase().includes((row.product || '').toLowerCase())) || products[0];
        const item = await db.createFeedback({
          customerName: row.customer_name || row.customerName || 'Anonymous Customer',
          customerEmail: row.email || row.customerEmail || 'user@example.com',
          productId: matchedProd.id,
          rating: parseInt(row.rating) || 3,
          text: row.feedback || row.text || 'Imported feedback entry',
          source: 'CSV_IMPORT'
        });
        createdItems.push(item);
      }

      res.json({
        success: true,
        importedCount: createdItems.length,
        items: createdItems
      });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // ==========================================
  // AI INTELLIGENCE & CHAT ANALYST APIS
  // ==========================================
  app.post('/api/v1/ai/analyze-preview', async (req: Request, res: Response) => {
    try {
      const { text, rating, productName } = req.body;
      const analysis = await analyzeFeedbackWithAI(text || '', rating || 3, productName || 'Acme Product');
      res.json({ success: true, analysis });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  app.post('/api/v1/ai/chat', async (req: Request, res: Response) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ success: false, error: 'Query is required' });
      }

      const overview = db.getAnalyticsOverview();
      const topComplaints = db.getTopComplaints();
      const featureRequests = db.getFeatureRequests();
      const recommendations = db.getTopRecommendations();

      const platformContext = {
        totalFeedback: overview.totalFeedback,
        positivePct: overview.positivePercentage,
        neutralPct: overview.neutralPercentage,
        negativePct: overview.negativePercentage,
        avgRating: overview.avgRating,
        csat: overview.csat,
        nps: overview.nps,
        criticalIssuesCount: overview.criticalIssuesCount,
        topComplaints,
        products: overview.productSentiment,
        featureRequests: featureRequests.slice(0, 5),
        recommendations,
        anomalies: overview.anomalies
      };

      const result = await handleAIChatQuery(query, platformContext);
      res.json({
        success: true,
        response: result.text,
        structuredData: result.structuredData
      });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // ==========================================
  // ANALYTICS APIS
  // ==========================================
  app.get('/api/v1/analytics/overview', (req: Request, res: Response) => {
    const overview = db.getAnalyticsOverview();
    res.json({ success: true, data: overview });
  });

  app.get('/api/v1/analytics/anomalies', (req: Request, res: Response) => {
    const anomalies = db.scanAnomalies();
    res.json({ success: true, anomalies });
  });

  // ==========================================
  // PRODUCTS & CUSTOMERS APIS
  // ==========================================
  app.get('/api/v1/customers', (req: Request, res: Response) => {
    res.json({ success: true, customers: db.getCustomers() });
  });

  app.get('/api/v1/customers/:id', (req: Request, res: Response) => {
    const customer = db.getCustomer(req.params.id);
    if (!customer) return res.status(404).json({ success: false, error: 'Customer not found' });
    const customerFeedbacks = db.getFeedbacks({ search: customer.email, limit: 15 });
    res.json({ success: true, customer, feedbackHistory: customerFeedbacks.items });
  });

  app.get('/api/v1/customers/:id/risk', (req: Request, res: Response) => {
    const riskData = db.getCustomerRisk(req.params.id);
    if (!riskData) return res.status(404).json({ success: false, error: 'Customer not found' });
    res.json({ success: true, ...riskData });
  });

  // ==========================================
  // TARGET PRODUCT MANAGEMENT APIS
  // ==========================================
  app.get('/api/v1/products', (req: Request, res: Response) => {
    try {
      const { search, status, category, owner } = req.query;
      const products = db.getProducts({
        search: search as string,
        status: status as string,
        category: category as string,
        owner: owner as string
      });
      res.json({ success: true, products });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/v1/products/:id', (req: Request, res: Response) => {
    const product = db.getProduct(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Target product not found.' });
    }
    // Include recent feedback for product detail context
    const productFeedbacks = db.getFeedbacks({ productId: product.id, limit: 10 });
    res.json({ success: true, product, recentFeedback: productFeedbacks.items });
  });

  app.post('/api/v1/products', (req: Request, res: Response) => {
    try {
      const actor = getActor(req);
      const product = db.createProduct(req.body, actor);
      res.status(201).json({ success: true, product, message: 'Target product created successfully.' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.put('/api/v1/products/:id', (req: Request, res: Response) => {
    try {
      const actor = getActor(req);
      const product = db.updateProduct(req.params.id, req.body, actor);
      res.json({ success: true, product, message: 'Target product updated successfully.' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.patch('/api/v1/products/:id/status', (req: Request, res: Response) => {
    try {
      const actor = getActor(req);
      const { status } = req.body;
      const product = db.updateProductStatus(req.params.id, status, actor);
      res.json({ success: true, product, message: `Product status updated to ${status}.` });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/v1/products/:id', (req: Request, res: Response) => {
    try {
      const actor = getActor(req);
      const result = db.archiveProduct(req.params.id, actor);
      res.json({
        success: true,
        product: result.product,
        feedbackCount: result.feedbackCount,
        issuesCount: result.issuesCount,
        message: `Product ${result.product.name} archived successfully.`
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.get('/api/v1/products/:id/feedback', (req: Request, res: Response) => {
    const feedback = db.getProductFeedback(req.params.id);
    res.json({ success: true, feedback, count: feedback.length });
  });

  app.get('/api/v1/products/:id/issues', (req: Request, res: Response) => {
    const issues = db.getProductIssues(req.params.id);
    res.json({ success: true, issues, count: issues.length });
  });

  app.get('/api/v1/products/:id/activity', (req: Request, res: Response) => {
    const activity = db.getProductActivity(req.params.id);
    res.json({ success: true, activity });
  });

  app.post('/api/v1/products/:id/analyze', async (req: Request, res: Response) => {
    try {
      const product = db.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found.' });
      }
      const feedbacks = db.getProductFeedback(req.params.id);
      const issues = db.getProductIssues(req.params.id);
      const report = await analyzeTargetProductWithAI(product, feedbacks, issues);
      res.json({ success: true, report });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/v1/products/compare', (req: Request, res: Response) => {
    try {
      const { productIds } = req.body;
      const ids: string[] = Array.isArray(productIds) ? productIds : [];
      const allProducts = db.getProducts();
      const selected = allProducts.filter(p => ids.includes(p.id));

      const comparison = selected.map(p => {
        const pFeedbacks = db.getProductFeedback(p.id);
        const pIssues = db.getProductIssues(p.id);
        const resolvedIssues = pIssues.filter(i => i.status === 'RESOLVED').length;
        const resolutionRate = pIssues.length > 0 ? Math.round((resolvedIssues / pIssues.length) * 100) : 100;

        return {
          product: p,
          healthScore: p.healthScore || 85,
          csat: p.csat || 80,
          sentimentPositiveRate: p.positiveRate || 75,
          feedbackVolume: pFeedbacks.length,
          openIssuesCount: pIssues.filter(i => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length,
          criticalIssuesCount: p.criticalIssues || 0,
          emergingIssuesCount: p.emergingIssues || 0,
          customerRisk: p.customerRisk || 'LOW',
          resolutionRate
        };
      });

      res.json({ success: true, comparison });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ==========================================
  // ISSUES & ACTION TRACKER APIS
  // ==========================================
  app.get('/api/v1/issues', (req: Request, res: Response) => {
    res.json({ success: true, issues: db.getIssues() });
  });

  app.post('/api/v1/issues', (req: Request, res: Response) => {
    const actor = getActor(req);
    const { title, description, priority, category, productId, feedbackIds, assignedTo } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, error: 'Title and description required' });
    }
    const issue = db.createIssue({
      title,
      description,
      priority: priority || 'MEDIUM',
      category: category || 'General',
      productId: productId || db.getProducts()[0].id,
      feedbackIds: feedbackIds || [],
      assignedTo: assignedTo || actor.id
    }, actor);
    res.status(201).json({ success: true, issue });
  });

  app.patch('/api/v1/issues/:id', (req: Request, res: Response) => {
    const actor = getActor(req);
    const updated = db.updateIssue(req.params.id, req.body, actor);
    if (!updated) return res.status(404).json({ success: false, error: 'Issue not found' });
    res.json({ success: true, issue: updated });
  });

  // ==========================================
  // FEATURE REQUESTS APIS
  // ==========================================
  app.get('/api/v1/feature-requests', (req: Request, res: Response) => {
    res.json({ success: true, featureRequests: db.getFeatureRequests() });
  });

  app.post('/api/v1/feature-requests/:id/vote', (req: Request, res: Response) => {
    const feat = db.voteFeatureRequest(req.params.id);
    if (!feat) return res.status(404).json({ success: false, error: 'Feature request not found' });
    res.json({ success: true, featureRequest: feat });
  });

  // ==========================================
  // NOTIFICATIONS APIS
  // ==========================================
  app.get('/api/v1/notifications', (req: Request, res: Response) => {
    res.json({ success: true, notifications: db.getNotifications() });
  });

  app.patch('/api/v1/notifications/:id/read', (req: Request, res: Response) => {
    const ok = db.markNotificationRead(req.params.id);
    res.json({ success: ok });
  });

  app.post('/api/v1/notifications/mark-all-read', (req: Request, res: Response) => {
    db.markAllNotificationsRead();
    res.json({ success: true });
  });

  // ==========================================
  // EXECUTIVE REPORTS APIS
  // ==========================================
  app.get('/api/v1/reports', (req: Request, res: Response) => {
    res.json({ success: true, reports: db.getReports() });
  });

  app.post('/api/v1/reports/generate', async (req: Request, res: Response) => {
    try {
      const actor = getActor(req);
      const { period } = req.body; // 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY'
      const report = await db.generateReport(period || 'WEEKLY', actor);
      res.status(201).json({ success: true, report });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // ==========================================
  // ENTERPRISE AI & INTELLIGENCE EXTENSIONS
  // ==========================================

  // 1. ROOT CAUSE ANALYSIS
  app.get('/api/v1/root-causes', (req: Request, res: Response) => {
    res.json({ success: true, rootCauses: db.getRootCauses() });
  });

  app.get('/api/v1/root-causes/:feedbackId', (req: Request, res: Response) => {
    const report = db.getRootCauseByFeedbackId(req.params.feedbackId);
    if (!report) return res.status(404).json({ success: false, error: 'Root cause report not found' });
    res.json({ success: true, report });
  });

  app.post('/api/v1/root-causes/generate', async (req: Request, res: Response) => {
    try {
      const { feedbackId } = req.body;
      if (!feedbackId) return res.status(400).json({ success: false, error: 'Feedback ID is required' });
      const report = await db.generateRootCause(feedbackId);
      if (!report) return res.status(404).json({ success: false, error: 'Feedback not found' });
      res.json({ success: true, report });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // 2. ISSUE CLUSTERS
  app.get('/api/v1/issue-clusters', (req: Request, res: Response) => {
    res.json({ success: true, clusters: db.getIssueClusters() });
  });

  app.get('/api/v1/issue-clusters/:id', (req: Request, res: Response) => {
    const cluster = db.getClusterById(req.params.id);
    if (!cluster) return res.status(404).json({ success: false, error: 'Cluster not found' });
    res.json({ success: true, cluster });
  });

  // 3. CUSTOMER HEALTH & CHURN PREDICTION
  app.get('/api/v1/customers/health-churn', (req: Request, res: Response) => {
    const customers = db.getCustomers();
    const healthScores = customers.map(c => ({
      customerId: c.id,
      healthScore: c.healthScore?.score ?? (c.avgRating > 4 ? 88 : c.avgRating > 3 ? 65 : 32),
      churnProbability: c.churnPrediction?.churnProbability ? c.churnPrediction.churnProbability / 100 : (c.avgRating < 3 ? 0.72 : 0.15),
      riskLevel: c.churnPrediction?.churnRisk ?? (c.avgRating < 3 ? 'HIGH' : 'LOW'),
      ltvUSD: c.segment?.includes('VIP') || c.segment?.includes('High-Value') ? 45000 : 12500,
      churnMitigationAction: c.churnPrediction?.recommendedRetentionAction ?? 'Proactive check-in from customer success'
    }));
    res.json({ success: true, healthScores });
  });

  app.get('/api/v1/customers/:id/health-churn', async (req: Request, res: Response) => {
    try {
      const data = await db.getCustomerHealthAndChurn(req.params.id);
      res.json({ success: true, ...data });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // 4. KNOWLEDGE BASE & COPILOT
  app.get('/api/v1/knowledge-base', (req: Request, res: Response) => {
    res.json({ success: true, documents: db.getKnowledgeDocs() });
  });

  app.get('/api/v1/knowledge-base/search', (req: Request, res: Response) => {
    const q = (req.query.q as string) || '';
    res.json({ success: true, documents: db.searchKnowledgeDocs(q) });
  });

  app.post('/api/v1/knowledge-base', (req: Request, res: Response) => {
    const { title, category, content, tags, sourceUrl } = req.body;
    if (!title || !content || !category) {
      return res.status(400).json({ success: false, error: 'Title, category, and content are required' });
    }
    const doc = db.addKnowledgeDoc({ title, category, content, tags: tags || [], sourceUrl });
    res.status(201).json({ success: true, document: doc });
  });

  app.get('/api/v1/copilot/tickets', (req: Request, res: Response) => {
    res.json({ success: true, tickets: db.getCopilotTickets() });
  });

  app.post('/api/v1/copilot/generate-reply', async (req: Request, res: Response) => {
    try {
      const { feedbackId } = req.body;
      if (!feedbackId) return res.status(400).json({ success: false, error: 'Feedback ID is required' });
      const ticket = await db.generateCopilotReplyForFeedback(feedbackId);
      if (!ticket) return res.status(404).json({ success: false, error: 'Feedback not found' });
      res.json({ success: true, ticket });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  app.post('/api/v1/copilot/resolve', (req: Request, res: Response) => {
    const actor = getActor(req);
    const { ticketId, resolutionText } = req.body;
    if (!ticketId) return res.status(400).json({ success: false, error: 'Ticket ID is required' });
    const ticket = db.resolveCopilotTicket(ticketId, resolutionText || 'Resolved by agent', actor.name);
    if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found' });
    res.json({ success: true, ticket });
  });

  // 5. COMPETITOR BENCHMARKING
  app.get('/api/v1/competitors', (req: Request, res: Response) => {
    res.json({ success: true, competitors: db.getCompetitorBenchmarks() });
  });

  // 6. RESOLVED IMPACT TRACKER
  app.get('/api/v1/resolved-impacts', (req: Request, res: Response) => {
    res.json({ success: true, resolvedImpacts: db.getResolvedImpacts() });
  });

  // 7. AI MODEL METRICS & HUMAN CORRECTIONS (HITL / RLHF)
  app.get('/api/v1/model-metrics', (req: Request, res: Response) => {
    res.json({ success: true, metrics: db.getModelMetrics() });
  });

  app.get('/api/v1/human-corrections', (req: Request, res: Response) => {
    res.json({ success: true, corrections: db.getHumanCorrections() });
  });

  app.post('/api/v1/human-corrections', (req: Request, res: Response) => {
    const actor = getActor(req);
    const { feedbackId, correctedSentiment, correctedTopics, correctedUrgency, reasoning } = req.body;
    if (!feedbackId || !reasoning) {
      return res.status(400).json({ success: false, error: 'Feedback ID and reasoning are required' });
    }
    const correction = db.submitHumanCorrection({
      feedbackId,
      correctedSentiment,
      correctedTopics,
      correctedUrgency,
      reasoning,
      correctedBy: actor.id,
      correctedByName: actor.name
    });
    res.status(201).json({ success: true, correction });
  });

  // 8. INTEGRATIONS & WEBHOOKS
  app.get('/api/v1/integrations', (req: Request, res: Response) => {
    res.json({ success: true, integrations: db.getIntegrations() });
  });

  app.patch('/api/v1/integrations/:id', (req: Request, res: Response) => {
    const updated = db.updateIntegration(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Integration not found' });
    res.json({ success: true, integration: updated });
  });

  app.post('/api/v1/integrations/:id/trigger', (req: Request, res: Response) => {
    const { eventName, payload } = req.body;
    const result = db.triggerIntegrationWebhook(req.params.id, eventName || 'SAMPLE_TRIGGER', payload || {});
    res.json(result);
  });

  // 9. REGIONAL METRICS & HEATMAP
  app.get('/api/v1/regional-metrics', (req: Request, res: Response) => {
    res.json({ success: true, regionalMetrics: db.getRegionalMetrics() });
  });

  app.get('/api/v1/heatmap', (req: Request, res: Response) => {
    res.json({ success: true, heatmap: db.getProductTopicHeatmap() });
  });

  // 10. NATURAL LANGUAGE ANALYTICS QUERY
  app.post('/api/v1/ai/nl-analytics', async (req: Request, res: Response) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ success: false, error: 'Query string is required' });
      }
      const result = await db.executeNaturalLanguageAnalytics(query);
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // 11. EXPLAINABLE AI ("Why?")
  app.post('/api/v1/ai/explain', async (req: Request, res: Response) => {
    try {
      const { feedbackId } = req.body;
      if (!feedbackId) return res.status(400).json({ success: false, error: 'Feedback ID is required' });
      const report = await db.explainFeedback(feedbackId);
      if (!report) return res.status(404).json({ success: false, error: 'Feedback not found' });
      res.json({ success: true, report });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // 12. EXECUTIVE AI COPILOT
  app.post('/api/v1/ai/executive-copilot', async (req: Request, res: Response) => {
    try {
      const { question, timeframe } = req.body;
      if (!question) return res.status(400).json({ success: false, error: 'Question is required' });
      const copilotResponse = await db.askExecutiveCopilot(question, timeframe);
      res.json({ success: true, ...copilotResponse });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // 13. MULTILINGUAL TRANSLATION & VOICE INTELLIGENCE
  app.post('/api/v1/ai/translate', async (req: Request, res: Response) => {
    try {
      const { text, targetLanguage } = req.body;
      if (!text) return res.status(400).json({ success: false, error: 'Text is required' });
      const translation = await detectLanguageAndTranslate(text, targetLanguage || 'English');
      res.json({ success: true, ...translation });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  app.post('/api/v1/ai/voice-transcribe', async (req: Request, res: Response) => {
    try {
      const { audioBase64, mimeType } = req.body;
      if (!audioBase64) return res.status(400).json({ success: false, error: 'Audio data is required' });
      const result = await transcribeAudioFeedback(audioBase64, mimeType || 'audio/webm');
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // ==========================================
  // DECISION INTELLIGENCE & NOVELTY ENGINE APIS
  // ==========================================

  // 1. WHAT-IF INTERVENTION SIMULATOR
  app.post('/api/v1/simulations/run', async (req: Request, res: Response) => {
    try {
      const actor = getActor(req);
      const { problemTopic, hypothesis, title, targetIntervention, intervention, action, improvementPercentage, customerSegmentFilter, productId, targetProductId } = req.body;
      const effectiveTopic = problemTopic || hypothesis || title || 'Customer Issue Mitigation';
      const effectiveIntervention = targetIntervention || intervention || action || 'Proactive Resolution & Workflow Enhancement';
      const simulation = await db.runWhatIfSimulation({
        problemTopic: effectiveTopic,
        targetIntervention: effectiveIntervention,
        improvementPercentage: Number(improvementPercentage) || 20,
        customerSegmentFilter: customerSegmentFilter || 'ALL',
        productId: productId || targetProductId
      }, actor);
      res.json({ success: true, simulation });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  app.get('/api/v1/simulations/history', (req: Request, res: Response) => {
    res.json({ success: true, simulations: db.getSimulationHistory() });
  });

  // 2. CAUSAL CUSTOMER INTELLIGENCE GRAPH
  app.get('/api/v1/causal-graph', (req: Request, res: Response) => {
    const { productId, segment, timeframe } = req.query;
    const graph = db.getCausalGraph({
      productId: productId as string,
      segment: segment as string,
      timeframe: timeframe as string
    });
    res.json({ success: true, graph });
  });

  // 3. CUSTOMER & ISSUE SENTIMENT FRUSTRATION VELOCITY
  app.get('/api/v1/analytics/frustration-velocity', (req: Request, res: Response) => {
    const { tier, targetType, search } = req.query;
    const velocities = db.getFrustrationVelocities({
      tier: tier as string,
      targetType: targetType as string,
      search: search as string
    });

    const counts = {
      criticalDeterioration: velocities.filter(v => v.status === 'CRITICAL_DETERIORATION').length,
      rapidlyIncreasing: velocities.filter(v => v.status === 'RAPIDLY_INCREASING').length,
      increasing: velocities.filter(v => v.status === 'INCREASING').length,
      stable: velocities.filter(v => v.status === 'STABLE').length,
      total: velocities.length
    };

    res.json({ success: true, velocities, counts });
  });

  app.post('/api/v1/analytics/frustration-velocity/action', (req: Request, res: Response) => {
    const { id, actionName } = req.body;
    if (!id || !actionName) {
      return res.status(400).json({ success: false, error: 'id and actionName are required' });
    }
    const result = db.triggerVelocityMitigation(id, actionName);
    res.json(result);
  });

  // 4. EMERGING ISSUE PREDICTION & EARLY WARNING CENTER
  app.get('/api/v1/issues/emerging', (req: Request, res: Response) => {
    const emergingIssues = db.getEmergingIssues();
    res.json({ success: true, emergingIssues });
  });

  app.post('/api/v1/issues/emerging/:id/action', (req: Request, res: Response) => {
    const { id } = req.params;
    const { actionName } = req.body;
    const actor = (req as any).user;
    const result = db.mitigateEmergingIssue(id, actionName || 'Deploy proactive mitigation', actor);
    res.json(result);
  });

  // 5. AI CUSTOMER CHURN RISK SCORING (0-100)
  app.get('/api/v1/customers/churn-intelligence', (req: Request, res: Response) => {
    const data = db.getCustomerChurnIntelligence();
    res.json({ success: true, ...data });
  });

  // 6. AI FEATURE PRIORITIZATION ROADMAP
  app.get('/api/v1/features/prioritized-roadmap', (req: Request, res: Response) => {
    const roadmap = db.getFeatureRoadmap();
    res.json({ success: true, roadmap });
  });

  // 7. CLOSED-LOOP RESOLUTION LEARNING
  app.get('/api/v1/resolutions/learning-loop', (req: Request, res: Response) => {
    const outcomes = db.getResolutionLearningOutcomes();
    res.json({ success: true, outcomes });
  });

  // 8. AI AUTONOMOUS FEEDBACK AGENT & CONTROL CENTER
  app.get('/api/v1/agent/status', async (req: Request, res: Response) => {
    const { FeedbackAgent } = await import('./server/agentBrain.js');
    res.json({
      success: true,
      status: 'ACTIVE',
      metrics: FeedbackAgent.getDashboardMetrics(),
      config: FeedbackAgent.getConfig()
    });
  });

  app.get('/api/v1/agent/events', async (req: Request, res: Response) => {
    const { FeedbackAgent } = await import('./server/agentBrain.js');
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    res.json({ success: true, events: FeedbackAgent.getEvents(limit) });
  });

  app.get('/api/v1/agent/incidents', (req: Request, res: Response) => {
    const incidents = db.getAutonomousIncidents();
    res.json({ success: true, incidents });
  });

  app.post('/api/v1/agent/incidents/:id/approve', (req: Request, res: Response) => {
    const { id } = req.params;
    const actor = getActor(req);
    const result = db.approveAutonomousIncident(id, actor);
    res.json(result);
  });

  app.post('/api/v1/agent/incidents/:id/reject', (req: Request, res: Response) => {
    const { id } = req.params;
    const { reason } = req.body;
    const actor = getActor(req);
    const result = db.rejectAutonomousIncident(id, reason, actor);
    res.json(result);
  });

  app.get('/api/v1/agent/recommendations', async (req: Request, res: Response) => {
    const { FeedbackAgent } = await import('./server/agentBrain.js');
    res.json({ success: true, recommendations: FeedbackAgent.getRecommendations() });
  });

  app.post('/api/v1/agent/recommendations/:id/approve', async (req: Request, res: Response) => {
    const { FeedbackAgent } = await import('./server/agentBrain.js');
    const actor = getActor(req);
    const result = FeedbackAgent.handleHumanDecision(req.params.id, 'APPROVE', req.body, actor);
    res.json(result);
  });

  app.post('/api/v1/agent/recommendations/:id/reject', async (req: Request, res: Response) => {
    const { FeedbackAgent } = await import('./server/agentBrain.js');
    const actor = getActor(req);
    const result = FeedbackAgent.handleHumanDecision(req.params.id, 'REJECT', req.body, actor);
    res.json(result);
  });

  app.post('/api/v1/agent/recommendations/:id/modify', async (req: Request, res: Response) => {
    const { FeedbackAgent } = await import('./server/agentBrain.js');
    const actor = getActor(req);
    const result = FeedbackAgent.handleHumanDecision(req.params.id, 'MODIFY', req.body, actor);
    res.json(result);
  });

  app.post('/api/v1/agent/recommendations/:id/investigate', async (req: Request, res: Response) => {
    const { FeedbackAgent } = await import('./server/agentBrain.js');
    const actor = getActor(req);
    const result = FeedbackAgent.handleHumanDecision(req.params.id, 'INVESTIGATE', req.body, actor);
    res.json(result);
  });

  app.get('/api/v1/agent/decisions', async (req: Request, res: Response) => {
    const { FeedbackAgent } = await import('./server/agentBrain.js');
    res.json({ success: true, decisions: FeedbackAgent.getDecisions() });
  });

  app.get('/api/v1/agent/decisions/:id', async (req: Request, res: Response) => {
    const { FeedbackAgent } = await import('./server/agentBrain.js');
    const decision = FeedbackAgent.getDecisionById(req.params.id);
    if (!decision) return res.status(404).json({ success: false, error: 'Decision trace not found' });
    res.json({ success: true, decision });
  });

  app.get('/api/v1/agent/outcomes', async (req: Request, res: Response) => {
    const { FeedbackAgent } = await import('./server/agentBrain.js');
    res.json({ success: true, outcomes: FeedbackAgent.getOutcomes() });
  });

  app.get('/api/v1/agent/memory', async (req: Request, res: Response) => {
    const { FeedbackAgent } = await import('./server/agentBrain.js');
    res.json({ success: true, memories: FeedbackAgent.getMemories() });
  });

  app.get('/api/v1/agent/config', async (req: Request, res: Response) => {
    const { FeedbackAgent } = await import('./server/agentBrain.js');
    res.json({ success: true, config: FeedbackAgent.getConfig() });
  });

  app.post('/api/v1/agent/config', async (req: Request, res: Response) => {
    const { FeedbackAgent } = await import('./server/agentBrain.js');
    const updated = FeedbackAgent.updateConfig(req.body);
    res.json({ success: true, config: updated });
  });

  app.post('/api/v1/agent/analyze', async (req: Request, res: Response) => {
    try {
      const { text, rating, customerName, customerEmail } = req.body;
      const { FeedbackAgent } = await import('./server/agentBrain.js');
      const tempFeedback: Feedback = {
        id: `fb_agent_${Date.now()}`,
        organizationId: 'org_acme_tech',
        customerName: customerName || 'Anand Narayanan',
        customerEmail: customerEmail || 'anand@enterprise.io',
        customerSegment: 'Enterprise Tier',
        productId: db.getProducts()[0]?.id || 'prod_pay_gateway',
        productName: 'Acme Pay Engine',
        rating: rating || 1,
        text: text || "I've tried paying three times and the payment still fails.",
        source: 'MANUAL',
        language: 'en',
        status: 'ANALYZED',
        tags: ['Payment', 'Agent'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const result = await FeedbackAgent.processNewFeedback(tempFeedback);
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  app.post('/api/v1/agent/demo-trigger', async (req: Request, res: Response) => {
    try {
      const { text } = req.body;
      const { FeedbackAgent } = await import('./server/agentBrain.js');
      const demoFeedback: Feedback = {
        id: `fb_demo_${Date.now()}`,
        organizationId: 'org_acme_tech',
        customerName: 'Marcus Vance',
        customerEmail: 'm.vance@vortexcloud.io',
        customerSegment: 'Tier-1 Enterprise VIP',
        productId: 'prod_pay_gateway',
        productName: 'Acme Pay Engine',
        rating: 1,
        text: text || "I've tried paying three times and the payment still fails with Error 504.",
        source: 'MANUAL',
        language: 'en',
        status: 'ANALYZED',
        tags: ['Payment', 'Spike', 'Demo'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const result = await FeedbackAgent.processNewFeedback(demoFeedback);
      res.json({ success: true, ...result, demoFeedback });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // 9. MULTILINGUAL & CODE-MIXED NLP
  app.post('/api/v1/nlp/multilingual-analyze', async (req: Request, res: Response) => {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ success: false, error: 'Text is required' });
      const analysis = await db.analyzeMultilingualFeedback(text);
      res.json({ success: true, analysis });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // 10. MULTIMODAL VOICE & SCREENSHOT
  app.post('/api/v1/multimodal/voice-analyze', async (req: Request, res: Response) => {
    try {
      const result = await db.processVoiceFeedback(req.body);
      res.json({ success: true, result });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  app.post('/api/v1/multimodal/screenshot-analyze', async (req: Request, res: Response) => {
    try {
      const result = await db.processScreenshotFeedback(req.body);
      res.json({ success: true, result });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // 11. FEEDBACK CONTRADICTION DETECTOR
  app.get('/api/v1/contradictions', (req: Request, res: Response) => {
    const queue = db.getContradictionsQueue();
    res.json({ success: true, contradictions: queue });
  });

  app.post('/api/v1/contradictions/:id/resolve', (req: Request, res: Response) => {
    const { id } = req.params;
    const { actionType } = req.body;
    const actor = (req as any).user || { id: 'usr_admin_1', name: 'Ashwin T (Admin)' };
    const result = db.resolveContradictionItem(id, actionType || 'RECALIBRATE', actor);
    res.json(result);
  });

  // 12. BUSINESS IMPACT ENGINE
  app.get('/api/v1/business-impact/summary', (req: Request, res: Response) => {
    const assessments = db.getBusinessImpact();
    res.json({ success: true, assessments });
  });

  app.post('/api/v1/business-impact/simulate', (req: Request, res: Response) => {
    const assessments = db.getBusinessImpact(req.body);
    res.json({ success: true, assessments });
  });

  // 13. CONVERSATIONAL CUSTOMER ANALYTICS ASSISTANT
  app.post('/api/v1/analytics/conversational-query', async (req: Request, res: Response) => {
    try {
      const { query, history } = req.body;
      if (!query) return res.status(400).json({ success: false, error: 'Query is required' });
      const response = await db.handleConversationalQuery(query, history || []);
      res.json({ success: true, response });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // Alias for POST /api/ai/query
  app.post('/api/v1/ai/query', async (req: Request, res: Response) => {
    try {
      const { query, history } = req.body;
      if (!query) return res.status(400).json({ success: false, error: 'Query is required' });
      const response = await db.handleConversationalQuery(query, history || []);
      res.json({ success: true, response });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // WHAT-IF SIMULATIONS REST ENDPOINTS
  app.post('/api/v1/simulations', async (req: Request, res: Response) => {
    try {
      const actor = getActor(req);
      const { problemTopic, targetIntervention, improvementPercentage, customerSegmentFilter, productId } = req.body;
      if (!problemTopic || !targetIntervention) {
        return res.status(400).json({ success: false, error: 'Problem topic and target intervention are required' });
      }
      const simulation = await db.runWhatIfSimulation({
        problemTopic,
        targetIntervention,
        improvementPercentage: Number(improvementPercentage) || 20,
        customerSegmentFilter: customerSegmentFilter || 'ALL',
        productId
      }, actor);
      res.status(201).json({ success: true, simulation });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  app.get('/api/v1/simulations/:id', (req: Request, res: Response) => {
    const history = db.getSimulationHistory();
    const sim = history.find(s => s.id === req.params.id);
    if (!sim) return res.status(404).json({ success: false, error: 'Simulation not found' });
    res.json({ success: true, simulation: sim });
  });

  // AI RECOMMENDATIONS REST ENDPOINTS
  app.get('/api/v1/recommendations', (req: Request, res: Response) => {
    const recommendations = db.getTopRecommendations();
    res.json({ success: true, recommendations });
  });

  // HUMAN-IN-THE-LOOP RECOMMENDATION APPROVAL
  app.post('/api/v1/recommendations/:id/approve', (req: Request, res: Response) => {
    const actor = getActor(req);
    const { action } = req.body;
    const result = db.approveRecommendation(req.params.id, action, actor);
    res.json(result);
  });

  app.get('/api/v1/recommendations/approved', (req: Request, res: Response) => {
    res.json({ success: true, approvals: db.getApprovedRecommendations() });
  });

  // RESOLUTIONS REST ENDPOINT
  app.post('/api/v1/resolutions', (req: Request, res: Response) => {
    const actor = getActor(req);
    const result = db.createResolution(req.body, actor);
    res.status(201).json(result);
  });

  // ==========================================
  // DECISION INTELLIGENCE ROUTES
  // ==========================================

  // Decision Trace for a recommendation
  app.get('/api/v1/recommendations/:id/decision-trace', (req: Request, res: Response) => {
    try {
      const trace = db.getDecisionTrace(req.params.id);
      if (!trace) return res.status(404).json({ success: false, error: 'Decision trace not found' });
      res.json({ success: true, trace });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // Evidence for a recommendation
  app.get('/api/v1/recommendations/:id/evidence', (req: Request, res: Response) => {
    try {
      const evidence = db.getEvidenceForRecommendation(req.params.id);
      res.json({ success: true, evidence });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // Recommendation performance summary
  app.get('/api/v1/recommendations/performance', (req: Request, res: Response) => {
    try {
      const performance = db.getRecommendationPerformance();
      res.json({ success: true, performance });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // Predictive Issue Forecasts + Velocity
  app.get('/api/v1/predictions/issues', (req: Request, res: Response) => {
    try {
      const { productId } = req.query as { productId?: string };
      const { forecasts, velocityMetrics } = db.getPredictiveForecasts(productId);
      res.json({ success: true, forecasts, velocityMetrics });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // Business Impact Breakdown per product
  app.get('/api/v1/products/:id/business-impact', (req: Request, res: Response) => {
    try {
      const breakdown = db.getBusinessImpactBreakdown(req.params.id);
      if (!breakdown) return res.status(404).json({ success: false, error: 'Product not found' });
      res.json({ success: true, breakdown });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // Knowledge Graph per product
  app.get('/api/v1/products/:id/knowledge-graph', (req: Request, res: Response) => {
    try {
      const graph = db.getKnowledgeGraph(req.params.id);
      if (!graph) return res.status(404).json({ success: false, error: 'Product not found' });
      res.json({ success: true, graph });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // Global Causal Graph DAG API
  app.get('/api/v1/causal-graph', (req: Request, res: Response) => {
    try {
      const { productId, segment, timeframe } = req.query;
      const graph = db.getCausalGraph({
        productId: productId as string,
        segment: segment as string,
        timeframe: timeframe as string
      });
      res.json({ success: true, graph });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Digital Twin Simulation
  app.post('/api/v1/products/:id/digital-twin/simulate', (req: Request, res: Response) => {
    try {
      const result = db.runDigitalTwinSimulation(req.params.id, req.body.parameters || {});
      if (!result) return res.status(404).json({ success: false, error: 'Product not found' });
      res.json({ success: true, result });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // Outcomes (Closed-Loop Learning)
  app.get('/api/v1/outcomes', (req: Request, res: Response) => {
    try {
      const outcomes = db.getOutcomes();
      res.json({ success: true, outcomes });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // Audit Logs API
  app.get('/api/v1/audit-logs', (req: Request, res: Response) => {
    try {
      const auditLogs = db.getAuditLogs();
      res.json({ success: true, auditLogs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Predictive Forecasts & Issues Radar API
  app.get('/api/v1/predictions/issues', (req: Request, res: Response) => {
    try {
      const forecasts = [
        {
          issueCluster: 'Gateway API 504 Timeout',
          currentFrequency: '18 / day',
          predictedFrequency7d: '42 / day',
          predictedFrequency14d: '88 / day',
          riskLevel: 'CRITICAL',
          confidenceScore: 0.94,
          predictedChurnARR: 148000,
          rootCause: 'Connection pool saturation on peak load',
          recommendedPreventiveAction: 'Deploy Redis cluster cache and increase database connection pool to 200'
        },
        {
          issueCluster: 'Mobile Photo Upload Crash',
          currentFrequency: '12 / day',
          predictedFrequency7d: '24 / day',
          predictedFrequency14d: '45 / day',
          riskLevel: 'HIGH',
          confidenceScore: 0.89,
          predictedChurnARR: 62000,
          rootCause: 'Out-Of-Memory error on iOS high-res camera captures',
          recommendedPreventiveAction: 'Implement client-side TurboModule image downsampling'
        },
        {
          issueCluster: 'SSO Token Expiration Desync',
          currentFrequency: '6 / day',
          predictedFrequency7d: '9 / day',
          predictedFrequency14d: '15 / day',
          riskLevel: 'MEDIUM',
          confidenceScore: 0.82,
          predictedChurnARR: 28000,
          rootCause: 'Okta SAML assertion lifetime clock skew',
          recommendedPreventiveAction: 'Synchronize NTP server and configure 5-minute clock drift tolerance'
        }
      ];
      const velocityMetrics = [
        { date: 'Day 1', observed: 12, predicted: 12 },
        { date: 'Day 3', observed: 18, predicted: 19 },
        { date: 'Day 7', observed: null, predicted: 34 },
        { date: 'Day 10', observed: null, predicted: 52 },
        { date: 'Day 14', observed: null, predicted: 88 }
      ];
      res.json({ success: true, forecasts, velocityMetrics });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Feature Demand Intelligence API
  app.get('/api/v1/feature-demand', (req: Request, res: Response) => {
    try {
      const features = [
        {
          id: 'feat_1',
          name: 'Real-time Webhook Event Dispatcher',
          category: 'Integrations',
          demandScore: 94,
          requestedByCount: 48,
          arrInfluenced: 340000,
          sentimentAvg: 4.6,
          effortWeeks: 2,
          roiScore: 9.2,
          status: 'PLANNED'
        },
        {
          id: 'feat_2',
          name: 'Granular Custom Role Permissions Builder',
          category: 'Security & RBAC',
          demandScore: 88,
          requestedByCount: 36,
          arrInfluenced: 215000,
          sentimentAvg: 4.4,
          effortWeeks: 3,
          roiScore: 7.8,
          status: 'IN_REVIEW'
        },
        {
          id: 'feat_3',
          name: 'Offline Feedback Ingestion Queue',
          category: 'Mobile Core',
          demandScore: 82,
          requestedByCount: 29,
          arrInfluenced: 180000,
          sentimentAvg: 4.1,
          effortWeeks: 4,
          roiScore: 6.9,
          status: 'BACKLOG'
        }
      ];
      res.json({ success: true, features });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/v1/outcomes', requirePermission('recommendation.approve'), (req: Request, res: Response) => {
    try {
      const actor = getActor(req);
      const outcome = db.recordOutcome(req.body, actor);
      res.status(201).json({ success: true, outcome });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // Feature Demand Intelligence
  app.get('/api/v1/feature-demand', (req: Request, res: Response) => {
    try {
      const { productId } = req.query as { productId?: string };
      const features = db.getFeatureDemand(productId);
      res.json({ success: true, features });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // Decision Command Center
  app.get('/api/v1/command-center', (req: Request, res: Response) => {
    try {
      const { productId } = req.query as { productId?: string };
      const data = db.getCommandCenterData(productId);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });



  app.get('/api/v1/organization', (req: Request, res: Response) => {
    res.json({ success: true, organization: db.getOrganization() });
  });

  // ==========================================
  // OPENAPI / SWAGGER SPECS
  // ==========================================
  app.get('/api/docs', (req: Request, res: Response) => {
    res.json({
      openapi: '3.0.0',
      info: {
        title: 'AI Customer-Feedback Intelligence Platform API',
        version: '1.0.0',
        description: 'Enterprise API for feedback ingestion, Gemini AI sentiment analysis, emotion detection, aspect extraction, and issue automation.'
      },
      servers: [{ url: '/api/v1' }],
      paths: {
        '/feedback': {
          get: { summary: 'List and filter feedback records' },
          post: { summary: 'Ingest and analyze customer feedback' }
        },
        '/analytics/overview': {
          get: { summary: 'Get aggregated CSAT, NPS, sentiment, and volume KPIs' }
        },
        '/ai/chat': {
          post: { summary: 'Grounded natural language query layer for business intelligence' }
        },
        '/reports/generate': {
          post: { summary: 'Generate executive intelligence report with Gemini summary' }
        }
      }
    });
  });

  // ==========================================
  // VITE MIDDLEWARE (DEV) & STATIC (PROD)
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global Error Handler
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('[Server Error]', err);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: err.message || 'An unexpected error occurred'
      }
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Customer-Feedback Intelligence Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
