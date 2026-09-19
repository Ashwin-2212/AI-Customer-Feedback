import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { ApiService } from '../../services/api.js';
import { FrustrationVelocityItem, FrustrationVelocityAlert, FrustrationVelocityTrajectoryPoint } from '../../types.js';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Flame,
  Info,
  Layers,
  MessageSquare,
  Play,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
  User,
  Zap,
  X
} from 'lucide-react';

export function SentimentVelocityAlertsView() {
  const { addToast } = useApp();
  const [items, setItems] = useState<FrustrationVelocityItem[]>([]);
  const [counts, setCounts] = useState({
    criticalDeterioration: 0,
    rapidlyIncreasing: 0,
    increasing: 0,
    stable: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<FrustrationVelocityItem | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [selectedTargetType, setSelectedTargetType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [hoveredTrajectoryPoint, setHoveredTrajectoryPoint] = useState<{
    itemId: string;
    point: FrustrationVelocityTrajectoryPoint;
  } | null>(null);

  const fetchVelocities = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getFrustrationVelocities({
        tier: selectedTier,
        targetType: selectedTargetType,
        search: searchQuery
      });
      setItems(res.velocities || []);
      if (res.counts) {
        setCounts(res.counts);
      }
    } catch (err) {
      console.error('Failed to load frustration velocities', err);
      addToast({
        title: 'Error loading velocity telemetry',
        message: 'Could not retrieve latest sentiment trajectory analytics.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVelocities();
  }, [selectedTier, selectedTargetType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVelocities();
  };

  const handleTriggerAction = async (item: FrustrationVelocityItem, actionName: string) => {
    try {
      setActionLoadingId(item.id);
      const res = await ApiService.triggerVelocityAction(item.id, actionName);
      if (res.success) {
        addToast({
          title: 'Mitigation Dispatched 🚀',
          message: `Successfully initiated: "${actionName}" for ${item.customerName || item.issueTitle}.`,
          type: 'success'
        });
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, mitigationStatus: 'DISPATCHED', mitigationActionTaken: actionName } : i));
        if (selectedItem?.id === item.id) {
          setSelectedItem(prev => prev ? { ...prev, mitigationStatus: 'DISPATCHED', mitigationActionTaken: actionName } : null);
        }
      }
    } catch (err) {
      addToast({
        title: 'Dispatch Failed',
        message: 'Could not trigger mitigation action.',
        type: 'error'
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Helper to render alert badges
  const getAlertBadge = (status: FrustrationVelocityAlert, rate: number) => {
    switch (status) {
      case 'CRITICAL_DETERIORATION':
        return {
          icon: '🔴',
          label: 'Critical Deterioration',
          subtext: `Rate: ${rate}/day (Severe Drop)`,
          badgeClass: 'bg-rose-500/10 text-rose-700 border-rose-300 dark:border-rose-900/60 dark:text-rose-400',
          borderClass: 'border-l-4 border-l-rose-500',
          pulse: true
        };
      case 'RAPIDLY_INCREASING':
        return {
          icon: '🟠',
          label: 'Rapidly Increasing',
          subtext: `Rate: ${rate}/day (Fast Decline)`,
          badgeClass: 'bg-amber-500/10 text-amber-700 border-amber-300 dark:border-amber-900/60 dark:text-amber-400',
          borderClass: 'border-l-4 border-l-amber-500',
          pulse: false
        };
      case 'INCREASING':
        return {
          icon: '🟡',
          label: 'Increasing',
          subtext: `Rate: ${rate}/day (Moderate Friction)`,
          badgeClass: 'bg-yellow-500/10 text-yellow-800 border-yellow-300 dark:border-yellow-900/60 dark:text-yellow-400',
          borderClass: 'border-l-4 border-l-yellow-500',
          pulse: false
        };
      case 'STABLE':
      default:
        return {
          icon: '🟢',
          label: 'Stable',
          subtext: `Rate: ${rate > 0 ? '+' : ''}${rate}/day (Healthy)`,
          badgeClass: 'bg-emerald-500/10 text-emerald-700 border-emerald-300 dark:border-emerald-900/60 dark:text-emerald-400',
          borderClass: 'border-l-4 border-l-emerald-500',
          pulse: false
        };
    }
  };

  // Render SVG Sparkline
  const renderSparkline = (item: FrustrationVelocityItem) => {
    const trajectory = item.sentimentTrajectory;
    if (!trajectory || trajectory.length === 0) return null;

    const width = 240;
    const height = 48;
    const padding = 6;

    const points = trajectory.map((pt, idx) => {
      const x = padding + (idx / (trajectory.length - 1)) * (width - padding * 2);
      const normalizedScore = (pt.sentimentScore + 1) / 2;
      const y = (height - padding) - normalizedScore * (height - padding * 2);
      return { x, y, pt };
    });

    const pathData = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    const strokeColor =
      item.status === 'CRITICAL_DETERIORATION'
        ? '#f43f5e'
        : item.status === 'RAPIDLY_INCREASING'
        ? '#f97316'
        : item.status === 'INCREASING'
        ? '#eab308'
        : '#10b981';

    return (
      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-12 overflow-visible"
        >
          <line
            x1={padding}
            y1={height / 2}
            x2={width - padding}
            y2={height / 2}
            stroke="#94a3b8"
            strokeDasharray="2,2"
            strokeOpacity="0.4"
          />
          <path
            d={pathData}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {points.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r={idx === points.length - 1 ? 4 : 2.5}
              fill={idx === points.length - 1 ? strokeColor : '#ffffff'}
              stroke={strokeColor}
              strokeWidth="2"
              className="cursor-pointer transition-all hover:r-5"
              onMouseEnter={() => setHoveredTrajectoryPoint({ itemId: item.id, point: p.pt })}
              onMouseLeave={() => setHoveredTrajectoryPoint(null)}
            />
          ))}
        </svg>

        {hoveredTrajectoryPoint && hoveredTrajectoryPoint.itemId === item.id && (
          <div className="absolute top-0 right-0 z-10 rounded-md bg-slate-900/90 px-2 py-1 text-[10px] font-mono text-white shadow-md dark:bg-slate-100 dark:text-slate-900">
            {hoveredTrajectoryPoint.point.dayLabel} ({hoveredTrajectoryPoint.point.date}):{' '}
            <span className="font-bold">
              {hoveredTrajectoryPoint.point.sentimentScore > 0 ? '+' : ''}
              {hoveredTrajectoryPoint.point.sentimentScore}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Header Banner */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 p-2 text-white shadow-sm">
              <TrendingDown className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Sentiment Frustration Velocity & Deterioration Early Warning
            </h1>
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-black text-rose-800 dark:bg-rose-950 dark:text-rose-300 animate-pulse">
              🚨 Live Velocity Detection
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Detect accounts and systemic issues whose sentiment is deteriorating unusually quickly (e.g.{' '}
            <span className="font-mono font-bold text-rose-600 dark:text-rose-400">-0.24/day</span>) before churn occurs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchVelocities}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-indigo-500' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* 4 Alert Tiers KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 🔴 Critical Deterioration */}
        <div
          onClick={() => setSelectedTier(selectedTier === 'CRITICAL_DETERIORATION' ? 'ALL' : 'CRITICAL_DETERIORATION')}
          className={`cursor-pointer relative overflow-hidden rounded-2xl border p-4 transition-all duration-200 shadow-2xs ${
            selectedTier === 'CRITICAL_DETERIORATION'
              ? 'ring-2 ring-rose-500 bg-rose-50/70 border-rose-300 dark:bg-rose-950/40 dark:border-rose-800'
              : 'bg-white border-slate-200 hover:border-rose-300 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-rose-900/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔴</span>
              <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                Critical Deterioration
              </span>
            </div>
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-black text-rose-800 dark:bg-rose-950 dark:text-rose-300">
              ≤ -0.20/day
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {counts.criticalDeterioration}
            </span>
            <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
              e.g. -0.24/day
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Emergency intervention triggered. Highest churn threat.
          </p>
        </div>

        {/* 🟠 Rapidly Increasing */}
        <div
          onClick={() => setSelectedTier(selectedTier === 'RAPIDLY_INCREASING' ? 'ALL' : 'RAPIDLY_INCREASING')}
          className={`cursor-pointer relative overflow-hidden rounded-2xl border p-4 transition-all duration-200 shadow-2xs ${
            selectedTier === 'RAPIDLY_INCREASING'
              ? 'ring-2 ring-amber-500 bg-amber-50/70 border-amber-300 dark:bg-amber-950/40 dark:border-amber-800'
              : 'bg-white border-slate-200 hover:border-amber-300 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-amber-900/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🟠</span>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                Rapidly Increasing
              </span>
            </div>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              -0.12 to -0.20/day
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {counts.rapidlyIncreasing}
            </span>
            <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
              Steep erosion
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Rapid sentiment decline across consecutive days.
          </p>
        </div>

        {/* 🟡 Increasing */}
        <div
          onClick={() => setSelectedTier(selectedTier === 'INCREASING' ? 'ALL' : 'INCREASING')}
          className={`cursor-pointer relative overflow-hidden rounded-2xl border p-4 transition-all duration-200 shadow-2xs ${
            selectedTier === 'INCREASING'
              ? 'ring-2 ring-yellow-500 bg-yellow-50/70 border-yellow-300 dark:bg-yellow-950/40 dark:border-yellow-800'
              : 'bg-white border-slate-200 hover:border-yellow-300 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-yellow-900/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🟡</span>
              <span className="text-xs font-bold text-yellow-800 dark:text-yellow-400 uppercase tracking-wider">
                Increasing
              </span>
            </div>
            <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-black text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">
              -0.05 to -0.12/day
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {counts.increasing}
            </span>
            <span className="text-xs font-mono font-bold text-yellow-700 dark:text-yellow-400">
              Mild friction
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Moderate frustration trend. Early warning alert.
          </p>
        </div>

        {/* 🟢 Stable */}
        <div
          onClick={() => setSelectedTier(selectedTier === 'STABLE' ? 'ALL' : 'STABLE')}
          className={`cursor-pointer relative overflow-hidden rounded-2xl border p-4 transition-all duration-200 shadow-2xs ${
            selectedTier === 'STABLE'
              ? 'ring-2 ring-emerald-500 bg-emerald-50/70 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800'
              : 'bg-white border-slate-200 hover:border-emerald-300 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-emerald-900/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🟢</span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                Stable
              </span>
            </div>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              ≥ -0.05/day
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {counts.stable}
            </span>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              Healthy / Steady
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Sentiment healthy or within normal variance bounds.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-slate-50/80 dark:bg-slate-900/70 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        {/* Entity Type Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
          <button
            onClick={() => setSelectedTargetType('ALL')}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedTargetType === 'ALL'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            All Entities
          </button>
          <button
            onClick={() => setSelectedTargetType('CUSTOMER')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              selectedTargetType === 'CUSTOMER'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <User className="h-3 w-3" />
            <span>Customers Only</span>
          </button>
          <button
            onClick={() => setSelectedTargetType('ISSUE')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              selectedTargetType === 'ISSUE'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Layers className="h-3 w-3" />
            <span>Systemic Issues</span>
          </button>
        </div>

        {/* Tier Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Alert:</span>
          {['ALL', 'CRITICAL_DETERIORATION', 'RAPIDLY_INCREASING', 'INCREASING', 'STABLE'].map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                selectedTier === tier
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700'
              }`}
            >
              {tier === 'ALL' && 'All Tiers'}
              {tier === 'CRITICAL_DETERIORATION' && '🔴 Critical'}
              {tier === 'RAPIDLY_INCREASING' && '🟠 Rapid'}
              {tier === 'INCREASING' && '🟡 Increasing'}
              {tier === 'STABLE' && '🟢 Stable'}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search accounts, issues, friction..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-900 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </form>
      </div>

      {/* Main List of Monitored Deterioration Entities */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
            <span className="text-xs font-medium text-slate-500">Evaluating multi-day sentiment slope trajectories...</span>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-2" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No items matching filter</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            All customer accounts and issues in this view are within healthy sentiment variance thresholds.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => {
            const badge = getAlertBadge(item.status, item.velocityRatePerDay);
            const isCustomer = item.targetType === 'CUSTOMER';

            return (
              <div
                key={item.id}
                className={`flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-2xs transition hover:shadow-md dark:bg-slate-900 dark:border-slate-800 ${badge.borderClass}`}
              >
                <div>
                  {/* Top Bar: Entity Identity & Alert Pill */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className={`p-2 rounded-xl mt-0.5 ${isCustomer ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400' : 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400'}`}>
                        {isCustomer ? <User className="h-4 w-4" /> : <Layers className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            {isCustomer ? item.customerName : item.issueTitle}
                          </h3>
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {isCustomer ? item.customerSegment : item.productName}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {isCustomer ? item.customerEmail : `Category: ${item.category} • ${item.affectedCustomersCount || 1} accounts affected`}
                        </div>
                      </div>
                    </div>

                    {/* Alert Badge */}
                    <div className="flex flex-col items-end">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black border ${badge.badgeClass}`}>
                        <span>{badge.icon}</span>
                        <span>{badge.label}</span>
                      </span>
                      <div className="mt-1 flex items-center gap-1 font-mono text-xs font-extrabold text-rose-600 dark:text-rose-400">
                        <TrendingDown className="h-3.5 w-3.5" />
                        <span>{item.velocityRatePerDay > 0 ? '+' : ''}{item.velocityRatePerDay} / day</span>
                      </div>
                    </div>
                  </div>

                  {/* Trajectory Sparkline & Metric Badges */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      <span>7-Day Sentiment Trajectory</span>
                      <span className="font-mono">
                        Current:{' '}
                        <strong className={item.currentSentimentScore < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'}>
                          {item.currentSentimentScore > 0 ? '+' : ''}{item.currentSentimentScore}
                        </strong>
                      </span>
                    </div>

                    {renderSparkline(item)}

                    <div className="mt-2 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                      {item.consecutiveNegativeDays > 0 && (
                        <span className="inline-flex items-center gap-1 font-bold text-amber-700 dark:text-amber-400">
                          <Flame className="h-3 w-3 text-amber-500 fill-amber-500" />
                          <span>{item.consecutiveNegativeDays} Consecutive Neg Days</span>
                        </span>
                      )}
                      {item.estimatedRevenueAtRiskUSD && item.estimatedRevenueAtRiskUSD > 0 && (
                        <span className="inline-flex items-center gap-0.5 font-bold text-rose-700 dark:text-rose-400">
                          <DollarSign className="h-3 w-3" />
                          <span>${(item.estimatedRevenueAtRiskUSD || 0).toLocaleString()} At Risk</span>
                        </span>
                      )}
                      {item.mitigationStatus === 'DISPATCHED' && (
                        <span className="ml-auto inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Mitigation Active</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Friction Symptom & Quote */}
                  <div className="mt-3 space-y-1.5 text-xs">
                    <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Primary Friction:{' '}
                        <span className="font-normal text-slate-600 dark:text-slate-300">{item.primaryFrictionPoint}</span>
                      </span>
                    </div>
                    {item.latestFeedbackSnippet && (
                      <div className="rounded-lg bg-slate-100/70 p-2 text-[11px] italic text-slate-600 dark:bg-slate-800/60 dark:text-slate-400 border-l-2 border-indigo-400">
                        "{item.latestFeedbackSnippet}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Inspect 360° Diagnostic</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </button>

                  <div className="flex items-center gap-2">
                    {item.mitigationStatus === 'DISPATCHED' ? (
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{item.mitigationActionTaken ? 'Action Dispatched' : 'Dispatched'}</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleTriggerAction(item, item.recommendedAction)}
                        disabled={actionLoadingId === item.id}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-indigo-500 disabled:opacity-50 transition"
                      >
                        {actionLoadingId === item.id ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Zap className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
                        )}
                        <span>Auto-Dispatch Mitigation</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 360° Diagnostic Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="rounded-2xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                {selectedItem.targetType === 'CUSTOMER' ? <User className="h-6 w-6" /> : <Layers className="h-6 w-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedItem.targetType === 'CUSTOMER' ? selectedItem.customerName : selectedItem.issueTitle}
                  </h2>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-black border ${getAlertBadge(selectedItem.status, selectedItem.velocityRatePerDay).badgeClass}`}>
                    {getAlertBadge(selectedItem.status, selectedItem.velocityRatePerDay).icon}{' '}
                    {getAlertBadge(selectedItem.status, selectedItem.velocityRatePerDay).label}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  ID: {selectedItem.id} • Target: {selectedItem.targetType} • Rate:{' '}
                  <strong className="text-rose-600 dark:text-rose-400 font-bold">{selectedItem.velocityRatePerDay}/day</strong>
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 py-4">
              {/* Trajectory Breakdown */}
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Multi-Day Sentiment Trajectory Timeline
                </span>
                <div className="mt-3">
                  {renderSparkline(selectedItem)}
                </div>
                <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] font-mono">
                  {selectedItem.sentimentTrajectory.map((pt, idx) => (
                    <div key={idx} className="p-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                      <div className="text-slate-400 font-semibold">{pt.dayLabel}</div>
                      <div className={`font-bold ${pt.sentimentScore < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'}`}>
                        {pt.sentimentScore > 0 ? '+' : ''}{pt.sentimentScore}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Friction & AI Recommendation */}
              <div className="space-y-3">
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 dark:border-amber-900/40 dark:bg-amber-950/20">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span>Root Friction Analysis</span>
                  </div>
                  <p className="mt-1 text-xs text-amber-900 dark:text-amber-200">
                    {selectedItem.primaryFrictionPoint}
                  </p>
                </div>

                <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3.5 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-800 dark:text-indigo-300">
                    <Sparkles className="h-4 w-4 text-indigo-600" />
                    <span>Recommended AI Retention Playbook</span>
                  </div>
                  <p className="mt-1 text-xs text-indigo-900 dark:text-indigo-200 font-medium">
                    {selectedItem.recommendedAction}
                  </p>
                </div>

                {selectedItem.latestFeedbackSnippet && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Latest Feedback Transcript</span>
                    <p className="mt-1 text-xs italic text-slate-600 dark:text-slate-400">
                      "{selectedItem.latestFeedbackSnippet}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                onClick={() => setSelectedItem(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Close
              </button>
              {selectedItem.mitigationStatus !== 'DISPATCHED' && (
                <button
                  onClick={() => handleTriggerAction(selectedItem, selectedItem.recommendedAction)}
                  disabled={actionLoadingId === selectedItem.id}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500"
                >
                  <Zap className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
                  <span>Execute Retention Dispatch</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
