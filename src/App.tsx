import React from 'react';
import { AppProvider, useApp } from './context/AppContext.js';
import { ErrorBoundary } from './components/common/ErrorBoundary.js';
import { NotFoundView } from './components/common/NotFoundView.js';
import { Header } from './components/common/Header.js';
import { Sidebar } from './components/common/Sidebar.js';
import { CommandPalette } from './components/common/CommandPalette.js';
import { ToastContainer } from './components/common/ToastContainer.js';
import { DashboardView } from './components/dashboard/DashboardView.js';
import { TotalProjectAdminView } from './components/roles/TotalProjectAdminView.js';
import { RoleAccessGuard } from './components/roles/RoleAccessGuard.js';
import { FeedbackView } from './components/feedback/FeedbackView.js';
import { FeedbackDetailModal } from './components/feedback/FeedbackDetailModal.js';
import { ManualFeedbackModal } from './components/feedback/ManualFeedbackModal.js';
import { CSVImportModal } from './components/feedback/CSVImportModal.js';
import { AIChatAnalyst } from './components/chat/AIChatAnalyst.js';
import { IssuesView } from './components/issues/IssuesView.js';
import { FeatureRequestsView } from './components/features/FeatureRequestsView.js';
import { DeepAnalyticsView } from './components/analytics/DeepAnalyticsView.js';
import { ReportsView } from './components/reports/ReportsView.js';
import { CustomerDirectoryView } from './components/customers/CustomerDirectoryView.js';
import { ProductMatrixView } from './components/products/ProductMatrixView.js';
import { PublicFeedbackPortal } from './components/public/PublicFeedbackPortal.js';
import { SettingsView } from './components/settings/SettingsView.js';
import { IssueClustersView } from './components/clusters/IssueClustersView.js';
import { CopilotHubView } from './components/copilot/CopilotHubView.js';
import { CompetitiveIntelligenceView } from './components/competitive/CompetitiveIntelligenceView.js';
import { ResolvedImpactView } from './components/impact/ResolvedImpactView.js';
import { ModelGovernanceView } from './components/governance/ModelGovernanceView.js';
import { SentimentVelocityAlertsView } from './components/velocity/SentimentVelocityAlertsView.js';
import { EmergingIssuesView } from './components/emerging/EmergingIssuesView.js';
import { CustomerChurnRiskView } from './components/customers/CustomerChurnRiskView.js';
import { FeatureRoadmapView } from './components/roadmap/FeatureRoadmapView.js';
import { ResolutionLearningView } from './components/learning/ResolutionLearningView.js';
import { AutonomousAgentView } from './components/agent/AutonomousAgentView.js';
import { CausalGraphView } from './components/causal/CausalGraphView.js';
import { WhatIfSimulatorView } from './components/simulator/WhatIfSimulatorView.js';
import { TargetProductsView } from './components/products/TargetProductsView.js';
import { DecisionCommandCenterView } from './components/decision/DecisionCommandCenterView.js';
import { PredictiveIssueView } from './components/predictive/PredictiveIssueView.js';
import { ClosedLoopOutcomeLearningView } from './components/learning/ClosedLoopOutcomeLearningView.js';
import { KnowledgeGraphView } from './components/graph/KnowledgeGraphView.js';
import { FeatureDemandView } from './components/intelligence/FeatureDemandView.js';
import { SystemHealthView } from './components/system/SystemHealthView.js';
import { SecurityRulesView } from './components/security/SecurityRulesView.js';
import { AuditLogsView } from './components/audit/AuditLogsView.js';
import { PlatformSettingsView } from './components/settings/PlatformSettingsView.js';

function MainLayout() {
  const { activeTab, currentRole } = useApp();

  const renderActiveView = () => {
    let viewNode: React.ReactNode;
    switch (activeTab) {
      case 'dashboard':
        viewNode = <DashboardView />;
        break;
      case 'total_project':
        viewNode = currentRole === 'ADMIN' ? (
          <TotalProjectAdminView />
        ) : (
          <RoleAccessGuard
            title="Total Project Administration Restricted"
            description="Only users with the ADMIN role can inspect the unified multi-product overview, modify global RBAC permissions, and manage enterprise pipeline telemetry."
          />
        );
        break;
      case 'autonomous_agent':
      case 'agent_queue':
        viewNode = <AutonomousAgentView />;
        break;
      case 'emerging_issues':
      case 'early_warning':
        viewNode = <EmergingIssuesView />;
        break;
      case 'causal':
      case 'causal_intelligence':
        viewNode = <CausalGraphView />;
        break;
      case 'simulator':
      case 'what_if_simulator':
        viewNode = <WhatIfSimulatorView />;
        break;
      case 'churn_intelligence':
      case 'churn_risk':
        viewNode = <CustomerChurnRiskView />;
        break;
      case 'feature_roadmap':
      case 'product_roadmap':
        viewNode = <FeatureRoadmapView />;
        break;
      case 'resolution_learning':
      case 'learning_loop':
        viewNode = <ResolutionLearningView />;
        break;
      case 'decision_command_center':
      case 'command_center':
        viewNode = <DecisionCommandCenterView />;
        break;
      case 'predictive_issues':
      case 'predictive':
        viewNode = <PredictiveIssueView />;
        break;
      case 'closed_loop_outcomes':
      case 'outcome_learning':
        viewNode = <ClosedLoopOutcomeLearningView />;
        break;
      case 'knowledge_graph':
      case 'causal_graph':
        viewNode = <KnowledgeGraphView />;
        break;
      case 'feature_demand':
      case 'demand_intelligence':
        viewNode = <FeatureDemandView />;
        break;
      case 'feedback':
        viewNode = <FeedbackView />;
        break;
      case 'clusters':
        viewNode = <IssueClustersView />;
        break;
      case 'copilot':
        viewNode = <CopilotHubView />;
        break;
      case 'competitive':
        viewNode = <CompetitiveIntelligenceView />;
        break;
      case 'impact':
        viewNode = <ResolvedImpactView />;
        break;
      case 'sentiment_velocity':
      case 'velocity_alerts':
        viewNode = <SentimentVelocityAlertsView />;
        break;
      case 'governance':
        viewNode = currentRole === 'ADMIN' || currentRole === 'MANAGER' ? (
          <ModelGovernanceView />
        ) : (
          <RoleAccessGuard
            title="Model Governance & Integrations Restricted"
            description="Access to AI model telemetry, RLHF human feedback datasets, and webhook integrations is restricted to Managers and Administrators."
          />
        );
        break;
      case 'ai_analyst':
        viewNode = <AIChatAnalyst />;
        break;
      case 'analytics':
        viewNode = <DeepAnalyticsView />;
        break;
      case 'issues':
        viewNode = <IssuesView />;
        break;
      case 'feature_requests':
        viewNode = <FeatureRequestsView />;
        break;
      case 'reports':
        viewNode = <ReportsView />;
        break;
      case 'customers':
        viewNode = <CustomerDirectoryView />;
        break;
      case 'target_products':
      case 'admin/products':
      case 'target_product_management':
        viewNode = <TargetProductsView />;
        break;
      case 'products':
        viewNode = <ProductMatrixView />;
        break;
      case 'public_portal':
        viewNode = <PublicFeedbackPortal />;
        break;
      case 'users':
      case 'roles_permissions':
      case 'organizations':
        viewNode = currentRole === 'ADMIN' ? (
          <TotalProjectAdminView />
        ) : (
          <RoleAccessGuard
            title="Administrator Control Center Restricted"
            description="Only users with the ADMIN role can modify user rosters, edit RBAC permissions, and manage enterprise pipeline telemetry."
          />
        );
        break;
      case 'security':
        viewNode = currentRole === 'ADMIN' ? (
          <SecurityRulesView />
        ) : (
          <RoleAccessGuard
            title="Security & PII Rules Restricted"
            description="Access to PII redaction settings, encryption policies, and IP allowlist is restricted to Administrators."
          />
        );
        break;
      case 'audit_logs':
        viewNode = currentRole === 'ADMIN' ? (
          <AuditLogsView />
        ) : (
          <RoleAccessGuard
            title="Compliance Audit Logs Restricted"
            description="Inspection of system audit logs and compliance trails is restricted to Administrators."
          />
        );
        break;
      case 'system_health':
      case 'health_metrics':
        viewNode = currentRole === 'ADMIN' || currentRole === 'MANAGER' ? (
          <SystemHealthView />
        ) : (
          <RoleAccessGuard
            title="System Health & Telemetry Restricted"
            description="Access to real-time microservices latency, SSE stream health, and CPU metrics is restricted to Managers and Administrators."
          />
        );
        break;
      case 'settings':
        viewNode = currentRole === 'ADMIN' ? (
          <PlatformSettingsView />
        ) : (
          <RoleAccessGuard
            title="Platform Settings Restricted"
            description="Global platform settings, workspace configuration, and notification policies are restricted to Administrators."
          />
        );
        break;
      case 'ai_config':
        viewNode = currentRole === 'ADMIN' ? (
          <SettingsView />
        ) : (
          <RoleAccessGuard
            title="AI Configuration Restricted"
            description="AI inference engine parameters and model selection are restricted to Administrators."
          />
        );
        break;
      case 'recommendations':
        viewNode = currentRole === 'ADMIN' || currentRole === 'MANAGER' ? (
          <DecisionCommandCenterView />
        ) : (
          <RoleAccessGuard
            title="Recommendation Approval Restricted"
            description="Viewing and approving AI recommendations is restricted to Managers and Administrators."
          />
        );
        break;
      default:
        viewNode = <NotFoundView />;
        break;
    }

    return (
      <ErrorBoundary key={activeTab} isComponentLevel fallbackTitle={`Module Error (${activeTab})`}>
        {viewNode}
      </ErrorBoundary>
    );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/50">
          {renderActiveView()}
        </main>
      </div>

      {/* Modals & Portals */}
      <FeedbackDetailModal />
      <ManualFeedbackModal />
      <CSVImportModal />
      <CommandPalette />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </ErrorBoundary>
  );
}
