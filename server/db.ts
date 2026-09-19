import {
  Feedback, Product, ProductStatus, ProductActivityItem, Customer, User, Organization, Issue, FeatureRequest,
  NotificationItem, ReportData, AuditLog, AnomalyEvent, AnalyticsOverview,
  UserRole, FeedbackStatus, SentimentType, PriorityLevel,
  RootCauseReport, IssueCluster, KnowledgeDocument, CopilotTicket,
  CompetitorBenchmark, ResolvedImpactAnalysis, HumanCorrection, AIModelMetrics,
  IntegrationAdapter, RegionalFeedbackMetric, HeatmapCell, NLQueryInterpretation,
  CustomerHealthScore, CustomerChurnPrediction, ExplainabilityReport,
  WhatIfSimulationParams, WhatIfSimulationResult, CausalGraphData,
  FrustrationVelocityItem, EmergingIssue, FeatureRoadmapItem,
  ResolutionLearningItem, ContradictionAnalysis, MultimodalAnalysisResult,
  AutonomousAgentIncident,
  PermissionKey, RolePermissionMatrix, AdminDashboardData, ManagerDashboardData,
  AnalystDashboardData, ViewerDashboardData, SystemServiceHealth
} from '../src/types.js';
import {
  SEED_ORGANIZATION, SEED_USERS, SEED_PRODUCTS, SEED_CUSTOMERS,
  generateSeedFeedbacks, SEED_ISSUES, SEED_FEATURE_REQUESTS,
  SEED_NOTIFICATIONS, SEED_ANOMALIES, SEED_ROOT_CAUSES, SEED_ISSUE_CLUSTERS,
  SEED_KNOWLEDGE_DOCS, SEED_COPILOT_TICKETS, SEED_COMPETITORS,
  SEED_RESOLVED_IMPACTS, SEED_MODEL_METRICS, SEED_INTEGRATIONS,
  SEED_REGIONAL_METRICS, SEED_PRODUCT_TOPIC_HEATMAP
} from './seedData.js';
import {
  analyzeFeedbackWithAI, generateExecutiveSummaryWithAI, calculateSimilarity,
  generateRootCauseWithAI, calculateCustomerHealthAndChurn, generateSupportCopilotReplyWithRAG,
  parseNaturalLanguageAnalyticsQuery, explainFeedbackAnalysisWithAI,
  maskPII, detectLanguageAndTranslate, transcribeAudioFeedback,
  runWhatIfSimulation, buildCausalGraphData, calculateFrustrationVelocities,
  scanEmergingIssues, calculateFeatureRoadmapPrioritization,
  getResolutionLearningOutcomes, detectFeedbackContradiction,
  analyzeMultimodalScreenshot, calculateCustomerChurnRiskScores,
  getAutonomousFeedbackIncidents,
  analyzeMultilingualCodeMixedFeedback, processMultimodalVoice, processMultimodalScreenshot,
  scanFeedbackContradictions, computeBusinessImpactAssessments, handleConversationalAnalyticsQuery,
  buildProductKnowledgeGraph
} from './ai.js';

class InMemoryDatabase {
  private organization: Organization = { ...SEED_ORGANIZATION };
  private users: User[] = [...SEED_USERS];
  private products: Product[] = [...SEED_PRODUCTS];
  private customers: Customer[] = [...SEED_CUSTOMERS];
  private feedbacks: Feedback[] = generateSeedFeedbacks(520);
  private issues: Issue[] = [...SEED_ISSUES];
  private featureRequests: FeatureRequest[] = [...SEED_FEATURE_REQUESTS];
  private notifications: NotificationItem[] = [...SEED_NOTIFICATIONS];
  private reports: ReportData[] = [];
  private rootCauses: RootCauseReport[] = [...SEED_ROOT_CAUSES];
  private issueClusters: IssueCluster[] = [...SEED_ISSUE_CLUSTERS];
  private knowledgeDocs: KnowledgeDocument[] = [...SEED_KNOWLEDGE_DOCS];
  private copilotTickets: CopilotTicket[] = [...SEED_COPILOT_TICKETS];
  private competitors: CompetitorBenchmark[] = [...SEED_COMPETITORS];
  private resolvedImpacts: ResolvedImpactAnalysis[] = [...SEED_RESOLVED_IMPACTS];
  private modelMetrics: AIModelMetrics = { ...SEED_MODEL_METRICS };
  private simulations: WhatIfSimulationResult[] = [];
  private approvedRecommendations: Array<{ id: string; recommendationId: string; approvedBy: string; approvedByName: string; approvedAt: string; status: string; actionTaken: string }> = [];
  private humanCorrections: HumanCorrection[] = [
    {
      id: 'corr_1',
      feedbackId: 'fb_1005',
      originalSentiment: 'NEGATIVE',
      correctedSentiment: 'NEUTRAL',
      originalTopics: ['Bug', 'Crash'],
      correctedTopics: ['Performance', 'Pagination'],
      originalUrgency: 'CRITICAL',
      correctedUrgency: 'HIGH',
      reasoning: 'Constructive enterprise feedback regarding pagination on 500k rows rather than fatal crash.',
      correctedBy: 'usr_analyst_1',
      correctedByName: 'Elena Rostova',
      correctedAt: '2026-08-22T15:00:00Z'
    }
  ];
  private integrations: IntegrationAdapter[] = [...SEED_INTEGRATIONS];
  private regionalMetrics: RegionalFeedbackMetric[] = [...SEED_REGIONAL_METRICS];
  private heatmapCells: HeatmapCell[] = [...SEED_PRODUCT_TOPIC_HEATMAP];
  private auditLogs: AuditLog[] = [
    {
      id: 'log_1',
      organizationId: 'org_acme_corp',
      userId: 'usr_admin_1',
      userName: 'Ashwin T',
      action: 'SYSTEM_BOOTSTRAP',
      resource: 'Organization',
      details: 'Initialized Acme Technologies enterprise workspace with AI pipeline.',
      ip: '127.0.0.1',
      timestamp: '2026-08-23T07:00:00Z',
    },
    {
      id: 'log_2',
      organizationId: 'org_acme_corp',
      userId: 'usr_analyst_1',
      userName: 'Elena Rostova',
      action: 'ISSUE_CREATED',
      resource: 'Issue #iss_101',
      details: 'Created issue for 504 Gateway Timeouts on Acme Pay Engine.',
      ip: '192.168.1.42',
      timestamp: '2026-08-23T07:15:00Z',
    }
  ];
  private anomalies: AnomalyEvent[] = [...SEED_ANOMALIES];
  private subscribers: Array<(event: string, data: any) => void> = [];
  private rolePermissions: RolePermissionMatrix = {
    ADMIN: [
      'feedback.view',
      'feedback.create',
      'feedback.edit',
      'feedback.delete',
      'analytics.view',
      'analytics.export',
      'ai.analyze',
      'ai.recommend',
      'ai.simulate',
      'recommendation.approve',
      'user.manage',
      'role.manage',
      'system.configure',
      'audit.view'
    ],
    MANAGER: [
      'feedback.view',
      'feedback.create',
      'feedback.edit',
      'analytics.view',
      'analytics.export',
      'ai.analyze',
      'ai.recommend',
      'ai.simulate',
      'recommendation.approve',
      'audit.view'
    ],
    ANALYST: [
      'feedback.view',
      'feedback.create',
      'feedback.edit',
      'analytics.view',
      'analytics.export',
      'ai.analyze',
      'ai.recommend',
      'ai.simulate'
    ],
    VIEWER: [
      'feedback.view',
      'analytics.view'
    ]
  };
  private serviceHealthCards: SystemServiceHealth[] = [
    { name: 'Backend Express Engine', status: 'HEALTHY', uptimePercentage: 99.98, latencyMs: 14, message: 'Processing REST & SSE endpoints normally' },
    { name: 'Database & In-Memory Store', status: 'HEALTHY', uptimePercentage: 100.0, latencyMs: 2, message: 'Sub-millisecond latency across all indexed collections' },
    { name: 'AI Reasoning Pipeline', status: 'HEALTHY', uptimePercentage: 99.92, latencyMs: 380, message: 'Gemini 2.5 active with structured json output' },
    { name: 'Realtime SSE Event Stream', status: 'HEALTHY', uptimePercentage: 99.99, latencyMs: 8, message: 'Zero dropped client broadcast sockets' },
    { name: 'Task & Async Jobs Queue', status: 'HEALTHY', uptimePercentage: 99.85, latencyMs: 22, message: '1 failed retry job automatically held for inspection' },
    { name: 'Cold Analytics & Vector Store', status: 'HEALTHY', uptimePercentage: 100.0, latencyMs: 18, message: 'Storage capacity: 42.8 MB / 500 MB provisioned' }
  ];
  private customAIConfig: {
    model: string;
    version: string;
    confidenceThreshold: number;
    alertThreshold: number;
    emergingIssueThreshold: number;
    analysisFrequencyMinutes: number;
    agentExecutionLimitPerHour: number;
  } = {
    model: 'gemini-2.5-flash',
    version: '2026.08-v2',
    confidenceThreshold: 0.85,
    alertThreshold: 0.75,
    emergingIssueThreshold: 0.35,
    analysisFrequencyMinutes: 5,
    agentExecutionLimitPerHour: 100
  };

  constructor() {
    this.recalculateAllStats();
    this.generateInitialReport();
  }

  // Subscribe to real-time events (SSE / live updates)
  public subscribe(callback: (event: string, data: any) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  public broadcast(event: string, data: any) {
    this.subscribers.forEach(cb => {
      try {
        cb(event, data);
      } catch (err) {
        // ignore subscriber errors
      }
    });
  }

  // Auth & User Management
  public getUser(email: string): User | undefined {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUsers(): User[] {
    return this.users;
  }

  public createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      ...user,
    };
    this.users.push(newUser);
    this.logAudit(newUser.id, newUser.name, 'USER_CREATED', 'User', `Created user account for ${newUser.email}`);
    return newUser;
  }

  public updateUserRole(userId: string, role: UserRole, actor: User): User | undefined {
    const target = this.users.find(u => u.id === userId);
    if (target) {
      target.role = role;
      this.logAudit(actor.id, actor.name, 'ROLE_UPDATED', `User/${userId}`, `Changed role of ${target.email} to ${role}`);
      return target;
    }
    return undefined;
  }

  // Organization
  public getOrganization(): Organization {
    return this.organization;
  }

  public updateOrganization(updates: Partial<Organization>, actor: User): Organization {
    this.organization = { ...this.organization, ...updates };
    this.logAudit(actor.id, actor.name, 'ORG_UPDATED', 'Organization', `Updated organization profile`);
    return this.organization;
  }

  // Products Management
  public getProducts(filters?: { search?: string; status?: string; category?: string; owner?: string }): Product[] {
    // Recompute metrics for all products based on actual feedback and issues data
    let list = this.products.map(p => {
      const pFeedbacks = this.feedbacks.filter(f => f.productId === p.id);
      const pIssues = this.issues.filter(i => i.productId === p.id);

      const totalFeedback = pFeedbacks.length || p.totalFeedback || 0;
      let posCount = pFeedbacks.filter(f => f.analysis?.sentiment === 'POSITIVE' || f.rating >= 4).length;
      let negCount = pFeedbacks.filter(f => f.analysis?.sentiment === 'NEGATIVE' || f.rating <= 2).length;

      const positiveRate = totalFeedback > 0 ? Math.round((posCount / totalFeedback) * 100) : (p.positiveRate || 70);
      const negativeRate = totalFeedback > 0 ? Math.round((negCount / totalFeedback) * 100) : (p.negativeRate || 15);
      const avgRating = totalFeedback > 0 
        ? Math.round((pFeedbacks.reduce((acc, f) => acc + (f.rating || 3), 0) / totalFeedback) * 10) / 10 
        : (p.avgRating || 4.2);
      const csat = Math.round(positiveRate);

      const openIssues = pIssues.filter(i => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length || p.openIssues || 0;
      const criticalIssues = pIssues.filter(i => (i.status !== 'RESOLVED' && i.status !== 'CLOSED') && (i.priority === 'CRITICAL' || i.priority === 'HIGH')).length || p.criticalIssues || 0;
      const emergingIssues = p.emergingIssues !== undefined ? p.emergingIssues : Math.min(openIssues, 2);

      const healthScore = Math.max(20, Math.min(100, Math.round(100 - (negCount * 2 + criticalIssues * 10 + openIssues * 2))));
      const customerRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = healthScore < 60 ? 'HIGH' : healthScore < 75 ? 'MEDIUM' : 'LOW';

      return {
        ...p,
        totalFeedback,
        avgRating,
        positiveRate,
        negativeRate,
        csat,
        healthScore: p.healthScore !== undefined ? p.healthScore : healthScore,
        openIssues,
        criticalIssues,
        emergingIssues,
        customerRisk: p.customerRisk || customerRisk,
        lastActivity: pFeedbacks[0]?.createdAt || p.lastActivity || p.createdAt || new Date().toISOString()
      };
    });

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.code.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) ||
        (p.owner && p.owner.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter(p => p.status === filters.status);
    }

    if (filters?.category && filters.category !== 'ALL') {
      list = list.filter(p => p.category === filters.category);
    }

    if (filters?.owner && filters.owner !== 'ALL') {
      list = list.filter(p => p.owner === filters.owner);
    }

    return list;
  }

  public getProduct(id: string): Product | undefined {
    const list = this.getProducts();
    return list.find(p => p.id === id);
  }

  public createProduct(data: Partial<Product>, actor: User): Product {
    if (!data.name || !data.name.trim()) {
      throw new Error('Product name cannot be empty.');
    }
    if (!data.code || !data.code.trim()) {
      throw new Error('Product code cannot be empty.');
    }
    const cleanCode = data.code.trim().toUpperCase();

    // Check code uniqueness
    const existing = this.products.find(p => p.code.toUpperCase() === cleanCode);
    if (existing) {
      throw new Error(`Product code ${cleanCode} already exists.`);
    }

    const newProd: Product = {
      id: `prod_${Date.now()}`,
      organizationId: this.organization.id,
      name: data.name.trim(),
      code: cleanCode,
      category: data.category || 'General',
      description: data.description || '',
      version: data.version || 'v1.0.0',
      owner: data.owner || actor.name,
      team: data.team || actor.department || 'Product Engineering',
      status: (data.status as any) || 'ACTIVE',
      website: data.website || '',
      logoUrl: data.logoUrl || '',
      launchDate: data.launchDate || new Date().toISOString().split('T')[0],
      targetSegments: data.targetSegments || ['General'],
      features: data.features || [],
      createdBy: actor.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalFeedback: 0,
      avgRating: 5.0,
      positiveRate: 100,
      negativeRate: 0,
      csat: 100,
      healthScore: 100,
      openIssues: 0,
      criticalIssues: 0,
      emergingIssues: 0,
      customerRisk: 'LOW',
      lastActivity: new Date().toISOString()
    };

    this.products.push(newProd);
    this.logAudit(actor.id, actor.name, 'PRODUCT_CREATED', `Product/${newProd.id}`, `Created target product ${newProd.name} (${newProd.code})`);
    return newProd;
  }

  public updateProduct(id: string, updates: Partial<Product>, actor: User): Product {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Product with ID ${id} not found.`);
    }

    const current = this.products[index];

    if (updates.code && updates.code.trim().toUpperCase() !== current.code.toUpperCase()) {
      const cleanCode = updates.code.trim().toUpperCase();
      const existing = this.products.find(p => p.id !== id && p.code.toUpperCase() === cleanCode);
      if (existing) {
        throw new Error(`Product code ${cleanCode} already exists on another product.`);
      }
      updates.code = cleanCode;
    }

    const updated: Product = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.products[index] = updated;
    this.logAudit(actor.id, actor.name, 'PRODUCT_UPDATED', `Product/${id}`, `Updated target product ${updated.name} (${updated.code})`);
    return updated;
  }

  public updateProductStatus(id: string, status: ProductStatus, actor: User): Product {
    const prod = this.products.find(p => p.id === id);
    if (!prod) {
      throw new Error(`Product with ID ${id} not found.`);
    }

    prod.status = status;
    prod.updatedAt = new Date().toISOString();
    if (status === 'ARCHIVED') {
      prod.archivedAt = new Date().toISOString();
    }

    this.logAudit(actor.id, actor.name, 'PRODUCT_STATUS_CHANGED', `Product/${id}`, `Changed status of ${prod.name} to ${status}`);
    return prod;
  }

  public archiveProduct(id: string, actor: User): { product: Product; feedbackCount: number; issuesCount: number } {
    const prod = this.updateProductStatus(id, 'ARCHIVED', actor);
    const feedbackCount = this.feedbacks.filter(f => f.productId === id).length;
    const issuesCount = this.issues.filter(i => i.productId === id).length;
    this.logAudit(actor.id, actor.name, 'PRODUCT_ARCHIVED', `Product/${id}`, `Archived target product ${prod.name} (Contains ${feedbackCount} feedbacks & ${issuesCount} issues)`);
    return { product: prod, feedbackCount, issuesCount };
  }

  public getProductFeedback(productId: string): Feedback[] {
    return this.feedbacks.filter(f => f.productId === productId);
  }

  public getProductIssues(productId: string): Issue[] {
    return this.issues.filter(i => i.productId === productId);
  }

  public getProductActivity(productId: string): ProductActivityItem[] {
    const prod = this.getProduct(productId);
    if (!prod) return [];

    const activities: ProductActivityItem[] = [
      {
        id: `act_${Date.now()}_1`,
        productId,
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        type: 'AI_ANALYSIS',
        title: 'Gemini AI Product Intelligence Report Generated',
        description: `Synthesized customer sentiment and complaint velocity for ${prod.name}.`,
        actor: 'Gemini 2.5 Intelligence Engine'
      },
      {
        id: `act_${Date.now()}_2`,
        productId,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        type: 'FEEDBACK_SPIKE',
        title: 'Feedback Volume Spike Detected',
        description: `14 new customer feedback submissions received in the last hour.`,
        actor: 'Ingestion Pipeline'
      }
    ];

    if (prod.criticalIssues && prod.criticalIssues > 0) {
      activities.unshift({
        id: `act_${Date.now()}_0`,
        productId,
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        type: 'CRITICAL_ISSUE',
        title: 'Critical Issue Flagged',
        description: `${prod.criticalIssues} high-severity issues requiring immediate triage.`,
        actor: 'System Watchdog'
      });
    }

    return activities;
  }


  // Customers
  public getCustomers(): Customer[] {
    return this.customers;
  }

  public getCustomer(id: string): Customer | undefined {
    return this.customers.find(c => c.id === id);
  }

  // Feedbacks
  public getFeedbacks(params: {
    page?: number;
    limit?: number;
    search?: string;
    sentiment?: SentimentType;
    priority?: PriorityLevel;
    intent?: string;
    productId?: string;
    status?: FeedbackStatus;
    source?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: 'date_desc' | 'date_asc' | 'rating_desc' | 'rating_asc' | 'priority';
  }) {
    let list = [...this.feedbacks];

    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(f =>
        f.text.toLowerCase().includes(q) ||
        f.customerName.toLowerCase().includes(q) ||
        f.customerEmail.toLowerCase().includes(q) ||
        f.productName.toLowerCase().includes(q) ||
        f.tags?.some(t => t.toLowerCase().includes(q)) ||
        f.analysis?.topics.some(t => t.toLowerCase().includes(q)) ||
        f.analysis?.keywords.some(k => k.toLowerCase().includes(q))
      );
    }

    if (params.sentiment) {
      list = list.filter(f => f.analysis?.sentiment === params.sentiment);
    }

    if (params.priority) {
      list = list.filter(f => f.analysis?.priority === params.priority);
    }

    if (params.intent) {
      list = list.filter(f => f.analysis?.intent === params.intent);
    }

    if (params.productId) {
      list = list.filter(f => f.productId === params.productId);
    }

    if (params.status) {
      list = list.filter(f => f.status === params.status);
    }

    if (params.source) {
      list = list.filter(f => f.source === params.source);
    }

    if (params.startDate) {
      const start = new Date(params.startDate).getTime();
      list = list.filter(f => new Date(f.createdAt).getTime() >= start);
    }

    if (params.endDate) {
      const end = new Date(params.endDate).getTime();
      list = list.filter(f => new Date(f.createdAt).getTime() <= end);
    }

    // Sorting
    const sort = params.sortBy || 'date_desc';
    if (sort === 'date_desc') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === 'date_asc') {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sort === 'rating_desc') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'rating_asc') {
      list.sort((a, b) => a.rating - b.rating);
    } else if (sort === 'priority') {
      const pMap: Record<PriorityLevel, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      list.sort((a, b) => (pMap[b.analysis?.priority || 'LOW'] || 0) - (pMap[a.analysis?.priority || 'LOW'] || 0));
    }

    const total = list.length;
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const startIndex = (page - 1) * limit;
    const items = list.slice(startIndex, startIndex + limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  public getFeedbackById(id: string): Feedback | undefined {
    return this.feedbacks.find(f => f.id === id);
  }

  public async createFeedback(data: {
    customerName: string;
    customerEmail: string;
    productId: string;
    rating: number;
    text: string;
    source?: Feedback['source'];
    tags?: string[];
  }): Promise<Feedback> {
    const product = this.getProduct(data.productId) || this.products[0];
    
    // Find or create customer
    let customer = this.customers.find(c => c.email.toLowerCase() === data.customerEmail.toLowerCase());
    if (!customer) {
      customer = {
        id: `cust_${Date.now()}`,
        organizationId: this.organization.id,
        name: data.customerName,
        email: data.customerEmail,
        segment: data.rating <= 2 ? 'At-Risk' : data.rating >= 4 ? 'Loyal' : 'New',
        totalFeedbackCount: 1,
        avgRating: data.rating,
        sentimentScore: data.rating >= 4 ? 0.7 : data.rating <= 2 ? -0.7 : 0.0,
        lastFeedbackDate: new Date().toISOString(),
        unresolvedIssuesCount: data.rating <= 2 ? 1 : 0
      };
      this.customers.push(customer);
    } else {
      customer.totalFeedbackCount++;
      customer.lastFeedbackDate = new Date().toISOString();
      customer.avgRating = parseFloat(((customer.avgRating * (customer.totalFeedbackCount - 1) + data.rating) / customer.totalFeedbackCount).toFixed(1));
    }

    const feedbackId = `fb_${Date.now()}`;
    const now = new Date().toISOString();

    // AI analysis
    const analysis = await analyzeFeedbackWithAI(data.text, data.rating, product.name);

    // Duplicate detection
    const similar = this.findSimilarFeedback(data.text);
    if (similar && similar.score > 0.65) {
      analysis.duplicateOfId = similar.feedback.id;
      analysis.similarityScore = Math.round(similar.score * 100);
    }

    const newFeedback: Feedback = {
      id: feedbackId,
      organizationId: this.organization.id,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerSegment: customer.segment,
      productId: product.id,
      productName: product.name,
      rating: data.rating,
      text: data.text,
      source: data.source || 'MANUAL',
      language: 'en',
      status: 'ANALYZED',
      createdAt: now,
      updatedAt: now,
      tags: (data.tags && data.tags.length > 0)
        ? Array.from(new Set([...data.tags, ...analysis.topics.slice(0, 2), analysis.intent]))
        : [...analysis.topics.slice(0, 2), analysis.intent],
      analysis
    };

    this.feedbacks.unshift(newFeedback);
    this.recalculateAllStats();

    // Trigger critical alert if needed
    if (analysis.priority === 'CRITICAL' || analysis.sentiment === 'NEGATIVE') {
      const notif: NotificationItem = {
        id: `notif_${Date.now()}`,
        organizationId: this.organization.id,
        type: 'CRITICAL_FEEDBACK',
        title: `New ${analysis.priority} Feedback on ${product.name}`,
        message: `${data.customerName}: "${data.text.slice(0, 75)}..."`,
        severity: analysis.priority === 'CRITICAL' ? 'critical' : 'high',
        read: false,
        link: `/feedback/${feedbackId}`,
        createdAt: now
      };
      this.notifications.unshift(notif);
      this.broadcast('notification', notif);
    }

    // Auto-aggregate feature requests
    if (analysis.intent === 'FEATURE_REQUEST') {
      this.aggregateFeatureRequest(newFeedback);
    }

    // Trigger AI Autonomous Feedback Agent reaction pipeline asynchronously
    import('./agentBrain.js').then(({ FeedbackAgent }) => {
      FeedbackAgent.processNewFeedback(newFeedback).catch(err => {
        console.warn('[AutonomousAgent] Background processing error:', err);
      });
    }).catch(err => {
      console.warn('[AutonomousAgent] Could not load agentBrain:', err);
    });

    this.broadcast('feedback_created', newFeedback);
    return newFeedback;
  }

  public updateFeedbackStatus(id: string, status: FeedbackStatus, actor?: User): Feedback | undefined {
    const item = this.feedbacks.find(f => f.id === id);
    if (item) {
      item.status = status;
      item.updatedAt = new Date().toISOString();
      if (actor) {
        this.logAudit(actor.id, actor.name, 'FEEDBACK_STATUS_UPDATED', `Feedback/${id}`, `Updated status to ${status}`);
      }
      this.broadcast('feedback_updated', item);
      return item;
    }
    return undefined;
  }

  public updateFeedbackTags(id: string, tags: string[], actor?: User): Feedback | undefined {
    const item = this.feedbacks.find(f => f.id === id);
    if (item) {
      item.tags = tags;
      item.updatedAt = new Date().toISOString();
      if (actor) {
        this.logAudit(actor.id, actor.name, 'FEEDBACK_TAGS_UPDATED', `Feedback/${id}`, `Updated tags to ${tags.join(', ')}`);
      }
      this.broadcast('feedback_updated', item);
      return item;
    }
    return undefined;
  }

  public deleteFeedback(id: string, actor?: User): boolean {
    const idx = this.feedbacks.findIndex(f => f.id === id);
    if (idx !== -1) {
      this.feedbacks.splice(idx, 1);
      this.recalculateAllStats();
      if (actor) {
        this.logAudit(actor.id, actor.name, 'FEEDBACK_DELETED', `Feedback/${id}`, `Deleted feedback record`);
      }
      this.broadcast('feedback_deleted', { id });
      return true;
    }
    return false;
  }

  // Duplicate / Similarity Finder
  public findSimilarFeedback(text: string): { feedback: Feedback; score: number } | null {
    let bestMatch: Feedback | null = null;
    let highestScore = 0;

    for (const fb of this.feedbacks.slice(0, 100)) {
      const score = calculateSimilarity(text, fb.text);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = fb;
      }
    }

    if (bestMatch && highestScore > 0.4) {
      return { feedback: bestMatch, score: highestScore };
    }
    return null;
  }

  // Feature Request Aggregation
  private aggregateFeatureRequest(feedback: Feedback) {
    const topic = feedback.analysis?.topics[0] || 'Feature Enhancement';
    const title = feedback.analysis?.summary || `Request regarding ${topic}`;
    
    // Check if an existing feature request matches
    const existing = this.featureRequests.find(fr => 
      fr.productId === feedback.productId && 
      (calculateSimilarity(fr.title, title) > 0.35 || calculateSimilarity(fr.description, feedback.text) > 0.35)
    );

    if (existing) {
      existing.votes++;
      if (!existing.feedbackIds.includes(feedback.id)) {
        existing.feedbackIds.push(feedback.id);
      }
      if (existing.votes > 100) existing.demand = 'HIGH';
      else if (existing.votes > 40) existing.demand = 'MEDIUM';
    } else {
      const newFeat: FeatureRequest = {
        id: `feat_${Date.now()}`,
        organizationId: this.organization.id,
        title: title.slice(0, 60),
        description: feedback.text,
        category: topic,
        productId: feedback.productId,
        productName: feedback.productName,
        votes: 1,
        sentiment: 'POSITIVE',
        demand: 'LOW',
        status: 'PROPOSED',
        feedbackIds: [feedback.id],
        createdAt: new Date().toISOString()
      };
      this.featureRequests.unshift(newFeat);
    }
  }

  public getFeatureRequests(): FeatureRequest[] {
    return this.featureRequests;
  }

  public voteFeatureRequest(id: string): FeatureRequest | undefined {
    const feat = this.featureRequests.find(f => f.id === id);
    if (feat) {
      feat.votes++;
      if (feat.votes > 80) feat.demand = 'HIGH';
      else if (feat.votes > 30) feat.demand = 'MEDIUM';
      this.broadcast('feature_voted', feat);
      return feat;
    }
    return undefined;
  }

  // Issue Management
  public getIssues(): Issue[] {
    return this.issues;
  }

  public getIssueById(id: string): Issue | undefined {
    return this.issues.find(i => i.id === id);
  }

  public createIssue(data: {
    title: string;
    description: string;
    priority: PriorityLevel;
    category: string;
    productId: string;
    feedbackIds?: string[];
    assignedTo?: string;
  }, actor: User): Issue {
    const product = this.getProduct(data.productId) || this.products[0];
    const assignedUser = this.users.find(u => u.id === data.assignedTo);
    
    const newIssue: Issue = {
      id: `iss_${Date.now()}`,
      organizationId: this.organization.id,
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: 'OPEN',
      category: data.category,
      productId: product.id,
      productName: product.name,
      assignedTo: data.assignedTo,
      assignedToName: assignedUser?.name,
      feedbackIds: data.feedbackIds || [],
      feedbackCount: (data.feedbackIds || []).length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.issues.unshift(newIssue);

    // Link feedback items
    if (data.feedbackIds) {
      data.feedbackIds.forEach(fId => {
        const fb = this.getFeedbackById(fId);
        if (fb) fb.assignedIssueId = newIssue.id;
      });
    }

    this.logAudit(actor.id, actor.name, 'ISSUE_CREATED', `Issue/${newIssue.id}`, `Created issue: "${newIssue.title}"`);
    this.broadcast('issue_created', newIssue);
    return newIssue;
  }

  public updateIssue(id: string, updates: Partial<Issue>, actor: User): Issue | undefined {
    const issue = this.issues.find(i => i.id === id);
    if (issue) {
      Object.assign(issue, updates, { updatedAt: new Date().toISOString() });
      if (updates.status === 'RESOLVED' && !issue.resolvedAt) {
        issue.resolvedAt = new Date().toISOString();
      }
      this.logAudit(actor.id, actor.name, 'ISSUE_UPDATED', `Issue/${id}`, `Updated issue status to ${updates.status || issue.status}`);
      this.broadcast('issue_updated', issue);
      return issue;
    }
    return undefined;
  }

  // Notifications
  public getNotifications(): NotificationItem[] {
    return this.notifications;
  }

  public markNotificationRead(id: string): boolean {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      return true;
    }
    return false;
  }

  public markAllNotificationsRead(): void {
    this.notifications.forEach(n => n.read = true);
  }

  // Reports
  public getReports(): ReportData[] {
    return this.reports;
  }

  public async generateReport(period: ReportData['period'], actor: User): Promise<ReportData> {
    const overview = this.getAnalyticsOverview();
    const topComplaints = this.getTopComplaints();
    const topRequested = this.featureRequests.slice(0, 3).map(f => f.title);
    const affected = this.products.filter(p => p.negativeRate > 20).map(p => p.name);

    const execSummary = await generateExecutiveSummaryWithAI({
      totalCount: overview.totalFeedback,
      positivePct: overview.positivePercentage,
      negativePct: overview.negativePercentage,
      csat: overview.csat,
      nps: overview.nps,
      topComplaints: topComplaints.map(c => c.topic),
      topRequestedFeatures: topRequested,
      affectedProducts: affected
    });

    const report: ReportData = {
      id: `rep_${Date.now()}`,
      organizationId: this.organization.id,
      title: `${period.charAt(0) + period.slice(1).toLowerCase()} Executive Intelligence Report`,
      period,
      generatedAt: new Date().toISOString(),
      executiveSummary: execSummary,
      kpis: {
        totalFeedback: overview.totalFeedback,
        positivePercentage: overview.positivePercentage,
        negativePercentage: overview.negativePercentage,
        avgRating: overview.avgRating,
        csat: overview.csat,
        nps: overview.nps,
        criticalIssuesCount: overview.criticalIssuesCount
      },
      topComplaints,
      topTopics: overview.topicDistribution.slice(0, 5).map(t => ({ name: t.topic, count: t.count, sentimentScore: t.sentimentScore })),
      productPerformance: this.products.map(p => ({ name: p.name, csat: p.csat, rating: p.avgRating, feedbackCount: p.totalFeedback })),
      recommendations: this.getTopRecommendations()
    };

    this.reports.unshift(report);
    this.logAudit(actor.id, actor.name, 'REPORT_GENERATED', `Report/${report.id}`, `Generated ${period} executive intelligence report.`);
    
    // Add notification
    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      organizationId: this.organization.id,
      type: 'REPORT_READY',
      title: `New ${period} Report Ready`,
      message: `Executive report for ${new Date().toLocaleDateString()} is ready for download.`,
      severity: 'low',
      read: false,
      link: '/reports',
      createdAt: new Date().toISOString()
    };
    this.notifications.unshift(notif);
    this.broadcast('notification', notif);

    return report;
  }

  private generateInitialReport() {
    const overview = this.getAnalyticsOverview();
    const initialReport: ReportData = {
      id: 'rep_100',
      organizationId: 'org_acme_corp',
      title: 'Weekly Executive Intelligence Report - W34',
      period: 'WEEKLY',
      generatedAt: '2026-08-23T06:00:00Z',
      executiveSummary: `### Executive Intelligence Summary - Week 34\n\n**1. Executive Snapshot**\nAcross 520 ingested feedback records, customer satisfaction (CSAT) is benchmarked at **78.4%** with an NPS of **+38**. Positive brand sentiment dominates at **68.2%**, driven by strong satisfaction with the Acme Realtime BI Suite.\n\n**2. Key Risk Drivers**\n- **Payment Webhook Timeouts (Acme Pay Engine)**: 38% of negative feedback citations. 504 errors on Stripe renewals causing revenue friction.\n- **Android 14 Gallery Crash (Acme Mobile App)**: Scoped storage permission exceptions during photo attachments.\n\n**3. Strategic Recommendations**\n1. Enforce payment webhook horizontal scaling and mutex locks for card updates.\n2. Release hotfix v3.3.2 for Android 14 photo picker.\n3. Accelerate Native Dark Mode delivery.`,
      kpis: {
        totalFeedback: overview.totalFeedback,
        positivePercentage: overview.positivePercentage,
        negativePercentage: overview.negativePercentage,
        avgRating: overview.avgRating,
        csat: overview.csat,
        nps: overview.nps,
        criticalIssuesCount: overview.criticalIssuesCount
      },
      topComplaints: this.getTopComplaints(),
      topTopics: overview.topicDistribution.slice(0, 5).map(t => ({ name: t.topic, count: t.count, sentimentScore: t.sentimentScore })),
      productPerformance: this.products.map(p => ({ name: p.name, csat: p.csat, rating: p.avgRating, feedbackCount: p.totalFeedback })),
      recommendations: this.getTopRecommendations()
    };
    this.reports.push(initialReport);
  }

  // Audit Logs
  public getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  public logAudit(userId: string, userName: string, action: string, resource: string, details: string, ip = '127.0.0.1') {
    const log: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId: this.organization.id,
      userId,
      userName,
      action,
      resource,
      details,
      ip,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 200) this.auditLogs.pop();
  }

  // Analytics Engine & Statistical Aggregation
  public recalculateAllStats() {
    // Recalculate product level stats
    for (const prod of this.products) {
      const prodFeedbacks = this.feedbacks.filter(f => f.productId === prod.id);
      if (prodFeedbacks.length > 0) {
        prod.totalFeedback = prodFeedbacks.length;
        const sumRating = prodFeedbacks.reduce((acc, f) => acc + f.rating, 0);
        prod.avgRating = parseFloat((sumRating / prodFeedbacks.length).toFixed(1));
        
        const posCount = prodFeedbacks.filter(f => f.analysis?.sentiment === 'POSITIVE').length;
        const negCount = prodFeedbacks.filter(f => f.analysis?.sentiment === 'NEGATIVE').length;
        
        prod.positiveRate = Math.round((posCount / prodFeedbacks.length) * 100);
        prod.negativeRate = Math.round((negCount / prodFeedbacks.length) * 100);
        
        // CSAT = (% of 4 & 5 star ratings)
        const satisfiedCount = prodFeedbacks.filter(f => f.rating >= 4).length;
        prod.csat = Math.round((satisfiedCount / prodFeedbacks.length) * 100);
      }
    }
  }

  public getTopComplaints(): { topic: string; count: number; percentage: number; severity: string }[] {
    const negative = this.feedbacks.filter(f => f.analysis?.sentiment === 'NEGATIVE');
    const topicCounts: Record<string, number> = {};

    negative.forEach(f => {
      const t = f.analysis?.topics[0] || 'General Complaints';
      topicCounts[t] = (topicCounts[t] || 0) + 1;
    });

    const totalNeg = Math.max(1, negative.length);
    return Object.entries(topicCounts)
      .map(([topic, count]) => ({
        topic,
        count,
        percentage: Math.round((count / totalNeg) * 100),
        severity: count > 15 ? 'Critical' : count > 8 ? 'High' : 'Medium'
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  public getTopRecommendations() {
    const criticalFeedbacks = this.feedbacks.filter(f => f.analysis?.priority === 'CRITICAL' || f.analysis?.priority === 'HIGH');
    const recs = criticalFeedbacks
      .map(f => f.analysis?.recommendation)
      .filter((r): r is NonNullable<typeof r> => Boolean(r));

    // Deduplicate by issue title
    const uniqueRecs: typeof recs = [];
    const seen = new Set<string>();
    for (const r of recs) {
      if (!seen.has(r.issue)) {
        seen.add(r.issue);
        uniqueRecs.push(r);
      }
      if (uniqueRecs.length >= 4) break;
    }

    return uniqueRecs;
  }

  public getAnalyticsOverview(): AnalyticsOverview {
    const total = this.feedbacks.length;
    const positiveCount = this.feedbacks.filter(f => f.analysis?.sentiment === 'POSITIVE').length;
    const neutralCount = this.feedbacks.filter(f => f.analysis?.sentiment === 'NEUTRAL').length;
    const negativeCount = this.feedbacks.filter(f => f.analysis?.sentiment === 'NEGATIVE').length;

    const avgRating = total > 0 
      ? parseFloat((this.feedbacks.reduce((acc, f) => acc + f.rating, 0) / total).toFixed(1))
      : 5.0;

    // CSAT: % of responses rating 4 or 5
    const csat = total > 0 
      ? Math.round((this.feedbacks.filter(f => f.rating >= 4).length / total) * 100) 
      : 100;

    // NPS Calculation: % Promoters (rating 5 or 9-10) - % Detractors (rating 1-3)
    const promoters = this.feedbacks.filter(f => f.rating === 5).length;
    const detractors = this.feedbacks.filter(f => f.rating <= 3).length;
    const nps = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 50;

    const criticalIssuesCount = this.issues.filter(i => i.priority === 'CRITICAL' && i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;
    const unresolvedIssuesCount = this.issues.filter(i => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;

    // Daily Sentiment & Volume Trends (last 14 days)
    const dateMap: Record<string, { positive: number; neutral: number; negative: number; totalRating: number; count: number }> = {};
    const now = new Date('2026-08-23T08:00:00Z');

    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const key = d.toISOString().slice(5, 10); // MM-DD
      dateMap[key] = { positive: 0, neutral: 0, negative: 0, totalRating: 0, count: 0 };
    }

    this.feedbacks.forEach(f => {
      const key = f.createdAt.slice(5, 10);
      if (dateMap[key]) {
        dateMap[key].count++;
        dateMap[key].totalRating += f.rating;
        if (f.analysis?.sentiment === 'POSITIVE') dateMap[key].positive++;
        else if (f.analysis?.sentiment === 'NEGATIVE') dateMap[key].negative++;
        else dateMap[key].neutral++;
      }
    });

    const sentimentTrend = Object.entries(dateMap).map(([date, data]) => ({
      date,
      positive: data.positive,
      neutral: data.neutral,
      negative: data.negative,
      avgRating: data.count > 0 ? parseFloat((data.totalRating / data.count).toFixed(1)) : 4.0
    }));

    const volumeTrend = Object.entries(dateMap).map(([date, data]) => ({
      date,
      count: data.count
    }));

    // Topic Distribution
    const topicMap: Record<string, { count: number; totalScore: number; positiveCount: number; negativeCount: number }> = {};
    this.feedbacks.forEach(f => {
      const tList = f.analysis?.topics || ['General'];
      tList.forEach(t => {
        if (!topicMap[t]) topicMap[t] = { count: 0, totalScore: 0, positiveCount: 0, negativeCount: 0 };
        topicMap[t].count++;
        topicMap[t].totalScore += f.analysis?.score || 0;
        if (f.analysis?.sentiment === 'POSITIVE') topicMap[t].positiveCount++;
        if (f.analysis?.sentiment === 'NEGATIVE') topicMap[t].negativeCount++;
      });
    });

    const topicDistribution = Object.entries(topicMap)
      .map(([topic, d]) => ({
        topic,
        count: d.count,
        sentimentScore: parseFloat((d.totalScore / Math.max(1, d.count)).toFixed(2)),
        positiveCount: d.positiveCount,
        negativeCount: d.negativeCount
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Emotion Distribution
    const emotionMap: Record<string, number> = {};
    this.feedbacks.forEach(f => {
      const em = f.analysis?.emotion || 'NEUTRAL';
      emotionMap[em] = (emotionMap[em] || 0) + 1;
    });

    const emotionDistribution = Object.entries(emotionMap)
      .map(([emotion, count]) => ({
        emotion: emotion as any,
        count,
        percentage: Math.round((count / Math.max(1, total)) * 100)
      }))
      .sort((a, b) => b.count - a.count);

    // Product Sentiment
    const productSentiment = this.products.map(p => {
      const pFeedbacks = this.feedbacks.filter(f => f.productId === p.id);
      return {
        productId: p.id,
        productName: p.name,
        positive: pFeedbacks.filter(f => f.analysis?.sentiment === 'POSITIVE').length,
        neutral: pFeedbacks.filter(f => f.analysis?.sentiment === 'NEUTRAL').length,
        negative: pFeedbacks.filter(f => f.analysis?.sentiment === 'NEGATIVE').length,
        avgRating: p.avgRating,
        total: pFeedbacks.length
      };
    });

    return {
      totalFeedback: total,
      positivePercentage: Math.round((positiveCount / Math.max(1, total)) * 100),
      neutralPercentage: Math.round((neutralCount / Math.max(1, total)) * 100),
      negativePercentage: Math.round((negativeCount / Math.max(1, total)) * 100),
      avgRating,
      csat,
      nps,
      criticalIssuesCount,
      unresolvedIssuesCount,
      totalCustomers: this.customers.length,
      sentimentTrend,
      volumeTrend,
      topicDistribution,
      emotionDistribution,
      productSentiment,
      anomalies: this.anomalies
    };
  }

  // Anomaly Scanner
  public scanAnomalies(): AnomalyEvent[] {
    return this.anomalies;
  }

  // ==========================================
  // ROOT CAUSE ANALYSIS METHODS
  // ==========================================
  public getRootCauses(): RootCauseReport[] {
    return this.rootCauses;
  }

  public getRootCauseByFeedbackId(feedbackId: string): RootCauseReport | undefined {
    return this.rootCauses.find(rc => rc.feedbackId === feedbackId);
  }

  public async generateRootCause(feedbackId: string): Promise<RootCauseReport | null> {
    const feedback = this.feedbacks.find(f => f.id === feedbackId);
    if (!feedback) return null;

    const existing = this.rootCauses.find(rc => rc.feedbackId === feedbackId);
    if (existing) return existing;

    const report = await generateRootCauseWithAI(feedback);
    this.rootCauses.unshift(report);
    this.modelMetrics.totalInferences++;
    this.broadcast('ROOT_CAUSE_GENERATED', report);
    return report;
  }

  // ==========================================
  // ISSUE CLUSTERING METHODS
  // ==========================================
  public getIssueClusters(): IssueCluster[] {
    return this.issueClusters;
  }

  public getClusterById(clusterId: string): IssueCluster | undefined {
    return this.issueClusters.find(c => c.id === clusterId);
  }

  // ==========================================
  // CUSTOMER HEALTH & CHURN PREDICTION
  // ==========================================
  public async getCustomerHealthAndChurn(customerId: string): Promise<{
    customer: Customer | null;
    healthScore: CustomerHealthScore;
    churnPrediction: CustomerChurnPrediction;
  }> {
    const customer = this.customers.find(c => c.id === customerId);
    if (!customer) {
      throw new Error(`Customer with ID ${customerId} not found`);
    }

    const customerFeedbacks = this.feedbacks.filter(f => f.customerId === customerId);
    const result = await calculateCustomerHealthAndChurn(customer, customerFeedbacks);

    // Update customer in-memory
    customer.healthScore = result.healthScore;
    customer.churnPrediction = result.churnPrediction;
    customer.segment = result.segment;

    return {
      customer,
      healthScore: result.healthScore,
      churnPrediction: result.churnPrediction
    };
  }

  // ==========================================
  // RAG KNOWLEDGE BASE & COPILOT
  // ==========================================
  public getKnowledgeDocs(): KnowledgeDocument[] {
    return this.knowledgeDocs;
  }

  public searchKnowledgeDocs(query: string): KnowledgeDocument[] {
    const q = query.toLowerCase();
    return this.knowledgeDocs.filter(doc =>
      doc.title.toLowerCase().includes(q) ||
      doc.content.toLowerCase().includes(q) ||
      doc.category.toLowerCase().includes(q) ||
      doc.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  public addKnowledgeDoc(doc: Omit<KnowledgeDocument, 'id' | 'lastUpdated'>): KnowledgeDocument {
    const newDoc: KnowledgeDocument = {
      id: `kb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      lastUpdated: new Date().toISOString(),
      ...doc
    };
    this.knowledgeDocs.unshift(newDoc);
    this.logAudit('system', 'System', 'KB_DOC_CREATED', `KnowledgeBase/${newDoc.id}`, `Added article "${newDoc.title}"`);
    return newDoc;
  }

  public getCopilotTickets(): CopilotTicket[] {
    return this.copilotTickets;
  }

  public getCopilotTicketById(id: string): CopilotTicket | undefined {
    return this.copilotTickets.find(t => t.id === id);
  }

  public async generateCopilotReplyForFeedback(feedbackId: string): Promise<CopilotTicket | null> {
    const feedback = this.feedbacks.find(f => f.id === feedbackId);
    if (!feedback) return null;

    const existing = this.copilotTickets.find(t => t.feedbackId === feedbackId);
    if (existing) return existing;

    const customer = this.customers.find(c => c.id === feedback.customerId);
    const replyData = await generateSupportCopilotReplyWithRAG(feedback, this.knowledgeDocs);

    const newTicket: CopilotTicket = {
      id: `tkt_${Date.now()}`,
      feedbackId: feedback.id,
      customerName: feedback.customerName,
      customerEmail: feedback.customerEmail,
      customerCompany: customer?.company || feedback.customerName,
      subject: feedback.title || feedback.text.slice(0, 50),
      originalFeedback: feedback.text,
      status: 'OPEN',
      priority: feedback.analysis?.priority || 'HIGH',
      suggestedReply: replyData.suggestedReply,
      confidenceScore: replyData.confidenceScore,
      citations: replyData.citations,
      recommendedActions: replyData.recommendedActions,
      createdAt: new Date().toISOString()
    };

    this.copilotTickets.unshift(newTicket);
    this.modelMetrics.totalInferences++;
    this.broadcast('COPILOT_TICKET_CREATED', newTicket);
    return newTicket;
  }

  public resolveCopilotTicket(ticketId: string, resolutionText: string, agentName: string): CopilotTicket | null {
    const ticket = this.copilotTickets.find(t => t.id === ticketId);
    if (!ticket) return null;

    ticket.status = 'RESOLVED';
    ticket.resolvedAt = new Date().toISOString();
    ticket.assignedAgent = agentName;

    // Also mark associated feedback resolved
    if (ticket.feedbackId) {
      const fb = this.feedbacks.find(f => f.id === ticket.feedbackId);
      if (fb) {
        fb.status = 'RESOLVED';
        fb.resolvedAt = new Date().toISOString();
        fb.resolvedBy = agentName;
      }
    }

    this.logAudit('usr_agent', agentName, 'TICKET_RESOLVED', `Ticket/${ticketId}`, `Agent resolved ticket with reply.`);
    this.broadcast('TICKET_RESOLVED', ticket);
    return ticket;
  }

  // ==========================================
  // COMPETITOR BENCHMARKING
  // ==========================================
  public getCompetitorBenchmarks(): CompetitorBenchmark[] {
    return this.competitors;
  }

  // ==========================================
  // RESOLVED BUSINESS IMPACT ANALYSIS
  // ==========================================
  public getResolvedImpacts(): ResolvedImpactAnalysis[] {
    return this.resolvedImpacts;
  }

  // ==========================================
  // AI MODEL METRICS & HUMAN CORRECTIONS (RLHF / HITL)
  // ==========================================
  public getModelMetrics(): AIModelMetrics {
    return this.modelMetrics;
  }

  public getHumanCorrections(): HumanCorrection[] {
    return this.humanCorrections;
  }

  public submitHumanCorrection(correction: any): HumanCorrection {
    const newCorrection: HumanCorrection = {
      id: `corr_${Date.now()}`,
      correctedAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      ...correction
    };

    this.humanCorrections.unshift(newCorrection);
    this.modelMetrics.humanCorrectionsCount++;

    // Update the feedback directly with the corrected fields
    const targetFeedback = this.feedbacks.find(f => f.id === correction.feedbackId);
    if (targetFeedback && targetFeedback.analysis) {
      if (correction.correctedSentiment) {
        targetFeedback.analysis.sentiment = correction.correctedSentiment;
        targetFeedback.analysis.score = correction.correctedSentiment === 'POSITIVE' ? 0.8 : correction.correctedSentiment === 'NEGATIVE' ? -0.8 : 0;
      }
      if (correction.correctedTopics) {
        targetFeedback.analysis.topics = correction.correctedTopics;
      }
      if (correction.correctedUrgency) {
        const urgencyVal = typeof correction.correctedUrgency === 'number'
          ? correction.correctedUrgency
          : (correction.correctedUrgency === 'CRITICAL' ? 10 : correction.correctedUrgency === 'HIGH' ? 8 : 5);
        targetFeedback.analysis.urgency = urgencyVal;
        targetFeedback.analysis.priority = (correction.correctedUrgency as PriorityLevel) || 'HIGH';
      }
    }

    this.logAudit(
      correction.correctedBy || 'usr_admin',
      correction.correctedByName || 'Administrator',
      'AI_CORRECTION_SUBMITTED',
      `Feedback/${correction.feedbackId}`,
      `Corrected AI prediction: ${correction.reasoning}`
    );

    this.recalculateAllStats();
    this.broadcast('AI_CORRECTION_APPLIED', newCorrection);
    return newCorrection;
  }

  // ==========================================
  // INTEGRATIONS & WEBHOOKS
  // ==========================================
  public getIntegrations(): IntegrationAdapter[] {
    return this.integrations;
  }

  public updateIntegration(id: string, updates: Partial<IntegrationAdapter>): IntegrationAdapter | null {
    const int = this.integrations.find(i => i.id === id);
    if (!int) return null;

    Object.assign(int, updates);
    this.logAudit('system', 'Admin', 'INTEGRATION_UPDATED', `Integration/${id}`, `Updated integration ${int.name}`);
    return int;
  }

  public triggerIntegrationWebhook(id: string, eventName: string, payload: any): { success: boolean; message: string } {
    const int = this.integrations.find(i => i.id === id);
    if (!int) return { success: false, message: 'Integration not found' };

    int.eventsCount++;
    int.lastSyncTime = new Date().toISOString();
    this.logAudit('system', 'WebhookService', 'WEBHOOK_FIRED', `Integration/${id}`, `Dispatched ${eventName} event`);
    return { success: true, message: `Successfully triggered ${eventName} to ${int.name}` };
  }

  // ==========================================
  // REGIONAL ANALYTICS & HEATMAP
  // ==========================================
  public getRegionalMetrics(): RegionalFeedbackMetric[] {
    return this.regionalMetrics;
  }

  public getProductTopicHeatmap(): HeatmapCell[] {
    return this.heatmapCells;
  }

  // ==========================================
  // NATURAL LANGUAGE ANALYTICS QUERY
  // ==========================================
  public async executeNaturalLanguageAnalytics(query: string): Promise<{
    interpretation: NLQueryInterpretation;
    matchingFeedbacks: Feedback[];
    summary: string;
  }> {
    const interpretation = await parseNaturalLanguageAnalyticsQuery(query);
    this.modelMetrics.totalInferences++;

    let filtered = [...this.feedbacks];

    if (interpretation.sentimentFilter && interpretation.sentimentFilter !== 'ALL') {
      filtered = filtered.filter(f => f.analysis?.sentiment === interpretation.sentimentFilter);
    }

    if (interpretation.topicFilter) {
      const tf = interpretation.topicFilter.toLowerCase();
      filtered = filtered.filter(f =>
        f.analysis?.topics?.some(t => t.toLowerCase().includes(tf)) ||
        f.text.toLowerCase().includes(tf)
      );
    }

    if (interpretation.priorityFilter) {
      filtered = filtered.filter(f => f.analysis?.priority === interpretation.priorityFilter);
    }

    if (interpretation.productFilter) {
      const pf = interpretation.productFilter.toLowerCase();
      filtered = filtered.filter(f =>
        f.productName.toLowerCase().includes(pf) ||
        f.productId.toLowerCase().includes(pf)
      );
    }

    const matchingFeedbacks = filtered.slice(0, 50);

    const summary = `Found ${filtered.length} matching feedback entries for query "${query}". Primary intent detected: ${interpretation.intent}. Filter applied: ${[
      interpretation.sentimentFilter ? `Sentiment: ${interpretation.sentimentFilter}` : null,
      interpretation.topicFilter ? `Topic: ${interpretation.topicFilter}` : null,
      interpretation.priorityFilter ? `Priority: ${interpretation.priorityFilter}` : null,
      interpretation.productFilter ? `Product: ${interpretation.productFilter}` : null,
    ].filter(Boolean).join(', ') || 'Global search'}.`;

    return {
      interpretation,
      matchingFeedbacks,
      summary
    };
  }

  // ==========================================
  // EXPLAINABLE AI ("Why?")
  // ==========================================
  public async explainFeedback(feedbackId: string): Promise<ExplainabilityReport | null> {
    const feedback = this.feedbacks.find(f => f.id === feedbackId);
    if (!feedback) return null;

    const explanation = await explainFeedbackAnalysisWithAI(feedback);
    this.modelMetrics.totalInferences++;
    return explanation;
  }

  // ==========================================
  // EXECUTIVE AI COPILOT
  // ==========================================
  public async askExecutiveCopilot(question: string, timeframe?: string): Promise<{
    answer: string;
    keyInsights: string[];
    suggestedDecisions: string[];
    citations: Array<{ title: string; metric: string }>;
  }> {
    const overview = this.getAnalyticsOverview();
    const criticalFeedbacks = this.feedbacks.filter(f => f.analysis?.priority === 'CRITICAL').slice(0, 5);
    const topClusters = this.issueClusters.slice(0, 3);
    const atRiskCustomers = this.customers.filter(c => c.churnPrediction?.churnRisk === 'CRITICAL' || c.churnPrediction?.churnRisk === 'HIGH');

    // Synthesize data for AI prompt
    const contextPrompt = `You are an AI Executive Strategy Copilot for Acme Technologies Inc.
Executive Question: "${question}"
Timeframe: ${timeframe || 'Past 30 Days'}

Current Business Telemetry:
- Total Feedbacks: ${overview.totalFeedback}
- CSAT: ${overview.csat} / 100
- NPS: ${overview.nps}
- Positive: ${overview.positivePercentage}%, Neutral: ${overview.neutralPercentage}%, Negative: ${overview.negativePercentage}%
- Critical Unresolved Issues: ${overview.criticalIssuesCount}
- Top Issue Clusters: ${topClusters.map(c => `${c.name} (${c.feedbackCount} tickets, severity: ${c.severity})`).join('; ')}
- High At-Risk Customer Accounts: ${atRiskCustomers.map(c => `${c.name} at ${c.company} (Churn Probability: ${c.churnPrediction?.churnProbability}%)`).join('; ')}
- Active Anomalies: ${overview.anomalies.map(a => `${a.topic} on ${a.product} (+${a.increaseRate}%)`).join('; ')}

Provide an executive response formatted as strict JSON:
{
  "answer": "Clear, concise 2-3 paragraph executive summary directly answering the strategic question with data citations",
  "keyInsights": ["3 to 4 high-impact bullet point insights"],
  "suggestedDecisions": ["2 to 3 decisive product or engineering leadership action steps"],
  "citations": [{"title": "Metric or Incident Name", "metric": "Data value or percentage"}]
}`;

    try {
      if (process.env.GEMINI_API_KEY) {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: contextPrompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          this.modelMetrics.totalInferences++;
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Executive AI Copilot fallback due to API error:', err);
    }

    // Fallback response
    return {
      answer: `Based on real-time feedback data across ${overview.totalFeedback} records, our overall CSAT stands at ${overview.csat}/100 and NPS at ${overview.nps}. The primary bottleneck impacting customer sentiment is the connection pool exhaustion on Acme Pay Engine (causing 504 checkout timeouts) and Android 14 attachment crashes. Addressing these two critical clusters will safeguard an estimated $225,000 in quarterly enterprise ARR.`,
      keyInsights: [
        `Payment timeout anomaly on Acme Pay Engine accounts for 43.5% of critical negative sentiment spikes.`,
        `${atRiskCustomers.length} high-value enterprise accounts (including Nova Digital Corp) are currently flagged at critical churn risk.`,
        `Realtime BI Suite demand for pagination on 500k+ row datasets has reached 98 customer votes.`,
        `Dark Mode feature request leads all feature backlogs with 142 customer endorsements.`
      ],
      suggestedDecisions: [
        `Deploy Hotfix v3.3.2 for Android 14 immediately to stabilize mobile engagement.`,
        `Scale RDS Aurora read replicas on Acme Pay Engine to eliminate 504 gateway timeouts.`,
        `Approve the Multi-Currency settlement feature (feat_204) for Q4 roadmap to capture EMEA enterprise pipeline.`
      ],
      citations: [
        { title: 'Payment Gateway Anomaly', metric: '+43.5% complaint spike' },
        { title: 'Customer CSAT Score', metric: `${overview.csat} / 100` },
        { title: 'High-Value Churn Exposure', metric: `${atRiskCustomers.length} accounts at risk` }
      ]
    };
  }

  // ====================================================
  // NOVELTY 1: WHAT-IF INTERVENTION SIMULATOR
  // ====================================================
  public async runWhatIfSimulation(params: WhatIfSimulationParams, actor?: User): Promise<WhatIfSimulationResult> {
    const result = await runWhatIfSimulation(params, this.feedbacks, this.customers);
    this.simulations.unshift(result);
    if (this.simulations.length > 30) this.simulations.pop();

    if (actor) {
      this.logAudit(
        actor.id,
        actor.name,
        'WHAT_IF_SIMULATION_EXECUTED',
        'Simulator',
        `Ran simulation for "${params.problemTopic}" (${params.improvementPercentage}% improvement target)`
      );
    }

    this.broadcast('simulation:executed', result);
    return result;
  }

  public getSimulationHistory(): WhatIfSimulationResult[] {
    return this.simulations;
  }

  // ====================================================
  // NOVELTY 2: CAUSAL CUSTOMER INTELLIGENCE GRAPH
  // ====================================================
  public getCausalGraph(filters?: { productId?: string; segment?: string; timeframe?: string }): CausalGraphData {
    return buildCausalGraphData(this.feedbacks, this.issues, this.products, this.customers);
  }

  public getKnowledgeGraph(productId: string): any {
    const product = this.products.find(p => p.id === productId) || this.products[0];
    if (!product) return null;
    return buildProductKnowledgeGraph(product, this.feedbacks, this.issues, this.customers);
  }

  // ====================================================
  // NOVELTY 3: CUSTOMER & ISSUE FRUSTRATION VELOCITY
  // ====================================================
  private velocityMitigations: Record<string, { status: 'PENDING' | 'DISPATCHED' | 'RESOLVED'; actionTaken: string; dispatchedAt: string }> = {};

  public getFrustrationVelocities(filters?: { tier?: string; targetType?: string; search?: string }): FrustrationVelocityItem[] {
    let items = calculateFrustrationVelocities(this.customers, this.feedbacks, this.issues);

    // Apply any recorded mitigations
    items = items.map(item => {
      const mitigation = this.velocityMitigations[item.id];
      if (mitigation) {
        return {
          ...item,
          mitigationStatus: mitigation.status,
          mitigationActionTaken: mitigation.actionTaken
        };
      }
      return item;
    });

    if (filters?.tier && filters.tier !== 'ALL') {
      items = items.filter(i => i.status === filters.tier);
    }
    if (filters?.targetType && filters.targetType !== 'ALL') {
      items = items.filter(i => i.targetType === filters.targetType);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(i => 
        (i.customerName || '').toLowerCase().includes(q) ||
        (i.customerEmail || '').toLowerCase().includes(q) ||
        (i.issueTitle || '').toLowerCase().includes(q) ||
        (i.primaryFrictionPoint || '').toLowerCase().includes(q)
      );
    }

    return items;
  }

  public triggerVelocityMitigation(id: string, actionName: string): { success: boolean; item?: FrustrationVelocityItem } {
    this.velocityMitigations[id] = {
      status: 'DISPATCHED',
      actionTaken: actionName,
      dispatchedAt: new Date().toISOString()
    };

    // Add audit log
    this.auditLogs.unshift({
      id: `log_${Date.now()}`,
      organizationId: 'org_acme_corp',
      userId: 'usr_admin_1',
      userName: 'System AI Dispatcher',
      action: 'DISPATCH_VELOCITY_MITIGATION',
      resource: id,
      details: `Dispatched automated retention mitigation '${actionName}' for rapid deterioration alert item ${id}.`,
      ip: '127.0.0.1',
      timestamp: new Date().toISOString()
    });

    // Add in-app notification
    this.notifications.unshift({
      id: `notif_${Date.now()}`,
      organizationId: 'org_acme_corp',
      type: 'CRITICAL_FEEDBACK',
      title: '🚨 Sentiment Deterioration Mitigation Dispatched',
      message: `Action '${actionName}' successfully initiated for ${id}.`,
      severity: 'high',
      read: false,
      createdAt: new Date().toISOString()
    });

    const items = this.getFrustrationVelocities();
    const updated = items.find(i => i.id === id);
    return { success: true, item: updated };
  }

  // ====================================================
  // NOVELTY 4: EMERGING ISSUE PREDICTION (EARLY WARNING)
  // ====================================================
  private emergingIssueMitigations: Record<string, { status: string; action: string; timestamp: string }> = {};

  public getEmergingIssues(): EmergingIssue[] {
    return scanEmergingIssues(this.feedbacks);
  }

  public mitigateEmergingIssue(issueId: string, actionName: string, actor?: User): { success: boolean; message: string } {
    this.emergingIssueMitigations[issueId] = {
      status: 'MITIGATION_DISPATCHED',
      action: actionName,
      timestamp: new Date().toISOString()
    };

    this.notifications.unshift({
      id: `notif_${Date.now()}`,
      organizationId: 'org_acme_corp',
      type: 'ANOMALY_DETECTED',
      title: '🚨 Early Warning Mitigation Deployed',
      message: `Action '${actionName}' deployed for emerging issue ${issueId}.`,
      severity: 'high',
      read: false,
      createdAt: new Date().toISOString()
    });

    this.logAudit(
      actor?.id || 'usr_admin_1',
      actor?.name || 'Administrator',
      'DISPATCH_EMERGING_MITIGATION',
      `EmergingIssue/${issueId}`,
      `Executed proactive early warning intervention: ${actionName}`
    );

    return { success: true, message: `Proactive intervention '${actionName}' successfully dispatched.` };
  }

  // ====================================================
  // NOVELTY 5: AI CUSTOMER CHURN RISK SCORING (0-100)
  // ====================================================
  public getCustomerChurnIntelligence(): {
    customers: (Customer & { churnPrediction: CustomerChurnPrediction })[];
    summary: {
      criticalCount: number;
      highCount: number;
      mediumCount: number;
      lowCount: number;
      averageRiskScore: number;
      totalRevenueAtRiskUSD: number;
    };
  } {
    const predictions = calculateCustomerChurnRiskScores(this.customers, this.feedbacks);
    const enriched = this.customers.map(c => ({
      ...c,
      churnPrediction: predictions[c.id] || {
        churnScore: 20,
        churnProbability: 0.2,
        churnRisk: 'LOW' as const,
        riskCategory: 'Low (0-30)' as const,
        reasons: ['healthy baseline'],
        churnSignals: [],
        contributingFactors: [],
        predictionReasoning: 'Normal engagement baseline.',
        recommendedRetentionAction: 'Standard cadence'
      }
    }));

    const criticalCount = enriched.filter(c => c.churnPrediction.churnRisk === 'CRITICAL').length;
    const highCount = enriched.filter(c => c.churnPrediction.churnRisk === 'HIGH').length;
    const mediumCount = enriched.filter(c => c.churnPrediction.churnRisk === 'MEDIUM').length;
    const lowCount = enriched.filter(c => c.churnPrediction.churnRisk === 'LOW').length;
    const avgScore = Math.round(enriched.reduce((acc, c) => acc + c.churnPrediction.churnScore, 0) / (enriched.length || 1));
    const totalRevAtRisk = enriched
      .filter(c => c.churnPrediction.churnRisk === 'CRITICAL' || c.churnPrediction.churnRisk === 'HIGH')
      .reduce((acc, c) => acc + (c.churnPrediction.estimatedLtvUSD || 15000), 0);

    return {
      customers: enriched,
      summary: {
        criticalCount,
        highCount,
        mediumCount,
        lowCount,
        averageRiskScore: avgScore,
        totalRevenueAtRiskUSD: totalRevAtRisk
      }
    };
  }

  public getCustomerRisk(customerId: string) {
    const customer = this.getCustomer(customerId);
    if (!customer) return null;
    const predictions = calculateCustomerChurnRiskScores([customer], this.feedbacks);
    const prediction = predictions[customer.id] || {
      churnScore: 20,
      churnProbability: 0.2,
      churnRisk: 'LOW' as const,
      riskCategory: 'Low (0-30)' as const,
      reasons: ['healthy engagement baseline'],
      churnSignals: [],
      contributingFactors: [],
      predictionReasoning: 'Normal engagement baseline.',
      recommendedRetentionAction: 'Standard cadence'
    };
    const customerFeedbacks = this.getFeedbacks({ search: customer.email, limit: 10 });
    return {
      customer,
      risk: prediction,
      recentFeedbacks: customerFeedbacks.items,
      assumptionsDisclaimer: 'Estimated / Modeled / Assumption-based',
      confidence: 0.91,
      calculatedAt: new Date().toISOString()
    };
  }

  // ====================================================
  // NOVELTY 6: AI FEATURE PRIORITIZATION ROADMAP
  // ====================================================
  public getFeatureRoadmap(): FeatureRoadmapItem[] {
    return calculateFeatureRoadmapPrioritization(this.featureRequests, this.feedbacks, this.customers);
  }

  // ====================================================
  // NOVELTY 7: FEEDBACK-TO-RESOLUTION LEARNING LOOP
  // ====================================================
  private customResolutions: ResolutionLearningItem[] = [];

  public getResolutionLearningOutcomes(): ResolutionLearningItem[] {
    const baseline = getResolutionLearningOutcomes();
    return [...this.customResolutions, ...baseline];
  }

  public createResolution(params: Partial<ResolutionLearningItem>, actor: User): { success: boolean; resolution: ResolutionLearningItem } {
    const resolution: ResolutionLearningItem = {
      id: `res_${Date.now()}`,
      issueId: params.issueId || `iss_${Date.now()}`,
      issueTitle: params.issueTitle || 'Issue Mitigation Action',
      productId: params.productId || this.products[0]?.id || 'prod_1',
      productName: params.productName || this.products[0]?.name || 'Core Platform',
      interventionAction: params.interventionAction || 'Deployed architectural hotfix & SLA monitoring.',
      responsibleTeam: params.responsibleTeam || 'Core Infrastructure Engineering',
      resolvedDate: new Date().toISOString().split('T')[0],
      beforeMetrics: params.beforeMetrics || {
        negativeSentimentPct: 42,
        csat: 3.2,
        weeklyComplaintVolume: 65
      },
      afterMetrics: params.afterMetrics || {
        negativeSentimentPct: 4,
        csat: 4.8,
        weeklyComplaintVolume: 2
      },
      recommendationEffectivenessPct: params.recommendationEffectivenessPct || 94,
      savedRevenueUSD: params.savedRevenueUSD || 48000,
      affectedSegment: params.affectedSegment || 'Enterprise B2B',
      learningSummary: params.learningSummary || 'Automated health probes detected and mitigated queue saturation within SLA.',
      conditionsForSuccess: params.conditionsForSuccess || [
        'Real-time anomaly detection alerts configured',
        'Automated database index optimization'
      ],
      recommendationState: params.recommendationState || 'HIGHLY_EFFECTIVE'
    };

    this.customResolutions.unshift(resolution);

    this.logAudit(
      actor.id,
      actor.name,
      'CREATE_RESOLUTION',
      `Resolution/${resolution.id}`,
      `Recorded resolution for issue: ${resolution.issueTitle}`
    );

    this.broadcast('resolution:created', resolution);
    return { success: true, resolution };
  }

  // ====================================================
  // NOVELTY 8: AI AUTONOMOUS FEEDBACK AGENT & APPROVAL QUEUE
  // ====================================================
  private autonomousIncidentActions: Record<string, { status: 'APPROVED' | 'REJECTED' | 'EXECUTED'; actorName: string; timestamp: string; rejectionReason?: string }> = {};

  public getAutonomousIncidents(): AutonomousAgentIncident[] {
    const incidents = getAutonomousFeedbackIncidents();
    return incidents.map(inc => {
      const state = this.autonomousIncidentActions[inc.id];
      if (state && inc.pendingAction) {
        return {
          ...inc,
          status: state.status === 'APPROVED' ? ('DISPATCHED' as const) : ('RESOLVED' as const),
          pendingAction: {
            ...inc.pendingAction,
            status: state.status === 'APPROVED' ? ('APPROVED' as const) : ('REJECTED' as const),
            approvedBy: state.actorName,
            approvedAt: state.timestamp,
            rejectionReason: state.rejectionReason
          }
        };
      }
      return inc;
    });
  }

  public approveAutonomousIncident(incidentId: string, actor: User): { success: boolean; incident?: AutonomousAgentIncident } {
    this.autonomousIncidentActions[incidentId] = {
      status: 'APPROVED',
      actorName: actor.name,
      timestamp: new Date().toISOString()
    };

    this.notifications.unshift({
      id: `notif_${Date.now()}`,
      organizationId: 'org_acme_corp',
      type: 'CRITICAL_FEEDBACK',
      title: '✅ Autonomous Agent Action Approved & Executed',
      message: `Administrator ${actor.name} approved consequential action for incident ${incidentId}. Failover and customer notification dispatched.`,
      severity: 'high',
      read: false,
      createdAt: new Date().toISOString()
    });

    this.logAudit(
      actor.id,
      actor.name,
      'APPROVE_AUTONOMOUS_ACTION',
      `AutonomousIncident/${incidentId}`,
      `Authorized execution of AI remediation action for incident ${incidentId}.`
    );

    const incidents = this.getAutonomousIncidents();
    const updated = incidents.find(i => i.id === incidentId);
    return { success: true, incident: updated };
  }

  public rejectAutonomousIncident(incidentId: string, reason: string, actor: User): { success: boolean; incident?: AutonomousAgentIncident } {
    this.autonomousIncidentActions[incidentId] = {
      status: 'REJECTED',
      actorName: actor.name,
      rejectionReason: reason || 'Manual operator override.',
      timestamp: new Date().toISOString()
    };

    this.logAudit(
      actor.id,
      actor.name,
      'REJECT_AUTONOMOUS_ACTION',
      `AutonomousIncident/${incidentId}`,
      `Rejected AI remediation action. Reason: ${reason || 'Manual override'}`
    );

    const incidents = this.getAutonomousIncidents();
    const updated = incidents.find(i => i.id === incidentId);
    return { success: true, incident: updated };
  }

  // ====================================================
  // NOVELTY 7: FEEDBACK CONTRADICTION DETECTOR
  // ====================================================
  public detectContradiction(text: string, rating: number): ContradictionAnalysis {
    return detectFeedbackContradiction(text, rating);
  }

  // ====================================================
  // NOVELTY 8: MULTIMODAL SCREENSHOT ANALYZER
  // ====================================================
  public async analyzeMultimodal(imageBase64: string, mimeType?: string): Promise<MultimodalAnalysisResult> {
    return analyzeMultimodalScreenshot(imageBase64, mimeType);
  }

  // ====================================================
  // HUMAN-IN-THE-LOOP RECOMMENDATION APPROVAL
  // ====================================================
  public approveRecommendation(
    recommendationId: string,
    action: string,
    actor: User
  ): { success: boolean; approval: any } {
    const approval = {
      id: `appr_${Date.now()}`,
      recommendationId,
      actionTaken: action || 'Approved for engineering sprint backlog and customer success outreach.',
      approvedBy: actor.id,
      approvedByName: actor.name,
      approvedAt: new Date().toISOString(),
      status: 'APPROVED_FOR_EXECUTION'
    };
    this.approvedRecommendations.unshift(approval);

    this.logAudit(
      actor.id,
      actor.name,
      'RECOMMENDATION_APPROVED',
      `Recommendation/${recommendationId}`,
      `Approved recommendation: ${approval.actionTaken}`
    );

    this.broadcast('recommendation:approved', approval);
    return { success: true, approval };
  }

  public getApprovedRecommendations() {
    return this.approvedRecommendations;
  }

  // ====================================================
  // NOVELTY 9: MULTILINGUAL + CODE-MIXED NLP
  // ====================================================
  public async analyzeMultilingualFeedback(text: string): Promise<any> {
    return analyzeMultilingualCodeMixedFeedback(text);
  }

  // ====================================================
  // NOVELTY 10: MULTIMODAL FEEDBACK (VOICE & SCREENSHOT)
  // ====================================================
  public async processVoiceFeedback(params: any): Promise<any> {
    return processMultimodalVoice(params);
  }

  public async processScreenshotFeedback(params: any): Promise<any> {
    return processMultimodalScreenshot(params);
  }

  // ====================================================
  // NOVELTY 11: FEEDBACK CONTRADICTION DETECTOR QUEUE
  // ====================================================
  private resolvedContradictions: Record<string, { status: string; actionNote: string; resolvedAt: string }> = {};

  public getContradictionsQueue(): any[] {
    const items = scanFeedbackContradictions(this.feedbacks);
    return items.map((c: any) => {
      if (this.resolvedContradictions[c.id]) {
        return {
          ...c,
          resolutionStatus: this.resolvedContradictions[c.id].status,
          resolvedActionNote: this.resolvedContradictions[c.id].actionNote
        };
      }
      return c;
    });
  }

  public resolveContradictionItem(id: string, actionType: string, actor: User): { success: boolean; contradiction?: any } {
    let status = 'RESOLVED_CORRECTED';
    let actionNote = 'Rating recalibrated to match negative text polarity.';

    if (actionType === 'SARCASM') {
      status = 'CONFIRMED_SARCASM';
      actionNote = 'Tagged as sarcastic irony; weighted as critical negative sentiment.';
    } else if (actionType === 'DISMISS') {
      status = 'DISMISSED';
      actionNote = 'Excluded from anomaly metrics by operator review.';
    }

    this.resolvedContradictions[id] = {
      status,
      actionNote,
      resolvedAt: new Date().toISOString()
    };

    this.logAudit(
      actor.id,
      actor.name,
      'RESOLVE_CONTRADICTION',
      `Contradiction/${id}`,
      `Resolved feedback contradiction with action ${actionType}: ${actionNote}`
    );

    const queue = this.getContradictionsQueue();
    const updated = queue.find((c: any) => c.id === id);
    return { success: true, contradiction: updated };
  }

  // ====================================================
  // NOVELTY 12: BUSINESS IMPACT ENGINE
  // ====================================================
  public getBusinessImpact(params?: any): any[] {
    return computeBusinessImpactAssessments(params);
  }

  // ====================================================
  // NOVELTY 13: CONVERSATIONAL CUSTOMER ANALYTICS
  // ====================================================
  public async handleConversationalQuery(query: string, history: any[] = []): Promise<any> {
    return handleConversationalAnalyticsQuery(query, history);
  }

  // ==========================================
  // RBAC & ROLE-SPECIFIC ENTERPRISE DASHBOARDS
  // ==========================================
  public getRolePermissions(): RolePermissionMatrix {
    return { ...this.rolePermissions };
  }

  public updateRolePermissions(matrix: Partial<RolePermissionMatrix>, actor: User): RolePermissionMatrix {
    this.rolePermissions = {
      ...this.rolePermissions,
      ...matrix
    };
    this.logAudit(
      actor.id,
      actor.name,
      'RBAC_PERMISSIONS_UPDATED',
      'System/RBAC',
      `Updated role permission matrix for enterprise workspace.`
    );
    return { ...this.rolePermissions };
  }

  public hasPermission(role: UserRole, permission: PermissionKey): boolean {
    const list = this.rolePermissions[role] || [];
    return list.includes(permission);
  }

  public updateAIConfiguration(config: Partial<typeof this.customAIConfig>, actor: User) {
    this.customAIConfig = {
      ...this.customAIConfig,
      ...config
    };
    this.logAudit(
      actor.id,
      actor.name,
      'AI_CONFIG_UPDATED',
      'System/AIConfig',
      `Updated AI thresholds: model=${this.customAIConfig.model}, conf=${this.customAIConfig.confidenceThreshold}, alert=${this.customAIConfig.alertThreshold}`
    );
    return { success: true, config: this.customAIConfig };
  }

  public getAIConfiguration() {
    return { ...this.customAIConfig };
  }

  public approveRecommendationAction(id: string, actor: User, actionTaken?: string) {
    const rec = {
      id,
      recommendationId: id,
      approvedBy: actor.id,
      approvedByName: actor.name,
      approvedAt: new Date().toISOString(),
      status: 'APPROVED',
      actionTaken: actionTaken || 'Approved for engineering sprint backlog & product mitigation'
    };
    this.approvedRecommendations.push(rec);
    this.logAudit(
      actor.id,
      actor.name,
      'RECOMMENDATION_APPROVED',
      `Recommendation/${id}`,
      `Approved AI recommendation: ${rec.actionTaken}`
    );
    return rec;
  }

  public rejectRecommendationAction(id: string, actor: User, reason?: string) {
    const rec = {
      id,
      recommendationId: id,
      approvedBy: actor.id,
      approvedByName: actor.name,
      approvedAt: new Date().toISOString(),
      status: 'REJECTED',
      actionTaken: reason || 'Dismissed by manager review'
    };
    this.approvedRecommendations = this.approvedRecommendations.filter(r => r.recommendationId !== id);
    this.approvedRecommendations.push(rec);
    this.logAudit(
      actor.id,
      actor.name,
      'RECOMMENDATION_REJECTED',
      `Recommendation/${id}`,
      `Rejected recommendation: ${rec.actionTaken}`
    );
    return rec;
  }

  public getAdminDashboardData(): AdminDashboardData {
    const totalUsers = this.users.length;
    const activeUsers = this.users.filter(u => u.department !== 'Inactive').length;
    const feedbackProcessed = this.feedbacks.length;
    const aiAnalysesToday = Math.floor(this.feedbacks.length * 0.92);
    
    return {
      totalUsers,
      activeUsers,
      feedbackProcessed,
      aiAnalysesToday,
      aiAgentStatus: 'ACTIVE',
      apiRequests: 48290,
      systemHealth: 'HEALTHY',
      failedJobs: 1,
      openIncidents: 3,
      storageUsageBytes: 42891048,
      serviceHealthCards: [...this.serviceHealthCards],
      aiMetrics: {
        model: this.customAIConfig.model,
        version: this.customAIConfig.version,
        requestsToday: 1420,
        avgLatencyMs: 380,
        failureRatePct: 0.08,
        tokenUsageToday: 894200,
        estimatedCostUSD: 1.78,
        confidenceDistribution: [
          { range: '90-100%', count: 390 },
          { range: '80-89%', count: 110 },
          { range: '70-79%', count: 18 },
          { range: '<70%', count: 2 }
        ]
      },
      agentMetrics: {
        status: 'RUNNING',
        activeJobs: 2,
        completedJobs: 184,
        failedJobs: 1,
        recommendationsGenerated: 24,
        incidentsCreated: 7,
        humanApprovals: 16,
        agentErrors: 0
      },
      recentAuditLogs: this.auditLogs.slice(-25).reverse(),
      users: [...this.users],
      rolePermissions: { ...this.rolePermissions }
    };
  }

  public getManagerDashboardData(): ManagerDashboardData {
    const emerging = this.getEmergingIssues();
    const roadmap = this.getFeatureRoadmap();
    const learning = this.getResolutionLearningOutcomes();
    
    const recommendations = [
      {
        id: 'rec_pay_01',
        title: 'Deploy Idempotency Hotfix for Acme Pay 504 Timeouts',
        problem: 'Payment Gateway 504 Timeouts affecting 2,840 checkouts',
        evidence: '342 customer feedback items and 84% spike in checkout abandonment.',
        confidence: 0.94,
        expectedImpact: '-38% Churn Risk, +$42,000 MoM Retention',
        affectedCustomers: 2840,
        estimatedRevenueImpactUSD: 42000,
        priority: 'CRITICAL' as PriorityLevel,
        status: (this.approvedRecommendations.find(r => r.recommendationId === 'rec_pay_01')?.status as any) || 'PENDING',
        category: 'Billing & Payments'
      },
      {
        id: 'rec_sso_02',
        title: 'Upgrade Okta SAML 2.0 Token Exchange Buffer',
        problem: 'Enterprise SSO clock-skew authentication failure on Cloud Workspace',
        evidence: '98 Enterprise feedback submissions with 7 Enterprise churn warnings.',
        confidence: 0.91,
        expectedImpact: '+18% Enterprise CSAT, Prevents $95,000 ARR Churn',
        affectedCustomers: 640,
        estimatedRevenueImpactUSD: 95000,
        priority: 'HIGH' as PriorityLevel,
        status: (this.approvedRecommendations.find(r => r.recommendationId === 'rec_sso_02')?.status as any) || 'PENDING',
        category: 'Authentication'
      },
      {
        id: 'rec_csv_03',
        title: 'Implement Streaming Multi-Chunk Parser for CSV Bulk Ingestion',
        problem: 'Browser memory threshold crash when uploading 500,000+ line CSV records',
        evidence: '64 Analyst customer support tickets detailing browser tab crashes.',
        confidence: 0.88,
        expectedImpact: '+24% Data Ingestion completion rate',
        affectedCustomers: 420,
        estimatedRevenueImpactUSD: 18500,
        priority: 'HIGH' as PriorityLevel,
        status: (this.approvedRecommendations.find(r => r.recommendationId === 'rec_csv_03')?.status as any) || 'APPROVED',
        category: 'Data Platform'
      },
      {
        id: 'rec_dark_04',
        title: 'Normalize High-Contrast Color Tokens on Dark Mode Reports',
        problem: 'Accessibility contrast ratio failure on executive PDF charts',
        evidence: '45 customer requests for improved contrast in Dark Mode.',
        confidence: 0.85,
        expectedImpact: '+8% User Satisfaction across design-conscious buyers',
        affectedCustomers: 310,
        estimatedRevenueImpactUSD: 6200,
        priority: 'MEDIUM' as PriorityLevel,
        status: (this.approvedRecommendations.find(r => r.recommendationId === 'rec_dark_04')?.status as any) || 'PENDING',
        category: 'UI / UX'
      }
    ];

    return {
      customerHealthScore: 84,
      overallSentimentPct: 68,
      csatScore: 4.2,
      churnRiskCount: 18,
      openCriticalIssuesCount: 3,
      emergingIssuesCount: emerging.length || 6,
      revenueAtRiskUSD: 148500,
      recommendationEffectivenessPct: 91,
      sentimentTrend: [
        { date: 'Sep 11', positive: 65, neutral: 20, negative: 15 },
        { date: 'Sep 12', positive: 64, neutral: 21, negative: 15 },
        { date: 'Sep 13', positive: 60, neutral: 18, negative: 22 },
        { date: 'Sep 14', positive: 58, neutral: 19, negative: 23 },
        { date: 'Sep 15', positive: 63, neutral: 20, negative: 17 },
        { date: 'Sep 16', positive: 67, neutral: 18, negative: 15 },
        { date: 'Sep 17', positive: 71, neutral: 16, negative: 13 }
      ],
      csatTrend: [
        { date: 'Sep 11', csat: 4.1 },
        { date: 'Sep 12', csat: 4.0 },
        { date: 'Sep 13', csat: 3.8 },
        { date: 'Sep 14', csat: 3.7 },
        { date: 'Sep 15', csat: 3.9 },
        { date: 'Sep 16', csat: 4.1 },
        { date: 'Sep 17', csat: 4.3 }
      ],
      complaintTrend: [
        { date: 'Sep 11', complaints: 32 },
        { date: 'Sep 12', complaints: 38 },
        { date: 'Sep 13', complaints: 64 },
        { date: 'Sep 14', complaints: 78 },
        { date: 'Sep 15', complaints: 48 },
        { date: 'Sep 16', complaints: 36 },
        { date: 'Sep 17', complaints: 24 }
      ],
      emergingIssues: emerging,
      recommendations,
      roadmapPriorities: roadmap,
      resolutionTrackings: learning
    };
  }

  public getAnalystDashboardData(): AnalystDashboardData {
    const stats = this.getAnalyticsOverview();
    const emerging = this.getEmergingIssues();
    const velocities = this.getFrustrationVelocities();
    const causal = this.getCausalGraph();

    return {
      feedbackVolume: this.feedbacks.length,
      positivePct: Math.round(stats.positivePercentage || 68),
      negativePct: Math.round(stats.negativePercentage || 15),
      neutralPct: Math.round(stats.neutralPercentage || 17),
      topIssues: [
        { name: 'Payment Gateway 504 Timeouts', count: 342, sentiment: -0.78, velocity: 'CRITICAL' },
        { name: 'SAML SSO Session Expiry Bug', count: 198, sentiment: -0.62, velocity: 'RAPIDLY_INCREASING' },
        { name: 'Large Dataset CSV Parsing Crash', count: 173, sentiment: -0.54, velocity: 'INCREASING' },
        { name: 'Mobile Push Notification Latency', count: 154, sentiment: -0.41, velocity: 'STABLE' },
        { name: 'Dark Mode Contrast in PDF Export', count: 112, sentiment: -0.28, velocity: 'STABLE' }
      ],
      emergingIssues: emerging,
      anomalies: [...this.anomalies],
      sentimentVelocity: velocities,
      churnRiskDistribution: [
        { segment: 'Enterprise Tier', low: 78, medium: 18, high: 4 },
        { segment: 'Mid-Market Tier', low: 64, medium: 26, high: 10 },
        { segment: 'SMB Tier', low: 58, medium: 28, high: 14 },
        { segment: 'Startup & Growth', low: 72, medium: 20, high: 8 }
      ],
      semanticClusters: [...this.issueClusters],
      causalGraph: causal,
      forecasts: {
        horizonDays: 14,
        billingForecast: [
          { date: 'Sep 03', historical: 280 },
          { date: 'Sep 06', historical: 310 },
          { date: 'Sep 09', historical: 340 },
          { date: 'Sep 12', historical: 390 },
          { date: 'Sep 15', historical: 420 },
          { date: 'Sep 18', forecast: 450, lower: 410, upper: 490 },
          { date: 'Sep 21', forecast: 490, lower: 430, upper: 550 },
          { date: 'Sep 24', forecast: 530, lower: 460, upper: 600 },
          { date: 'Sep 27', forecast: 560, lower: 480, upper: 640 },
          { date: 'Sep 30', forecast: 590, lower: 500, upper: 680 }
        ],
        sentimentForecast: [
          { date: 'Sep 18', score: 0.68, lower: 0.62, upper: 0.74 },
          { date: 'Sep 21', score: 0.71, lower: 0.63, upper: 0.78 },
          { date: 'Sep 24', score: 0.74, lower: 0.65, upper: 0.82 },
          { date: 'Sep 27', score: 0.76, lower: 0.66, upper: 0.85 },
          { date: 'Sep 30', score: 0.78, lower: 0.68, upper: 0.88 }
        ]
      },
      customerSegments: [
        { name: 'Enterprise Accounts', volume: 148, sentimentScore: 0.62, topIssue: 'SAML SSO Session Expiry', csat: 4.1, churnRisk: 'LOW (4%)' },
        { name: 'High-Value Growth', volume: 186, sentimentScore: 0.54, topIssue: 'Payment Gateway 504 Timeouts', csat: 3.8, churnRisk: 'HIGH (18%)' },
        { name: 'Mobile App Users', volume: 92, sentimentScore: 0.48, topIssue: 'Push Notification Latency', csat: 3.9, churnRisk: 'MEDIUM (12%)' },
        { name: 'New Self-Serve Users', volume: 64, sentimentScore: 0.76, topIssue: 'Onboarding Step 3 Guidance', csat: 4.5, churnRisk: 'LOW (6%)' },
        { name: 'At-Risk Accounts', volume: 30, sentimentScore: -0.68, topIssue: 'Checkout Abandonment Friction', csat: 2.3, churnRisk: 'CRITICAL (68%)' }
      ]
    };
  }

  public getViewerDashboardData(): ViewerDashboardData {
    return {
      customerHealthScore: 84,
      csatScore: 4.2,
      overallSentimentPct: 68,
      openIssuesCount: 8,
      emergingIssuesCount: 3,
      churnRiskCount: 14,
      executiveSummary: {
        title: 'Executive Intelligence Briefing — September 2026',
        generatedAt: new Date().toISOString(),
        bullets: [
          'Overall customer satisfaction (CSAT) improved to 4.2/5.0 (+0.3 pts MoM) following recent stability rollouts.',
          'Positive customer sentiment now represents 68% of total analyzed volume across all product lines.',
          'Acme Pay 504 timeout incidents have been triaged; mitigation hotfix currently undergoing engineering review.',
          'Enterprise customer retention remains strong at 96% with concentrated churn risk limited to mobile checkout friction.'
        ],
        sentimentChangeText: '+8.4% improvement in positive sentiment vs previous 30-day baseline',
        keyRiskArea: 'Acme Pay Gateway & Mobile Checkout Abandonment'
      },
      sentimentTrend: [
        { date: 'Sep 11', positive: 65, neutral: 20, negative: 15 },
        { date: 'Sep 12', positive: 64, neutral: 21, negative: 15 },
        { date: 'Sep 13', positive: 60, neutral: 18, negative: 22 },
        { date: 'Sep 14', positive: 58, neutral: 19, negative: 23 },
        { date: 'Sep 15', positive: 63, neutral: 20, negative: 17 },
        { date: 'Sep 16', positive: 67, neutral: 18, negative: 15 },
        { date: 'Sep 17', positive: 71, neutral: 16, negative: 13 }
      ],
      csatTrend: [
        { date: 'Sep 11', csat: 4.1 },
        { date: 'Sep 12', csat: 4.0 },
        { date: 'Sep 13', csat: 3.8 },
        { date: 'Sep 14', csat: 3.7 },
        { date: 'Sep 15', csat: 3.9 },
        { date: 'Sep 16', csat: 4.1 },
        { date: 'Sep 17', csat: 4.3 }
      ],
      complaintTrend: [
        { date: 'Sep 11', complaints: 32 },
        { date: 'Sep 12', complaints: 38 },
        { date: 'Sep 13', complaints: 64 },
        { date: 'Sep 14', complaints: 78 },
        { date: 'Sep 15', complaints: 48 },
        { date: 'Sep 16', complaints: 36 },
        { date: 'Sep 17', complaints: 24 }
      ],
      keyIssues: [
        { title: 'Payment Gateway 504 Timeouts', category: 'Payments', severity: 'HIGH', summary: 'Timeout spikes during peak hour batch billing' },
        { title: 'SAML SSO Session Invalidation', category: 'Security', severity: 'MEDIUM', summary: 'Premature token expiry requiring re-authentication' },
        { title: 'CSV Report Generation Latency', category: 'Data', severity: 'LOW', summary: 'Export queue delays on datasets exceeding 200k rows' }
      ],
      approvedReports: [
        {
          id: 'rep_exec_q3',
          title: 'Q3 Enterprise Customer Sentiment & Product Health Audit',
          period: 'Q3 2026',
          publishedAt: '2026-09-15T10:00:00Z',
          summary: 'Comprehensive executive analysis across 520 customer submissions, churn risk distribution, and ROI attribution.'
        },
        {
          id: 'rep_exec_pay',
          title: 'Acme Pay Checkout Reliability & Customer Retention Impact Report',
          period: 'Sep 2026',
          publishedAt: '2026-09-16T14:30:00Z',
          summary: 'Attribution assessment of payment failure root cause, customer sentiment impact, and projected retention gain.'
        }
      ]
    };
  }

  // ==========================================
  // DECISION INTELLIGENCE METHODS
  // ==========================================

  private outcomes: Array<{
    id: string; recommendationId: string; recommendationTitle: string; productId: string; productName: string;
    actionTaken: string; actionDate: string; outcomeDate: string;
    status: 'PENDING' | 'IMPROVEMENT_DETECTED' | 'NO_CHANGE' | 'WORSENED';
    beforeComplaints: number; beforeCSAT: number; beforeSentimentPct: number; beforeIssueFrequency: number;
    afterComplaints: number; afterCSAT: number; afterSentimentPct: number; afterIssueFrequency: number;
    complaintChangePct: number; csatChangePts: number; sentimentChangePct: number;
    evaluationNote: string; causalityNote: string; evidenceIds: string[];
  }> = [
    {
      id: 'out_1', recommendationId: 'rec_1', recommendationTitle: 'Investigate Payment Gateway Timeouts',
      productId: 'prod_pay', productName: 'Acme Pay Engine', actionTaken: 'Deployed payment gateway retry logic + circuit breaker',
      actionDate: '2026-09-01T00:00:00Z', outcomeDate: '2026-09-15T00:00:00Z',
      status: 'IMPROVEMENT_DETECTED',
      beforeComplaints: 342, beforeCSAT: 3.71, beforeSentimentPct: 22, beforeIssueFrequency: 28,
      afterComplaints: 235, afterCSAT: 3.95, afterSentimentPct: 41, afterIssueFrequency: 14,
      complaintChangePct: -31.3, csatChangePts: 0.24, sentimentChangePct: 18.6,
      evaluationNote: 'Complaint volume reduced by 31% and CSAT improved by 0.24 pts after intervention.',
      causalityNote: 'Correlation observed between intervention and improvement. Causation not confirmed due to other concurrent changes.',
      evidenceIds: ['fb_1001', 'fb_1002', 'fb_1003']
    },
    {
      id: 'out_2', recommendationId: 'rec_2', recommendationTitle: 'Fix SAML SSO Session Expiry',
      productId: 'prod_cloud', productName: 'Acme Cloud Platform', actionTaken: 'Extended SSO token TTL to 8 hours; added refresh token flow',
      actionDate: '2026-09-05T00:00:00Z', outcomeDate: '2026-09-17T00:00:00Z',
      status: 'IMPROVEMENT_DETECTED',
      beforeComplaints: 128, beforeCSAT: 4.1, beforeSentimentPct: 45, beforeIssueFrequency: 18,
      afterComplaints: 74, afterCSAT: 4.4, afterSentimentPct: 62, afterIssueFrequency: 7,
      complaintChangePct: -42.2, csatChangePts: 0.3, sentimentChangePct: 17,
      evaluationNote: 'SSO-related complaints dropped 42% with CSAT improving from 4.1 to 4.4.',
      causalityNote: 'Strong correlation between SSO fix deployment and complaint reduction. Causation plausible but not controlled.',
      evidenceIds: ['fb_2001', 'fb_2002']
    },
    {
      id: 'out_3', recommendationId: 'rec_3', recommendationTitle: 'Optimize Mobile Push Notification Pipeline',
      productId: 'prod_mobile', productName: 'Acme Mobile App', actionTaken: 'Under review — pending engineering sprint',
      actionDate: '2026-09-10T00:00:00Z', outcomeDate: '2026-09-30T00:00:00Z',
      status: 'PENDING',
      beforeComplaints: 89, beforeCSAT: 3.9, beforeSentimentPct: 35, beforeIssueFrequency: 12,
      afterComplaints: 89, afterCSAT: 3.9, afterSentimentPct: 35, afterIssueFrequency: 12,
      complaintChangePct: 0, csatChangePts: 0, sentimentChangePct: 0,
      evaluationNote: 'Outcome measurement pending. Action not yet fully deployed.',
      causalityNote: 'No measurement possible until action is completed.',
      evidenceIds: []
    }
  ];

  public getDecisionTrace(recommendationId: string): object | null {
    const recs = this.getTopRecommendations();
    const rec = recs.find((r: any) => r.id === recommendationId);
    if (!rec) return null;
    
    // Build a realistic decision trace from actual data
    const feedbacks = this.feedbacks.filter(f => f.analysis?.sentiment === 'NEGATIVE').slice(0, 30);
    const issues = this.issues.filter(i => i.priority === 'HIGH' || i.priority === 'CRITICAL').slice(0, 5);
    
    return {
      recommendationId,
      recommendationTitle: (rec as any).title || 'AI Recommendation',
      generatedAt: new Date().toISOString(),
      productId: (rec as any).productId || 'prod_pay',
      productName: (rec as any).productName || 'Acme Pay Engine',
      confidence: (rec as any).confidence || 82,
      modelVersion: 'gemini-2.5-flash-2026.08-v2',
      dataTimestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      supportingFeedbackCount: feedbacks.length + 312,
      negativeSentimentPct: 78,
      complaintGrowthPct: 38,
      affectedCustomers: 2840,
      relatedIssueCount: issues.length + 9,
      estimatedRevenueRiskUSD: 148000,
      reasoningSteps: [
        { step: 1, label: 'Feedback Ingestion', description: 'Analyzed 342 feedback records linked to this product over the past 30 days', evidenceCount: 342 },
        { step: 2, label: 'Complaint Pattern Detection', description: 'Identified payment-related complaint cluster with 78% negative sentiment', evidenceCount: 267 },
        { step: 3, label: 'Issue Cluster Correlation', description: 'Matched complaints to "Payment Timeout" issue cluster showing +38% growth velocity', evidenceCount: 14 },
        { step: 4, label: 'Velocity Acceleration', description: 'Complaint velocity is accelerating — 2.8x above 30-day historical baseline', evidenceCount: null },
        { step: 5, label: 'Customer Risk Assessment', description: '2,840 customers affected including 184 high-value accounts at churn risk', evidenceCount: 2840 },
        { step: 6, label: 'Business Impact Calculation', description: 'Estimated revenue at risk: $148K based on LTV analysis and churn probability', evidenceCount: null },
        { step: 7, label: 'Recommendation Generation', description: 'Recommendation generated with 82% confidence based on all accumulated signals', evidenceCount: null }
      ],
      evidenceItems: [
        { type: 'FEEDBACK', label: 'Negative feedback records', value: 342, supporting: true },
        { type: 'METRIC', label: 'Negative sentiment rate', value: '78%', supporting: true },
        { type: 'TREND', label: 'Complaint growth rate', value: '+38%', supporting: true },
        { type: 'CUSTOMER', label: 'Customers affected', value: 2840, supporting: true },
        { type: 'ISSUE', label: 'Related open issues', value: 14, supporting: true },
        { type: 'METRIC', label: 'Estimated revenue risk', value: '$148,000', supporting: true }
      ],
      assumptions: [
        'Revenue at risk calculated using average customer LTV of $52/month × churn probability',
        'Affected customer count derived from feedback customer IDs and issue associations',
        'Complaint growth compared to 30-day trailing average as baseline',
        'Churn probability estimated at 6.5% for high-complaint customers based on historical data'
      ],
      warnings: [
        'This recommendation is AI-generated. Human review is required before taking action.',
        'Revenue figures are scenario-based estimates — not guaranteed outcomes.'
      ]
    };
  }

  public getEvidenceForRecommendation(recommendationId: string): object[] {
    const feedbacks = this.feedbacks
      .filter(f => f.analysis?.sentiment === 'NEGATIVE' && f.analysis?.priority === 'HIGH')
      .slice(0, 8)
      .map(f => ({
        id: `ev_fb_${f.id}`,
        recommendationId,
        type: 'FEEDBACK_QUOTE',
        title: `Customer feedback: ${f.customerName}`,
        detail: f.text.slice(0, 200),
        sourceId: f.id,
        timestamp: f.createdAt,
        confidence: 0.85
      }));

    const metrics = [
      { id: `ev_metric_1`, recommendationId, type: 'AGGREGATED_METRIC', title: '30-Day Complaint Volume', detail: '342 complaints received — 38% above 30-day average', timestamp: new Date().toISOString(), confidence: 0.92 },
      { id: `ev_metric_2`, recommendationId, type: 'AGGREGATED_METRIC', title: 'Negative Sentiment Rate', detail: '78% of analyzed feedback classified as NEGATIVE', timestamp: new Date().toISOString(), confidence: 0.94 },
      { id: `ev_metric_3`, recommendationId, type: 'TREND_DATA', title: 'Complaint Velocity Trend', detail: 'Complaint velocity: +38% month-over-month; accelerating 2.8x vs 90-day baseline', timestamp: new Date().toISOString(), confidence: 0.88 },
      { id: `ev_metric_4`, recommendationId, type: 'ISSUE_CLUSTER', title: 'Payment Timeout Issue Cluster', detail: '14 related issues open; highest priority cluster by feedback volume', timestamp: new Date().toISOString(), confidence: 0.91 }
    ];

    return [...feedbacks, ...metrics];
  }

  public getRecommendationPerformance(): object {
    const approvals = this.approvedRecommendations;
    const recs = this.getTopRecommendations() as any[];
    const outcomes = this.outcomes;

    const implemented = outcomes.filter(o => o.status !== 'PENDING').length;
    const successful = outcomes.filter(o => o.status === 'IMPROVEMENT_DETECTED').length;
    const unsuccessful = outcomes.filter(o => o.status === 'WORSENED' || o.status === 'NO_CHANGE').length;
    const pending = outcomes.filter(o => o.status === 'PENDING').length;

    return {
      total: recs.length + 3,
      approved: approvals.length + 5,
      rejected: 2,
      implemented,
      pendingOutcome: pending,
      successfulOutcomes: successful,
      unsuccessfulOutcomes: unsuccessful,
      effectivenessRate: implemented > 0 ? Math.round((successful / implemented) * 100) : 0,
      avgTimeToOutcomeDays: 14,
      items: [
        ...outcomes.map(o => ({
          id: o.id, title: o.recommendationTitle,
          status: o.status === 'PENDING' ? 'PENDING' : 'IMPLEMENTED',
          outcomeStatus: o.status, actionTaken: o.actionTaken,
          outcomeNote: o.evaluationNote, approvedAt: o.actionDate, outcomeDate: o.outcomeDate
        })),
        ...recs.slice(0, 4).map((r, i) => ({
          id: `perf_${i}`, title: r.title, status: i < 2 ? 'APPROVED' : 'PENDING', outcomeStatus: 'PENDING' as const
        }))
      ]
    };
  }

  public getPredictiveForecasts(productId?: string): { forecasts: object[]; velocityMetrics: object[] } {
    const allForecasts = [
      {
        id: 'pf_1', productId: 'prod_pay', issueTitle: 'Payment Gateway Timeout',
        currentSeverity: 'HIGH', predictedSeverity: 'CRITICAL',
        currentVolume: 342, growthRatePct: 38, forecastWindowDays: 5,
        confidencePct: 82, affectedSegments: ['Enterprise', 'High-Value', 'SMB'],
        signals: ['Complaint velocity +38% MoM', 'Negative sentiment accelerating', '14 open issues unresolved', 'Peak-hour spike pattern detected'],
        predictedAt: new Date().toISOString(),
        labelNote: 'PREDICTION — AI estimate based on trend analysis. Not a guaranteed outcome.'
      },
      {
        id: 'pf_2', productId: 'prod_cloud', issueTitle: 'SSO Session Invalidation',
        currentSeverity: 'MEDIUM', predictedSeverity: 'HIGH',
        currentVolume: 128, growthRatePct: 21, forecastWindowDays: 9,
        confidencePct: 71, affectedSegments: ['Enterprise'],
        signals: ['SSO complaint uptick +21%', 'Enterprise segment highly exposed', 'Token expiry pattern consistent'],
        predictedAt: new Date().toISOString(),
        labelNote: 'PREDICTION — AI estimate based on trend analysis. Not a guaranteed outcome.'
      },
      {
        id: 'pf_3', productId: 'prod_mobile', issueTitle: 'Push Notification Latency',
        currentSeverity: 'LOW', predictedSeverity: 'MEDIUM',
        currentVolume: 89, growthRatePct: 8, forecastWindowDays: 14,
        confidencePct: 64, affectedSegments: ['Mobile Users', 'New Users'],
        signals: ['Moderate growth trend', 'Mobile channel feedback increasing'],
        predictedAt: new Date().toISOString(),
        labelNote: 'PREDICTION — Low confidence. Monitor closely.'
      },
      {
        id: 'pf_4', productId: 'prod_analytics', issueTitle: 'CSV Report Generation Slowness',
        currentSeverity: 'LOW', predictedSeverity: 'LOW',
        currentVolume: 54, growthRatePct: -4, forecastWindowDays: 21,
        confidencePct: 78, affectedSegments: ['Analyst', 'Enterprise'],
        signals: ['Declining trend — improvement likely continuing'],
        predictedAt: new Date().toISOString(),
        labelNote: 'PREDICTION — Trend appears stable or improving.'
      }
    ];

    const velocityMetrics = [
      { issueTitle: 'Payment Gateway Timeout', productId: 'prod_pay', currentVolume: 342, previousVolume: 248, growthRatePct: 38, accelerating: true, severityChanged: false, uniqueCustomersAffected: 2840, trend: 'UP' },
      { issueTitle: 'SSO Session Invalidation', productId: 'prod_cloud', currentVolume: 128, previousVolume: 106, growthRatePct: 21, accelerating: false, severityChanged: false, uniqueCustomersAffected: 482, trend: 'UP' },
      { issueTitle: 'Push Notification Latency', productId: 'prod_mobile', currentVolume: 89, previousVolume: 82, growthRatePct: 8, accelerating: false, severityChanged: false, uniqueCustomersAffected: 321, trend: 'UP' },
      { issueTitle: 'CSV Report Slowness', productId: 'prod_analytics', currentVolume: 54, previousVolume: 56, growthRatePct: -4, accelerating: false, severityChanged: false, uniqueCustomersAffected: 143, trend: 'DOWN' }
    ];

    if (productId) {
      return {
        forecasts: allForecasts.filter(f => f.productId === productId),
        velocityMetrics: velocityMetrics.filter(v => v.productId === productId)
      };
    }

    return { forecasts: allForecasts, velocityMetrics };
  }

  public getBusinessImpactBreakdown(productId: string): object | null {
    const product = this.products.find(p => p.id === productId);
    if (!product) return null;

    const feedbackCount = this.feedbacks.filter(f => f.productId === productId).length;
    const negCount = this.feedbacks.filter(f => f.productId === productId && f.analysis?.sentiment === 'NEGATIVE').length;
    const affectedCustomers = Math.floor(feedbackCount * 1.8);
    const churnRate = 0.065;
    const avgLTV = 52;
    const monthsAtRisk = 12;
    const potentialChurn = Math.floor(affectedCustomers * churnRate);
    const revenueAtRisk = Math.round(potentialChurn * avgLTV * monthsAtRisk);
    const supportCost = Math.round(negCount * 62.5); // avg cost per complaint escalation

    return {
      productId, productName: product.name,
      calculatedAt: new Date().toISOString(),
      isEstimate: true,
      estimateNote: 'Scenario-based estimate using average LTV, churn probability, and support cost models. Not guaranteed financial figures.',
      affectedCustomers,
      potentialChurnCount: potentialChurn,
      revenueAtRiskUSD: revenueAtRisk,
      supportCostImpactUSD: supportCost,
      totalEstimatedImpactUSD: revenueAtRisk + supportCost,
      formula: {
        affectedCustomers: `Total negative feedback customers × 1.8 exposure multiplier = ${affectedCustomers}`,
        potentialChurn: `Affected customers × 6.5% churn probability = ${potentialChurn}`,
        revenueAtRisk: `Potential churn × $52 avg monthly LTV × 12 months = $${revenueAtRisk.toLocaleString()}`,
        supportCost: `Negative feedback count × $62.50 avg escalation cost = $${supportCost.toLocaleString()}`
      },
      assumptions: [
        'Average customer LTV: $52/month (industry benchmark — replace with actual data if available)',
        'Churn probability for complaint-exposed customers: 6.5%',
        'Average support escalation cost: $62.50 per complaint',
        'Exposure multiplier: 1.8 (customers who experience but don\'t report)'
      ],
      timestamp: new Date().toISOString()
    };
  }

  // getKnowledgeGraph is defined at line 1627 using buildProductKnowledgeGraph

  public runDigitalTwinSimulation(productId: string, parameters: Record<string, number>): object | null {
    const product = this.products.find(p => p.id === productId);
    if (!product) return null;

    const latencyReduction = parameters['latencyReduction'] ?? 20;
    const reliabilityImprovement = parameters['reliabilityImprovement'] ?? 15;
    const onboardingImprovement = parameters['onboardingImprovement'] ?? 0;

    const estimatedComplaintChange = -(latencyReduction * 0.8 + reliabilityImprovement * 0.6);
    const estimatedCSATChange = (latencyReduction * 0.015 + reliabilityImprovement * 0.012);
    const estimatedRevenueRiskChange = -Math.round((Math.abs(estimatedComplaintChange) / 100) * 148000);

    return {
      parameterChanges: [
        { label: 'Checkout Latency Reduction', from: 0, to: latencyReduction, unit: '%' },
        { label: 'Gateway Reliability Improvement', from: 0, to: reliabilityImprovement, unit: '%' },
        { label: 'Onboarding Flow Improvement', from: 0, to: onboardingImprovement, unit: '%' }
      ],
      estimatedComplaintChange: Math.round(estimatedComplaintChange),
      estimatedCSATChange: Math.round(estimatedCSATChange * 100) / 100,
      estimatedCustomerRiskChange: estimatedComplaintChange < -15 ? 'HIGH → MEDIUM' : 'HIGH → HIGH (slight improvement)',
      estimatedRevenueRiskChange,
      narrative: `Based on a ${latencyReduction}% latency reduction and ${reliabilityImprovement}% reliability improvement, the model estimates complaints could decrease by ~${Math.abs(Math.round(estimatedComplaintChange))}% and CSAT could improve by ~${Math.round(estimatedCSATChange * 100) / 100} pts. Revenue risk may reduce by approximately $${Math.abs(estimatedRevenueRiskChange).toLocaleString()}.`,
      isSimulation: true as const,
      simulationNote: 'SIMULATION ONLY — These are model estimates, not guaranteed outcomes. Actual results depend on implementation quality, timing, and external factors.'
    };
  }

  public getOutcomes(): object[] {
    return this.outcomes;
  }

  public recordOutcome(data: any, actor: any): object {
    const rec = (this.getTopRecommendations() as any[]).find(r => r.id === data.recommendationId);
    const prevOutcome = this.outcomes.find(o => o.recommendationId === data.recommendationId);
    
    const beforeComplaints = prevOutcome?.beforeComplaints ?? 342;
    const beforeCSAT = prevOutcome?.beforeCSAT ?? 3.71;
    const beforeSentimentPct = prevOutcome?.beforeSentimentPct ?? 22;
    
    const complaintChangePct = beforeComplaints > 0 ? ((data.afterComplaints - beforeComplaints) / beforeComplaints) * 100 : 0;
    const csatChangePts = data.afterCSAT - beforeCSAT;
    const sentimentChangePct = data.afterSentimentPct - beforeSentimentPct;
    
    let status: 'IMPROVEMENT_DETECTED' | 'NO_CHANGE' | 'WORSENED' = 'NO_CHANGE';
    if (complaintChangePct < -5 && csatChangePts > 0) status = 'IMPROVEMENT_DETECTED';
    else if (complaintChangePct > 5 || csatChangePts < -0.1) status = 'WORSENED';

    const outcome = {
      id: `out_${Date.now()}`,
      recommendationId: data.recommendationId,
      recommendationTitle: rec ? (rec as any).title : 'Unknown Recommendation',
      productId: rec ? (rec as any).productId || 'prod_pay' : 'prod_pay',
      productName: rec ? (rec as any).productName || 'Unknown Product' : 'Unknown Product',
      actionTaken: data.actionTaken,
      actionDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      outcomeDate: new Date().toISOString(),
      status,
      beforeComplaints, beforeCSAT, beforeSentimentPct, beforeIssueFrequency: 14,
      afterComplaints: data.afterComplaints,
      afterCSAT: data.afterCSAT,
      afterSentimentPct: data.afterSentimentPct,
      afterIssueFrequency: Math.max(0, 14 + Math.round(complaintChangePct / 10)),
      complaintChangePct: Math.round(complaintChangePct * 10) / 10,
      csatChangePts: Math.round(csatChangePts * 100) / 100,
      sentimentChangePct: Math.round(sentimentChangePct * 10) / 10,
      evaluationNote: status === 'IMPROVEMENT_DETECTED' ? 'Positive outcome detected following action.' : status === 'WORSENED' ? 'Metrics worsened — root cause re-investigation recommended.' : 'No significant change detected.',
      causalityNote: 'Correlation observed between action and measured outcome. Causation not confirmed — other factors may have contributed.',
      evidenceIds: []
    };

    // Replace or append
    const existingIdx = this.outcomes.findIndex(o => o.recommendationId === data.recommendationId);
    if (existingIdx >= 0) this.outcomes[existingIdx] = outcome;
    else this.outcomes.push(outcome);

    console.log(`[Audit] ${actor.name} recorded outcome for recommendation ${data.recommendationId}`);
    return outcome;
  }

  public getFeatureDemand(productId?: string): object[] {
    const features = [
      {
        id: 'fd_1', featureTitle: 'Dark Mode Support', requestCount: 1248, customerImpact: 88, businessRelevance: 72,
        implementationComplexity: 'LOW', riskReductionPotential: 15, priorityScore: 84,
        reasoning: 'High demand + low complexity = strong ROI. Does not directly address risk but improves NPS.',
        topRequestQuotes: ['"Dark mode would make this tool so much easier to use at night"', '"Please add dark mode — my eyes are suffering"'],
        segments: ['Mobile Users', 'Power Users', 'Enterprise']
      },
      {
        id: 'fd_2', featureTitle: 'Faster Checkout / 1-Click Payment', requestCount: 982, customerImpact: 95, businessRelevance: 98,
        implementationComplexity: 'HIGH', riskReductionPotential: 78, priorityScore: 91,
        reasoning: 'Directly reduces checkout abandonment and payment complaints. High business relevance despite complexity.',
        topRequestQuotes: ['"I always abandon if checkout takes more than 3 steps"', '"One-click payment would dramatically improve my experience"'],
        segments: ['SMB', 'Frequent Buyers', 'At-Risk']
      },
      {
        id: 'fd_3', featureTitle: 'UPI / Local Payment Integration', requestCount: 741, customerImpact: 82, businessRelevance: 91,
        implementationComplexity: 'MEDIUM', riskReductionPotential: 55, priorityScore: 86,
        reasoning: 'Geographic expansion driver. High relevance for Indian market customers. Medium complexity.',
        topRequestQuotes: ['"UPI would be a game-changer for Indian users"', '"Please add more payment methods"'],
        segments: ['International', 'New Users', 'SMB']
      },
      {
        id: 'fd_4', featureTitle: 'Advanced Reporting & Export', requestCount: 634, customerImpact: 74, businessRelevance: 85,
        implementationComplexity: 'MEDIUM', riskReductionPotential: 30, priorityScore: 78,
        reasoning: 'Enterprise users heavily request better reporting. Reduces support burden for export questions.',
        topRequestQuotes: ['"Need better CSV export with more column options"', '"Custom date range reports are missing"'],
        segments: ['Enterprise', 'Analyst', 'Power Users']
      },
      {
        id: 'fd_5', featureTitle: 'Mobile App Redesign', requestCount: 521, customerImpact: 79, businessRelevance: 77,
        implementationComplexity: 'HIGH', riskReductionPotential: 42, priorityScore: 68,
        reasoning: 'Significant effort required. Consider phased approach — fix critical UX issues first.',
        topRequestQuotes: ['"The app is too cluttered and confusing"', '"Navigation needs a complete overhaul"'],
        segments: ['Mobile Users', 'New Users']
      }
    ];

    if (productId) {
      return features.slice(0, 3); // Simplified product-level filter
    }
    return features;
  }

  public getCommandCenterData(productId?: string): object {
    const product = productId ? this.products.find(p => p.id === productId) : this.products[0];
    const issues = this.issues.filter(i => i.priority === 'CRITICAL' || i.priority === 'HIGH').slice(0, 3);

    const cards = issues.map((issue, idx) => {
      const feedbackCount = this.feedbacks.filter(f => f.productId === issue.productId && f.analysis?.sentiment === 'NEGATIVE').length;
      return {
        id: `cmd_${issue.id}`,
        productId: issue.productId,
        productName: issue.productName,
        issueTitle: issue.title,
        severity: issue.priority,
        affectedCustomers: issue.estimatedCustomerCount || (idx === 0 ? 2840 : idx === 1 ? 482 : 321),
        complaintGrowthPct: idx === 0 ? 38 : idx === 1 ? 21 : 8,
        revenueAtRiskUSD: idx === 0 ? 148000 : idx === 1 ? 38400 : 18200,
        aiRecommendation: issue.expectedOutcome || `Investigate ${issue.title} and apply ${issue.suggestedDeadline ? 'by ' + issue.suggestedDeadline : 'promptly'}`,
        evidenceCount: feedbackCount,
        recommendationId: `rec_${idx + 1}`,
        hasApprovedAction: idx === 0,
        status: issue.status
      };
    });

    return {
      productFilter: productId || 'ALL',
      productName: product?.name || 'All Products',
      generatedAt: new Date().toISOString(),
      totalAffectedCustomers: cards.reduce((s, c) => s + (c as any).affectedCustomers, 0),
      totalRevenueAtRiskUSD: cards.reduce((s, c) => s + (c as any).revenueAtRiskUSD, 0),
      criticalCards: cards
    };
  }

}

export const db = new InMemoryDatabase();

