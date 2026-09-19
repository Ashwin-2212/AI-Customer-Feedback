export type UserRole = 'ADMIN' | 'MANAGER' | 'ANALYST' | 'VIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  organizationId: string;
  department?: string;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: 'Starter' | 'Professional' | 'Enterprise';
  logo?: string;
  createdAt: string;
}

export type FeedbackStatus = 'NEW' | 'PROCESSING' | 'ANALYZED' | 'REVIEWED' | 'ASSIGNED' | 'RESOLVED' | 'ARCHIVED';

export type FeedbackSource = 'MANUAL' | 'PUBLIC_FORM' | 'CSV_IMPORT' | 'API' | 'WIDGET' | 'ZENDESK' | 'APP_STORE';

export type SentimentType = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

export type EmotionType = 
  | 'HAPPY' 
  | 'SATISFIED' 
  | 'EXCITED' 
  | 'ANGRY' 
  | 'FRUSTRATED' 
  | 'DISAPPOINTED' 
  | 'CONFUSED' 
  | 'WORRIED' 
  | 'NEUTRAL';

export type IntentType = 
  | 'COMPLAINT' 
  | 'PRAISE' 
  | 'FEATURE_REQUEST' 
  | 'BUG_REPORT' 
  | 'QUESTION' 
  | 'REFUND_REQUEST' 
  | 'CANCELLATION' 
  | 'PRODUCT_INQUIRY' 
  | 'GENERAL_FEEDBACK';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AspectSentiment {
  aspect: string;
  sentiment: SentimentType;
  quote?: string;
  score?: number;
}

export interface AIRecommendation {
  issue: string;
  evidence: string;
  action: string;
  expectedImpact: string;
  priority: PriorityLevel;
}

export interface FeedbackAnalysis {
  sentiment: SentimentType;
  score: number; // -1.0 to 1.0
  confidence: number; // 0.0 to 1.0
  emotion: EmotionType;
  emotionConfidence: number;
  intent: IntentType;
  topics: string[];
  keywords: string[];
  entities?: string[];
  priority: PriorityLevel;
  urgency: number; // 1 to 10
  aspects: AspectSentiment[];
  summary: string;
  recommendation: AIRecommendation;
  duplicateOfId?: string;
  similarityScore?: number;
  analyzedAt: string;
  provider: 'gemini' | 'nlp_engine';
  explainability?: {
    confidence: number;
    keySignals: string[];
    reasoning: string;
    modelContribution: {
      sentimentWeight: number;
      keywordWeight: number;
      ratingWeight: number;
      historicalPatternWeight: number;
    };
  };
}

export interface Feedback {
  id: string;
  organizationId: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerSegment?: 'High-Value' | 'At-Risk' | 'Loyal' | 'New' | 'Frequent Complainant' | 'Feature Seeker' | 'Satisfied Customer' | 'Churn Risk' | string;
  productId: string;
  productName: string;
  rating: number; // 1-5
  text: string;
  title?: string;
  source: FeedbackSource;
  language: string;
  detectedLanguage?: string;
  originalLanguage?: string;
  originalText?: string;
  translatedText?: string;
  isTranslated?: boolean;
  status: FeedbackStatus;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  analysis?: FeedbackAnalysis;
  assignedIssueId?: string;
  tags: string[];
  // Voice intelligence
  audioUrl?: string;
  audioDurationSeconds?: number;
  voiceTranscript?: string;
  // Security & Data Quality
  piiMasked?: boolean;
  detectedPiiTypes?: string[];
  spamStatus?: 'LEGITIMATE' | 'SUSPICIOUS' | 'SPAM';
  dataQualityScore?: number; // 0-100
  // Location
  location?: {
    city?: string;
    state?: string;
    country?: string;
    region?: string;
  };
}

export type ProductStatus = 'ACTIVE' | 'MONITORING' | 'PAUSED' | 'ARCHIVED' | 'BETA' | 'SUNSET';

export interface ProductFeature {
  id: string;
  productId: string;
  name: string;
  description?: string;
  status: 'STABLE' | 'BETA' | 'DEPRECATED' | 'PLANNED';
  feedbackCount?: number;
  openIssuesCount?: number;
}

export interface Product {
  id: string;
  organizationId: string;
  name: string;
  code: string; // Unique identifier e.g. PAY-001, CLOUD-001
  category: string;
  description: string;
  version?: string;
  owner?: string; // Product Owner or Lead
  team?: string; // Department / Engineering team
  status: ProductStatus;
  website?: string;
  logoUrl?: string;
  launchDate?: string;
  targetSegments?: string[];
  features?: ProductFeature[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  archivedAt?: string;
  // Dynamic KPIs & Aggregates
  totalFeedback: number;
  avgRating: number;
  positiveRate: number;
  negativeRate: number;
  csat: number;
  healthScore?: number; // 0 - 100
  openIssues?: number;
  criticalIssues?: number;
  emergingIssues?: number;
  customerRisk?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  lastActivity?: string;
}

export interface ProductAIReport {
  id: string;
  productId: string;
  productName: string;
  generatedAt: string;
  healthScore: number;
  sentimentSummary: string;
  complaintVelocity: string;
  topProblems: Array<{
    issue: string;
    mentions: number;
    severity: PriorityLevel;
    growthPercent: number;
  }>;
  emergingTrends: Array<{
    trend: string;
    description: string;
    customerSegment: string;
  }>;
  customerRiskAssessment: {
    riskTier: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    affectedCustomersCount: number;
    primaryDriver: string;
  };
  recommendedActions: Array<{
    action: string;
    impact: string;
    urgency: PriorityLevel;
    effort: 'LOW' | 'MEDIUM' | 'HIGH';
  }>;
  confidenceScore: number; // 0 - 100
}

export interface ProductComparisonItem {
  product: Product;
  healthScore: number;
  csat: number;
  sentimentPositiveRate: number;
  feedbackVolume: number;
  openIssuesCount: number;
  criticalIssuesCount: number;
  emergingIssuesCount: number;
  customerRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  resolutionRate: number;
}

export interface ProductActivityItem {
  id: string;
  productId: string;
  timestamp: string;
  type: 'CRITICAL_ISSUE' | 'AI_ANALYSIS' | 'FEEDBACK_SPIKE' | 'HEALTH_CHANGE' | 'STATUS_CHANGE' | 'RECOMMENDATION_APPROVED';
  title: string;
  description: string;
  actor?: string;
}


export interface CustomerHealthScore {
  score?: number;
  healthScore?: number; // 0 - 100
  churnProbability?: number; // 0 - 1.0
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  customerId?: string;
  ltvUSD?: number;
  churnMitigationAction?: string;
  status?: 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION' | 'AT_RISK' | 'CRITICAL' | string;
  factors?: {
    sentimentScore: number; // 0-100
    feedbackFrequency: number; // 0-100
    avgRatingScore: number; // 0-100
    issueResolutionScore: number; // 0-100
    complaintSeverityScore: number; // 0-100
    engagementScore: number; // 0-100
  };
  reasons?: string[];
}

export type ChurnRiskTier = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ChurnContributingFactor {
  factor: string;
  points: number; // e.g. +28
  description: string;
  evidenceQuote?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface CustomerChurnPrediction {
  churnScore?: number; // 0 - 100 (e.g. 82/100)
  churnProbability: number; // 0 - 100%
  churnRisk: ChurnRiskTier | string;
  riskCategory?: 'Low (0-30)' | 'Medium (31-60)' | 'High (61-80)' | 'Critical (81-100)' | string;
  reasons?: string[]; // e.g. ["repeated negative feedback", "unresolved complaint", "declining ratings", "competitor mention", "increasing frustration", "high-value customer"]
  churnSignals: string[];
  contributingFactors?: ChurnContributingFactor[];
  predictionReasoning: string;
  recommendedRetentionAction: string;
  estimatedLtvUSD?: number;
  lastAssessedDate?: string;
}

export interface Customer {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  company?: string;
  segment: 'Loyal Customer' | 'Satisfied Customer' | 'At-Risk Customer' | 'Churn Risk' | 'Feature Seeker' | 'Frequent Complainer' | 'High-Value Customer' | 'New Customer' | 'VIP' | 'Loyal' | 'At-Risk' | string;
  totalFeedbackCount: number;
  avgRating: number;
  sentimentScore: number;
  lastFeedbackDate: string;
  unresolvedIssuesCount: number;
  healthScore?: CustomerHealthScore;
  churnPrediction?: CustomerChurnPrediction;
  location?: {
    city: string;
    region: string;
    country: string;
  };
}

export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'BLOCKED' | 'RESOLVED' | 'CLOSED';

export interface Issue {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  priority: PriorityLevel;
  status: IssueStatus;
  category: string;
  productId: string;
  productName: string;
  assignedTo?: string;
  assignedToName?: string;
  feedbackIds: string[];
  feedbackCount: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  // Enterprise Action Plan
  rootCause?: string;
  responsibleTeam?: 'Engineering' | 'Product' | 'Operations' | 'Customer Support' | 'DevOps' | 'Billing' | string;
  suggestedDeadline?: string;
  expectedOutcome?: string;
  successMetric?: string;
  businessImpactScore?: number; // 0-100
  estimatedCustomerCount?: number;
  estimatedRevenueAtRisk?: string;
  // External Integration Sync
  syncedIntegrations?: {
    jiraKey?: string;
    githubIssueUrl?: string;
    slackAlertSent?: boolean;
    linearId?: string;
  };
}

export type EffortVsImpactQuadrant = 'FIX_NOW' | 'STRATEGIC' | 'QUICK_WIN' | 'AVOID' | string;

export interface FeatureRequest {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  category: string;
  productId: string;
  productName: string;
  votes: number;
  customerCount?: number;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'MIXED';
  demand: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PROPOSED' | 'UNDER_REVIEW' | 'PLANNED' | 'IN_DEVELOPMENT' | 'COMPLETED';
  feedbackIds: string[];
  createdAt: string;
  // AI Feature Prioritization Matrix
  businessImpact?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  estimatedEffort?: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  quadrant?: EffortVsImpactQuadrant;
  featurePriorityScore?: number; // 0-100
  urgencyScore?: number; // 1-10
  roiRationale?: string;
}

// ----------------------------------------------------
// AI Root Cause Analysis
// ----------------------------------------------------
export interface RootCauseItem {
  id?: string;
  title?: string;
  cause?: string;
  action?: string;
  description?: string;
  owner?: string;
  department?: string;
  priority?: PriorityLevel | string;
  impactLevel?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
  probability?: number;
  evidenceQuotes?: string[];
  recommendedFix?: string;
  estimatedResolutionHours?: number;
  responsibleTeam?: string;
  status?: string;
  eta?: string;
}

export interface RootCauseReport {
  id: string;
  title?: string;
  rootCause?: string;
  feedbackId?: string;
  topic?: string;
  problemStatement?: string;
  category?: string;
  summary?: string;
  isSystemic?: boolean;
  systemicIssue?: boolean | string;
  estimatedRevenueAtRiskUSD?: number;
  estimatedRevenueAtRisk?: string | number;
  estimatedRevenueImpact?: string;
  estimatedAffectedCustomers?: number;
  involvedDepartments?: string[];
  departmentsInvolved?: string[];
  contributingFactors?: string[];
  possibleCauses?: RootCauseItem[];
  actionItems?: RootCauseItem[];
  preventionStrategy?: string;
  confidenceScore?: number;
  businessRisk?: string;
  productId?: string;
  productName?: string;
  feedbackCount?: number;
  negativePercentage?: number;
  overallPriority?: PriorityLevel;
  discoveredAt?: string;
  generatedAt?: string;
}

// ----------------------------------------------------
// AI Issue Clusters
// ----------------------------------------------------
export interface IssueCluster {
  id: string;
  name: string;
  title?: string;
  summary?: string;
  category?: string;
  description?: string;
  severity: PriorityLevel | string;
  feedbackCount: number;
  affectedCustomersCount?: number;
  trend?: 'UP' | 'DOWN' | 'STABLE' | string;
  trendPercentage?: number;
  negativeSentimentPct?: number;
  sentiment?: string;
  avgRating?: number;
  avgSentimentScore?: number;
  priority?: PriorityLevel | string;
  topKeywords?: string[];
  keywords?: string[];
  sampleQuotes?: string[];
  rootCauseHypothesis: string;
  rootCauseSummary?: string;
  suggestedAction?: string;
  status?: 'NEW' | 'ANALYZING' | 'TRIAGED' | 'PROMOTED' | string;
  productIds?: string[];
  productId?: string;
  productName?: string;
  feedbackIds?: string[];
  sampleFeedbackIds?: string[];
  associatedFeedbackIds?: string[];
  detectedAt?: string;
}

// ----------------------------------------------------
// RAG Knowledge Base & Support Copilot
// ----------------------------------------------------
export interface KnowledgeDocument {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  chunks?: string[];
  lastUpdated: string;
  author?: string;
  sourceUrl?: string;
}

export interface RAGCitation {
  docId: string;
  title?: string;
  docTitle?: string;
  category?: string;
  snippet?: string;
  excerpt?: string;
  relevanceScore?: number;
}

export interface CopilotTicket {
  id: string;
  feedbackId: string;
  customerName: string;
  customerEmail: string;
  customerCompany?: string;
  subject?: string;
  originalFeedback?: string;
  feedbackSnippet?: string;
  incomingMessage?: string;
  productName?: string;
  detectedIntent?: IntentType | string;
  detectedEmotion?: EmotionType | string;
  priority?: PriorityLevel | string;
  suggestedReply?: string;
  suggestedResponse?: string;
  generatedDraftResponse?: string;
  confidenceScore: number;
  citations?: RAGCitation[];
  ragCitations?: RAGCitation[];
  relevantCitations?: RAGCitation[];
  recommendedAction?: string;
  recommendedActions?: string[];
  status: 'PENDING_REVIEW' | 'APPROVED' | 'SENT' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | string;
  resolvedAt?: string;
  assignedAgent?: string;
  createdAt: string;
}

// ----------------------------------------------------
// Competitor Feedback Intelligence
// ----------------------------------------------------
export interface CompetitorBenchmark {
  id?: string;
  name?: string;
  competitorName?: string;
  category?: string;
  sentimentScore?: number;
  competitorSentiment?: number;
  sentimentVsOurProduct?: number | string;
  csatScore?: number;
  mentionCount?: number;
  strengths?: string[];
  weaknesses?: string[];
  strengthsMentioned?: string[];
  weaknessesMentioned?: string[];
  marketShareEstimate: number | string;
  ourProduct?: string;
  ourCsat?: number;
  competitorCsat?: number;
  sentimentComparison?: {
    ourPositivePct: number;
    ourNegativePct: number;
    competitorPositivePct: number;
    competitorNegativePct: number;
  };
  competitorStrengths?: string[];
  competitorWeaknesses?: string[];
  topCompetitorComplaints?: string[];
  strategicOpportunity?: string;
}

// ----------------------------------------------------
// Before vs After Resolution Tracking
// ----------------------------------------------------
export interface ResolvedImpactAnalysis {
  id?: string;
  issueId: string;
  issueTitle: string;
  status?: string;
  productId?: string;
  productName?: string;
  resolutionDate?: string;
  resolvedDate?: string;
  preFixCSAT?: number;
  postFixCSAT?: number;
  csatDelta?: number;
  churnRevenuePreventedUSD?: number;
  estimatedSavedRevenue?: number | string;
  feedbackSummaryPostResolution?: string;
  preResolutionNegativeCount?: number;
  postResolutionNegativeCount?: number;
  beforeFixNegativePct?: number;
  afterFixNegativePct?: number;
  sentimentDeltaPct?: number;
  sentimentShiftPercentage?: number;
  beforeFixCsat?: number;
  afterFixCsat?: number;
  csatImprovement?: number;
  csatLiftPercentage?: number;
  complaintVolumeReductionPct?: number;
  sampleBeforeQuote?: string;
  sampleAfterQuote?: string;
  aiVerificationSummary?: string;
}

// ----------------------------------------------------
// Human-in-the-Loop & Model Monitoring
// ----------------------------------------------------
export interface HumanCorrection {
  id: string;
  feedbackId: string;
  customerName?: string;
  feedbackSnippet?: string;
  field?: string;
  originalSentiment?: string;
  originalUrgency?: PriorityLevel | string | number;
  originalTopics?: string[];
  originalValue?: string;
  correctedValue?: string;
  correctedSentiment?: SentimentType;
  correctedUrgency?: PriorityLevel | string | number;
  correctedTopics?: string[];
  reasoning: string;
  correctedBy?: string;
  correctedByName?: string;
  correctedAt?: string;
  timestamp?: string;
  notes?: string;
}

export interface AIModelMetrics {
  modelVersion?: string;
  activeModel?: string;
  sentimentAccuracy: number;
  classificationAccuracy?: number;
  aspectExtractionF1?: number;
  emotionAccuracy?: number;
  intentAccuracy?: number;
  topicAccuracy?: number;
  priorityAccuracy?: number;
  averageConfidence?: number;
  lowConfidenceCount?: number;
  urgencyRecall?: number;
  avgLatencyMs?: number;
  averageLatencyMs?: number;
  modelLatencyMs?: number;
  totalAnalyzed?: number;
  totalInferences?: number;
  totalEvaluated?: number;
  humanCorrectionsCount: number;
  correctionsCount?: number;
  rootCausePrecision?: number;
  ragRelevanceScore?: number;
  lastCalibrationDate?: string;
  uptimePercentage?: number;
  lastTrainedAt?: string;
  corrections?: HumanCorrection[];
}

// ----------------------------------------------------
// Integration Hub
// ----------------------------------------------------
export interface IntegrationAdapter {
  id: string;
  name: string;
  type: string;
  category?: string;
  description?: string;
  icon?: string;
  status: string;
  isEnabled: boolean;
  webhookConfigured?: boolean;
  webhookUrl: string;
  triggerEvents: string[];
  lastSyncTime?: string;
  lastSyncedAt?: string;
  eventsCount?: number;
  config?: any;
}

// ----------------------------------------------------
// Explainability & Voice
// ----------------------------------------------------
export interface FeatureWeight {
  feature: string;
  weight: number;
}

export interface ExplainabilityReport {
  feedbackId: string;
  confidenceScore: number;
  decisionBoundaryReasoning: string;
  featureWeights: FeatureWeight[];
  triggerPhrases: string[];
  counterfactuals?: string[];
}

export interface VoiceFeedbackTranscript {
  transcript: string;
  detectedLanguage: string;
  confidence: number;
  durationSeconds: number;
}

export interface TranslationResult {
  translatedText: string;
  detectedSourceLanguage: string;
  targetLanguage: string;
}

// ----------------------------------------------------
// Natural Language Query Filter
// ----------------------------------------------------
export interface NLQueryInterpretation {
  rawQuery: string;
  sentimentFilter?: SentimentType | string;
  topicFilter?: string;
  priorityFilter?: PriorityLevel | string;
  productFilter?: string;
  intent?: IntentType | string;
  filtersSummary?: string;
  structuredFilters: {
    sentiment?: SentimentType;
    priority?: PriorityLevel;
    intent?: IntentType;
    productId?: string;
    productName?: string;
    topic?: string;
    dateRange?: 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'LAST_90_DAYS' | 'ALL';
    searchKeywords?: string[];
  };
  sqlTranslationExplanation: string;
  confidenceScore: number;
}

// ----------------------------------------------------
// Geographical Analytics
// ----------------------------------------------------
export interface RegionalFeedbackMetric {
  region: string;
  country: string;
  city: string;
  regionCode?: string;
  feedbackCount: number;
  csat: number;
  topComplaintTopic: string;
  negativeRate: number;
  churnRiskCount: number;
}

// ----------------------------------------------------
// Product x Topic Heatmap
// ----------------------------------------------------
export interface HeatmapCell {
  productId: string;
  productName: string;
  topic: string;
  feedbackCount: number;
  csat: number;
  sentimentScore?: number;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  topQuote?: string;
}

export interface NotificationItem {
  id: string;
  organizationId: string;
  type: 'CRITICAL_FEEDBACK' | 'NEGATIVE_SPIKE' | 'FEATURE_SURGE' | 'ANOMALY_DETECTED' | 'REPORT_READY';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface ReportData {
  id: string;
  organizationId: string;
  title: string;
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
  generatedAt: string;
  executiveSummary: string;
  kpis: {
    totalFeedback: number;
    positivePercentage: number;
    negativePercentage: number;
    avgRating: number;
    csat: number;
    nps: number;
    criticalIssuesCount: number;
  };
  topComplaints: { topic: string; count: number; percentage: number; severity: string }[];
  topTopics: { name: string; count: number; sentimentScore: number }[];
  productPerformance: { name: string; csat: number; rating: number; feedbackCount: number }[];
  recommendations: AIRecommendation[];
}

export interface AuditLog {
  id: string;
  organizationId: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  details: string;
  ip: string;
  timestamp: string;
}

export interface AnomalyEvent {
  id: string;
  topic: string;
  product: string;
  increaseRate: number;
  timeWindow: string;
  severity: 'high' | 'critical';
  message: string;
  detectedAt: string;
  sampleQuotes: string[];
}

export interface AnalyticsOverview {
  totalFeedback: number;
  positivePercentage: number;
  neutralPercentage: number;
  negativePercentage: number;
  avgRating: number;
  csat: number;
  nps: number;
  criticalIssuesCount: number;
  unresolvedIssuesCount: number;
  totalCustomers: number;
  sentimentTrend: {
    date: string;
    positive: number;
    neutral: number;
    negative: number;
    avgRating: number;
  }[];
  volumeTrend: {
    date: string;
    count: number;
  }[];
  topicDistribution: {
    topic: string;
    count: number;
    sentimentScore: number;
    positiveCount: number;
    negativeCount: number;
  }[];
  emotionDistribution: {
    emotion: EmotionType;
    count: number;
    percentage: number;
  }[];
  productSentiment: {
    productId: string;
    productName: string;
    positive: number;
    neutral: number;
    negative: number;
    avgRating: number;
    total: number;
  }[];
  anomalies: AnomalyEvent[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  structuredData?: {
    type: 'kpi_summary' | 'top_complaints' | 'product_comparison' | 'recommendations' | 'feature_requests';
    data: any;
  };
  sources?: string[];
}

// ====================================================
// DECISION INTELLIGENCE & NOVELTY ENGINE SCHEMAS
// ====================================================

// 1. WHAT-IF INTERVENTION SIMULATOR
export interface WhatIfSimulationParams {
  problemTopic: string;
  productId?: string;
  targetIntervention: string;
  improvementPercentage: number; // e.g. 20 for 20% reduction
  customerSegmentFilter?: string;
  simulatedTimeframeDays?: number;
}

export interface WhatIfSimulationResult {
  id: string;
  params: WhatIfSimulationParams;
  timestamp: string;
  modelConfidence: number; // 0 - 100%
  baselineMetrics: {
    totalNegativeFeedback: number;
    topicComplaintCount: number;
    currentCSAT: number;
    highRiskCustomerCount: number;
    currentRetentionRate: number;
    monthlyRevenueAtRiskUSD: number;
  };
  simulatedMetrics: {
    negativeFeedbackReductionPct: number;
    topicComplaintReductionPct: number;
    projectedCSATDelta: number; // e.g. +0.42
    projectedCSAT: number;
    highRiskCustomerReductionPct: number;
    projectedRetentionGainPct: number;
    estimatedRevenueSavedUSD: number;
  };
  qualitativeSummary: string;
  assumptions: string[];
  evidenceDataPointsCount: number;
}

// 2. CAUSAL CUSTOMER INTELLIGENCE GRAPH
export type CausalNodeType =
  | 'FEEDBACK'
  | 'ISSUE'
  | 'PRODUCT'
  | 'FEATURE'
  | 'CUSTOMER_SEGMENT'
  | 'SENTIMENT'
  | 'EMOTION'
  | 'ROOT_CAUSE'
  | 'CHURN_RISK'
  | 'BUSINESS_IMPACT'
  | 'RESOLUTION';

export type CausalRelationshipType = 'HYPOTHESIS' | 'EVIDENCE_SUPPORTED' | 'CONFIRMED';

export interface CausalNode {
  id: string;
  label: string;
  type: CausalNodeType;
  metric?: string | number;
  statusColor?: string;
  confidence?: number;
  evidenceQuotes?: string[];
  meta?: Record<string, any>;
  x?: number;
  y?: number;
}

export interface CausalEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  relationshipType: CausalRelationshipType;
  strength: number; // 0.0 to 1.0
  evidenceCount: number;
  correlationCoeff?: number;
}

export interface CausalGraphData {
  nodes: CausalNode[];
  edges: CausalEdge[];
  summary: string;
  extractedAt: string;
}

// 3. CUSTOMER & ISSUE SENTIMENT FRUSTRATION VELOCITY
export type FrustrationVelocityAlert = 'STABLE' | 'INCREASING' | 'RAPIDLY_INCREASING' | 'CRITICAL_DETERIORATION';

export interface FrustrationVelocityTrajectoryPoint {
  date: string;
  dayLabel: string;
  sentimentScore: number;
  rating: number;
}

export interface FrustrationVelocityItem {
  id: string;
  targetType: 'CUSTOMER' | 'ISSUE';
  // Customer properties (when targetType === 'CUSTOMER')
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerSegment?: string;
  // Issue properties (when targetType === 'ISSUE')
  issueId?: string;
  issueTitle?: string;
  productName?: string;
  category?: string;
  affectedCustomersCount?: number;
  // Common velocity telemetry
  currentSentimentScore: number; // -1.0 to 1.0
  sentimentTrajectory: FrustrationVelocityTrajectoryPoint[];
  velocityRatePerDay: number; // e.g. -0.24
  status: FrustrationVelocityAlert;
  consecutiveNegativeDays: number;
  primaryFrictionPoint: string;
  latestFeedbackSnippet: string;
  recommendedAction: string;
  estimatedRevenueAtRiskUSD?: number;
  urgencyLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  mitigationStatus?: 'PENDING' | 'DISPATCHED' | 'RESOLVED';
  mitigationActionTaken?: string;
  lastUpdated?: string;
}

// 4. EMERGING ISSUE PREDICTION & EARLY WARNING CENTER
export interface EmergingIssue {
  id: string;
  topic: string;
  category: string;
  firstDetectedDate: string;
  currentMentions: number;
  growthRatePct: number; // e.g. +180%
  predictedMentions: number; // forecast next 7 days
  confidencePct: number;
  severity: PriorityLevel;
  affectedSegment: string;
  relatedKeywords: string[];
  sampleQuotes: string[];
  forecastTimeline: {
    date: string;
    actualMentions?: number;
    predictedMentions: number;
  }[];
  recommendedIntervention: string;
  estimatedRevenueAtRiskUSD: number;
}

// 5. AI FEATURE PRIORITIZATION ROADMAP
export interface FeatureRoadmapItem {
  id: string;
  title: string;
  category: string;
  productId: string;
  productName: string;
  priorityScore: number; // 0-100 (Calculated via transparent formula)
  customerImpactScore: number; // 1-10
  frequencyScore: number; // 1-10
  revenueImpactUSD: number;
  churnRiskMitigationPct: number;
  strategicImportanceScore: number; // 1-10
  affectedUsersCount: number;
  complaintVolume: number;
  sentimentImpactPct: number;
  roiRationale: string;
  status: 'PLANNED' | 'IN_DEVELOPMENT' | 'UNDER_REVIEW' | 'COMPLETED';
  confidencePct: number;
}

// 6. CLOSED-LOOP RESOLUTION LEARNING
export interface ResolutionLearningItem {
  id: string;
  issueId: string;
  issueTitle: string;
  productId: string;
  productName: string;
  interventionAction: string;
  responsibleTeam: string;
  resolvedDate: string;
  beforeMetrics: {
    negativeSentimentPct: number;
    csat: number;
    weeklyComplaintVolume: number;
  };
  afterMetrics: {
    negativeSentimentPct: number;
    csat: number;
    weeklyComplaintVolume: number;
  };
  recommendationEffectivenessPct: number; // 0-100%
  savedRevenueUSD: number;
  affectedSegment: string;
  learningSummary: string;
  conditionsForSuccess: string[];
  recommendationState: 'HIGHLY_EFFECTIVE' | 'MODERATE_EFFECT' | 'INEFFECTIVE' | 'UNDER_EVALUATION';
}

// 7. CONTRADICTION & MULTIMODAL DETECTION
export interface ContradictionAnalysis {
  isContradictory: boolean;
  ratingSentiment: SentimentType;
  textSentiment: SentimentType;
  confidence: number;
  possibleCause: 'ACCIDENTAL_RATING' | 'SARCASM' | 'INCONSISTENT_FEEDBACK' | 'SUSPICIOUS' | 'NONE';
  explanation: string;
}

export interface MultimodalAnalysisResult {
  extractedText: string;
  detectedUIErrors: string[];
  visualCategory: string;
  likelyRootCause: string;
  severity: PriorityLevel;
  confidence: number;
  screenshotSummary: string;
}

// ====================================================
// 8. AI AUTONOMOUS FEEDBACK AGENT & HUMAN APPROVAL
// ====================================================
export type PipelineStepStatus = 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'TRIGGERED_ACTION';

export interface AutonomousPipelineStep {
  stepNumber: number;
  name: string; // 'New Feedback' | 'Analyze' | 'Detect Duplicate' | 'Cluster Issue' | 'Determine Severity' | 'Check Existing Incidents' | 'Estimate Customer Risk' | 'Estimate Business Impact' | 'Generate Recommendation' | 'Human Approval'
  description: string;
  status: PipelineStepStatus;
  outputSummary?: string;
  durationMs?: number;
  timestamp?: string;
}

export type ApprovalActionStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'EXECUTED';

export interface PendingApprovalAction {
  id: string;
  title: string;
  actionType: 'GATEWAY_FAILOVER' | 'CUSTOMER_CREDIT' | 'HOTFIX_DISPATCH' | 'EXECUTIVE_SYNC' | 'COMMUNICATION_BROADCAST';
  consequenceLevel: 'HIGH' | 'CRITICAL' | 'EXTREME';
  description: string;
  targetEntity: string;
  estimatedImpact: string;
  requestedBy: string;
  status: ApprovalActionStatus;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface AutonomousAgentIncident {
  id: string;
  title: string; // e.g. "🚨 CRITICAL EMERGING ISSUE: 14 customers reported payment failures in the last 2 hours."
  severity: PriorityLevel;
  affectedSegment: string; // e.g. "Premium Mobile Users"
  reportedCustomerCount: number; // e.g. 14
  timeWindow: string; // e.g. "Last 2 hours"
  rootCauseHypothesis: string; // e.g. "Payment gateway timeout 504 on Stripe webhook router"
  recommendedAction: string; // e.g. "Investigate payment gateway timeout & failover to secondary route"
  evidenceQuotes: string[]; // related feedback items
  evidenceFeedbackIds: string[];
  estimatedRevenueAtRiskUSD: number;
  pipelineSteps: AutonomousPipelineStep[];
  pendingAction?: PendingApprovalAction;
  status: 'ACTIVE_INVESTIGATION' | 'PENDING_APPROVAL' | 'RESOLVED' | 'DISPATCHED';
  detectedAt: string;
  decisionTraceId?: string;
}

export type AgentEventType =
  | 'FEEDBACK_INGESTED'
  | 'ANALYSIS_COMPLETED'
  | 'DUPLICATE_CHECKED'
  | 'SEMANTIC_MATCHED'
  | 'ISSUE_CLUSTERED'
  | 'SEVERITY_CALCULATED'
  | 'EMERGING_SPIKE_DETECTED'
  | 'CUSTOMER_RISK_EVALUATED'
  | 'BUSINESS_IMPACT_MODELED'
  | 'ROOT_CAUSE_HYPOTHESIZED'
  | 'RECOMMENDATION_GENERATED'
  | 'INCIDENT_CREATED'
  | 'HUMAN_DECISION_RECEIVED'
  | 'ACTION_DISPATCHED'
  | 'OUTCOME_MEASURED'
  | 'MEMORY_UPDATED';

export interface AgentEvent {
  id: string;
  eventType: AgentEventType;
  timestamp: string;
  message: string;
  source: string;
  severity: PriorityLevel;
  entityId?: string;
  entityType?: 'FEEDBACK' | 'ISSUE' | 'INCIDENT' | 'RECOMMENDATION' | 'CUSTOMER';
  payload?: any;
}

export interface AgentPipelineStageResult {
  stageKey: string;
  name: string;
  status: 'COMPLETED' | 'RUNNING' | 'PENDING' | 'SKIPPED' | 'FAILED';
  durationMs: number;
  outputSummary: string;
  confidence?: number;
  data?: any;
}

export interface AgentRun {
  id: string;
  feedbackId: string;
  startedAt: string;
  completedAt?: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  totalDurationMs: number;
  stages: AgentPipelineStageResult[];
  incidentId?: string;
  recommendationId?: string;
}

export interface AgentDecision {
  id: string;
  incidentId: string;
  title: string;
  decisionType: 'CREATE_INCIDENT' | 'UPGRADE_SEVERITY' | 'DISPATCH_ALERT' | 'TRIGGER_PLAYBOOK';
  whyFactors: string[];
  evidenceDataPointsCount: number;
  confidence: number;
  recommendedAction: string;
  timestamp: string;
  rootCauseHypothesis: string;
  regressionRisk: string;
  causalLinkSummary: string;
}

export interface AgentRecommendation {
  id: string;
  issueId: string;
  incidentId?: string;
  title: string;
  reason: string;
  evidence: string[];
  confidence: number;
  expectedImpact: string;
  affectedCustomersCount: number;
  priority: PriorityLevel;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'MODIFIED' | 'INVESTIGATING';
  targetTeam: string;
  modifiedAction?: string;
  assignedTo?: string;
  decidedAt?: string;
  decidedBy?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface AgentEvidence {
  id: string;
  incidentId: string;
  feedbackId: string;
  quote: string;
  customerName: string;
  sentiment: SentimentType;
  severity: PriorityLevel;
  timestamp: string;
  similarityScore: number;
}

export interface AgentAction {
  id: string;
  recommendationId: string;
  incidentId?: string;
  actionType: string;
  description: string;
  status: 'PENDING' | 'EXECUTING' | 'EXECUTED' | 'ROLLED_BACK' | 'FAILED';
  executedAt?: string;
  executedBy?: string;
  rollbackPlan?: string;
  executionTelemetry?: any;
}

export interface AgentOutcome {
  id: string;
  actionId: string;
  recommendationId: string;
  interventionName: string;
  beforeMetrics: {
    negativeSentimentPct: number;
    complaintVolume: number;
    csat: number;
  };
  afterMetrics: {
    negativeSentimentPct: number;
    complaintVolume: number;
    csat: number;
  };
  effectivenessPct: number;
  savedRevenueUSD: number;
  status: 'SUCCESSFUL' | 'PARTIALLY_EFFECTIVE' | 'INEFFECTIVE';
  evaluatedAt: string;
}

export interface AgentMemory {
  id: string;
  incidentType: string;
  rootCause: string;
  successfulInterventions: string[];
  failedInterventions: string[];
  averageEffectivenessPct: number;
  customerSegmentPatterns: string[];
  timesObserved: number;
  lastObservedAt: string;
}

export interface AgentConfig {
  isAutoEnabled: boolean;
  minConfidenceThreshold: number; // e.g. 0.85 (85%)
  emergingGrowthThresholdPct: number; // e.g. 100 (+100% growth)
  highSeverityIncidentThreshold: number; // e.g. 5 complaints
  autoCreateIncident: boolean;
  maxActionsPerHour: number;
  notificationChannels: string[];
}

export interface AgentDashboardMetrics {
  agentStatus: 'ACTIVE' | 'PAUSED' | 'DEGRADED';
  feedbackProcessedToday: number;
  issuesDetected: number;
  emergingIssuesCount: number;
  criticalIssuesCount: number;
  recommendationsCount: number;
  awaitingApprovalCount: number;
  resolvedCount: number;
  averageConfidencePct: number;
  uptimeHours: number;
}

// ====================================================
// 9. MULTILINGUAL & CODE-MIXED NLP
// ====================================================
export type CodeMixedLanguage = 'ENGLISH' | 'TAMIL' | 'HINDI' | 'TANGLISH' | 'HINGLISH' | 'OTHER';
export type FeedbackIntent = 'COMPLAINT' | 'FEATURE_REQUEST' | 'INQUIRY' | 'APPRECIATION' | 'CHURN_THREAT' | 'BUG_REPORT';

export interface TokenLanguageTag {
  token: string;
  language: CodeMixedLanguage;
  confidence: number;
}

export interface MultilingualAnalysisResult {
  id?: string;
  originalText: string;
  detectedLanguages: CodeMixedLanguage[];
  primaryLanguage: CodeMixedLanguage;
  codeMixedRatio: number; // 0 to 1
  script: 'LATIN' | 'TAMIL' | 'DEVANAGARI' | 'MIXED';
  canonicalEnglishTranslation: string;
  tokenBreakdown: TokenLanguageTag[];
  intent: FeedbackIntent;
  aspect: string; // 'Performance' | 'Payment' | 'Authentication' | 'UI/UX' | 'Support'
  sentiment: SentimentType;
  sentimentScore: number; // -1 to 1
  severity: PriorityLevel;
  confidence: number; // 0 to 1
  analyzedAt: string;
}

// ====================================================
// 10. MULTIMODAL FEEDBACK (VOICE & SCREENSHOT)
// ====================================================
export type MultimodalInputType = 'TEXT' | 'VOICE' | 'SCREENSHOT';
export type VoiceEmotion = 'FRUSTRATED' | 'ANGRY' | 'CALM' | 'SATISFIED' | 'URGENT' | 'CONFUSED';

export interface VoiceAnalysisResult {
  id: string;
  audioSampleName?: string;
  transcription: string;
  speechToTextConfidence: number;
  detectedEmotion: VoiceEmotion;
  emotionValence: number; // -1 (negative) to 1 (positive)
  urgencyLevel: PriorityLevel;
  sentiment: SentimentType;
  intent: FeedbackIntent;
  aspect: string;
  severity: PriorityLevel;
  durationSeconds: number;
  acousticPitchHz?: number;
  suggestedTicketTitle: string;
  createdAt: string;
}

export interface VisualErrorBoundingBox {
  id: string;
  xPct: number;
  yPct: number;
  widthPct: number;
  heightPct: number;
  label: string;
  extractedSnippet: string;
}

export interface ScreenshotAnalysisResult {
  id: string;
  sampleName: string;
  imageUrl: string;
  ocrExtractedText: string;
  detectedErrorCode?: string; // e.g. "Error 504" | "HTTP 500" | "KYC_VERIFICATION_FAILED"
  visualUIElements: string[];
  category: string; // e.g. "Payment" | "Authentication" | "Checkout"
  likelyCause: string; // e.g. "Gateway Timeout" | "Database Connection Stalled"
  severity: PriorityLevel;
  confidence: number; // e.g. 0.91
  highlightBoundingBoxes: VisualErrorBoundingBox[];
  suggestedAction: string;
  createdAt: string;
}

// ====================================================
// 11. FEEDBACK CONTRADICTION DETECTOR
// ====================================================
export type ContradictionType = 'RATING_HIGH_TEXT_NEGATIVE' | 'RATING_LOW_TEXT_POSITIVE' | 'POLARITY_INVERSION' | 'SARCASTIC_AMBIVALENCE';
export type ContradictionCause = 'ACCIDENTAL_RATING' | 'SARCASM_IRONY' | 'INCONSISTENT_FEEDBACK' | 'SUSPICIOUS_BOT' | 'MISUNDERSTOOD_SCALE';

export interface FeedbackContradiction {
  id: string;
  feedbackId: string;
  customerName: string;
  customerEmail?: string;
  starRating: number; // e.g. 5
  ratingSentiment: SentimentType; // Positive
  textSentiment: SentimentType; // Negative
  text: string; // "The application crashes every time I open it."
  contradictionType: ContradictionType;
  confidence: number; // e.g. 0.91 (91%)
  possibleCauses: ContradictionCause[];
  recommendedTrueRating: number; // e.g. 1
  trueCalibratedSentiment: SentimentType; // Negative
  explanation: string;
  resolutionStatus: 'DETECTED' | 'RESOLVED_CORRECTED' | 'CONFIRMED_SARCASM' | 'DISMISSED';
  resolvedActionNote?: string;
  createdAt: string;
}

// ====================================================
// 12. BUSINESS IMPACT ENGINE
// ====================================================
export interface BusinessImpactAssessment {
  id: string;
  issueName: string; // e.g. "Payment Failure"
  category: string;
  affectedCustomerCount: number; // e.g. 2,840
  estimatedChurnRiskPct: number; // e.g. 12%
  estimatedRevenueAtRiskINR: number; // e.g. 1,840,000 (₹18.4 Lakhs)
  estimatedRevenueAtRiskUSD: number; // e.g. $22,000
  priority: PriorityLevel; // CRITICAL
  rootCause: string;
  affectedSegments: string[];
  arpuAssumptionUSD: number;
  arpuAssumptionINR: number;
  recoveryValue48hUSD: number;
  recoveryValue48hINR: number;
  modeledAssumptionsDisclaimer: string; // "Estimated / Modeled / Assumption-based"
  confidence: number;
  calculatedAt: string;
}

export interface FinancialSensitivityParams {
  baselineARPU_USD: number;
  baselineARPU_INR: number;
  churnSensitivityMultiplier: number;
  timeHorizonMonths: number;
  currency: 'INR' | 'USD';
}

// ====================================================
// 13. CONVERSATIONAL CUSTOMER ANALYTICS
// ====================================================
export type AnalyticsStructuredDataType = 
  | 'CSAT_BREAKDOWN'
  | 'EVIDENCE_LIST'
  | 'AFFECTED_CUSTOMERS'
  | 'SIMULATION_RESULT'
  | 'CAUSAL_RCA'
  | 'ROADMAP_PRIORITY'
  | 'GENERAL_METRICS';

export interface AnalyticsCSATBreakdown {
  previousCSAT: number; // 4.3
  currentCSAT: number; // 3.8
  drop: number; // -0.5
  period: string; // "Last Month vs Prior"
  primaryContributors: { name: string; percentage: number; count: number; sentiment: string }[];
  mostAffectedSegment: string; // "Premium mobile users"
  recommendedAction: string; // "Prioritize payment reliability"
}

export interface AnalyticsEvidenceQuote {
  id: string;
  customerName: string;
  text: string;
  timestamp: string;
  category: string;
  severity: PriorityLevel;
}

export interface AnalyticsAffectedCustomer {
  id: string;
  name: string;
  segment: string;
  arrUSD: number;
  churnRiskScore: number;
  recentIssue: string;
}

export interface AnalyticsSimulationResult {
  scenarioTitle: string;
  targetMetric: string;
  currentValue: number;
  projectedValue: number;
  netGain: string;
  estimatedRevenueSavedUSD: number;
  rationale: string;
}

export interface AnalyticsCausalRCA {
  incidentName: string;
  rootCause: string;
  causalChain: string[];
  failureRate: string;
  recommendedHotfix: string;
}

export interface AnalyticsRoadmapPriority {
  rankedFeatures: { rank: number; featureName: string; score: number; rationale: string }[];
}

export interface AnalyticsStructuredPayload {
  type: AnalyticsStructuredDataType;
  csatBreakdown?: AnalyticsCSATBreakdown;
  evidenceQuotes?: AnalyticsEvidenceQuote[];
  affectedCustomers?: AnalyticsAffectedCustomer[];
  simulationResult?: AnalyticsSimulationResult;
  causalRCA?: AnalyticsCausalRCA;
  roadmapPriority?: AnalyticsRoadmapPriority;
}

export interface AnalyticsChatMessage {
  id: string;
  sender: 'USER' | 'ASSISTANT';
  text: string;
  timestamp: string;
  payload?: AnalyticsStructuredPayload;
  suggestedFollowUps?: string[];
}

// ==========================================
// RBAC & ROLE DASHBOARD TYPES
// ==========================================
export type PermissionKey =
  | 'feedback.view'
  | 'feedback.create'
  | 'feedback.edit'
  | 'feedback.delete'
  | 'analytics.view'
  | 'analytics.export'
  | 'ai.analyze'
  | 'ai.recommend'
  | 'ai.simulate'
  | 'recommendation.approve'
  | 'user.manage'
  | 'role.manage'
  | 'system.configure'
  | 'audit.view';

export interface PermissionDefinition {
  key: PermissionKey;
  label: string;
  category: 'Feedback' | 'Analytics' | 'AI & Decision' | 'Administration' | 'System';
  description: string;
}

export type RolePermissionMatrix = Record<UserRole, PermissionKey[]>;

export interface SystemServiceHealth {
  name: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  uptimePercentage: number;
  latencyMs: number;
  message?: string;
  icon?: string;
}

export interface AdminDashboardData {
  totalUsers: number;
  activeUsers: number;
  feedbackProcessed: number;
  aiAnalysesToday: number;
  aiAgentStatus: 'ACTIVE' | 'PAUSED' | 'IDLE';
  apiRequests: number;
  systemHealth: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  failedJobs: number;
  openIncidents: number;
  storageUsageBytes: number;
  serviceHealthCards: SystemServiceHealth[];
  aiMetrics: {
    model: string;
    version: string;
    requestsToday: number;
    avgLatencyMs: number;
    failureRatePct: number;
    tokenUsageToday: number;
    estimatedCostUSD: number;
    confidenceDistribution: { range: string; count: number }[];
  };
  agentMetrics: {
    status: string;
    activeJobs: number;
    completedJobs: number;
    failedJobs: number;
    recommendationsGenerated: number;
    incidentsCreated: number;
    humanApprovals: number;
    agentErrors: number;
  };
  recentAuditLogs: AuditLog[];
  users: User[];
  rolePermissions: RolePermissionMatrix;
}

export interface ManagerDashboardData {
  customerHealthScore: number;
  overallSentimentPct: number;
  csatScore: number;
  churnRiskCount: number;
  openCriticalIssuesCount: number;
  emergingIssuesCount: number;
  revenueAtRiskUSD: number;
  recommendationEffectivenessPct: number;
  sentimentTrend: { date: string; positive: number; neutral: number; negative: number }[];
  csatTrend: { date: string; csat: number }[];
  complaintTrend: { date: string; complaints: number }[];
  emergingIssues: EmergingIssue[];
  recommendations: Array<{
    id: string;
    title: string;
    problem: string;
    evidence: string;
    confidence: number;
    expectedImpact: string;
    affectedCustomers: number;
    estimatedRevenueImpactUSD: number;
    priority: PriorityLevel;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'IMPLEMENTED';
    category: string;
  }>;
  roadmapPriorities: FeatureRoadmapItem[];
  resolutionTrackings: ResolutionLearningItem[];
}

export interface AnalystDashboardData {
  feedbackVolume: number;
  positivePct: number;
  negativePct: number;
  neutralPct: number;
  topIssues: { name: string; count: number; sentiment: number; velocity: string }[];
  emergingIssues: EmergingIssue[];
  anomalies: AnomalyEvent[];
  sentimentVelocity: FrustrationVelocityItem[];
  churnRiskDistribution: { segment: string; low: number; medium: number; high: number }[];
  semanticClusters: IssueCluster[];
  causalGraph: CausalGraphData;
  forecasts: {
    horizonDays: number;
    billingForecast: { date: string; historical?: number; forecast?: number; lower?: number; upper?: number }[];
    sentimentForecast: { date: string; score: number; lower: number; upper: number }[];
  };
  customerSegments: {
    name: string;
    volume: number;
    sentimentScore: number;
    topIssue: string;
    csat: number;
    churnRisk: string;
  }[];
}

export interface ViewerDashboardData {
  customerHealthScore: number;
  csatScore: number;
  overallSentimentPct: number;
  openIssuesCount: number;
  emergingIssuesCount: number;
  churnRiskCount: number;
  executiveSummary: {
    title: string;
    generatedAt: string;
    bullets: string[];
    sentimentChangeText: string;
    keyRiskArea: string;
  };
  sentimentTrend: { date: string; positive: number; neutral: number; negative: number }[];
  csatTrend: { date: string; csat: number }[];
  complaintTrend: { date: string; complaints: number }[];
  keyIssues: { title: string; category: string; severity: string; summary: string }[];
  approvedReports: Array<{
    id: string;
    title: string;
    period: string;
    publishedAt: string;
    summary: string;
    pdfUrl?: string;
  }>;
}

// ==========================================
// DECISION INTELLIGENCE TYPES
// ==========================================

export interface DecisionEvidenceItem {
  type: 'FEEDBACK' | 'ISSUE' | 'TREND' | 'METRIC' | 'CUSTOMER';
  label: string;
  value: string | number;
  supporting: boolean;
}

export interface DecisionReasoningStep {
  step: number;
  label: string;
  description: string;
  evidenceCount?: number;
}

export interface DecisionTrace {
  recommendationId: string;
  recommendationTitle: string;
  generatedAt: string;
  productId: string;
  productName: string;
  confidence: number; // 0-100
  modelVersion: string;
  dataTimestamp: string;
  // Evidence collected
  supportingFeedbackCount: number;
  negativeSentimentPct: number;
  complaintGrowthPct: number;
  affectedCustomers: number;
  relatedIssueCount: number;
  estimatedRevenueRiskUSD: number;
  // Reasoning path
  reasoningSteps: DecisionReasoningStep[];
  // Evidence items
  evidenceItems: DecisionEvidenceItem[];
  // Assumptions
  assumptions: string[];
  // Warnings
  warnings?: string[];
}

export interface EvidenceRecord {
  id: string;
  recommendationId: string;
  type: 'FEEDBACK_QUOTE' | 'AGGREGATED_METRIC' | 'TREND_DATA' | 'ISSUE_CLUSTER';
  title: string;
  detail: string;
  sourceId?: string;
  timestamp: string;
  confidence: number;
}

// ==========================================
// PREDICTIVE ISSUE INTELLIGENCE
// ==========================================

export interface PredictiveIssueForecast {
  id: string;
  productId: string;
  issueTitle: string;
  currentSeverity: PriorityLevel;
  predictedSeverity: PriorityLevel;
  currentVolume: number;
  growthRatePct: number; // e.g. +38
  forecastWindowDays: number; // e.g. 4-7
  confidencePct: number; // 0-100
  affectedSegments: string[];
  signals: string[];
  predictedAt: string;
  labelNote: string; // e.g. "PREDICTION — Not guaranteed"
}

export interface IssueVelocityMetric {
  issueTitle: string;
  productId: string;
  currentVolume: number;
  previousVolume: number;
  growthRatePct: number;
  accelerating: boolean; // unusual vs historical baseline
  severityChanged: boolean;
  uniqueCustomersAffected: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
}

// ==========================================
// BUSINESS IMPACT ENGINE
// ==========================================

export interface BusinessImpactBreakdown {
  productId: string;
  productName: string;
  calculatedAt: string;
  isEstimate: boolean;
  estimateNote: string;
  affectedCustomers: number;
  potentialChurnCount: number;
  revenueAtRiskUSD: number;
  supportCostImpactUSD: number;
  totalEstimatedImpactUSD: number;
  formula: {
    affectedCustomers: string;
    potentialChurn: string;
    revenueAtRisk: string;
    supportCost: string;
  };
  assumptions: string[];
  timestamp: string;
}

// ==========================================
// KNOWLEDGE GRAPH
// ==========================================

export interface KnowledgeGraphNode {
  id: string;
  type: 'CUSTOMER' | 'FEEDBACK' | 'FEATURE' | 'ISSUE' | 'ROOT_CAUSE' | 'RISK' | 'IMPACT' | 'RECOMMENDATION' | 'RESOLUTION' | 'OUTCOME';
  label: string;
  value?: string | number;
  severity?: PriorityLevel;
  count?: number;
  productId?: string;
}

export interface KnowledgeGraphEdge {
  source: string;
  target: string;
  label: string;
  weight?: number;
}

export interface KnowledgeGraphData {
  productId: string;
  productName: string;
  generatedAt: string;
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
}

// ==========================================
// CLOSED-LOOP OUTCOME LEARNING
// ==========================================

export interface OutcomeRecord {
  id: string;
  recommendationId: string;
  recommendationTitle: string;
  productId: string;
  productName: string;
  actionTaken: string;
  actionDate: string;
  outcomeDate: string;
  status: 'PENDING' | 'IMPROVEMENT_DETECTED' | 'NO_CHANGE' | 'WORSENED';
  // Before metrics
  beforeComplaints: number;
  beforeCSAT: number;
  beforeSentimentPct: number;
  beforeIssueFrequency: number;
  // After metrics
  afterComplaints: number;
  afterCSAT: number;
  afterSentimentPct: number;
  afterIssueFrequency: number;
  // Changes
  complaintChangePct: number;
  csatChangePts: number;
  sentimentChangePct: number;
  // Evaluation
  evaluationNote: string;
  causalityNote: string; // "Correlation observed, causation not confirmed"
  evidenceIds: string[];
}

export interface RecommendationPerformance {
  total: number;
  approved: number;
  rejected: number;
  implemented: number;
  pendingOutcome: number;
  successfulOutcomes: number;
  unsuccessfulOutcomes: number;
  effectivenessRate: number; // 0-100
  avgTimeToOutcomeDays: number;
  items: Array<{
    id: string;
    title: string;
    status: 'APPROVED' | 'REJECTED' | 'IMPLEMENTED' | 'PENDING';
    outcomeStatus?: 'IMPROVEMENT_DETECTED' | 'NO_CHANGE' | 'WORSENED' | 'PENDING';
    actionTaken?: string;
    outcomeNote?: string;
    approvedAt?: string;
    outcomeDate?: string;
  }>;
}

// ==========================================
// FEATURE DEMAND INTELLIGENCE
// ==========================================

export interface FeatureDemandScore {
  id: string;
  featureTitle: string;
  requestCount: number;
  customerImpact: number; // 0-100
  businessRelevance: number; // 0-100
  implementationComplexity: 'LOW' | 'MEDIUM' | 'HIGH';
  riskReductionPotential: number; // 0-100
  priorityScore: number; // composite 0-100
  reasoning: string;
  topRequestQuotes: string[];
  segments: string[];
}

// ==========================================
// PRODUCT DIGITAL TWIN
// ==========================================

export interface DigitalTwinParameter {
  id: string;
  label: string;
  unit: string;
  currentValue: number;
  min: number;
  max: number;
  step: number;
}

export interface DigitalTwinSimulationResult {
  parameterChanges: Array<{ label: string; from: number; to: number; unit: string }>;
  estimatedComplaintChange: number; // percent
  estimatedCSATChange: number; // points
  estimatedCustomerRiskChange: string;
  estimatedRevenueRiskChange: number; // USD
  narrative: string;
  isSimulation: true;
  simulationNote: string;
}

// ==========================================
// AI AGENT MONITORING
// ==========================================

export type AgentState = 'MONITORING' | 'ANALYZING' | 'INVESTIGATING' | 'WAITING_FOR_APPROVAL' | 'EXECUTING' | 'COMPLETED' | 'FAILED' | 'PAUSED';

export interface AgentPipelineStep {
  step: number;
  name: string;
  state: AgentState;
  startedAt?: string;
  completedAt?: string;
  detail?: string;
}

