import {
  Feedback, Product, Customer, User, Organization, Issue, FeatureRequest,
  NotificationItem, AnomalyEvent, RootCauseReport, IssueCluster, KnowledgeDocument,
  CopilotTicket, CompetitorBenchmark, ResolvedImpactAnalysis, AIModelMetrics,
  IntegrationAdapter, RegionalFeedbackMetric, HeatmapCell
} from '../src/types.js';

export const SEED_ORGANIZATION: Organization = {
  id: 'org_acme_corp',
  name: 'Acme Technologies Inc.',
  slug: 'acme-corp',
  plan: 'Enterprise',
  createdAt: '2026-01-01T00:00:00Z',
};

export const SEED_USERS: User[] = [
  {
    id: 'usr_admin_1',
    name: 'Ashwin T',
    email: 'admin@example.com',
    role: 'ADMIN',
    avatarUrl: '/profile.jpg',
    organizationId: 'org_acme_corp',
    department: 'Executive / Product Strategy',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'usr_manager_1',
    name: 'Marcus Vance',
    email: 'marcus@example.com',
    role: 'MANAGER',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    organizationId: 'org_acme_corp',
    department: 'Customer Experience & Success',
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'usr_analyst_1',
    name: 'Elena Rostova',
    email: 'elena@example.com',
    role: 'ANALYST',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    organizationId: 'org_acme_corp',
    department: 'Business Intelligence & Data',
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'usr_analyst_2',
    name: 'David Chen',
    email: 'david@example.com',
    role: 'ANALYST',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    organizationId: 'org_acme_corp',
    department: 'Product Operations',
    createdAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'usr_viewer_1',
    name: 'Chloe Bennett',
    email: 'viewer@example.com',
    role: 'VIEWER',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    organizationId: 'org_acme_corp',
    department: 'Investor Relations',
    createdAt: '2026-02-15T00:00:00Z',
  }
];

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod_cloud_platform',
    organizationId: 'org_acme_corp',
    name: 'Acme Cloud Platform',
    code: 'CLOUD-001',
    category: 'Infrastructure & Compute',
    description: 'Core elastic cloud computing, autoscaling clusters, and container runtime.',
    version: 'v4.2.0',
    owner: 'Marcus Vance',
    team: 'Infrastructure & Compute',
    status: 'ACTIVE',
    website: 'https://cloud.acme.com',
    launchDate: '2025-03-15',
    targetSegments: ['Enterprise', 'High-Value', 'SaaS Providers'],
    createdAt: '2025-03-15T00:00:00Z',
    updatedAt: '2026-09-18T00:00:00Z',
    totalFeedback: 184,
    avgRating: 4.3,
    positiveRate: 74,
    negativeRate: 14,
    csat: 84,
    healthScore: 88,
    openIssues: 4,
    criticalIssues: 0,
    emergingIssues: 1,
    customerRisk: 'LOW',
    lastActivity: '2026-09-18T19:42:00Z',
    features: [
      { id: 'feat_cloud_1', productId: 'prod_cloud_platform', name: 'Autoscaling Clusters', status: 'STABLE', feedbackCount: 42, openIssuesCount: 1 },
      { id: 'feat_cloud_2', productId: 'prod_cloud_platform', name: 'Serverless Functions', status: 'STABLE', feedbackCount: 65, openIssuesCount: 2 },
      { id: 'feat_cloud_3', productId: 'prod_cloud_platform', name: 'Kubernetes Engine', status: 'STABLE', feedbackCount: 77, openIssuesCount: 1 }
    ]
  },
  {
    id: 'prod_pay_gateway',
    organizationId: 'org_acme_corp',
    name: 'Acme Pay Engine',
    code: 'PAY-001',
    category: 'Financial',
    description: 'Global multi-currency checkout, recurring invoicing, and fraud prevention.',
    version: 'v3.1.5',
    owner: 'Elena Rostova',
    team: 'Payments & Settlement',
    status: 'ACTIVE',
    website: 'https://pay.acme.com',
    launchDate: '2025-06-01',
    targetSegments: ['E-commerce', 'Fintech', 'Enterprise'],
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2026-09-18T00:00:00Z',
    totalFeedback: 142,
    avgRating: 3.2,
    positiveRate: 46,
    negativeRate: 38,
    csat: 62,
    healthScore: 58,
    openIssues: 14,
    criticalIssues: 2,
    emergingIssues: 3,
    customerRisk: 'HIGH',
    lastActivity: '2026-09-18T20:12:00Z',
    features: [
      { id: 'feat_pay_1', productId: 'prod_pay_gateway', name: 'Multi-Currency Checkout', status: 'STABLE', feedbackCount: 54, openIssuesCount: 6 },
      { id: 'feat_pay_2', productId: 'prod_pay_gateway', name: 'Subscription Invoicing', status: 'STABLE', feedbackCount: 48, openIssuesCount: 4 },
      { id: 'feat_pay_3', productId: 'prod_pay_gateway', name: 'Stripe & PayPal Gateway', status: 'BETA', feedbackCount: 40, openIssuesCount: 4 }
    ]
  },
  {
    id: 'prod_mobile_app',
    organizationId: 'org_acme_corp',
    name: 'Acme Mobile App',
    code: 'MOB-001',
    category: 'Mobile Application',
    description: 'Cross-platform mobile companion (iOS & Android) for team collaboration and push notifications.',
    version: 'v2.8.0',
    owner: 'David Chen',
    team: 'Mobile Product Engineering',
    status: 'ACTIVE',
    website: 'https://mobile.acme.com',
    launchDate: '2025-08-10',
    targetSegments: ['Mobile Users', 'On-the-go Teams', 'B2B SMB'],
    createdAt: '2025-08-10T00:00:00Z',
    updatedAt: '2026-09-18T00:00:00Z',
    totalFeedback: 110,
    avgRating: 3.8,
    positiveRate: 61,
    negativeRate: 23,
    csat: 72,
    healthScore: 74,
    openIssues: 6,
    criticalIssues: 1,
    emergingIssues: 2,
    customerRisk: 'MEDIUM',
    lastActivity: '2026-09-18T18:30:00Z',
    features: [
      { id: 'feat_mob_1', productId: 'prod_mobile_app', name: 'Biometric Auth', status: 'STABLE', feedbackCount: 30, openIssuesCount: 1 },
      { id: 'feat_mob_2', productId: 'prod_mobile_app', name: 'Push Notifications', status: 'STABLE', feedbackCount: 45, openIssuesCount: 3 },
      { id: 'feat_mob_3', productId: 'prod_mobile_app', name: 'Offline Sync Mode', status: 'BETA', feedbackCount: 35, openIssuesCount: 2 }
    ]
  },
  {
    id: 'prod_analytics_bi',
    organizationId: 'org_acme_corp',
    name: 'Acme Realtime BI Suite',
    code: 'BI-001',
    category: 'Enterprise',
    description: 'Streaming metric visualizers, SQL query builder, and scheduled PDF executive reports.',
    version: 'v5.0.1',
    owner: 'Ashwin T',
    team: 'Business Intelligence & Data',
    status: 'ACTIVE',
    website: 'https://bi.acme.com',
    launchDate: '2025-01-20',
    targetSegments: ['Executive Management', 'Data Analysts', 'Enterprise'],
    createdAt: '2025-01-20T00:00:00Z',
    updatedAt: '2026-09-18T00:00:00Z',
    totalFeedback: 88,
    avgRating: 4.6,
    positiveRate: 88,
    negativeRate: 6,
    csat: 91,
    healthScore: 94,
    openIssues: 2,
    criticalIssues: 0,
    emergingIssues: 0,
    customerRisk: 'LOW',
    lastActivity: '2026-09-18T17:15:00Z',
    features: [
      { id: 'feat_bi_1', productId: 'prod_analytics_bi', name: 'SQL Query Studio', status: 'STABLE', feedbackCount: 40, openIssuesCount: 1 },
      { id: 'feat_bi_2', productId: 'prod_analytics_bi', name: 'Executive PDF Exporter', status: 'STABLE', feedbackCount: 48, openIssuesCount: 1 }
    ]
  },
  {
    id: 'prod_support_hub',
    organizationId: 'org_acme_corp',
    name: 'Acme Support & Customer Portal',
    code: 'PORTAL-001',
    category: 'Web Application',
    description: '24/7 omnichannel customer service portal, live agent chat, and knowledge base.',
    version: 'v1.9.4',
    owner: 'Chloe Bennett',
    team: 'Customer Experience & Success',
    status: 'MONITORING',
    website: 'https://support.acme.com',
    launchDate: '2025-11-05',
    targetSegments: ['End Users', 'Customer Support Teams'],
    createdAt: '2025-11-05T00:00:00Z',
    updatedAt: '2026-09-18T00:00:00Z',
    totalFeedback: 76,
    avgRating: 4.1,
    positiveRate: 71,
    negativeRate: 16,
    csat: 81,
    healthScore: 82,
    openIssues: 3,
    criticalIssues: 0,
    emergingIssues: 1,
    customerRisk: 'LOW',
    lastActivity: '2026-09-18T19:05:00Z',
    features: [
      { id: 'feat_port_1', productId: 'prod_support_hub', name: 'Live Agent Chat', status: 'STABLE', feedbackCount: 38, openIssuesCount: 1 },
      { id: 'feat_port_2', productId: 'prod_support_hub', name: 'RAG Knowledge Search', status: 'STABLE', feedbackCount: 38, openIssuesCount: 2 }
    ]
  }
];

export const SEED_CUSTOMERS: Customer[] = [
  {
    id: 'cust_1',
    organizationId: 'org_acme_corp',
    name: 'Alexander Wright',
    email: 'a.wright@horizontech.io',
    company: 'Horizon Technologies',
    segment: 'High-Value Customer',
    totalFeedbackCount: 14,
    avgRating: 4.2,
    sentimentScore: 0.65,
    lastFeedbackDate: '2026-08-22T14:30:00Z',
    unresolvedIssuesCount: 1,
    healthScore: {
      score: 78,
      status: 'GOOD',
      factors: {
        sentimentScore: 82,
        feedbackFrequency: 75,
        avgRatingScore: 84,
        issueResolutionScore: 75,
        complaintSeverityScore: 70,
        engagementScore: 85
      },
      reasons: ['High account revenue ($120k ARR)', 'Recent 504 checkout issue reported', 'Overall satisfied with BI suite']
    },
    churnPrediction: {
      churnProbability: 18,
      churnRisk: 'LOW',
      churnSignals: ['1 checkout timeout reported in past 48 hours', 'Otherwise high engagement'],
      predictionReasoning: 'Customer health is solid (78/100) with low churn risk provided payment webhook issue is remediated quickly.',
      recommendedRetentionAction: 'Dispatch senior account executive check-in and assign P0 priority to Webhook ticket.'
    },
    location: {
      city: 'San Francisco',
      region: 'California',
      country: 'United States'
    }
  },
  {
    id: 'cust_2',
    organizationId: 'org_acme_corp',
    name: 'Sophia Patel',
    email: 'sophia@novacorp.de',
    company: 'Nova Digital Corp',
    segment: 'At-Risk Customer',
    totalFeedbackCount: 8,
    avgRating: 2.1,
    sentimentScore: -0.72,
    lastFeedbackDate: '2026-08-23T07:15:00Z',
    unresolvedIssuesCount: 3,
    healthScore: {
      score: 28,
      status: 'CRITICAL',
      factors: {
        sentimentScore: 14,
        feedbackFrequency: 80,
        avgRatingScore: 42,
        issueResolutionScore: 25,
        complaintSeverityScore: 20,
        engagementScore: 45
      },
      reasons: ['3 active unresolved support tickets', 'Encountered double-billing on card swap', 'Negative sentiment (-0.72)']
    },
    churnPrediction: {
      churnProbability: 84,
      churnRisk: 'CRITICAL',
      churnSignals: ['3 open complaints regarding double billing', 'Threatened cancellation on phone support', 'Low average rating (2.1/5.0)'],
      predictionReasoning: 'Customer is actively in critical churn risk territory due to billing friction and prolonged ticket resolution.',
      recommendedRetentionAction: 'Issue immediate credit refund of $150, void disputed charge, and initiate executive outreach call within 2 hours.'
    },
    location: {
      city: 'Berlin',
      region: 'Brandenburg',
      country: 'Germany'
    }
  },
  {
    id: 'cust_3',
    organizationId: 'org_acme_corp',
    name: 'Liam O’Connor',
    email: 'liam@celticstream.com',
    company: 'Celtic Stream Media',
    segment: 'Loyal Customer',
    totalFeedbackCount: 19,
    avgRating: 4.8,
    sentimentScore: 0.89,
    lastFeedbackDate: '2026-08-21T18:40:00Z',
    unresolvedIssuesCount: 0,
    healthScore: {
      score: 96,
      status: 'EXCELLENT',
      factors: {
        sentimentScore: 95,
        feedbackFrequency: 90,
        avgRatingScore: 96,
        issueResolutionScore: 100,
        complaintSeverityScore: 100,
        engagementScore: 98
      },
      reasons: ['Highest NPS advocate', 'Zero unresolved issues', 'Frequent positive feature feedback']
    },
    churnPrediction: {
      churnProbability: 3,
      churnRisk: 'LOW',
      churnSignals: ['Consistent 5-star ratings', 'Active member of beta testing cohort'],
      predictionReasoning: 'Exceptional account health with near-zero churn probability.',
      recommendedRetentionAction: 'Invite to customer advisory board and offer early preview of v3.4 release.'
    },
    location: {
      city: 'Dublin',
      region: 'Leinster',
      country: 'Ireland'
    }
  },
  {
    id: 'cust_4',
    organizationId: 'org_acme_corp',
    name: 'Grace Kim',
    email: 'grace.kim@seoulfintech.kr',
    company: 'Seoul Financial Solutions',
    segment: 'Frequent Complainer',
    totalFeedbackCount: 12,
    avgRating: 2.7,
    sentimentScore: -0.41,
    lastFeedbackDate: '2026-08-23T06:00:00Z',
    unresolvedIssuesCount: 2,
    healthScore: {
      score: 44,
      status: 'NEEDS_ATTENTION',
      factors: {
        sentimentScore: 30,
        feedbackFrequency: 85,
        avgRatingScore: 54,
        issueResolutionScore: 50,
        complaintSeverityScore: 40,
        engagementScore: 60
      },
      reasons: ['Frequent Android 14 crash submissions', 'High ticket volume', '2 unresolved issues']
    },
    churnPrediction: {
      churnProbability: 58,
      churnRisk: 'HIGH',
      churnSignals: ['Mobile app crashing during photo uploads', 'Submitted 4 bug tickets this week'],
      predictionReasoning: 'High risk of mobile abandonment if Android 14 hotfix is delayed past 48 hours.',
      recommendedRetentionAction: 'Provide early APK build of hotfix v3.3.2 and assign dedicated mobile engineer.'
    },
    location: {
      city: 'Seoul',
      region: 'Gyeonggi',
      country: 'South Korea'
    }
  },
  {
    id: 'cust_5',
    organizationId: 'org_acme_corp',
    name: 'Mateo Hernandez',
    email: 'mateo@solargrid.es',
    company: 'SolarGrid Systems',
    segment: 'New Customer',
    totalFeedbackCount: 3,
    avgRating: 4.0,
    sentimentScore: 0.5,
    lastFeedbackDate: '2026-08-20T11:20:00Z',
    unresolvedIssuesCount: 0,
    healthScore: {
      score: 80,
      status: 'GOOD',
      factors: {
        sentimentScore: 75,
        feedbackFrequency: 40,
        avgRatingScore: 80,
        issueResolutionScore: 100,
        complaintSeverityScore: 100,
        engagementScore: 70
      },
      reasons: ['Smooth onboarding in Spanish', 'Prompt customer support reply', 'Positive initial feedback']
    },
    churnPrediction: {
      churnProbability: 12,
      churnRisk: 'LOW',
      churnSignals: ['Positive initial sentiment'],
      predictionReasoning: 'Newly onboarded account showing positive adoption trajectory.',
      recommendedRetentionAction: 'Send onboarding satisfaction survey and offer free optimization workshop.'
    },
    location: {
      city: 'Madrid',
      region: 'Community of Madrid',
      country: 'Spain'
    }
  },
  {
    id: 'cust_6',
    organizationId: 'org_acme_corp',
    name: 'Fatima Al-Mansoor',
    email: 'fatima@gulfretail.ae',
    company: 'Gulf Retail Group',
    segment: 'High-Value Customer',
    totalFeedbackCount: 11,
    avgRating: 3.5,
    sentimentScore: 0.2,
    lastFeedbackDate: '2026-08-22T09:45:00Z',
    unresolvedIssuesCount: 1,
    healthScore: {
      score: 68,
      status: 'GOOD',
      factors: {
        sentimentScore: 60,
        feedbackFrequency: 70,
        avgRatingScore: 70,
        issueResolutionScore: 75,
        complaintSeverityScore: 65,
        engagementScore: 72
      },
      reasons: ['High transaction volume across Middle East', 'Awaiting Multi-Currency AED support']
    },
    churnPrediction: {
      churnProbability: 26,
      churnRisk: 'MEDIUM',
      churnSignals: ['Requested multi-currency settlement feature', '1 open ticket on currency conversion fees'],
      predictionReasoning: 'Medium churn risk tied to feature availability for local UAE Dirham settlement.',
      recommendedRetentionAction: 'Inform about upcoming Multi-Currency release in Q4 roadmap.'
    },
    location: {
      city: 'Dubai',
      region: 'Dubai Emirate',
      country: 'United Arab Emirates'
    }
  },
  {
    id: 'cust_7',
    organizationId: 'org_acme_corp',
    name: 'Priya Sundaram',
    email: 'priya.sundaram@chennaitech.in',
    company: 'Chennai Tech Innovators',
    segment: 'Loyal Customer',
    totalFeedbackCount: 16,
    avgRating: 4.7,
    sentimentScore: 0.85,
    lastFeedbackDate: '2026-08-23T05:20:00Z',
    unresolvedIssuesCount: 0,
    healthScore: {
      score: 94,
      status: 'EXCELLENT',
      factors: {
        sentimentScore: 92,
        feedbackFrequency: 88,
        avgRatingScore: 94,
        issueResolutionScore: 100,
        complaintSeverityScore: 95,
        engagementScore: 96
      },
      reasons: ['Submitted multilingual Tamil/English praise', 'Zero open incidents', 'Fast CSAT responses']
    },
    churnPrediction: {
      churnProbability: 5,
      churnRisk: 'LOW',
      churnSignals: ['High NPS advocate in APAC region'],
      predictionReasoning: 'Highly engaged account with stellar sentiment.',
      recommendedRetentionAction: 'Feature case study in regional APAC customer spotlight.'
    },
    location: {
      city: 'Chennai',
      region: 'Tamil Nadu',
      country: 'India'
    }
  },
  {
    id: 'cust_8',
    organizationId: 'org_acme_corp',
    name: 'Rajesh Sharma',
    email: 'rajesh@bangalorefin.in',
    company: 'Bangalore FinTech Labs',
    segment: 'At-Risk Customer',
    totalFeedbackCount: 9,
    avgRating: 2.4,
    sentimentScore: -0.65,
    lastFeedbackDate: '2026-08-23T04:10:00Z',
    unresolvedIssuesCount: 2,
    healthScore: {
      score: 32,
      status: 'AT_RISK',
      factors: {
        sentimentScore: 20,
        feedbackFrequency: 75,
        avgRatingScore: 48,
        issueResolutionScore: 40,
        complaintSeverityScore: 30,
        engagementScore: 50
      },
      reasons: ['Submitted Hindi payment failure feedback', '2 open tickets regarding UPI webhook drops']
    },
    churnPrediction: {
      churnProbability: 72,
      churnRisk: 'HIGH',
      churnSignals: ['Payment failure on UPI webhook renewal', 'Critical priority complaint logged'],
      predictionReasoning: 'High risk of payment churn in Indian market without dedicated UPI webhook queue.',
      recommendedRetentionAction: 'Prioritize UPI webhook adapter fix and schedule success engineering call.'
    },
    location: {
      city: 'Bangalore',
      region: 'Karnataka',
      country: 'India'
    }
  }
];

export const RAW_FEEDBACK_TEMPLATES = [
  // Payments & Checkout (Negative / Critical)
  {
    text: "Our checkout page threw a 504 gateway timeout twice today during peak billing hours. We lost approximately 14 customer upgrades because the Stripe webhook was dropped! This is unacceptable for an enterprise tier.",
    product: 'prod_pay_gateway',
    productName: 'Acme Pay Engine',
    rating: 1,
    source: 'ZENDESK',
    sentiment: 'NEGATIVE' as const,
    score: -0.92,
    emotion: 'ANGRY' as const,
    intent: 'BUG_REPORT' as const,
    priority: 'CRITICAL' as const,
    urgency: 10,
    topics: ['Payments', 'Webhooks', 'Checkout', 'Server Outage'],
    keywords: ['gateway timeout', 'lost upgrades', 'webhook dropped', 'billing hours'],
    aspects: [
      { aspect: 'Payment Gateway', sentiment: 'NEGATIVE' as const, quote: '504 gateway timeout during peak billing hours' },
      { aspect: 'Reliability', sentiment: 'NEGATIVE' as const, quote: 'lost approximately 14 customer upgrades' }
    ],
    summary: 'Critical checkout gateway timeout caused 14 lost enterprise subscription upgrades.',
    recommendation: {
      issue: 'Recurring 504 timeouts on payment webhook dispatcher during traffic spikes.',
      evidence: 'Multiple enterprise customers reporting lost upgrade conversions and dropped events.',
      action: 'Scale webhook worker pool horizontally and implement exponential backoff buffer.',
      expectedImpact: 'Eliminate dropped checkout events and prevent revenue churn.',
      priority: 'CRITICAL' as const
    }
  },
  {
    text: "We were double billed on invoice #INV-88291 after changing our credit card. The customer support agent resolved the refund quickly, but why did your automated billing engine charge both cards?",
    product: 'prod_pay_gateway',
    productName: 'Acme Pay Engine',
    rating: 2,
    source: 'MANUAL',
    sentiment: 'NEGATIVE' as const,
    score: -0.74,
    emotion: 'FRUSTRATED' as const,
    intent: 'REFUND_REQUEST' as const,
    priority: 'HIGH' as const,
    urgency: 8,
    topics: ['Billing', 'Refunds', 'Customer Support', 'Payment Engine'],
    keywords: ['double billed', 'refund', 'automated billing', 'credit card'],
    aspects: [
      { aspect: 'Billing Accuracy', sentiment: 'NEGATIVE' as const, quote: 'double billed after changing card' },
      { aspect: 'Customer Support', sentiment: 'POSITIVE' as const, quote: 'agent resolved the refund quickly' }
    ],
    summary: 'Double charge occurred during credit card replacement; refund handled swiftly by support.',
    recommendation: {
      issue: 'Idempotency failure when updating default payment source on active subscriptions.',
      evidence: 'Simultaneous charges posted to both old token and new card token.',
      action: 'Enforce single-active payment method mutex lock before triggering scheduled invoice charges.',
      expectedImpact: 'Prevent redundant payment captures and reduce support ticket volume by 15%.',
      priority: 'HIGH' as const
    }
  },
  // Mobile App (Feature Request / Mixed)
  {
    text: "Please add Dark Mode to the iOS and Android applications. Working late at night in our server rooms is blinding with the pure white background. Other than that, push alerts are instant and super reliable!",
    product: 'prod_mobile_app',
    productName: 'Acme Mobile App (iOS & Android)',
    rating: 4,
    source: 'APP_STORE',
    sentiment: 'POSITIVE' as const,
    score: 0.65,
    emotion: 'SATISFIED' as const,
    intent: 'FEATURE_REQUEST' as const,
    priority: 'MEDIUM' as const,
    urgency: 4,
    topics: ['Mobile App', 'UI/UX', 'Dark Mode', 'Push Notifications'],
    keywords: ['dark mode', 'server rooms', 'push alerts instant', 'blinding white'],
    aspects: [
      { aspect: 'UI/UX & Accessibility', sentiment: 'NEGATIVE' as const, quote: 'blinding with pure white background' },
      { aspect: 'Push Notifications', sentiment: 'POSITIVE' as const, quote: 'push alerts are instant and super reliable' }
    ],
    summary: 'Customer requests Dark Mode for night shift monitoring while praising push notification reliability.',
    recommendation: {
      issue: 'High demand for system-aware dark theme among DevOps and on-call engineers.',
      evidence: 'Over 80+ distinct customer requests citing eye strain in dim environments.',
      action: 'Prioritize OLED dark palette in upcoming v3.4 mobile sprint.',
      expectedImpact: 'Boost App Store rating by +0.3 stars and improve user session duration.',
      priority: 'MEDIUM' as const
    }
  },
  {
    text: "The latest mobile update keeps crashing on Android 14 whenever I attempt to upload a photo to an incident ticket. It closes immediately with no error log. Please fix ASAP.",
    product: 'prod_mobile_app',
    productName: 'Acme Mobile App (iOS & Android)',
    rating: 1,
    source: 'APP_STORE',
    sentiment: 'NEGATIVE' as const,
    score: -0.88,
    emotion: 'FRUSTRATED' as const,
    intent: 'BUG_REPORT' as const,
    priority: 'HIGH' as const,
    urgency: 9,
    topics: ['Mobile App', 'Android Crash', 'Image Upload', 'Incident Tickets'],
    keywords: ['keeps crashing', 'Android 14', 'upload photo', 'closes immediately'],
    aspects: [
      { aspect: 'Android Stability', sentiment: 'NEGATIVE' as const, quote: 'keeps crashing whenever I upload photo' },
      { aspect: 'Crash Reporting', sentiment: 'NEGATIVE' as const, quote: 'closes immediately with no error log' }
    ],
    summary: 'Android 14 photo attachment crashes app instantly without error capture.',
    recommendation: {
      issue: 'Scoped storage permission exception on Android 14 image picker intent.',
      evidence: 'Multiple crashes reported on Android 14 devices during file attach workflow.',
      action: 'Update photo picker intent to AndroidX PhotoPicker API without requiring full storage permissions.',
      expectedImpact: 'Resolve crash loop for all modern Android users.',
      priority: 'HIGH' as const
    }
  },
  // BI Suite & Analytics (Praise / High CSAT)
  {
    text: "The new streaming chart visualizer in Acme BI Suite is simply incredible. We cut our weekly board reporting time from 4 hours down to 10 minutes. The automated PDF export is crisp and beautiful.",
    product: 'prod_analytics_bi',
    productName: 'Acme Realtime BI Suite',
    rating: 5,
    source: 'PUBLIC_FORM',
    sentiment: 'POSITIVE' as const,
    score: 0.96,
    emotion: 'EXCITED' as const,
    intent: 'PRAISE' as const,
    priority: 'LOW' as const,
    urgency: 1,
    topics: ['Analytics', 'Reporting', 'Performance', 'UI/UX'],
    keywords: ['streaming chart', 'reporting time cut', 'PDF export crisp', 'incredible'],
    aspects: [
      { aspect: 'Streaming Visualizer', sentiment: 'POSITIVE' as const, quote: 'simply incredible' },
      { aspect: 'PDF Reporting', sentiment: 'POSITIVE' as const, quote: 'cut reporting time from 4 hours to 10 mins' }
    ],
    summary: 'Executive customer commends streaming visualizer and automated PDF report speed.',
    recommendation: {
      issue: 'Opportunity to highlight automated PDF reporting as key enterprise selling feature.',
      evidence: 'NPS in analytics module reached +68 with continuous praise on board-ready exports.',
      action: 'Feature automated executive reports in product marketing case studies.',
      expectedImpact: 'Increase enterprise tier upsells by demonstrating tangible ROI.',
      priority: 'LOW' as const
    }
  },
  {
    text: "I love the dashboard flexibility, but when querying datasets with over 2 million rows, the browser tab consumes 3GB of RAM and stutters. Would love to have server-side pagination for raw data tables.",
    product: 'prod_analytics_bi',
    productName: 'Acme Realtime BI Suite',
    rating: 3,
    source: 'API',
    sentiment: 'NEUTRAL' as const,
    score: 0.12,
    emotion: 'CONFUSED' as const,
    intent: 'FEATURE_REQUEST' as const,
    priority: 'MEDIUM' as const,
    urgency: 5,
    topics: ['Analytics', 'Performance', 'Memory Usage', 'Pagination'],
    keywords: ['2 million rows', '3GB RAM', 'stutters', 'server-side pagination'],
    aspects: [
      { aspect: 'Dashboard Flexibility', sentiment: 'POSITIVE' as const, quote: 'love the dashboard flexibility' },
      { aspect: 'Large Dataset Performance', sentiment: 'NEGATIVE' as const, quote: 'consumes 3GB RAM and stutters on 2M rows' }
    ],
    summary: 'Customer requests virtualized server-side pagination to mitigate client memory spikes on massive datasets.',
    recommendation: {
      issue: 'Client-side table component attempts to mount entire unpaginated query payload in DOM.',
      evidence: 'High RAM consumption (>2.5GB) and frame drops during analytical exploration.',
      action: 'Implement windowed virtual scrolling and cursor-based server pagination.',
      expectedImpact: 'Cap browser memory below 200MB regardless of dataset size.',
      priority: 'MEDIUM' as const
    }
  },
  // Cloud Platform (Mixed / High Impact)
  {
    text: "Cluster provisioning is blistering fast (under 30 seconds!), which is best in class. However, the documentation for VPC peering with AWS is outdated and missing the transit gateway configuration steps.",
    product: 'prod_cloud_platform',
    productName: 'Acme Cloud Platform',
    rating: 4,
    source: 'MANUAL',
    sentiment: 'POSITIVE' as const,
    score: 0.68,
    emotion: 'SATISFIED' as const,
    intent: 'GENERAL_FEEDBACK' as const,
    priority: 'MEDIUM' as const,
    urgency: 4,
    topics: ['Cloud Platform', 'Documentation', 'Cluster Provisioning', 'Networking'],
    keywords: ['blistering fast', 'under 30s', 'outdated docs', 'VPC peering AWS'],
    aspects: [
      { aspect: 'Provisioning Speed', sentiment: 'POSITIVE' as const, quote: 'blistering fast under 30 seconds' },
      { aspect: 'VPC Documentation', sentiment: 'NEGATIVE' as const, quote: 'documentation for AWS VPC peering is outdated' }
    ],
    summary: 'Praise for ultra-fast cluster spin-up contrasted with outdated multi-cloud VPC networking guides.',
    recommendation: {
      issue: 'Outdated developer documentation causing friction in hybrid cloud setups.',
      evidence: 'Multiple engineering leads requesting step-by-step AWS Transit Gateway examples.',
      action: 'Update Cloud Networking documentation section with complete Terraform blueprints.',
      expectedImpact: 'Accelerate enterprise onboarding timeline by 40%.',
      priority: 'MEDIUM' as const
    }
  },
  {
    text: "We had a production database outage on us-east-1 last Tuesday. While the automated failover worked, we received zero incident status notifications until 45 minutes after the event was resolved!",
    product: 'prod_cloud_platform',
    productName: 'Acme Cloud Platform',
    rating: 2,
    source: 'ZENDESK',
    sentiment: 'NEGATIVE' as const,
    score: -0.78,
    emotion: 'WORRIED' as const,
    intent: 'COMPLAINT' as const,
    priority: 'HIGH' as const,
    urgency: 8,
    topics: ['Cloud Platform', 'Incident Management', 'Outage', 'Notifications'],
    keywords: ['production outage', 'automated failover worked', 'zero incident notifications', '45 minutes late'],
    aspects: [
      { aspect: 'Automated Failover', sentiment: 'POSITIVE' as const, quote: 'automated failover worked' },
      { aspect: 'Incident Communication', sentiment: 'NEGATIVE' as const, quote: 'zero incident status notifications until 45 mins late' }
    ],
    summary: 'Failover executed successfully but customer communications were delayed by 45 minutes.',
    recommendation: {
      issue: 'Status page incident automation pipeline is disconnected from telemetry monitors.',
      evidence: 'Customers learned of outage through their own logs before Acme status page updated.',
      action: 'Hook automated health check degradation signals directly to incident broadcast channels.',
      expectedImpact: 'Reduce time-to-first-incident-notification from 45 mins down to <3 mins.',
      priority: 'HIGH' as const
    }
  },
  // Support & Helpdesk
  {
    text: "Agent Maria on the Live Support team went above and beyond to help us configure our SAML SSO integration. She stayed on a screen share for 40 minutes until everything verified successfully. Give her a raise!",
    product: 'prod_support_hub',
    productName: 'Acme Support & Helpdesk',
    rating: 5,
    source: 'PUBLIC_FORM',
    sentiment: 'POSITIVE' as const,
    score: 0.98,
    emotion: 'HAPPY' as const,
    intent: 'PRAISE' as const,
    priority: 'LOW' as const,
    urgency: 1,
    topics: ['Customer Support', 'SAML SSO', 'Live Chat', 'Onboarding'],
    keywords: ['above and beyond', 'SAML SSO', 'screen share', 'give her a raise'],
    aspects: [
      { aspect: 'Customer Support Quality', sentiment: 'POSITIVE' as const, quote: 'went above and beyond on 40 min screen share' },
      { aspect: 'SSO Onboarding', sentiment: 'POSITIVE' as const, quote: 'everything verified successfully' }
    ],
    summary: 'Customer gives stellar praise to support agent for hands-on SAML SSO resolution.',
    recommendation: {
      issue: 'Opportunity to recognize outstanding support representatives and codify SSO troubleshooting best practices.',
      evidence: 'Highest possible CSAT rating (100%) on SSO onboarding interactions.',
      action: 'Document Maria’s SSO verification checklist into the public knowledge base.',
      expectedImpact: 'Enable self-serve SSO configuration and lower ticket volume.',
      priority: 'LOW' as const
    }
  }
];

export function generateSeedFeedbacks(count = 520): Feedback[] {
  const feedbacks: Feedback[] = [];
  const now = new Date('2026-08-23T08:00:00Z');
  
  const customerList = SEED_CUSTOMERS;
  const products = SEED_PRODUCTS;

  const names = [
    'Emma Wilson', 'Liam Becker', 'Noah Schmidt', 'Olivia Martin', 'Lucas Rossi',
    'Mia Tanaka', 'Ethan Hunt', 'Ava Tremblay', 'Benjamin Scott', 'Isabella Gomez',
    'Oliver Hansen', 'Charlotte Laurent', 'Henry Zhang', 'Amelia Duarte', 'Jack Kowalski',
    'Harper Jensen', 'Sebastian Vance', 'Evelyn Taylor', 'Jameson Reed', 'Abigail Thorne',
    'Julianna Sterling', 'Dominic Cruz', 'Nora Lindqvist', 'Carter Hayes', 'Maya Lin'
  ];

  const domains = ['techcorp.com', 'acmecloud.io', 'finserve.global', 'hyperdata.net', 'solaris.dev', 'strata.co'];

  for (let i = 0; i < count; i++) {
    const template = RAW_FEEDBACK_TEMPLATES[i % RAW_FEEDBACK_TEMPLATES.length];
    const customer = customerList[i % customerList.length];
    const randName = names[i % names.length];
    const randEmail = `${randName.toLowerCase().replace(' ', '.')}${i % 70}@${domains[i % domains.length]}`;
    
    // Spread dates over past 30 days
    const daysAgo = Math.floor(Math.pow(Math.random(), 1.4) * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const minsAgo = Math.floor(Math.random() * 60);
    const feedbackDate = new Date(now.getTime() - (daysAgo * 86400000 + hoursAgo * 3600000 + minsAgo * 60000)).toISOString();

    // Add subtle variation to text
    const textVariations = [
      template.text,
      `[Ticket #${10000 + i}] ${template.text}`,
      `${template.text} Please let our operations team know once an update is scheduled.`,
      `Regarding ${template.productName}: ${template.text}`,
      `${template.text} - Sent from our production workspace.`
    ];
    const chosenText = textVariations[i % textVariations.length];

    const feedbackItem: Feedback = {
      id: `fb_${1000 + i}`,
      organizationId: 'org_acme_corp',
      customerName: i < customerList.length ? customer.name : randName,
      customerEmail: i < customerList.length ? customer.email : randEmail,
      customerSegment: customer.segment,
      productId: template.product,
      productName: template.productName,
      rating: template.rating,
      text: chosenText,
      source: template.source as any,
      language: 'en',
      status: (i % 8 === 0 ? 'RESOLVED' : i % 5 === 0 ? 'REVIEWED' : 'ANALYZED'),
      createdAt: feedbackDate,
      updatedAt: feedbackDate,
      tags: [...template.topics.slice(0, 2), template.intent],
      analysis: {
        sentiment: template.sentiment,
        score: template.score,
        confidence: 0.88 + (i % 12) * 0.01,
        emotion: template.emotion,
        emotionConfidence: 0.85 + (i % 14) * 0.01,
        intent: template.intent,
        topics: template.topics,
        keywords: template.keywords,
        entities: [template.productName, 'Acme Cloud'],
        priority: template.priority,
        urgency: template.urgency,
        aspects: template.aspects,
        summary: template.summary,
        recommendation: template.recommendation,
        analyzedAt: feedbackDate,
        provider: 'gemini'
      }
    };

    feedbacks.push(feedbackItem);
  }

  // Sort descending by date
  feedbacks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return feedbacks;
}

export const SEED_ISSUES: Issue[] = [
  {
    id: 'iss_101',
    organizationId: 'org_acme_corp',
    title: '504 Gateway Timeouts during Payment Webhook Dispatch',
    description: 'Multiple enterprise customers experiencing dropped checkout events during high-traffic intervals.',
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    category: 'Payments & Infrastructure',
    productId: 'prod_pay_gateway',
    productName: 'Acme Pay Engine',
    assignedTo: 'usr_analyst_1',
    assignedToName: 'Elena Rostova',
    feedbackIds: ['fb_1000', 'fb_1009', 'fb_1018'],
    feedbackCount: 38,
    createdAt: '2026-08-22T09:00:00Z',
    updatedAt: '2026-08-23T07:30:00Z',
  },
  {
    id: 'iss_102',
    organizationId: 'org_acme_corp',
    title: 'Android 14 Photo Attachment Crash on Ticket Upload',
    description: 'Application abruptly closes when accessing system gallery on Android 14 API level 34.',
    priority: 'HIGH',
    status: 'OPEN',
    category: 'Mobile Application',
    productId: 'prod_mobile_app',
    productName: 'Acme Mobile App (iOS & Android)',
    assignedTo: 'usr_analyst_2',
    assignedToName: 'David Chen',
    feedbackIds: ['fb_1003', 'fb_1012'],
    feedbackCount: 24,
    createdAt: '2026-08-21T14:15:00Z',
    updatedAt: '2026-08-22T16:00:00Z',
  },
  {
    id: 'iss_103',
    organizationId: 'org_acme_corp',
    title: 'AWS VPC Peering Documentation Outdated',
    description: 'Developer guides lack AWS Transit Gateway route table configuration causing onboarding delays.',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    category: 'Developer Documentation',
    productId: 'prod_cloud_platform',
    productName: 'Acme Cloud Platform',
    assignedTo: 'usr_manager_1',
    assignedToName: 'Marcus Vance',
    feedbackIds: ['fb_1006'],
    feedbackCount: 16,
    createdAt: '2026-08-18T10:00:00Z',
    updatedAt: '2026-08-22T11:00:00Z',
    resolvedAt: '2026-08-22T11:00:00Z',
  },
  {
    id: 'iss_104',
    organizationId: 'org_acme_corp',
    title: 'Double Charge on Subscription Payment Method Swap',
    description: 'Race condition triggers dual capture when replacing default card right before scheduled billing cron.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    category: 'Billing Engine',
    productId: 'prod_pay_gateway',
    productName: 'Acme Pay Engine',
    assignedTo: 'usr_analyst_1',
    assignedToName: 'Elena Rostova',
    feedbackIds: ['fb_1001', 'fb_1010'],
    feedbackCount: 19,
    createdAt: '2026-08-20T08:30:00Z',
    updatedAt: '2026-08-23T06:00:00Z',
  }
];

export const SEED_FEATURE_REQUESTS: FeatureRequest[] = [
  {
    id: 'feat_201',
    organizationId: 'org_acme_corp',
    title: 'Native Dark Mode Theme for Mobile & Web',
    description: 'Implement dark/night theme across iOS, Android, and Web clients for on-call engineers working in low-light environments.',
    category: 'UI/UX & Accessibility',
    productId: 'prod_mobile_app',
    productName: 'Acme Mobile App (iOS & Android)',
    votes: 142,
    sentiment: 'POSITIVE',
    demand: 'HIGH',
    status: 'PLANNED',
    feedbackIds: ['fb_1002', 'fb_1011', 'fb_1020'],
    createdAt: '2026-08-01T00:00:00Z',
    quadrant: 'QUICK_WIN',
    featurePriorityScore: 89,
    urgencyScore: 84,
    businessImpact: 'High satisfaction gain with low risk of regressions.',
    estimatedEffort: 'MEDIUM',
    roiRationale: 'Boosts daily active mobile retention by 14% and reduces night-time eye fatigue tickets.',
    customerCount: 38
  },
  {
    id: 'feat_202',
    organizationId: 'org_acme_corp',
    title: 'Server-side Cursor Pagination for Large BI Datasets',
    description: 'Virtualize table rendering and paginate records server-side for queries exceeding 1M records to preserve client RAM.',
    category: 'Performance & Big Data',
    productId: 'prod_analytics_bi',
    productName: 'Acme Realtime BI Suite',
    votes: 98,
    sentiment: 'POSITIVE',
    demand: 'HIGH',
    status: 'IN_DEVELOPMENT',
    feedbackIds: ['fb_1005', 'fb_1014'],
    createdAt: '2026-08-05T00:00:00Z',
    quadrant: 'HIGH_VALUE_HIGH_EFFORT',
    featurePriorityScore: 92,
    urgencyScore: 90,
    businessImpact: 'Prevents enterprise browser freezes when querying 500k+ row datasets.',
    estimatedEffort: 'HIGH',
    roiRationale: 'Protects $450k ARR across 6 tier-1 enterprise accounts relying on heavy data analytics.',
    customerCount: 22
  },
  {
    id: 'feat_203',
    organizationId: 'org_acme_corp',
    title: 'Automated Slack / MS Teams Webhook Alerts for Critical Anomalies',
    description: 'Broadcast instant incident notifications directly into engineering channels when negative feedback spikes.',
    category: 'Integrations & Alerts',
    productId: 'prod_cloud_platform',
    productName: 'Acme Cloud Platform',
    votes: 76,
    sentiment: 'POSITIVE',
    demand: 'MEDIUM',
    status: 'UNDER_REVIEW',
    feedbackIds: ['fb_1007'],
    createdAt: '2026-08-10T00:00:00Z',
    quadrant: 'QUICK_WIN',
    featurePriorityScore: 78,
    urgencyScore: 70,
    businessImpact: 'Reduces incident MTTR by routing real-time alerts to engineering channels.',
    estimatedEffort: 'LOW',
    roiRationale: 'Drives viral adoption across developer and DevOps teams.',
    customerCount: 19
  },
  {
    id: 'feat_204',
    organizationId: 'org_acme_corp',
    title: 'Multi-Currency Settlement (EUR, GBP, JPY, INR) without Forex Markup',
    description: 'Allow European and Asian customers to bill directly in local currency with native SEPA and UPI bank debit rails.',
    category: 'Global Billing',
    productId: 'prod_pay_gateway',
    productName: 'Acme Pay Engine',
    votes: 54,
    sentiment: 'POSITIVE',
    demand: 'MEDIUM',
    status: 'PROPOSED',
    feedbackIds: ['fb_1008'],
    createdAt: '2026-08-12T00:00:00Z',
    quadrant: 'STRATEGIC_BIG_BET',
    featurePriorityScore: 85,
    urgencyScore: 76,
    businessImpact: 'Unlocks international enterprise expansion across EMEA and APAC territories.',
    estimatedEffort: 'HIGH',
    roiRationale: 'Projected +$2.1M ARR from EMEA and APAC enterprise contracts currently delayed by forex constraints.',
    customerCount: 15
  }
];

export const SEED_ROOT_CAUSES: RootCauseReport[] = [
  {
    id: 'rc_1',
    feedbackId: 'fb_1000',
    title: 'Acme Pay Gateway 504 Timeout During Peak Billing',
    rootCause: 'Connection pool exhaustion on upstream payment gateway microservice when webhook retries surge past 2,500 req/sec.',
    systemicIssue: 'Lack of distributed rate-limiting and asynchronous circuit breaker on payment broker queue.',
    departmentsInvolved: ['Payments Platform', 'DevOps & SRE', 'Billing Engineering'],
    actionItems: [
      { action: 'Scale RDS Aurora read replicas from 2 to 6 nodes during peak hours', owner: 'DevOps Lead', eta: '24 Hours', priority: 'CRITICAL', status: 'IN_PROGRESS' },
      { action: 'Implement BullMQ Redis queue with exponential backoff on webhook dispatch', owner: 'Payments Architect', eta: '3 Days', priority: 'HIGH', status: 'PLANNED' },
      { action: 'Update SDK documentation with webhook idempotency keys', owner: 'Technical Writer', eta: '5 Days', priority: 'MEDIUM', status: 'OPEN' }
    ],
    preventionStrategy: 'Deploy circuit-breaker threshold at 85% capacity with graceful degradation to queued async verification.',
    confidenceScore: 0.94,
    businessRisk: 'CRITICAL',
    estimatedRevenueAtRisk: '$180,000 / Quarter',
    generatedAt: '2026-08-23T08:00:00Z'
  },
  {
    id: 'rc_2',
    feedbackId: 'fb_1003',
    title: 'Android 14 Photo Attachment Fatal Crash',
    rootCause: 'Scoped storage permission regression in Android 14 API 34 where FileProvider URI permissions are revoked prematurely before multipart upload completes.',
    systemicIssue: 'Missing regression tests on Android 14 API 34 emulators in CI/CD pipeline.',
    departmentsInvolved: ['Mobile Engineering', 'QA Automation'],
    actionItems: [
      { action: 'Release Hotfix v3.3.2 using Android Photo Picker API (ActivityResultContracts)', owner: 'Mobile Lead', eta: '12 Hours', priority: 'CRITICAL', status: 'IN_PROGRESS' },
      { action: 'Add Android 14 device farm matrix to GitHub Actions test suite', owner: 'QA Architect', eta: '2 Days', priority: 'HIGH', status: 'PLANNED' }
    ],
    preventionStrategy: 'Enforce modern Android Photo Picker contract avoiding direct file path access across all mobile clients.',
    confidenceScore: 0.96,
    businessRisk: 'HIGH',
    estimatedRevenueAtRisk: '$45,000 / Month',
    generatedAt: '2026-08-22T17:30:00Z'
  }
];

export const SEED_ISSUE_CLUSTERS: IssueCluster[] = [
  {
    id: 'cluster_1',
    name: 'Payment Processing Timeouts & Double Billing',
    summary: 'Spike in customer reports of 504 timeouts, dropped webhook notifications, and duplicate invoices during subscription upgrade.',
    feedbackCount: 38,
    affectedCustomersCount: 16,
    sentiment: 'NEGATIVE',
    avgSentimentScore: -0.76,
    trend: 'INCREASING',
    trendPercentage: 43.5,
    topKeywords: ['checkout', '504 timeout', 'double charge', 'webhook', 'gateway', 'invoice'],
    rootCauseHypothesis: 'Database connection starvation during concurrent credit card change cron jobs.',
    severity: 'CRITICAL',
    sampleFeedbackIds: ['fb_1000', 'fb_1001', 'fb_1009', 'fb_1010']
  },
  {
    id: 'cluster_2',
    name: 'Android 14 Mobile Attachment Crashes',
    summary: 'Crash on photo upload or attachment submission affecting devices updated to Android 14.',
    feedbackCount: 24,
    affectedCustomersCount: 14,
    sentiment: 'NEGATIVE',
    avgSentimentScore: -0.62,
    trend: 'INCREASING',
    trendPercentage: 28.0,
    topKeywords: ['crash', 'android 14', 'photo', 'attachment', 'closes', 'upload'],
    rootCauseHypothesis: 'Android 14 photo picker permission lifecycle termination.',
    severity: 'HIGH',
    sampleFeedbackIds: ['fb_1003', 'fb_1012']
  },
  {
    id: 'cluster_3',
    name: 'Realtime BI Large Dataset Performance',
    summary: 'Browser tab memory pressure and slow table rendering when loading enterprise queries over 100,000 rows.',
    feedbackCount: 19,
    affectedCustomersCount: 9,
    sentiment: 'NEUTRAL',
    avgSentimentScore: -0.15,
    trend: 'STABLE',
    trendPercentage: 2.1,
    topKeywords: ['lag', '100k rows', 'pagination', 'browser freeze', 'export csv', 'memory'],
    rootCauseHypothesis: 'DOM rendering without virtual scroll pagination.',
    severity: 'MEDIUM',
    sampleFeedbackIds: ['fb_1005', 'fb_1014']
  },
  {
    id: 'cluster_4',
    name: 'Dark Mode Theme Surge Demand',
    summary: 'Strong positive desire for dark theme support across web and mobile dashboards.',
    feedbackCount: 42,
    affectedCustomersCount: 31,
    sentiment: 'POSITIVE',
    avgSentimentScore: 0.82,
    trend: 'INCREASING',
    trendPercentage: 64.0,
    topKeywords: ['dark mode', 'night theme', 'oled', 'eye strain', 'ui design'],
    rootCauseHypothesis: 'Product gap in nighttime usability for operations & monitoring engineers.',
    severity: 'LOW',
    sampleFeedbackIds: ['fb_1002', 'fb_1011', 'fb_1020']
  }
];

export const SEED_KNOWLEDGE_DOCS: KnowledgeDocument[] = [
  {
    id: 'kb_1',
    title: 'Payment Gateway Error Codes & Troubleshooting (504 & 402)',
    category: 'Billing & Payments',
    content: 'When receiving 504 Gateway Timeout during checkout, verify webhook endpoints and retry after 60 seconds with idempotency key. For double billing occurrences on card swap, check if active subscription invoice was queued before payment method update. Issue refund via Billing -> Refunds -> Instant Credit.',
    tags: ['payment', '504', 'timeout', 'double bill', 'refund', 'invoice', 'gateway'],
    lastUpdated: '2026-08-20T00:00:00Z',
    sourceUrl: 'https://docs.acme.corp/billing/troubleshooting'
  },
  {
    id: 'kb_2',
    title: 'Mobile App Troubleshooting: Android 14 Permission Fixes',
    category: 'Mobile & Device Support',
    content: 'For crashes on Android 14 during photo attachment, guide user to Settings > Apps > Acme > Permissions > Photos and Videos > Select "Always Allow All Photos" or use the latest v3.3.2 hotfix build from Google Play internal track.',
    tags: ['android', 'crash', 'photo', 'attachment', 'permissions', 'mobile'],
    lastUpdated: '2026-08-22T10:00:00Z',
    sourceUrl: 'https://docs.acme.corp/mobile/android-14'
  },
  {
    id: 'kb_3',
    title: 'Realtime BI Query Optimization & Virtual Scrolling',
    category: 'Analytics & BI',
    content: 'For large datasets exceeding 50,000 records, enable Server-Side Filtering and limit query window to 30 days. Exporting full CSV extracts should be scheduled via Background Exports to avoid client browser memory exhaustion.',
    tags: ['bi', 'query', 'pagination', 'memory', 'performance', 'csv'],
    lastUpdated: '2026-08-15T00:00:00Z',
    sourceUrl: 'https://docs.acme.corp/analytics/query-opt'
  },
  {
    id: 'kb_4',
    title: 'Enterprise SLA & Severity Level Definitions',
    category: 'Support Policy',
    content: 'P0 Critical incidents (system down, payment outage) require 15-minute response time and hourly updates. P1 High incidents (major workflow degraded) require 1-hour response time. P2 Medium incidents require 4-hour SLA.',
    tags: ['sla', 'escalation', 'policy', 'critical', 'p0', 'p1'],
    lastUpdated: '2026-08-01T00:00:00Z',
    sourceUrl: 'https://docs.acme.corp/support/sla'
  }
];

export const SEED_COPILOT_TICKETS: CopilotTicket[] = [
  {
    id: 'tkt_1',
    feedbackId: 'fb_1000',
    customerName: 'Alexander Wright',
    customerEmail: 'a.wright@horizontech.io',
    customerCompany: 'Horizon Technologies',
    subject: 'Urgent: 504 Timeout during checkout upgrade',
    originalFeedback: 'Our checkout page threw a 504 gateway timeout twice today during peak billing hours. Please fix this immediately, we are losing enterprise transactions.',
    status: 'OPEN',
    priority: 'CRITICAL',
    assignedAgent: 'Elena Rostova',
    suggestedReply: 'Dear Alexander,\n\nThank you for alerting our engineering team. We identified a transient connection surge on our payment gateway broker that triggered the 504 timeouts. Our infrastructure team has scaled the gateway connection pool and deployed rate-limit buffers to restore normal processing.\n\nCould you please re-attempt the transaction? We have verified your account telemetry and are monitoring your checkout flow directly.\n\nBest regards,\nAcme Enterprise Support',
    confidenceScore: 0.95,
    citations: [
      { docId: 'kb_1', title: 'Payment Gateway Error Codes & Troubleshooting (504 & 402)', excerpt: 'When receiving 504 Gateway Timeout during checkout, verify webhook endpoints and retry after 60 seconds with idempotency key.', relevanceScore: 0.98 },
      { docId: 'kb_4', title: 'Enterprise SLA & Severity Level Definitions', excerpt: 'P0 Critical incidents require 15-minute response time and hourly updates.', relevanceScore: 0.88 }
    ],
    recommendedActions: [
      'Scale payment gateway pods from 4 to 8 replicas',
      'Verify transaction log #TX-98421 on Stripe bridge',
      'Notify account manager for SLA review'
    ],
    createdAt: '2026-08-23T07:40:00Z'
  },
  {
    id: 'tkt_2',
    feedbackId: 'fb_1003',
    customerName: 'Grace Kim',
    customerEmail: 'grace.kim@seoulfintech.kr',
    customerCompany: 'Seoul Financial Solutions',
    subject: 'Android 14 app crash on receipt upload',
    originalFeedback: 'The latest mobile update keeps crashing on Android 14 whenever I attempt to upload a photo.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    assignedAgent: 'David Chen',
    suggestedReply: 'Hello Grace,\n\nWe apologize for the inconvenience caused by the photo upload crash on Android 14. This was traced to a permission lifecycle change in the latest Android API 34.\n\nWe have prepared Hotfix v3.3.2 which switches to the native Android Photo Picker. You can download the early build right now from our beta channel or toggle "Allow All Photos" in Android app settings as a temporary workaround.\n\nThank you for your patience,\nAcme Mobile Team',
    confidenceScore: 0.94,
    citations: [
      { docId: 'kb_2', title: 'Mobile App Troubleshooting: Android 14 Permission Fixes', excerpt: 'For crashes on Android 14 during photo attachment, guide user to Settings > Apps > Acme > Permissions > Photos and Videos > Select "Always Allow All Photos"', relevanceScore: 0.96 }
    ],
    recommendedActions: [
      'Provide APK download link for hotfix v3.3.2',
      'Mark Android 14 ticket tag for tracking'
    ],
    createdAt: '2026-08-23T06:10:00Z'
  }
];

export const SEED_COMPETITORS: CompetitorBenchmark[] = [
  {
    competitorName: 'FinStream Global',
    competitorSentiment: 0.58,
    marketShareEstimate: '28%',
    strengthsMentioned: ['Fast Multi-Currency EUR/GBP rails', 'Native Stripe & Adyen direct plug', 'Extensive localized billing'],
    weaknessesMentioned: ['Clunky legacy dashboard UI', 'Slow API webhook latency', 'Lack of real-time BI visualizer'],
    sentimentVsOurProduct: '+14% higher overall CSAT in BI and Analytics vs FinStream',
    mentionCount: 34
  },
  {
    competitorName: 'CloudPulse Analytics',
    competitorSentiment: 0.72,
    marketShareEstimate: '35%',
    strengthsMentioned: ['Fast sub-second 1M row querying', 'Pre-built SOC2 compliance templates', 'Excellent dark mode UI'],
    weaknessesMentioned: ['Very expensive per-seat pricing', 'Steep onboarding learning curve', 'Lack of automated AI insights'],
    sentimentVsOurProduct: '+28% faster time-to-value for small and medium teams',
    mentionCount: 52
  },
  {
    competitorName: 'AppMetrics Pro',
    competitorSentiment: 0.44,
    marketShareEstimate: '18%',
    strengthsMentioned: ['Cheap starter tier', 'Basic crash reporting for mobile'],
    weaknessesMentioned: ['Frequent mobile SDK memory leaks', 'Poor customer support response times', 'No root cause analysis'],
    sentimentVsOurProduct: '+42% higher enterprise reliability rating',
    mentionCount: 29
  }
];

export const SEED_RESOLVED_IMPACTS: ResolvedImpactAnalysis[] = [
  {
    issueId: 'iss_103',
    issueTitle: 'AWS VPC Peering Documentation Outdated',
    resolvedDate: '2026-08-22T11:00:00Z',
    preResolutionNegativeCount: 16,
    postResolutionNegativeCount: 1,
    sentimentShiftPercentage: 88.5,
    csatLiftPercentage: 18.2,
    estimatedSavedRevenue: '$64,000 (Avoided POC dropouts)',
    status: 'VERIFIED_EFFECTIVE'
  }
];

export const SEED_MODEL_METRICS: AIModelMetrics = {
  activeModel: 'gemini-2.5-flash',
  totalInferences: 4280,
  averageLatencyMs: 245,
  classificationAccuracy: 0.962,
  sentimentAccuracy: 0.948,
  rootCausePrecision: 0.931,
  ragRelevanceScore: 0.925,
  humanCorrectionsCount: 14,
  lastCalibrationDate: '2026-08-23T06:00:00Z',
  uptimePercentage: 99.98
};

export const SEED_INTEGRATIONS: any[] = [
  {
    id: 'int_slack',
    name: 'Slack Alerts & AI Bot',
    type: 'SLACK',
    status: 'ACTIVE',
    isEnabled: true,
    webhookUrl: 'https://hooks.slack.com/services/T00/B00/XXXX',
    triggerEvents: ['CRITICAL_FEEDBACK', 'CHURN_ALERT', 'ANOMALY_SPIKE'],
    icon: 'MessageSquare',
    webhookConfigured: true,
    lastSyncTime: '2026-08-23T08:15:00Z',
    eventsCount: 1420,
    config: { channel: '#customer-intelligence-alerts', alertOnCritical: true }
  },
  {
    id: 'int_jira',
    name: 'Jira Software Ticket Sync',
    type: 'JIRA',
    status: 'ACTIVE',
    isEnabled: true,
    webhookUrl: 'https://jira.atlassian.net/webhook',
    triggerEvents: ['P0_BUG_CREATED', 'ISSUE_PROMOTED'],
    icon: 'Bug',
    webhookConfigured: true,
    lastSyncTime: '2026-08-23T08:00:00Z',
    eventsCount: 384,
    config: { projectKey: 'PROD', issueType: 'Bug', autoCreateP0: true }
  },
  {
    id: 'int_zendesk',
    name: 'Zendesk Support Ingestion',
    type: 'ZENDESK',
    status: 'ACTIVE',
    isEnabled: true,
    webhookUrl: 'https://zendesk.com/api/v2/webhooks',
    triggerEvents: ['COPILOT_SUGGESTION', 'TICKET_INGESTED'],
    icon: 'Headphones',
    webhookConfigured: true,
    lastSyncTime: '2026-08-23T07:55:00Z',
    eventsCount: 2950,
    config: { ingestTickets: true, syncSentiment: true }
  },
  {
    id: 'int_salesforce',
    name: 'Salesforce CRM & Health Sync',
    type: 'SALESFORCE',
    status: 'ACTIVE',
    isEnabled: true,
    webhookUrl: 'https://salesforce.com/services/apexrest/webhook',
    triggerEvents: ['HEALTH_SCORE_UPDATED', 'CHURN_RISK_FLAGGED'],
    icon: 'Building2',
    webhookConfigured: true,
    lastSyncTime: '2026-08-23T07:30:00Z',
    eventsCount: 680,
    config: { syncHealthScores: true, churnAlertThreshold: 70 }
  },
  {
    id: 'int_hubspot',
    name: 'HubSpot CRM Contacts',
    type: 'HUBSPOT',
    status: 'PAUSED',
    isEnabled: false,
    webhookUrl: 'https://api.hubapi.com/webhooks/v3',
    triggerEvents: [],
    icon: 'Users',
    webhookConfigured: false,
    eventsCount: 0,
    config: {}
  },
  {
    id: 'int_linear',
    name: 'Linear Issue Tracking',
    type: 'LINEAR',
    status: 'ACTIVE',
    isEnabled: true,
    webhookUrl: 'https://api.linear.app/webhook',
    triggerEvents: ['ACTION_ITEM_ASSIGNED'],
    icon: 'Layers',
    webhookConfigured: true,
    lastSyncTime: '2026-08-23T06:45:00Z',
    eventsCount: 512,
    config: { team: 'ENGINEERING', autoTriage: true }
  }
];

export const SEED_REGIONAL_METRICS: any[] = [
  { region: 'North America', country: 'United States', city: 'San Francisco', regionCode: 'US', feedbackCount: 412, csat: 86, topComplaintTopic: 'Pagination on 500k rows', negativeRate: 0.14, churnRiskCount: 3 },
  { region: 'Western Europe', country: 'Germany', city: 'Berlin', regionCode: 'DE', feedbackCount: 184, csat: 74, topComplaintTopic: 'SEPA multi-currency support', negativeRate: 0.26, churnRiskCount: 2 },
  { region: 'Western Europe', country: 'United Kingdom', city: 'London', regionCode: 'GB', feedbackCount: 168, csat: 82, topComplaintTopic: 'VPC Peering guides', negativeRate: 0.18, churnRiskCount: 1 },
  { region: 'APAC', country: 'India', city: 'Bengaluru', regionCode: 'IN', feedbackCount: 245, csat: 80, topComplaintTopic: 'UPI webhook reliability', negativeRate: 0.20, churnRiskCount: 4 },
  { region: 'Western Europe', country: 'France', city: 'Paris', regionCode: 'FR', feedbackCount: 92, csat: 91, topComplaintTopic: 'French locale formatting', negativeRate: 0.09, churnRiskCount: 0 },
  { region: 'APAC', country: 'Japan', city: 'Tokyo', regionCode: 'JP', feedbackCount: 115, csat: 88, topComplaintTopic: 'Japanese font rendering', negativeRate: 0.12, churnRiskCount: 1 },
  { region: 'APAC', country: 'South Korea', city: 'Seoul', regionCode: 'KR', feedbackCount: 78, csat: 72, topComplaintTopic: 'Android 14 photo crash', negativeRate: 0.28, churnRiskCount: 2 },
  { region: 'Western Europe', country: 'Spain', city: 'Madrid', regionCode: 'ES', feedbackCount: 64, csat: 92, topComplaintTopic: 'Card refund speed', negativeRate: 0.08, churnRiskCount: 0 },
  { region: 'LATAM', country: 'Brazil', city: 'São Paulo', regionCode: 'BR', feedbackCount: 58, csat: 78, topComplaintTopic: 'Pix instant payment webhook', negativeRate: 0.22, churnRiskCount: 1 },
  { region: 'APAC', country: 'Australia', city: 'Sydney', regionCode: 'AU', feedbackCount: 86, csat: 89, topComplaintTopic: 'Sydney data latency', negativeRate: 0.11, churnRiskCount: 1 }
];

export const SEED_PRODUCT_TOPIC_HEATMAP: any[] = [
  { productId: 'prod_pay_gateway', productName: 'Acme Pay Engine', topic: 'Checkout Reliability', csat: 42, sentimentScore: -0.74, feedbackCount: 38, status: 'CRITICAL', topQuote: 'Payment gateway timeout during flash sales' },
  { productId: 'prod_pay_gateway', productName: 'Acme Pay Engine', topic: 'Multi-Currency', csat: 68, sentimentScore: 0.25, feedbackCount: 18, status: 'WARNING', topQuote: 'Need more local currencies support' },
  { productId: 'prod_pay_gateway', productName: 'Acme Pay Engine', topic: 'Refunds & Disputes', csat: 54, sentimentScore: -0.42, feedbackCount: 22, status: 'WARNING', topQuote: 'Refund API takes too long to acknowledge' },
  { productId: 'prod_mobile_app', productName: 'Acme Mobile App', topic: 'Android 14 Stability', csat: 38, sentimentScore: -0.68, feedbackCount: 28, status: 'CRITICAL', topQuote: 'App terminates when attaching receipt photos' },
  { productId: 'prod_mobile_app', productName: 'Acme Mobile App', topic: 'Dark Mode UI', csat: 95, sentimentScore: 0.85, feedbackCount: 46, status: 'HEALTHY', topQuote: 'The OLED dark theme is beautiful and saves battery' },
  { productId: 'prod_mobile_app', productName: 'Acme Mobile App', topic: 'Push Notifications', csat: 84, sentimentScore: 0.52, feedbackCount: 15, status: 'HEALTHY', topQuote: 'Push alerts are instantaneous' },
  { productId: 'prod_analytics_bi', productName: 'Acme Realtime BI Suite', topic: 'Big Dataset Latency', csat: 62, sentimentScore: -0.22, feedbackCount: 31, status: 'WARNING', topQuote: 'Dashboard renders slow over 1M records' },
  { productId: 'prod_analytics_bi', productName: 'Acme Realtime BI Suite', topic: 'Visualization Widgets', csat: 96, sentimentScore: 0.91, feedbackCount: 54, status: 'HEALTHY', topQuote: 'Chart customizability is best in class' },
  { productId: 'prod_cloud_platform', productName: 'Acme Cloud Platform', topic: 'VPC & Networking', csat: 82, sentimentScore: 0.38, feedbackCount: 20, status: 'HEALTHY', topQuote: 'VPC peering setup was straightforward' },
  { productId: 'prod_cloud_platform', productName: 'Acme Cloud Platform', topic: 'API Rate Limits', csat: 65, sentimentScore: -0.35, feedbackCount: 16, status: 'WARNING', topQuote: 'Rate limit headers should be clearer' }
];

export const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    organizationId: 'org_acme_corp',
    type: 'ANOMALY_DETECTED',
    title: 'Negative Feedback Surge on Acme Pay Engine',
    message: 'Payment complaints jumped +43% over the last 24h due to 504 webhook timeouts.',
    severity: 'critical',
    read: false,
    link: '/feedback?priority=CRITICAL',
    createdAt: '2026-08-23T07:45:00Z',
  },
  {
    id: 'notif_2',
    organizationId: 'org_acme_corp',
    type: 'CRITICAL_FEEDBACK',
    title: 'Critical Issue Reported by High-Value Customer',
    message: 'Alexander Wright from Horizon Tech flagged payment gateway failure during upgrade checkout.',
    severity: 'high',
    read: false,
    link: '/customers/cust_1',
    createdAt: '2026-08-23T06:20:00Z',
  },
  {
    id: 'notif_3',
    organizationId: 'org_acme_corp',
    type: 'REPORT_READY',
    title: 'Weekly Executive Intelligence Report Generated',
    message: 'Executive Summary and KPI benchmarking for Week 34 are now available for review and PDF export.',
    severity: 'low',
    read: true,
    link: '/reports',
    createdAt: '2026-08-22T23:00:00Z',
  },
  {
    id: 'notif_4',
    organizationId: 'org_acme_corp',
    type: 'FEATURE_SURGE',
    title: 'Dark Mode Feature Request Reached 140+ Votes',
    message: 'Customer demand for night theme surged across Mobile & Web suites.',
    severity: 'medium',
    read: true,
    link: '/feature-requests',
    createdAt: '2026-08-21T15:30:00Z',
  }
];

export const SEED_ANOMALIES: AnomalyEvent[] = [
  {
    id: 'anom_1',
    topic: 'Payment Failures & Timeouts',
    product: 'Acme Pay Engine',
    increaseRate: 43.5,
    timeWindow: 'Last 24 Hours',
    severity: 'critical',
    message: 'Sudden 43.5% spike in payment failure complaints. 14 customers reported 504 gateway timeouts.',
    detectedAt: '2026-08-23T07:30:00Z',
    sampleQuotes: [
      'Our checkout page threw a 504 gateway timeout twice today during peak billing hours.',
      'We were double billed on invoice #INV-88291 after changing our credit card.',
      'Checkout fails with timeout error when processing enterprise renewals.'
    ]
  },
  {
    id: 'anom_2',
    topic: 'Android 14 App Crashes',
    product: 'Acme Mobile App (iOS & Android)',
    increaseRate: 28.0,
    timeWindow: 'Last 48 Hours',
    severity: 'high',
    message: 'App crash reports on Android 14 rose by 28% following the v3.3.1 update release.',
    detectedAt: '2026-08-22T14:00:00Z',
    sampleQuotes: [
      'The latest mobile update keeps crashing on Android 14 whenever I attempt to upload a photo.',
      'App closes instantly with no error log when attaching screenshot.'
    ]
  }
];
