import {
  Feedback, Product, ProductAIReport, ProductComparisonItem, Customer, User, Organization, Issue, FeatureRequest,
  NotificationItem, ReportData, AuditLog, AnalyticsOverview, FeedbackAnalysis,
  UserRole, FeedbackStatus, SentimentType, PriorityLevel,
  RootCauseReport, IssueCluster, KnowledgeDocument, CopilotTicket,
  CompetitorBenchmark, ResolvedImpactAnalysis, HumanCorrection, AIModelMetrics,
  IntegrationAdapter, RegionalFeedbackMetric, HeatmapCell, NLQueryInterpretation,
  CustomerHealthScore, CustomerChurnPrediction, ExplainabilityReport,
  VoiceFeedbackTranscript, TranslationResult, FrustrationVelocityItem, FrustrationVelocityAlert,
  EmergingIssue, FeatureRoadmapItem, ResolutionLearningItem, AutonomousAgentIncident,
  MultilingualAnalysisResult, VoiceAnalysisResult, ScreenshotAnalysisResult,
  FeedbackContradiction, BusinessImpactAssessment, FinancialSensitivityParams, AnalyticsChatMessage,
  AgentEvent, AgentRun, AgentDecision, AgentRecommendation, AgentEvidence, AgentAction, AgentOutcome, AgentMemory, AgentConfig, AgentDashboardMetrics,
  AdminDashboardData, ManagerDashboardData, AnalystDashboardData, ViewerDashboardData,
  RolePermissionMatrix, PermissionKey
} from '../types.js';

const API_BASE = '/api/v1';

export class ApiService {
  private static userEmail = 'admin@example.com';

  public static setUserEmail(email: string) {
    this.userEmail = email;
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = {
      'Content-Type': 'application/json',
      'x-user-email': this.userEmail,
      ...(options.headers || {})
    };

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (!res.ok) {
      let errMessage = `HTTP error ${res.status}`;
      try {
        const errJson = await res.json();
        if (errJson.error) errMessage = typeof errJson.error === 'string' ? errJson.error : errJson.error.message || errMessage;
      } catch (e) {
        // fallback
      }
      throw new Error(errMessage);
    }

    return res.json();
  }

  // Auth
  public static async getMe(): Promise<{ user: User; organization: Organization; users: User[] }> {
    return this.request('/auth/me');
  }

  public static async switchRole(role: UserRole, userId?: string): Promise<{ user: User }> {
    return this.request('/auth/role-switch', {
      method: 'POST',
      body: JSON.stringify({ role, userId })
    });
  }

  public static async updateUserRole(userId: string, role: UserRole): Promise<{ user: User }> {
    return this.switchRole(role, userId);
  }

  // ==========================================
  // ROLE-SPECIFIC ENTERPRISE DASHBOARD APIS
  // ==========================================
  public static async getAdminDashboard(): Promise<{ success: boolean; data: AdminDashboardData }> {
    return this.request('/dashboard/admin');
  }

  public static async getManagerDashboard(): Promise<{ success: boolean; data: ManagerDashboardData }> {
    return this.request('/dashboard/manager');
  }

  public static async getAnalystDashboard(): Promise<{ success: boolean; data: AnalystDashboardData }> {
    return this.request('/dashboard/analyst');
  }

  public static async getViewerDashboard(): Promise<{ success: boolean; data: ViewerDashboardData }> {
    return this.request('/dashboard/viewer');
  }

  // RBAC Permissions
  public static async getRolePermissions(): Promise<{ success: boolean; data: RolePermissionMatrix }> {
    return this.request('/rbac/permissions');
  }

  public static async updateRolePermissions(matrix: Partial<RolePermissionMatrix>): Promise<{ success: boolean; data: RolePermissionMatrix }> {
    return this.request('/rbac/permissions', {
      method: 'PUT',
      body: JSON.stringify(matrix)
    });
  }

  // Recommendations Workflow
  public static async approveRecommendation(id: string, actionTaken?: string): Promise<{ success: boolean; data: any }> {
    return this.request(`/recommendations/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ actionTaken })
    });
  }

  public static async rejectRecommendation(id: string, reason?: string): Promise<{ success: boolean; data: any }> {
    return this.request(`/recommendations/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  // AI & System Configuration
  public static async getAIConfig(): Promise<{ success: boolean; data: any }> {
    return this.request('/settings/ai-config');
  }

  public static async updateAIConfig(config: any): Promise<{ success: boolean; config: any }> {
    return this.request('/settings/ai-config', {
      method: 'PUT',
      body: JSON.stringify(config)
    });
  }

  public static async queryAIChat(query: string, history: any[] = []): Promise<{ success: boolean; response: { message: string } }> {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ query, history })
    });
  }


  // Feedback
  public static async getFeedbacks(params: {
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
    sortBy?: string;
  }): Promise<{ items: Feedback[]; total: number; page: number; totalPages: number }> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') query.append(k, String(v));
    });
    return this.request(`/feedback?${query.toString()}`);
  }

  public static async getFeedbackById(id: string): Promise<{ feedback: Feedback; similarFeedback?: Feedback }> {
    return this.request(`/feedback/${id}`);
  }

  public static async createFeedback(data: {
    customerName: string;
    customerEmail: string;
    productId: string;
    rating: number;
    text: string;
    source?: string;
    tags?: string[];
  }): Promise<{ feedback: Feedback }> {
    return this.request('/feedback', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public static async submitPublicFeedback(data: {
    customerName: string;
    customerEmail: string;
    productId: string;
    rating: number;
    text: string;
  }): Promise<{ message: string; feedbackId: string }> {
    return this.request('/public/feedback', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public static async updateFeedbackStatus(id: string, status: FeedbackStatus): Promise<{ feedback: Feedback }> {
    return this.request(`/feedback/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  public static async updateFeedbackTags(id: string, tags: string[]): Promise<{ feedback: Feedback }> {
    return this.request(`/feedback/${id}/tags`, {
      method: 'PATCH',
      body: JSON.stringify({ tags })
    });
  }

  public static async deleteFeedback(id: string): Promise<{ success: boolean }> {
    return this.request(`/feedback/${id}`, { method: 'DELETE' });
  }

  public static async importCSV(rows: Record<string, any>[]): Promise<{ importedCount: number; items: Feedback[] }> {
    return this.request('/feedback/import-csv', {
      method: 'POST',
      body: JSON.stringify({ rows })
    });
  }

  public static async exportFeedbacksCSV(): Promise<string> {
    const res = await this.getFeedbacks({ limit: 500 });
    const headers = ['ID', 'Customer Name', 'Email', 'Product', 'Rating', 'Sentiment', 'Emotion', 'Priority', 'Status', 'Feedback Text', 'Created At'];
    const rows = res.items.map(f => [
      f.id,
      `"${(f.customerName || '').replace(/"/g, '""')}"`,
      `"${(f.customerEmail || '').replace(/"/g, '""')}"`,
      `"${(f.productName || '').replace(/"/g, '""')}"`,
      f.rating,
      f.analysis?.sentiment || 'NEUTRAL',
      f.analysis?.emotion || 'NEUTRAL',
      f.analysis?.priority || 'MEDIUM',
      f.status,
      `"${(f.text || '').replace(/"/g, '""')}"`,
      f.createdAt
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  // AI
  public static async analyzePreview(text: string, rating: number, productName: string): Promise<{ analysis: FeedbackAnalysis }> {
    return this.request('/ai/analyze-preview', {
      method: 'POST',
      body: JSON.stringify({ text, rating, productName })
    });
  }

  public static async chatWithAI(query: string): Promise<{ response: string; structuredData?: any }> {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ query })
    });
  }

  // Analytics
  public static async getAnalyticsOverview(): Promise<{ data: AnalyticsOverview }> {
    return this.request('/analytics/overview');
  }

  // Target Products
  public static async getProducts(filters?: { search?: string; status?: string; category?: string; owner?: string }): Promise<{ products: Product[] }> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.owner) params.append('owner', filters.owner);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/products${queryString}`);
  }

  public static async getProductDetails(id: string): Promise<{ product: Product }> {
    return this.request(`/products/${id}`);
  }

  public static async createProduct(productData: Partial<Product>): Promise<{ success: boolean; product: Product; message?: string }> {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  }

  public static async updateProduct(id: string, updates: Partial<Product>): Promise<{ success: boolean; product: Product; message?: string }> {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  public static async updateProductStatus(id: string, status: string): Promise<{ success: boolean; product: Product; message?: string }> {
    return this.request(`/products/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  public static async archiveProduct(id: string): Promise<{ success: boolean; product: Product; feedbackCount: number; issuesCount: number; message?: string }> {
    return this.request(`/products/${id}`, {
      method: 'DELETE'
    });
  }

  public static async getProductFeedback(id: string): Promise<{ success: boolean; feedback: Feedback[]; count: number }> {
    return this.request(`/products/${id}/feedback`);
  }

  public static async getProductIssues(id: string): Promise<{ success: boolean; issues: Issue[]; count: number }> {
    return this.request(`/products/${id}/issues`);
  }

  public static async getProductActivity(id: string): Promise<{ success: boolean; activity: any[] }> {
    return this.request(`/products/${id}/activity`);
  }

  public static async analyzeProductWithAI(id: string): Promise<{ success: boolean; report: ProductAIReport }> {
    return this.request(`/products/${id}/analyze`, {
      method: 'POST'
    });
  }

  public static async compareProducts(productIds: string[]): Promise<{ success: boolean; comparison: ProductComparisonItem[] }> {
    return this.request('/products/compare', {
      method: 'POST',
      body: JSON.stringify({ productIds })
    });
  }

  public static async getCustomers(): Promise<{ customers: Customer[] }> {
    return this.request('/customers');
  }

  public static async getCustomerDetails(id: string): Promise<{ customer: Customer; feedbackHistory: Feedback[] }> {
    return this.request(`/customers/${id}`);
  }

  // Issues
  public static async getIssues(): Promise<{ issues: Issue[] }> {
    return this.request('/issues');
  }

  public static async createIssue(data: {
    title: string;
    description: string;
    priority: PriorityLevel;
    category: string;
    productId: string;
    feedbackIds?: string[];
    assignedTo?: string;
  }): Promise<{ issue: Issue }> {
    return this.request('/issues', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public static async updateIssue(id: string, updates: Partial<Issue>): Promise<{ issue: Issue }> {
    return this.request(`/issues/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  // Feature Requests
  public static async getFeatureRequests(): Promise<{ featureRequests: FeatureRequest[] }> {
    return this.request('/feature-requests');
  }

  public static async voteFeatureRequest(id: string): Promise<{ featureRequest: FeatureRequest }> {
    return this.request(`/feature-requests/${id}/vote`, {
      method: 'POST'
    });
  }

  // Notifications
  public static async getNotifications(): Promise<{ notifications: NotificationItem[] }> {
    return this.request('/notifications');
  }

  public static async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return this.request(`/notifications/${id}/read`, { method: 'PATCH' });
  }

  public static async markAllNotificationsRead(): Promise<{ success: boolean }> {
    return this.request('/notifications/mark-all-read', { method: 'POST' });
  }

  // Reports
  public static async getReports(): Promise<{ reports: ReportData[] }> {
    return this.request('/reports');
  }

  public static async generateReport(period: ReportData['period']): Promise<{ report: ReportData }> {
    return this.request('/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ period })
    });
  }

  // Audit Logs
  public static async getAuditLogs(): Promise<{ auditLogs: AuditLog[] }> {
    return this.request('/audit-logs');
  }

  // ==========================================
  // ENTERPRISE AI & INTELLIGENCE EXTENSIONS
  // ==========================================

  // Root Cause Analysis
  public static async getRootCauses(): Promise<{ rootCauses: RootCauseReport[] }> {
    return this.request('/root-causes');
  }

  public static async getRootCauseByFeedbackId(feedbackId: string): Promise<{ report: RootCauseReport }> {
    return this.request(`/root-causes/${feedbackId}`);
  }

  public static async generateRootCause(feedbackId: string): Promise<{ report: RootCauseReport }> {
    return this.request('/root-causes/generate', {
      method: 'POST',
      body: JSON.stringify({ feedbackId })
    });
  }

  // Issue Clusters
  public static async getIssueClusters(): Promise<{ clusters: IssueCluster[] }> {
    return this.request('/issue-clusters');
  }

  public static async getClusterById(id: string): Promise<{ cluster: IssueCluster }> {
    return this.request(`/issue-clusters/${id}`);
  }

  // Customer Health & Churn
  public static async getCustomerHealthAndChurn(customerId?: string): Promise<{
    customer?: Customer;
    healthScore?: CustomerHealthScore;
    healthScores?: CustomerHealthScore[];
    churnPrediction?: CustomerChurnPrediction;
  }> {
    if (customerId) {
      return this.request(`/customers/${customerId}/health-churn`);
    }
    return this.request('/customers/health-churn');
  }

  // Knowledge Base & RAG Copilot
  public static async getKnowledgeDocs(): Promise<{ documents: KnowledgeDocument[] }> {
    return this.request('/knowledge-base');
  }

  public static async searchKnowledgeDocs(q: string): Promise<{ documents: KnowledgeDocument[] }> {
    return this.request(`/knowledge-base/search?q=${encodeURIComponent(q)}`);
  }

  public static async addKnowledgeDoc(data: {
    title: string;
    category: string;
    content: string;
    tags?: string[];
    sourceUrl?: string;
  }): Promise<{ document: KnowledgeDocument }> {
    return this.request('/knowledge-base', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public static async getCopilotTickets(): Promise<{ tickets: CopilotTicket[] }> {
    return this.request('/copilot/tickets');
  }

  public static async generateCopilotReply(feedbackId: string): Promise<{ ticket: CopilotTicket }> {
    return this.request('/copilot/generate-reply', {
      method: 'POST',
      body: JSON.stringify({ feedbackId })
    });
  }

  public static async resolveCopilotTicket(ticketId: string, resolutionText: string): Promise<{ ticket: CopilotTicket }> {
    return this.request('/copilot/resolve', {
      method: 'POST',
      body: JSON.stringify({ ticketId, resolutionText })
    });
  }

  // Competitor Benchmarks
  public static async getCompetitors(): Promise<{ competitors: CompetitorBenchmark[] }> {
    return this.request('/competitors');
  }

  // Resolved Impact Tracking
  public static async getResolvedImpacts(): Promise<{ resolvedImpacts: ResolvedImpactAnalysis[] }> {
    return this.request('/resolved-impacts');
  }

  // Model Metrics & Human in the loop
  public static async getModelMetrics(): Promise<{ metrics: AIModelMetrics }> {
    return this.request('/model-metrics');
  }

  public static async getHumanCorrections(): Promise<{ corrections: HumanCorrection[] }> {
    return this.request('/human-corrections');
  }

  public static async submitHumanCorrection(data: {
    feedbackId: string;
    correctedSentiment?: SentimentType;
    correctedTopics?: string[];
    correctedUrgency?: PriorityLevel;
    reasoning: string;
  }): Promise<{ correction: HumanCorrection }> {
    return this.request('/human-corrections', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Integrations
  public static async getIntegrations(): Promise<{ integrations: IntegrationAdapter[] }> {
    return this.request('/integrations');
  }

  public static async updateIntegration(id: string, updates: Partial<IntegrationAdapter>): Promise<{ integration: IntegrationAdapter }> {
    return this.request(`/integrations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  public static async triggerIntegration(id: string, eventName?: string, payload?: any): Promise<{ success: boolean; message: string }> {
    return this.request(`/integrations/${id}/trigger`, {
      method: 'POST',
      body: JSON.stringify({ eventName, payload })
    });
  }

  // Regional & Heatmap
  public static async getRegionalMetrics(): Promise<{ regionalMetrics: RegionalFeedbackMetric[] }> {
    return this.request('/regional-metrics');
  }

  public static async getProductTopicHeatmap(): Promise<{ heatmap: HeatmapCell[] }> {
    return this.request('/heatmap');
  }

  // Natural Language Analytics
  public static async queryNaturalLanguageAnalytics(query: string): Promise<{
    interpretation: NLQueryInterpretation;
    matchingFeedbacks: Feedback[];
    summary: string;
  }> {
    return this.request('/ai/nl-analytics', {
      method: 'POST',
      body: JSON.stringify({ query })
    });
  }

  // Explainable AI
  public static async explainFeedback(feedbackId: string): Promise<{ report: ExplainabilityReport }> {
    return this.request('/ai/explain', {
      method: 'POST',
      body: JSON.stringify({ feedbackId })
    });
  }

  // Executive Copilot
  public static async askExecutiveCopilot(question: string, timeframe?: string): Promise<{
    answer: string;
    keyInsights: string[];
    suggestedDecisions: string[];
    citations: Array<{ title: string; metric: string }>;
  }> {
    return this.request('/ai/executive-copilot', {
      method: 'POST',
      body: JSON.stringify({ question, timeframe })
    });
  }

  // Multilingual Translation & Voice
  public static async translateFeedback(text: string, targetLanguage?: string): Promise<TranslationResult> {
    return this.request('/ai/translate', {
      method: 'POST',
      body: JSON.stringify({ text, targetLanguage })
    });
  }

  public static async transcribeVoice(audioBase64: string, mimeType?: string): Promise<VoiceFeedbackTranscript> {
    return this.request('/ai/voice-transcribe', {
      method: 'POST',
      body: JSON.stringify({ audioBase64, mimeType })
    });
  }

  // Sentiment Frustration Velocity & Deterioration Alerts
  public static async getFrustrationVelocities(params?: {
    tier?: string;
    targetType?: string;
    search?: string;
  }): Promise<{
    velocities: FrustrationVelocityItem[];
    counts: {
      criticalDeterioration: number;
      rapidlyIncreasing: number;
      increasing: number;
      stable: number;
      total: number;
    };
  }> {
    const query = new URLSearchParams();
    if (params?.tier) query.append('tier', params.tier);
    if (params?.targetType) query.append('targetType', params.targetType);
    if (params?.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/analytics/frustration-velocity${qs}`);
  }

  public static async triggerVelocityAction(
    id: string,
    actionName: string
  ): Promise<{ success: boolean; item?: FrustrationVelocityItem }> {
    return this.request('/analytics/frustration-velocity/action', {
      method: 'POST',
      body: JSON.stringify({ id, actionName })
    });
  }

  // Novelty 4: Emerging Issues & Early Warning Center
  public static async getEmergingIssues(): Promise<{ emergingIssues: EmergingIssue[] }> {
    return this.request('/issues/emerging');
  }

  public static async triggerEmergingIssueAction(
    id: string,
    actionName: string
  ): Promise<{ success: boolean; message: string }> {
    return this.request(`/issues/emerging/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ actionName })
    });
  }

  // Novelty 5: Customer Churn Risk Intelligence (0-100)
  public static async getCustomerChurnIntelligence(): Promise<{
    customers: (Customer & { churnPrediction: CustomerChurnPrediction })[];
    summary: {
      criticalCount: number;
      highCount: number;
      mediumCount: number;
      lowCount: number;
      averageRiskScore: number;
      totalRevenueAtRiskUSD: number;
    };
  }> {
    return this.request('/customers/churn-intelligence');
  }

  // Novelty 6: AI Feature Prioritization Roadmap
  public static async getFeatureRoadmap(): Promise<{ roadmap: FeatureRoadmapItem[] }> {
    return this.request('/features/prioritized-roadmap');
  }

  // Novelty 7: Closed-Loop Resolution Learning
  public static async getResolutionLearningOutcomes(): Promise<{ outcomes: ResolutionLearningItem[] }> {
    return this.request('/resolutions/learning-loop');
  }

  // Novelty 8: AI Autonomous Feedback Agent & Control Center
  public static async getAgentStatus(): Promise<{ success: boolean; status: string; metrics: AgentDashboardMetrics; config: AgentConfig }> {
    return this.request('/agent/status');
  }

  public static async getAgentEvents(limit = 50): Promise<{ success: boolean; events: AgentEvent[] }> {
    return this.request(`/agent/events?limit=${limit}`);
  }

  public static async getAutonomousIncidents(): Promise<{ incidents: AutonomousAgentIncident[] }> {
    return this.request('/agent/incidents');
  }

  public static async approveAutonomousIncident(id: string): Promise<{ success: boolean; incident?: AutonomousAgentIncident }> {
    return this.request(`/agent/incidents/${id}/approve`, {
      method: 'POST'
    });
  }

  public static async rejectAutonomousIncident(id: string, reason?: string): Promise<{ success: boolean; incident?: AutonomousAgentIncident }> {
    return this.request(`/agent/incidents/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  public static async getAgentRecommendations(): Promise<{ success: boolean; recommendations: AgentRecommendation[] }> {
    return this.request('/agent/recommendations');
  }

  public static async approveAgentRecommendation(id: string, payload?: any): Promise<{ success: boolean; recommendation?: AgentRecommendation; action?: AgentAction }> {
    return this.request(`/agent/recommendations/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(payload || {})
    });
  }

  public static async rejectAgentRecommendation(id: string, reason?: string): Promise<{ success: boolean; recommendation?: AgentRecommendation }> {
    return this.request(`/agent/recommendations/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  public static async modifyAgentRecommendation(id: string, modifiedAction: string): Promise<{ success: boolean; recommendation?: AgentRecommendation }> {
    return this.request(`/agent/recommendations/${id}/modify`, {
      method: 'POST',
      body: JSON.stringify({ modifiedAction })
    });
  }

  public static async investigateAgentRecommendation(id: string, notes?: string): Promise<{ success: boolean; recommendation?: AgentRecommendation }> {
    return this.request(`/agent/recommendations/${id}/investigate`, {
      method: 'POST',
      body: JSON.stringify({ notes })
    });
  }

  public static async getAgentDecisions(): Promise<{ success: boolean; decisions: AgentDecision[] }> {
    return this.request('/agent/decisions');
  }

  public static async getAgentDecisionById(id: string): Promise<{ success: boolean; decision: AgentDecision }> {
    return this.request(`/agent/decisions/${id}`);
  }

  public static async getAgentOutcomes(): Promise<{ success: boolean; outcomes: AgentOutcome[] }> {
    return this.request('/agent/outcomes');
  }

  public static async getAgentMemory(): Promise<{ success: boolean; memories: AgentMemory[] }> {
    return this.request('/agent/memory');
  }

  public static async getAgentConfig(): Promise<{ success: boolean; config: AgentConfig }> {
    return this.request('/agent/config');
  }

  public static async updateAgentConfig(config: Partial<AgentConfig>): Promise<{ success: boolean; config: AgentConfig }> {
    return this.request('/agent/config', {
      method: 'POST',
      body: JSON.stringify(config)
    });
  }

  public static async analyzeAgentFeedback(params: { text: string; rating?: number; customerName?: string; customerEmail?: string }): Promise<{
    success: boolean;
    run?: AgentRun;
    incident?: AutonomousAgentIncident;
    recommendation?: AgentRecommendation;
    triage?: any;
    duplicateCheck?: any;
    severityAssessment?: any;
    rootCauseInvestigation?: any;
    impactEstimation?: any;
  }> {
    return this.request('/agent/analyze', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  public static async triggerAgentDemoWorkflow(params?: { sampleText?: string }): Promise<{
    success: boolean;
    demoInput: string;
    stagesCount: number;
    run: AgentRun;
    incident: AutonomousAgentIncident;
    recommendation: AgentRecommendation;
    decisionTrace: AgentDecision;
    customerRiskScore: number;
    estimatedRevenueAtRiskUSD: number;
    estimatedRevenueAtRiskINR: number;
  }> {
    return this.request('/agent/demo-trigger', {
      method: 'POST',
      body: JSON.stringify(params || {})
    });
  }

  // Novelty 9: Multilingual & Code-Mixed NLP
  public static async analyzeMultilingualFeedback(text: string): Promise<{ success: boolean; analysis: MultilingualAnalysisResult }> {
    return this.request('/nlp/multilingual-analyze', {
      method: 'POST',
      body: JSON.stringify({ text })
    });
  }

  // Novelty 10: Multimodal Feedback (Voice & Screenshot)
  public static async analyzeMultimodalVoice(params: { sampleName?: string; transcriptOverride?: string; durationSeconds?: number }): Promise<{ success: boolean; result: VoiceAnalysisResult }> {
    return this.request('/multimodal/voice-analyze', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  public static async analyzeMultimodalScreenshot(params: { sampleName?: string; ocrSnippet?: string }): Promise<{ success: boolean; result: ScreenshotAnalysisResult }> {
    return this.request('/multimodal/screenshot-analyze', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  // Novelty 11: Feedback Contradiction Detector
  public static async getContradictions(): Promise<{ success: boolean; contradictions: FeedbackContradiction[] }> {
    return this.request('/contradictions');
  }

  public static async resolveContradiction(id: string, actionType: string): Promise<{ success: boolean; contradiction?: FeedbackContradiction }> {
    return this.request(`/contradictions/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ actionType })
    });
  }

  // Novelty 12: Business Impact Engine
  public static async getBusinessImpact(params?: Partial<FinancialSensitivityParams>): Promise<{ success: boolean; assessments: BusinessImpactAssessment[] }> {
    if (params) {
      return this.request('/business-impact/simulate', {
        method: 'POST',
        body: JSON.stringify(params)
      });
    }
    return this.request('/business-impact/summary');
  }

  // Novelty 13: Conversational Customer Analytics
  public static async askConversationalAnalytics(query: string, history?: AnalyticsChatMessage[]): Promise<{ success: boolean; response: AnalyticsChatMessage }> {
    return this.request('/analytics/conversational-query', {
      method: 'POST',
      body: JSON.stringify({ query, history })
    });
  }

  // ==========================================
  // DECISION INTELLIGENCE APIs
  // ==========================================

  public static async getDecisionTrace(recommendationId: string): Promise<{ success: boolean; trace: any }> {
    return this.request(`/recommendations/${recommendationId}/decision-trace`);
  }

  public static async getEvidenceForRecommendation(recommendationId: string): Promise<{ success: boolean; evidence: any[] }> {
    return this.request(`/recommendations/${recommendationId}/evidence`);
  }

  public static async getPredictiveForecasts(productId?: string): Promise<{ success: boolean; forecasts: any[]; velocityMetrics: any[] }> {
    const qs = productId ? `?productId=${productId}` : '';
    return this.request(`/predictions/issues${qs}`);
  }

  public static async getBusinessImpactBreakdown(productId: string): Promise<{ success: boolean; breakdown: any }> {
    return this.request(`/products/${productId}/business-impact`);
  }

  public static async getKnowledgeGraph(productId: string): Promise<{ success: boolean; graph: any }> {
    return this.request(`/products/${productId}/knowledge-graph`);
  }

  public static async getOutcomes(): Promise<{ success: boolean; outcomes: any[] }> {
    return this.request('/outcomes');
  }

  public static async recordOutcome(data: {
    recommendationId: string;
    actionTaken: string;
    afterComplaints: number;
    afterCSAT: number;
    afterSentimentPct: number;
  }): Promise<{ success: boolean; outcome: any }> {
    return this.request('/outcomes', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public static async getRecommendationPerformance(): Promise<{ success: boolean; performance: any }> {
    return this.request('/recommendations/performance');
  }

  public static async getFeatureDemand(productId?: string): Promise<{ success: boolean; features: any[] }> {
    const qs = productId ? `?productId=${productId}` : '';
    return this.request(`/feature-demand${qs}`);
  }

  public static async runDigitalTwinSimulation(productId: string, params: Record<string, number>): Promise<{ success: boolean; result: any }> {
    return this.request(`/products/${productId}/digital-twin/simulate`, {
      method: 'POST',
      body: JSON.stringify({ parameters: params })
    });
  }

  public static async getCommandCenterData(productId?: string): Promise<{ success: boolean; data: any }> {
    const qs = productId ? `?productId=${productId}` : '';
    return this.request(`/command-center${qs}`);
  }
}

