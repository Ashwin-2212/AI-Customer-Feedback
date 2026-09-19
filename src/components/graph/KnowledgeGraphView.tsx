import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ApiService } from '../../services/api.js';
import { useApp } from '../../context/AppContext.js';
import {
  ZoomIn, ZoomOut, RefreshCw, GitMerge, Sliders, Sparkles, ArrowRight,
  Filter, Search, Download, Activity, AlertTriangle, DollarSign,
  TrendingUp, Zap, RotateCcw, Move, Info, ShieldCheck, CheckCircle2,
  HelpCircle, Layers, Target, X, ChevronRight, AlertCircle, Eye
} from 'lucide-react';

// ─── Node Type Visual Configuration ───────────────────────────────────────────
const NODE_CONFIG: Record<string, {
  color: string; bg: string; border: string; glow: string;
  icon: string; size: number; label: string; ring: string;
}> = {
  CUSTOMER:       { color: '#60a5fa', bg: 'rgba(59,130,246,0.15)',  border: '#3b82f6', glow: '#3b82f6', icon: '👤', size: 52, label: 'Customer',       ring: '#93c5fd' },
  FEEDBACK:       { color: '#c084fc', bg: 'rgba(168,85,247,0.15)',  border: '#a855f7', glow: '#a855f7', icon: '💬', size: 46, label: 'Feedback',       ring: '#d8b4fe' },
  FEATURE:        { color: '#34d399', bg: 'rgba(16,185,129,0.15)',  border: '#10b981', glow: '#10b981', icon: '⚙️', size: 44, label: 'Feature',        ring: '#6ee7b7' },
  ISSUE:          { color: '#f87171', bg: 'rgba(239,68,68,0.18)',   border: '#ef4444', glow: '#ef4444', icon: '🔴', size: 54, label: 'Issue',          ring: '#fca5a5' },
  ROOT_CAUSE:     { color: '#fb923c', bg: 'rgba(249,115,22,0.18)',  border: '#f97316', glow: '#f97316', icon: '🔍', size: 50, label: 'Root Cause',    ring: '#fdba74' },
  RISK:           { color: '#f43f5e', bg: 'rgba(244,63,94,0.18)',   border: '#e11d48', glow: '#e11d48', icon: '⚠️', size: 50, label: 'Risk',          ring: '#fda4af' },
  IMPACT:         { color: '#e879f9', bg: 'rgba(217,70,239,0.18)',  border: '#d946ef', glow: '#d946ef', icon: '💰', size: 52, label: 'Impact',        ring: '#f0abfc' },
  RECOMMENDATION: { color: '#facc15', bg: 'rgba(234,179,8,0.18)',   border: '#eab308', glow: '#eab308', icon: '🤖', size: 52, label: 'AI Rec',        ring: '#fde047' },
  RESOLUTION:     { color: '#4ade80', bg: 'rgba(34,197,94,0.18)',   border: '#22c55e', glow: '#22c55e', icon: '🔧', size: 46, label: 'Resolution',    ring: '#86efac' },
  OUTCOME:        { color: '#22d3ee', bg: 'rgba(6,182,212,0.18)',   border: '#06b6d4', glow: '#06b6d4', icon: '🏆', size: 56, label: 'Outcome',       ring: '#67e8f9' },
};

const EDGE_RELATION_STYLES: Record<string, { stroke: string; dash: string; label: string }> = {
  CONFIRMED:          { stroke: '#22c55e', dash: 'none', label: '✓ Confirmed' },
  EVIDENCE_SUPPORTED: { stroke: '#60a5fa', dash: 'none', label: '⊕ Evidence' },
  HYPOTHESIS:         { stroke: '#f59e0b', dash: '5,4',  label: '~ Hypothesis' },
};

// ─── Layout computation ────────────────────────────────────────────────────────
const SVG_W = 920, SVG_H = 580;

function computeLayout(nodes: any[], mode: 'RADIAL' | 'DAG' | 'LAYERED') {
  const pos: Record<string, { x: number; y: number }> = {};
  const cx = SVG_W / 2, cy = SVG_H / 2;

  const ORDER = ['CUSTOMER','FEEDBACK','FEATURE','ISSUE','ROOT_CAUSE','RISK','IMPACT','RECOMMENDATION','RESOLUTION','OUTCOME'];

  if (mode === 'RADIAL') {
    const groups: Record<string, any[]> = {};
    ORDER.forEach(t => { groups[t] = nodes.filter(n => n.type === t); });
    ORDER.forEach((t, gIdx) => {
      const grp = groups[t];
      if (!grp.length) return;
      const angle = (gIdx / ORDER.length) * 2 * Math.PI - Math.PI / 2;
      const r = 230;
      grp.forEach((node, nIdx) => {
        const spread = (nIdx - (grp.length - 1) / 2) * 52;
        pos[node.id] = {
          x: cx + Math.cos(angle) * r + Math.sin(angle) * spread,
          y: cy + Math.sin(angle) * r - Math.cos(angle) * spread,
        };
      });
    });
  } else if (mode === 'DAG') {
    const cols: Record<string, number> = {
      CUSTOMER:0, FEEDBACK:1, FEATURE:1, ISSUE:2, ROOT_CAUSE:3,
      RISK:4, IMPACT:4, RECOMMENDATION:5, RESOLUTION:5, OUTCOME:6
    };
    const buckets: Record<number, any[]> = {};
    nodes.forEach(n => {
      const c = cols[n.type] ?? 2;
      if (!buckets[c]) buckets[c] = [];
      buckets[c].push(n);
    });
    const colW = (SVG_W - 120) / 6;
    Object.entries(buckets).forEach(([cStr, cNodes]) => {
      const c = +cStr;
      const x = 60 + c * colW;
      cNodes.forEach((node, i) => {
        pos[node.id] = { x, y: SVG_H / (cNodes.length + 1) * (i + 1) };
      });
    });
  } else {
    const rows: Record<string, number> = {
      CUSTOMER:0, FEEDBACK:0, FEATURE:1, ISSUE:1, ROOT_CAUSE:2,
      RISK:3, IMPACT:3, RECOMMENDATION:4, RESOLUTION:4, OUTCOME:5
    };
    const buckets: Record<number, any[]> = {};
    nodes.forEach(n => {
      const r = rows[n.type] ?? 1;
      if (!buckets[r]) buckets[r] = [];
      buckets[r].push(n);
    });
    const rowH = (SVG_H - 100) / 5;
    Object.entries(buckets).forEach(([rStr, rNodes]) => {
      const r = +rStr;
      const y = 50 + r * rowH;
      rNodes.forEach((node, i) => {
        pos[node.id] = { x: SVG_W / (rNodes.length + 1) * (i + 1), y };
      });
    });
  }
  return pos;
}

// ─── BFS path tracer ──────────────────────────────────────────────────────────
function tracePaths(nodeId: string, edges: any[]) {
  const upstream = new Set<string>();
  const downstream = new Set<string>();
  const activeEdgeIds = new Set<string>();

  const qUp = [nodeId];
  while (qUp.length) {
    const curr = qUp.shift()!;
    edges.forEach(e => {
      if (e.target === curr && !upstream.has(e.source)) {
        upstream.add(e.source); activeEdgeIds.add(e.id); qUp.push(e.source);
      }
    });
  }
  const qDown = [nodeId];
  while (qDown.length) {
    const curr = qDown.shift()!;
    edges.forEach(e => {
      if (e.source === curr && !downstream.has(e.target)) {
        downstream.add(e.target); activeEdgeIds.add(e.id); qDown.push(e.target);
      }
    });
  }
  return { upstream, downstream, activeEdgeIds };
}

// ─── Bezier control point helper ──────────────────────────────────────────────
function bezierPath(x1: number, y1: number, x2: number, y2: number) {
  const dx = (x2 - x1) * 0.45;
  return `M${x1},${y1} C${x1+dx},${y1} ${x2-dx},${y2} ${x2},${y2}`;
}

// ─── Confidence Ring ──────────────────────────────────────────────────────────
function ConfidenceRing({ r, confidence, color }: { r: number; confidence: number; color: string }) {
  const circumference = 2 * Math.PI * (r + 6);
  const dash = circumference * confidence;
  return (
    <circle
      r={r + 6}
      fill="none"
      stroke={color}
      strokeWidth={2.5}
      strokeDasharray={`${dash} ${circumference}`}
      strokeDashoffset={circumference * 0.25}
      strokeLinecap="round"
      opacity={0.7}
    />
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export const KnowledgeGraphView: React.FC = () => {
  const { setActiveTab, selectedProductId, setSelectedProductId, addToast } = useApp();

  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [graphData, setGraphData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Interaction
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [layoutMode, setLayoutMode] = useState<'RADIAL' | 'DAG' | 'LAYERED'>('DAG');
  const [showEvidencePanel, setShowEvidencePanel] = useState(false);

  // Viewport
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Node Drag
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Counterfactual
  const [intervention, setIntervention] = useState(70);

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load products
  useEffect(() => {
    ApiService.getProducts().then(res => {
      const list = (res.products || []).map((p: any) => ({ id: p.id, name: p.name }));
      setProducts(list);
      if (list.length > 0) {
        const initial = (selectedProductId && selectedProductId !== 'ALL')
          ? (list.find((p: any) => p.id === selectedProductId)?.id || list[0].id)
          : list[0].id;
        setSelectedProduct(initial);
      }
    }).catch(() => setProducts([]));
  }, [selectedProductId]);

  const load = useCallback(async () => {
    if (!selectedProduct) return;
    setLoading(true); setError(null); setSelectedNodeId(null); setSelectedEdge(null);
    try {
      const r = await ApiService.getKnowledgeGraph(selectedProduct);
      setGraphData(r.graph);
      if (r.graph?.nodes?.length > 0) {
        const pos = computeLayout(r.graph.nodes, layoutMode);
        setNodePositions(pos);
        // Auto-select first ISSUE node for context
        const firstIssue = r.graph.nodes.find((n: any) => n.type === 'ISSUE') || r.graph.nodes[0];
        setSelectedNodeId(firstIssue.id);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load knowledge graph');
    } finally {
      setLoading(false);
    }
  }, [selectedProduct, layoutMode]);

  useEffect(() => { if (selectedProduct) load(); }, [selectedProduct]);

  const handleLayoutChange = (mode: 'RADIAL' | 'DAG' | 'LAYERED') => {
    setLayoutMode(mode);
    if (graphData?.nodes) {
      setNodePositions(computeLayout(graphData.nodes, mode));
    }
  };

  // Causal pathway
  const pathway = useMemo(() => {
    if (!selectedNodeId || !graphData?.edges) return { upstream: new Set<string>(), downstream: new Set<string>(), activeEdgeIds: new Set<string>() };
    return tracePaths(selectedNodeId, graphData.edges);
  }, [selectedNodeId, graphData]);

  // Filtered/visible nodes
  const visibleNodes = useMemo(() =>
    (graphData?.nodes || []).filter((n: any) => {
      const byType = filterType === 'ALL' || n.type === filterType;
      const bySearch = !searchQuery || n.label.toLowerCase().includes(searchQuery.toLowerCase());
      return byType && bySearch;
    }), [graphData, filterType, searchQuery]);

  // Type stats
  const typeStats = useMemo(() => {
    const s: Record<string, number> = {};
    (graphData?.nodes || []).forEach((n: any) => { s[n.type] = (s[n.type] || 0) + 1; });
    return s;
  }, [graphData]);

  const selectedNode = graphData?.nodes?.find((n: any) => n.id === selectedNodeId) ?? null;
  const selectedNodeCfg = selectedNode ? (NODE_CONFIG[selectedNode.type] ?? NODE_CONFIG.FEEDBACK) : null;

  // ARR impact from selected node meta
  const arrPerPercent = selectedNode?.meta?.arrSavedPerPercent ?? 17760;
  const arrSaved = Math.round(arrPerPercent * intervention / 100 * 100);
  const csatRecovery = +(intervention * 0.0085).toFixed(2);
  const churnReduced = Math.round(intervention * 0.18);

  // Canvas pan
  const onSvgMouseDown = (e: React.MouseEvent) => {
    if ((e.target as SVGElement) === svgRef.current) {
      setIsPanning(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    } else if (draggingId) {
      const svg = svgRef.current; if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const sx = (e.clientX - rect.left - pan.x) / zoom;
      const sy = (e.clientY - rect.top - pan.y) / zoom;
      setNodePositions(prev => ({ ...prev, [draggingId]: { x: sx - dragOffset.x, y: sy - dragOffset.y } }));
    }
  };
  const onMouseUp = () => { setIsPanning(false); setDraggingId(null); };

  const startNodeDrag = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const cur = nodePositions[nodeId] || { x: 0, y: 0 };
    const svg = svgRef.current; if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const sx = (e.clientX - rect.left - pan.x) / zoom;
    const sy = (e.clientY - rect.top - pan.y) / zoom;
    setDraggingId(nodeId);
    setDragOffset({ x: sx - cur.x, y: sy - cur.y });
    setSelectedNodeId(nodeId);
    setSelectedEdge(null);
  };

  // SVG Export
  const handleExport = () => {
    if (!svgRef.current) return;
    const svg = new XMLSerializer().serializeToString(svgRef.current);
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    const a = document.createElement('a');
    a.href = url; a.download = `causal_graph_${selectedProduct}_${Date.now()}.svg`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    addToast({ title: 'SVG Exported', message: 'High-resolution causal graph vector downloaded.', type: 'success' });
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-full text-slate-100 select-none">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-xl shadow-violet-500/25 border border-violet-400/30">
            <GitMerge className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Causal Knowledge Graph
              </h1>
              <span className="rounded-full bg-violet-500/20 px-2.5 py-0.5 text-[10px] font-bold text-violet-300 border border-violet-500/30 uppercase tracking-wider">
                Bayesian DAG Engine v4.0
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
              Multi-dimensional Bayesian causal network — from customer friction to root causes, ARR risk, and AI-driven resolutions with live counterfactual simulation.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { setActiveTab('simulator'); addToast({ title: 'Monte Carlo Loaded', message: 'Simulation engine primed with causal context.', type: 'info' }); }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-950/60 px-3.5 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-900/60 transition"
          >
            <Sliders className="h-3.5 w-3.5" /> Monte Carlo Sim
          </button>
          <button onClick={handleExport} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition">
            <Download className="h-3.5 w-3.5" /> Export SVG
          </button>
          <button
            onClick={load} disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-600/30 hover:bg-violet-500 transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Recalculate
          </button>
        </div>
      </div>

      {/* ── Product + Layout + Controls Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/70 px-4 py-3 rounded-2xl border border-slate-800">
        {/* Product scope */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Product:</span>
          {products.map(p => (
            <button
              key={p.id}
              onClick={() => { setSelectedProduct(p.id); setSelectedProductId(p.id); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border shrink-0 ${
                selectedProduct === p.id
                  ? 'bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-600/25'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
              }`}
            >{p.name}</button>
          ))}
        </div>

        {/* Layout mode toggles */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
          {(['DAG', 'RADIAL', 'LAYERED'] as const).map(m => (
            <button key={m}
              onClick={() => handleLayoutChange(m)}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                layoutMode === m ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {m === 'DAG' ? 'Bayesian DAG' : m === 'RADIAL' ? 'Radial' : 'Layered Flow'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Search / Filter / Zoom Row ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/50 px-4 py-2.5 rounded-xl border border-slate-800 text-xs">
        {/* Search */}
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text" placeholder="Search nodes..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="h-8 w-full rounded-xl border border-slate-700 bg-slate-950 pl-8 pr-3 text-xs text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Type filter chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <Filter className="h-3 w-3" /> Layer:
          </span>
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition ${filterType === 'ALL' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >All ({graphData?.nodes?.length || 0})</button>
          {Object.entries(NODE_CONFIG).map(([type, cfg]) => {
            const count = typeStats[type] || 0;
            if (!count) return null;
            return (
              <button key={type} onClick={() => setFilterType(type)}
                className={`px-2 py-1 rounded-lg font-semibold transition flex items-center gap-1 ${filterType === type ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                <span>{cfg.icon}</span>
                <span>{cfg.label} ({count})</span>
              </button>
            );
          })}
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-1">
          <button onClick={() => setZoom(z => Math.max(0.4, z - 0.15))} className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"><ZoomOut className="h-3.5 w-3.5" /></button>
          <span className="text-xs font-mono text-slate-400 px-1 min-w-[40px] text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(2.2, z + 0.15))} className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"><ZoomIn className="h-3.5 w-3.5" /></button>
          <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition" title="Reset view"><RotateCcw className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      {/* ── Main Area ── */}
      {loading ? (
        <div className="flex items-center justify-center h-[560px] rounded-3xl border border-slate-800 bg-slate-900/40">
          <div className="text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-violet-500/30" />
              <div className="absolute inset-0 rounded-full border-4 border-t-violet-500 animate-spin" />
              <GitMerge className="absolute inset-0 m-auto h-7 w-7 text-violet-400" />
            </div>
            <p className="text-slate-300 font-semibold text-sm">Synthesizing Bayesian Causal Topology…</p>
            <p className="text-slate-500 text-xs">Running probabilistic graph inference engine</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-[560px] rounded-3xl border border-rose-900/40 bg-rose-950/20">
          <div className="text-center space-y-3">
            <AlertCircle className="h-12 w-12 text-rose-400 mx-auto" />
            <p className="text-rose-300 font-bold">{error}</p>
            <button onClick={load} className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-700">Retry</button>
          </div>
        </div>
      ) : graphData && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

          {/* ── SVG Canvas (8 cols) ── */}
          <div
            ref={containerRef}
            onMouseDown={onSvgMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            className="xl:col-span-8 bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col cursor-grab active:cursor-grabbing"
            style={{ height: 600 }}
          >
            {/* Canvas header strip */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-sm text-xs z-20 shrink-0">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-white">{graphData.productName} — Causal DAG</span>
                <span className="text-slate-500 hidden sm:inline">· Drag canvas to pan · Drag nodes to reposition</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                <span>{visibleNodes.length} nodes</span>
                <span>{graphData.edges?.length || 0} directed links</span>
              </div>
            </div>

            {/* SVG */}
            <svg
              ref={svgRef}
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              className="w-full flex-1"
              style={{
                transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center center'
              }}
            >
              <defs>
                {/* Glow filters per node type */}
                {Object.entries(NODE_CONFIG).map(([type, cfg]) => (
                  <filter key={type} id={`glow-${type}`} x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feFlood floodColor={cfg.glow} floodOpacity="0.5" result="color" />
                    <feComposite in="color" in2="blur" operator="in" result="shadow" />
                    <feMerge><feMergeNode in="shadow" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                ))}
                {/* Arrow markers */}
                {Object.entries(EDGE_RELATION_STYLES).map(([rel, style]) => (
                  <marker key={rel} id={`arrow-${rel}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill={style.stroke} opacity={0.9} />
                  </marker>
                ))}
                {/* Active path arrow */}
                <marker id="arrow-active" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill="#a855f7" opacity={1} />
                </marker>
                {/* Dot grid */}
                <pattern id="dotgrid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="#334155" opacity="0.35" />
                </pattern>
              </defs>

              <rect width={SVG_W} height={SVG_H} fill="url(#dotgrid)" />

              {/* Edges (Bezier curves) */}
              {(graphData.edges || []).map((edge: any) => {
                const from = nodePositions[edge.source];
                const to = nodePositions[edge.target];
                if (!from || !to) return null;

                const relStyle = EDGE_RELATION_STYLES[edge.relationshipType] || EDGE_RELATION_STYLES.HYPOTHESIS;
                const isActive = pathway.activeEdgeIds.has(edge.id);
                const isDimmed = selectedNodeId && !isActive;
                const isEdgeSel = selectedEdge?.id === edge.id;
                const strokeColor = isActive ? '#a855f7' : isEdgeSel ? '#60a5fa' : relStyle.stroke;
                const strokeW = isActive ? 3 : isEdgeSel ? 2.5 : 1.8;
                const path = bezierPath(from.x, from.y, to.x, to.y);

                // Midpoint for label
                const mx = (from.x + to.x) / 2;
                const my = (from.y + to.y) / 2;

                return (
                  <g key={edge.id} style={{ opacity: isDimmed ? 0.1 : 1 }} className="cursor-pointer">
                    {/* Thick invisible hover target */}
                    <path d={path} fill="none" stroke="transparent" strokeWidth={12}
                      onClick={() => { setSelectedEdge(edge); setSelectedNodeId(null); }} />
                    <path
                      d={path} fill="none"
                      stroke={strokeColor} strokeWidth={strokeW}
                      strokeDasharray={relStyle.dash}
                      markerEnd={`url(#${isActive ? 'arrow-active' : `arrow-${edge.relationshipType}`})`}
                      className="transition-all duration-200"
                    />
                    {/* Strength badge on hovered / selected edge */}
                    {(isActive || isEdgeSel) && (
                      <g>
                        <rect x={mx - 24} y={my - 9} width={48} height={18} rx={6} fill="#0f172a" stroke={strokeColor} strokeWidth={1} />
                        <text x={mx} y={my + 4} textAnchor="middle" style={{ fontSize: 8, fill: isActive ? '#e9d5ff' : '#93c5fd', fontWeight: 700 }}>
                          {Math.round((edge.strength || 0) * 100)}% strength
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Nodes */}
              {visibleNodes.map((node: any) => {
                const pos = nodePositions[node.id];
                if (!pos) return null;

                const cfg = NODE_CONFIG[node.type] ?? NODE_CONFIG.FEEDBACK;
                const r = (cfg.size / 2) * (selectedNodeId === node.id ? 1.28 : hoveredNodeId === node.id ? 1.14 : 1);
                const isSelected = selectedNodeId === node.id;
                const isHovered = hoveredNodeId === node.id;
                const isUp = pathway.upstream.has(node.id);
                const isDown = pathway.downstream.has(node.id);
                const isDimmed = selectedNodeId && !isSelected && !isUp && !isDown;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${pos.x},${pos.y})`}
                    style={{ opacity: isDimmed ? 0.12 : 1 }}
                    className="cursor-move"
                    onMouseDown={e => startNodeDrag(e, node.id)}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                  >
                    {/* Glow on select */}
                    {(isSelected || isHovered) && (
                      <circle r={r + 12} fill={cfg.bg} filter={`url(#glow-${node.type})`} />
                    )}

                    {/* Confidence ring */}
                    {isSelected && node.confidence && (
                      <ConfidenceRing r={r} confidence={node.confidence} color={cfg.ring} />
                    )}

                    {/* Upstream / Downstream halo */}
                    {(isUp || isDown) && !isSelected && (
                      <circle r={r + 9} fill="none"
                        stroke={isUp ? '#f59e0b' : '#a855f7'}
                        strokeWidth={2} strokeDasharray="5,3" opacity={0.8} />
                    )}

                    {/* Main circle */}
                    <circle r={r} fill={cfg.bg}
                      stroke={isSelected ? '#ffffff' : cfg.border}
                      strokeWidth={isSelected ? 3 : isHovered ? 2.5 : 1.8} />

                    {/* Icon */}
                    <text textAnchor="middle" dy="-1" style={{ fontSize: r * 0.52, fill: cfg.color, userSelect: 'none' }}>
                      {cfg.icon}
                    </text>

                    {/* Label */}
                    <text textAnchor="middle" dy={r + 15}
                      style={{
                        fontSize: isSelected ? 9.5 : 8.5,
                        fill: isSelected ? '#ffffff' : isUp ? '#fcd34d' : isDown ? '#d8b4fe' : '#94a3b8',
                        fontWeight: isSelected ? 800 : 600,
                        userSelect: 'none'
                      }}
                    >
                      {node.label.length > 22 ? node.label.slice(0, 20) + '…' : node.label}
                    </text>

                    {/* Confidence value tiny label */}
                    {node.confidence && (isSelected || isHovered) && (
                      <text textAnchor="middle" dy={r + 27}
                        style={{ fontSize: 7.5, fill: '#64748b', fontWeight: 600 }}>
                        {Math.round(node.confidence * 100)}% conf
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Bottom legend strip */}
            <div className="px-4 py-2.5 border-t border-slate-800/80 bg-slate-900/90 flex items-center justify-between text-[11px] text-slate-400 shrink-0 z-10">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-violet-500 ring-2 ring-violet-500/25" /><span className="text-white font-medium">Selected</span></span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" />Upstream Cause</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-purple-400" />Downstream Impact</span>
                <span className="flex items-center gap-1.5"><span className="h-0.5 w-5 bg-green-400 inline-block" />Confirmed</span>
                <span className="flex items-center gap-1.5"><span className="h-0.5 w-5 bg-blue-400 inline-block" />Evidence</span>
                <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-amber-400 border-dashed border-t border-amber-400 inline-block" />Hypothesis</span>
              </div>
              <span className="font-mono text-slate-600">DAG Core v4.0 · Bayesian Inference</span>
            </div>
          </div>

          {/* ── Inspector Panel (4 cols) ── */}
          <div className="xl:col-span-4 space-y-4">

            {/* Node Inspector */}
            {selectedNode && selectedNodeCfg ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
                {/* Header band */}
                <div className="px-5 py-4 border-b border-slate-800" style={{ background: `linear-gradient(135deg, ${selectedNodeCfg.bg}, transparent)` }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Causal Node Inspector</span>
                      <h3 className="text-sm font-black text-white mt-0.5 leading-snug">{selectedNode.label}</h3>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="rounded-xl px-2.5 py-1 text-[10px] font-bold border" style={{ background: selectedNodeCfg.bg, color: selectedNodeCfg.color, borderColor: selectedNodeCfg.border }}>
                        {selectedNodeCfg.icon} {selectedNode.type}
                      </span>
                      <button onClick={() => setShowEvidencePanel(p => !p)} className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5">
                        <Eye className="h-3 w-3" /> Evidence
                      </button>
                    </div>
                  </div>
                </div>

                {/* Metrics grid */}
                <div className="px-5 py-4 space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-slate-400 text-[10px] mb-0.5">Bayesian Confidence</div>
                      <div className="font-black text-emerald-400 text-sm">{Math.round((selectedNode.confidence || 0.94) * 100)}%</div>
                      <div className="mt-1.5 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.round((selectedNode.confidence || 0.94) * 100)}%` }} />
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-slate-400 text-[10px] mb-0.5">Causal Odds Ratio</div>
                      <div className="font-black text-violet-400 text-sm">{selectedNode.oddsRatio || '4.2x Driver'}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-slate-400 text-[10px] mb-0.5">Upstream Causes</div>
                      <div className="font-black text-amber-400 text-sm">{pathway.upstream.size} Ancestor{pathway.upstream.size !== 1 ? 's' : ''}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-slate-400 text-[10px] mb-0.5">Downstream Impact</div>
                      <div className="font-black text-purple-400 text-sm">{pathway.downstream.size} Propagated</div>
                    </div>
                  </div>

                  {/* Telemetry metric pill */}
                  {selectedNode.metric && (
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Telemetry Value</span>
                      <span className="font-mono font-bold text-white">{selectedNode.metric}</span>
                    </div>
                  )}

                  {/* Evidence quotes (expandable) */}
                  {showEvidencePanel && selectedNode.evidenceQuotes?.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3 text-emerald-400" /> Customer Evidence Quotes
                      </div>
                      {selectedNode.evidenceQuotes.map((q: string, i: number) => (
                        <div key={i} className="p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-[11px] text-slate-300 italic">
                          "{q}"
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Counterfactual Simulator */}
                  <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/25 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" /> Counterfactual Simulator
                      </span>
                      <span className="font-mono text-xs font-bold text-white">Fix {intervention}%</span>
                    </div>

                    <input type="range" min={10} max={100} step={5}
                      value={intervention} onChange={e => setIntervention(+e.target.value)}
                      className="w-full accent-indigo-500 cursor-pointer" />

                    {/* Impact heatbar */}
                    <div className="relative h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${intervention}%`,
                          background: `linear-gradient(90deg, #7c3aed, #06b6d4)`
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-slate-900/80 text-center">
                        <div className="text-slate-400 text-[10px]">ARR Saved</div>
                        <div className="font-black text-emerald-400 font-mono">+${arrSaved.toLocaleString()}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900/80 text-center">
                        <div className="text-slate-400 text-[10px]">CSAT +pts</div>
                        <div className="font-black text-indigo-300 font-mono">+{csatRecovery}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900/80 text-center">
                        <div className="text-slate-400 text-[10px]">Churn ↓</div>
                        <div className="font-black text-amber-400 font-mono">-{churnReduced}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setActiveTab('simulator');
                        addToast({ title: 'Intervention Seeded', message: `Monte Carlo primed for "${selectedNode.label}"`, type: 'info' });
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-black hover:from-violet-500 hover:to-indigo-500 transition shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2"
                    >
                      <Zap className="h-3.5 w-3.5" /> Run Full Monte Carlo Model <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('feedback');
                        addToast({ title: 'Evidence Filter', message: `Showing feedback related to "${selectedNode.label}"`, type: 'info' });
                      }}
                      className="w-full py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700 hover:text-white transition flex items-center justify-center gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" /> View Raw Customer Feedback
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('root_cause');
                        addToast({ title: 'RCA Opened', message: `Loading root cause analysis for "${selectedNode.label}"`, type: 'info' });
                      }}
                      className="w-full py-2 bg-slate-800/60 text-slate-400 rounded-xl text-xs font-semibold hover:bg-slate-700 hover:text-white transition flex items-center justify-center gap-1.5"
                    >
                      <Target className="h-3.5 w-3.5" /> Open Root Cause Analysis
                    </button>
                  </div>
                </div>
              </div>
            ) : selectedEdge ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Causal Relationship</span>
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <span>{selectedEdge.source}</span>
                  <ChevronRight className="h-4 w-4 text-violet-400 shrink-0" />
                  <span>{selectedEdge.target}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Relationship</div>
                    <div className="font-bold text-white mt-0.5">{selectedEdge.label}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Link Strength</div>
                    <div className="font-bold text-emerald-400 mt-0.5">{Math.round((selectedEdge.strength || 0) * 100)}%</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Confidence Type</div>
                    <div className="font-bold text-indigo-400 mt-0.5">{selectedEdge.relationshipType}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Evidence Count</div>
                    <div className="font-bold text-amber-400 mt-0.5">{selectedEdge.evidenceCount} signals</div>
                  </div>
                </div>
                <button onClick={() => setSelectedEdge(null)} className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition flex items-center justify-center gap-1">
                  <X className="h-3 w-3" /> Dismiss
                </button>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto">
                  <Move className="h-7 w-7 text-violet-400" />
                </div>
                <div className="text-sm font-bold text-white">Select Any Causal Node</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Click on any node to highlight upstream root causes, downstream impact chains, and run counterfactual simulations.
                </p>
              </div>
            )}

            {/* Node Legend */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
                <Layers className="h-3 w-3" /> Node Classifications
              </h4>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                {Object.entries(NODE_CONFIG).map(([type, cfg]) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(filterType === type ? 'ALL' : type)}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-left transition ${filterType === type ? 'bg-violet-900/40 border border-violet-500/30' : 'hover:bg-slate-800/60'}`}
                  >
                    <span className="text-sm shrink-0">{cfg.icon}</span>
                    <span className="text-slate-400 truncate" style={{ color: filterType === type ? cfg.color : undefined }}>
                      {cfg.label}
                    </span>
                    {typeStats[type] > 0 && (
                      <span className="ml-auto text-slate-600 font-mono text-[10px]">{typeStats[type]}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Graph summary */}
            {graphData.summary && (
              <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-2xl p-4 text-xs text-indigo-300/80 flex items-start gap-2">
                <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>{graphData.summary}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
