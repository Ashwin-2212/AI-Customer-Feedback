import React, { useState, useEffect } from 'react';
import { Product, ProductStatus } from '../../types.js';
import { ApiService } from '../../services/api.js';
import { useApp } from '../../context/AppContext.js';
import { X, Upload, Package, AlertCircle, CheckCircle, Sparkles, Building2, Globe, Calendar, Tag, ShieldCheck } from 'lucide-react';

interface AddEditProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    productToEdit?: Product | null;
    onSuccess: () => void;
}

const CATEGORIES = [
    'SaaS',
    'Mobile Application',
    'Web Application',
    'Financial',
    'Healthcare',
    'E-commerce',
    'Enterprise',
    'Infrastructure & Compute',
    'Customer Service',
    'Other'
];

const STATUS_OPTIONS: ProductStatus[] = ['ACTIVE', 'MONITORING', 'PAUSED', 'ARCHIVED'];

export function AddEditProductModal({ isOpen, onClose, productToEdit, onSuccess }: AddEditProductModalProps) {
    const { addToast, users } = useApp();

    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('SaaS');
    const [version, setVersion] = useState('v1.0.0');
    const [owner, setOwner] = useState('');
    const [team, setTeam] = useState('Product Engineering');
    const [status, setStatus] = useState<ProductStatus>('ACTIVE');
    const [website, setWebsite] = useState('');
    const [launchDate, setLaunchDate] = useState(new Date().toISOString().split('T')[0]);
    const [targetSegments, setTargetSegments] = useState('Enterprise, SMB, SaaS');
    const [logoUrl, setLogoUrl] = useState('');
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (productToEdit) {
            setName(productToEdit.name || '');
            setCode(productToEdit.code || '');
            setDescription(productToEdit.description || '');
            setCategory(productToEdit.category || 'SaaS');
            setVersion(productToEdit.version || 'v1.0.0');
            setOwner(productToEdit.owner || '');
            setTeam(productToEdit.team || 'Product Engineering');
            setStatus(productToEdit.status || 'ACTIVE');
            setWebsite(productToEdit.website || '');
            setLaunchDate(productToEdit.launchDate || new Date().toISOString().split('T')[0]);
            setTargetSegments(Array.isArray(productToEdit.targetSegments) ? productToEdit.targetSegments.join(', ') : 'Enterprise, SMB');
            setLogoUrl(productToEdit.logoUrl || '');
            setLogoPreview(productToEdit.logoUrl || null);
        } else {
            setName('');
            setCode('');
            setDescription('');
            setCategory('SaaS');
            setVersion('v1.0.0');
            setOwner(users[0]?.name || 'Marcus Vance');
            setTeam('Product Engineering');
            setStatus('ACTIVE');
            setWebsite('');
            setLaunchDate(new Date().toISOString().split('T')[0]);
            setTargetSegments('Enterprise, SMB, B2B');
            setLogoUrl('');
            setLogoPreview(null);
        }
        setError(null);
    }, [productToEdit, isOpen, users]);

    if (!isOpen) return null;

    // Auto-generate initials for preview avatar
    const getInitials = (str: string) => {
        if (!str) return 'TP';
        const parts = str.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return str.substring(0, 2).toUpperCase();
    };

    // Auto-suggest product code from name if code field is empty
    const handleNameChange = (val: string) => {
        setName(val);
        if (!productToEdit && (!code || code === getSuggestedCode(name))) {
            setCode(getSuggestedCode(val));
        }
    };

    const getSuggestedCode = (str: string) => {
        if (!str) return '';
        const clean = str.replace(/[^a-zA-Z0-9\s]/g, '').trim();
        const parts = clean.split(/\s+/);
        let prefix = 'PRD';
        if (parts.length >= 2) {
            prefix = (parts[0].substring(0, 3) + '-' + parts[1].substring(0, 3)).toUpperCase();
        } else if (parts[0].length >= 3) {
            prefix = parts[0].substring(0, 4).toUpperCase();
        }
        return `${prefix}-001`;
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Invalid image file type. Please upload a PNG, JPG, or SVG logo.');
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                setError('File size exceeds 2MB limit.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setLogoPreview(result);
                setLogoUrl(result);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!name.trim()) {
            setError('Product Name is required.');
            return;
        }
        if (!code.trim()) {
            setError('Product Code is required.');
            return;
        }
        if (!category) {
            setError('Category must be selected.');
            return;
        }
        if (website && !website.startsWith('http://') && !website.startsWith('https://')) {
            setError('Invalid Website URL. Must start with http:// or https://');
            return;
        }

        const payload: Partial<Product> = {
            name: name.trim(),
            code: code.trim().toUpperCase(),
            description: description.trim(),
            category,
            version: version.trim() || 'v1.0.0',
            owner: owner.trim(),
            team: team.trim(),
            status,
            website: website.trim(),
            logoUrl,
            launchDate,
            targetSegments: targetSegments.split(',').map(s => s.trim()).filter(Boolean)
        };

        setLoading(true);
        try {
            if (productToEdit) {
                const res = await ApiService.updateProduct(productToEdit.id, payload);
                if (res.success) {
                    addToast({
                        title: 'Product Updated',
                        message: `Target product ${payload.name} (${payload.code}) has been updated.`,
                        type: 'success'
                    });
                    onSuccess();
                    onClose();
                } else {
                    setError(res.message || 'Failed to update product.');
                }
            } else {
                const res = await ApiService.createProduct(payload);
                if (res.success) {
                    addToast({
                        title: 'Target Product Created',
                        message: `Target product ${payload.name} (${payload.code}) has been added to intelligence platform monitoring.`,
                        type: 'success'
                    });
                    onSuccess();
                    onClose();
                } else {
                    setError(res.message || 'Failed to create target product.');
                }
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto">
            <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 my-8 animate-in fade-in zoom-in-95 duration-150">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
                            <Package className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                {productToEdit ? 'Edit Target Product' : 'Add Target Product'}
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Define products monitored by the Customer Feedback Intelligence Platform.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
                        <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                        <div>
                            <span className="font-bold">Validation Error: </span>
                            {error}
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">

                    {/* Logo & Basic Info Row */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {/* Logo Upload & Initials Preview */}
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-4 text-center dark:border-slate-700 dark:bg-slate-800/40">
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo preview" className="h-16 w-16 rounded-xl object-cover shadow-sm border border-slate-200 dark:border-slate-700" />
                            ) : (
                                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 font-bold text-white text-xl shadow-md">
                                    {getInitials(name)}
                                </div>
                            )}
                            <label className="mt-3 cursor-pointer rounded-lg bg-white px-3 py-1.5 text-[11px] font-semibold text-indigo-600 shadow-2xs border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-400">
                                <Upload className="mr-1.5 inline-block h-3.5 w-3.5" />
                                Upload Logo
                                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                            </label>
                            <span className="mt-1 text-[10px] text-slate-400">PNG, JPG, SVG (Max 2MB)</span>
                        </div>

                        {/* Name & Code */}
                        <div className="sm:col-span-2 space-y-3">
                            <div>
                                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Product Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Payment Platform, Cloud Engine"
                                    value={name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Product Code (Unique) <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. PAY-001, CLOUD-001"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                                        className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 font-mono font-bold text-indigo-600 placeholder:text-slate-400 uppercase focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-400"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400">Unique Code</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Description
                        </label>
                        <textarea
                            rows={2}
                            placeholder="Describe the product capabilities, key components, and monitored user workflows..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                    </div>

                    {/* Category, Status & Version Grid */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Category <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="h-9 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            >
                                {CATEGORIES.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Monitoring Status <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as ProductStatus)}
                                className="h-9 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold text-indigo-600 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-400"
                            >
                                {STATUS_OPTIONS.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Version / Release Tag
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. v2.4.0"
                                value={version}
                                onChange={(e) => setVersion(e.target.value)}
                                className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 font-mono text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Owner, Team & Launch Date Grid */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Product Owner
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Marcus Vance"
                                value={owner}
                                onChange={(e) => setOwner(e.target.value)}
                                className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Engineering Team / Dept
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Payments Engineering"
                                value={team}
                                onChange={(e) => setTeam(e.target.value)}
                                className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Launch Date
                            </label>
                            <input
                                type="date"
                                value={launchDate}
                                onChange={(e) => setLaunchDate(e.target.value)}
                                className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Website & Target Segments */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Product Website / Documentation URL
                            </label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="url"
                                    placeholder="https://pay.acme.com"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Target Customer Segments (Comma-separated)
                            </label>
                            <input
                                type="text"
                                placeholder="Enterprise, E-commerce, Fintech"
                                value={targetSegments}
                                onChange={(e) => setTargetSegments(e.target.value)}
                                className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Submit Action Buttons */}
                    <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    <span>Saving Product...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4" />
                                    <span>{productToEdit ? 'Save Changes' : '+ Add Target Product'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
