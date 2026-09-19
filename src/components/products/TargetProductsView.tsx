import React, { useState, useEffect } from 'react';
import { Product, ProductStatus } from '../../types.js';
import { ApiService } from '../../services/api.js';
import { useApp } from '../../context/AppContext.js';
import { AddEditProductModal } from './AddEditProductModal.js';
import { ProductDetailView } from './ProductDetailView.js';
import { ProductComparisonModal } from './ProductComparisonModal.js';
import {
  Package, Plus, Search, Filter, Scale, AlertTriangle, ShieldCheck,
  Activity, Sparkles, Edit3, Trash2, Eye, LayoutGrid, List, ChevronRight,
  TrendingUp, CheckCircle, AlertCircle, RefreshCw, Archive, Globe, User
} from 'lucide-react';
import { formatDate } from '../../lib/utils.js';

export function TargetProductsView() {
  const { addToast, currentRole } = useApp();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [ownerFilter, setOwnerFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Modals & Navigation
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Soft Delete / Archive Confirmation State
  const [archiveTarget, setArchiveTarget] = useState<Product | null>(null);
  const [archiving, setArchiving] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [search, statusFilter, categoryFilter, ownerFilter]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getProducts({
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        owner: ownerFilter !== 'ALL' ? ownerFilter : undefined
      });
      setProducts(res.products || []);
    } catch (err) {
      console.error('Failed to load target products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setProductToEdit(null);
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setProductToEdit(prod);
    setIsAddEditOpen(true);
  };

  const handleStatusChange = async (prod: Product, newStatus: ProductStatus) => {
    try {
      const res = await ApiService.updateProductStatus(prod.id, newStatus);
      if (res.success) {
        addToast({
          title: 'Status Updated',
          message: `Product ${prod.name} status set to ${newStatus}.`,
          type: 'success'
        });
        loadProducts();
      }
    } catch (err: any) {
      addToast({
        title: 'Status Change Failed',
        message: err.message || 'Failed to change product status.',
        type: 'error'
      });
    }
  };

  const handleConfirmArchive = async () => {
    if (!archiveTarget) return;
    setArchiving(true);
    try {
      const res = await ApiService.archiveProduct(archiveTarget.id);
      if (res.success) {
        addToast({
          title: 'Product Archived',
          message: `Product ${archiveTarget.name} has been archived. ${res.feedbackCount} feedback records preserved in historical archive.`,
          type: 'success'
        });
        setArchiveTarget(null);
        loadProducts();
      }
    } catch (err: any) {
      addToast({
        title: 'Archive Failed',
        message: err.message || 'Failed to archive product.',
        type: 'error'
      });
    } finally {
      setArchiving(false);
    }
  };

  // Helper for Initials Avatar
  const getInitials = (name: string) => {
    if (!name) return 'TP';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  // KPI Calculations from actual dataset
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === 'ACTIVE').length;
  const criticalIssueProducts = products.filter(p => (p.criticalIssues && p.criticalIssues > 0)).length;
  const emergingIssueProducts = products.filter(p => (p.emergingIssues && p.emergingIssues > 0)).length;
  const highRiskProducts = products.filter(p => p.customerRisk === 'HIGH' || p.customerRisk === 'CRITICAL').length;

  const categoriesList = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
  const ownersList = Array.from(new Set(products.map(p => p.owner).filter(Boolean)));

  // Render Product Details View if selected
  if (selectedProductId) {
    return (
      <ProductDetailView
        productId={selectedProductId}
        onBack={() => setSelectedProductId(null)}
        onEdit={(prod) => {
          setProductToEdit(prod);
          setIsAddEditOpen(true);
        }}
        onRefresh={loadProducts}
      />
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Top Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              🎯 Target Products
            </h1>
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Admin Control
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Manage the target products monitored by the Customer Feedback Intelligence Platform.
          </p>
        </div>

        {/* Top-Right Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCompareOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Scale className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Compare Products</span>
          </button>

          {currentRole === 'ADMIN' && (
            <button
              onClick={handleOpenAdd}
              id="btn-add-target-product"
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <Plus className="h-4 w-4" />
              <span>+ Add Target Product</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        
        {/* Total Products */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Products</span>
            <Package className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{totalProducts}</div>
          <div className="mt-1 text-[10px] text-slate-400">Configured in organization</div>
        </div>

        {/* Active Products */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 shadow-2xs dark:border-emerald-950/60 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Products</span>
            <CheckCircle className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-950 dark:text-emerald-200">{activeProducts}</div>
          <div className="mt-1 text-[10px] text-emerald-700/80 dark:text-emerald-400/80">Active monitoring stream</div>
        </div>

        {/* Critical Issues */}
        <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4 shadow-2xs dark:border-rose-950/60 dark:bg-rose-950/20">
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Critical Issues</span>
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-black text-rose-950 dark:text-rose-200">{criticalIssueProducts}</div>
          <div className="mt-1 text-[10px] text-rose-700/80 dark:text-rose-400/80">Products with critical bugs</div>
        </div>

        {/* Emerging Issues */}
        <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4 shadow-2xs dark:border-amber-950/60 dark:bg-amber-950/20">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Emerging Issues</span>
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-950 dark:text-amber-200">{emergingIssueProducts}</div>
          <div className="mt-1 text-[10px] text-amber-700/80 dark:text-amber-400/80">Complaint trend spikes</div>
        </div>

        {/* High Risk Products */}
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 shadow-2xs dark:border-indigo-950/60 dark:bg-indigo-950/20 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-300">
            <span className="text-[11px] font-bold uppercase tracking-wider">High Risk</span>
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-black text-indigo-950 dark:text-indigo-200">{highRiskProducts}</div>
          <div className="mt-1 text-[10px] text-indigo-700/80 dark:text-indigo-300/80">Churn risk tier HIGH</div>
        </div>

      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search products by name, code, category, or owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
          />
        </div>

        {/* Filters & View Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="MONITORING">MONITORING</option>
            <option value="PAUSED">PAUSED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="ALL">All Categories</option>
            {categoriesList.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Owner Filter */}
          <select
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="ALL">All Owners</option>
            {ownersList.map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>

          {/* Grid / Table Layout Toggle */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-800 dark:bg-slate-800">
            <button
              onClick={() => setViewMode('table')}
              className={`rounded-lg p-1.5 transition ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-2xs dark:bg-slate-700 dark:text-indigo-400' : 'text-slate-400'}`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-lg p-1.5 transition ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-2xs dark:bg-slate-700 dark:text-indigo-400' : 'text-slate-400'}`}
              title="Card Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex h-64 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
            <span>Loading target products dataset...</span>
          </div>
        </div>
      ) : products.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300 mb-4">
            <Package className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">🎯 No Target Products Found</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm">
            {search || statusFilter !== 'ALL'
              ? 'No target products match your active search or filter parameters.'
              : 'You haven\'t configured any target products yet. Add your first product to begin monitoring customer feedback.'}
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-5 flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add Target Product</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3.5">Target Product</th>
                <th className="px-3 py-3.5">Category</th>
                <th className="px-3 py-3.5">Status</th>
                <th className="px-3 py-3.5">Health</th>
                <th className="px-3 py-3.5 text-center">Feedback</th>
                <th className="px-3 py-3.5 text-center">CSAT</th>
                <th className="px-3 py-3.5 text-center">Open Issues</th>
                <th className="px-3 py-3.5">Risk Tier</th>
                <th className="px-3 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {products.map((p) => {
                const health = p.healthScore !== undefined ? p.healthScore : 84;
                return (
                  <tr key={p.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition duration-150">
                    
                    {/* Product Name & Code */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {p.logoUrl ? (
                          <img src={p.logoUrl} alt={p.name} className="h-9 w-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-2xs" />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 font-bold text-white text-xs shadow-sm">
                            {getInitials(p.name)}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedProductId(p.id)}
                              className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 text-left transition"
                            >
                              {p.name}
                            </button>
                            <span className="rounded bg-indigo-50 px-1.5 py-0.2 font-mono text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                              {p.code}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-1 max-w-xs mt-0.5">{p.description}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-3 py-3.5 font-medium text-slate-700 dark:text-slate-300">
                      {p.category}
                    </td>

                    {/* Status Pill with Dropdown Change */}
                    <td className="px-3 py-3.5">
                      <select
                        value={p.status}
                        onChange={(e) => handleStatusChange(p, e.target.value as ProductStatus)}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold focus:outline-none cursor-pointer border-0 ${
                          p.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          p.status === 'MONITORING' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                          p.status === 'PAUSED' ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300' :
                          'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="MONITORING">MONITORING</option>
                        <option value="PAUSED">PAUSED</option>
                        <option value="ARCHIVED">ARCHIVED</option>
                      </select>
                    </td>

                    {/* Health Score Bar */}
                    <td className="px-3 py-3.5">
                      <div className="w-24">
                        <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                          <span className="text-slate-500">Score</span>
                          <span className={health >= 80 ? 'text-emerald-600' : health >= 60 ? 'text-amber-600' : 'text-rose-600'}>
                            {health}/100
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              health >= 80 ? 'bg-emerald-500' : health >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${health}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Feedback Volume */}
                    <td className="px-3 py-3.5 text-center font-bold text-slate-900 dark:text-slate-100">
                      {p.totalFeedback}
                    </td>

                    {/* CSAT */}
                    <td className="px-3 py-3.5 text-center font-bold text-emerald-600 dark:text-emerald-400">
                      {p.csat}%
                    </td>

                    {/* Open Issues */}
                    <td className="px-3 py-3.5 text-center font-semibold">
                      <span className={p.openIssues && p.openIssues > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}>
                        {p.openIssues || 0}
                      </span>
                    </td>

                    {/* Customer Risk */}
                    <td className="px-3 py-3.5">
                      <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        p.customerRisk === 'HIGH' || p.customerRisk === 'CRITICAL' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                        p.customerRisk === 'MEDIUM' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {p.customerRisk || 'LOW'}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="px-3 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedProductId(p.id)}
                          className="rounded-lg p-1.5 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/60"
                          title="View Product Details & AI Analysis"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                          title="Edit Target Product"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>

                        {currentRole === 'ADMIN' && (
                          <button
                            onClick={() => setArchiveTarget(p)}
                            className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                            title="Archive Target Product"
                          >
                            <Archive className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map(p => {
            const health = p.healthScore !== undefined ? p.healthScore : 84;
            return (
              <div key={p.id} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition hover:border-indigo-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-900">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {p.logoUrl ? (
                        <img src={p.logoUrl} alt={p.name} className="h-11 w-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-2xs" />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 font-bold text-white text-sm shadow-md">
                          {getInitials(p.name)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-tight">{p.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{p.code}</span>
                          <span className="text-[10px] text-slate-400">• {p.category}</span>
                        </div>
                      </div>
                    </div>

                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      p.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {p.status}
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{p.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="grid grid-cols-3 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Feedback</span>
                      <strong className="text-slate-900 dark:text-white text-sm">{p.totalFeedback}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">CSAT</span>
                      <strong className="text-emerald-600 text-sm">{p.csat}%</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Issues</span>
                      <strong className="text-rose-600 text-sm">{p.openIssues || 0}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setSelectedProductId(p.id)}
                      className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      <span>View Details & AI Insights</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>

                    <div className="flex items-center gap-1">
                      <button onClick={() => handleOpenEdit(p)} className="p-1 text-slate-400 hover:text-slate-700">
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AddEditProductModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        productToEdit={productToEdit}
        onSuccess={loadProducts}
      />

      <ProductComparisonModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        products={products}
      />

      {/* Archive Confirmation Dialog */}
      {archiveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Archive Target Product?</h3>
            </div>
            
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to archive <strong className="text-slate-900 dark:text-white">{archiveTarget.name} ({archiveTarget.code})</strong>?
            </p>

            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
              <strong>Impact Summary:</strong>
              <ul className="mt-1 list-disc pl-4 space-y-0.5 text-[11px]">
                <li>{archiveTarget.totalFeedback} historical feedback records will be preserved.</li>
                <li>{archiveTarget.openIssues || 0} open issues will remain accessible in historical reports.</li>
                <li>No new live alerts or active AI monitoring will trigger for this product.</li>
              </ul>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setArchiveTarget(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmArchive}
                disabled={archiving}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-rose-700 disabled:opacity-50"
              >
                {archiving ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Archive className="h-4 w-4" />
                )}
                <span>Archive Product</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
