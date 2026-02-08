'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';

const CATEGORIES = [
    { value: 'website', label: 'Website', icon: '🌐', color: 'bg-blue-100 text-blue-700' },
    { value: 'social', label: 'Social Media', icon: '📱', color: 'bg-pink-100 text-pink-700' },
    { value: 'document', label: 'Document', icon: '📄', color: 'bg-green-100 text-green-700' },
    { value: 'other', label: 'Other', icon: '🔗', color: 'bg-slate-100 text-slate-700' },
];

export default function LinksPage() {
    const [links, setLinks] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterCompany, setFilterCompany] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedLink, setSelectedLink] = useState(null);
    const [formData, setFormData] = useState({
        companyId: '',
        title: '',
        url: '',
        category: 'other',
        notes: '',
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [linksRes, companiesRes] = await Promise.all([
                fetch('/api/links'),
                fetch('/api/companies'),
            ]);
            const [linksData, companiesData] = await Promise.all([
                linksRes.json(),
                companiesRes.json(),
            ]);
            setLinks(linksData.links || []);
            setCompanies(companiesData.companies || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLinks = links.filter(link => {
        if (filterCompany && link.companyId !== filterCompany) return false;
        if (filterCategory && link.category !== filterCategory) return false;
        return true;
    });

    const groupedLinks = CATEGORIES.reduce((acc, cat) => {
        acc[cat.value] = filteredLinks.filter(l => l.category === cat.value);
        return acc;
    }, {});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (selectedLink) {
                const res = await fetch(`/api/links/${selectedLink.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                setLinks(links.map(l => l.id === selectedLink.id ? data.link : l));
            } else {
                const res = await fetch('/api/links', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                setLinks([data.link, ...links]);
            }
            setShowModal(false);
            resetForm();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async () => {
        if (!selectedLink || !confirm('Delete this link?')) return;

        try {
            await fetch(`/api/links/${selectedLink.id}`, { method: 'DELETE' });
            setLinks(links.filter(l => l.id !== selectedLink.id));
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error('Failed to delete link:', error);
        }
    };

    const resetForm = () => {
        setFormData({ companyId: '', title: '', url: '', category: 'other', notes: '' });
        setSelectedLink(null);
        setError('');
    };

    const handleEdit = (link) => {
        setSelectedLink(link);
        setFormData({
            companyId: link.companyId,
            title: link.title,
            url: link.url,
            category: link.category,
            notes: link.notes || '',
        });
        setShowModal(true);
    };

    const openNew = () => {
        resetForm();
        if (companies.length > 0) {
            setFormData(prev => ({ ...prev, companyId: companies[0].id }));
        }
        setShowModal(true);
    };

    const getCategoryInfo = (category) => {
        return CATEGORIES.find(c => c.value === category) || CATEGORIES[3];
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Company Links</h1>
                    <p className="text-slate-500 mt-1">Store and organize company URLs and resources</p>
                </div>
                <Button onClick={openNew}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Link
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                <div className="w-56">
                    <Select
                        value={filterCompany}
                        onChange={(e) => setFilterCompany(e.target.value)}
                        placeholder="All Companies"
                        options={[
                            { value: '', label: 'All Companies' },
                            ...companies.map((c) => ({ value: c.id, label: c.name }))
                        ]}
                    />
                </div>
                <div className="w-48">
                    <Select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        placeholder="All Categories"
                        options={[
                            { value: '', label: 'All Categories' },
                            ...CATEGORIES.map((c) => ({ value: c.value, label: `${c.icon} ${c.label}` }))
                        ]}
                    />
                </div>
            </div>

            {/* Links Display */}
            {filteredLinks.length > 0 ? (
                <div className="space-y-6">
                    {CATEGORIES.map(cat => {
                        const categoryLinks = groupedLinks[cat.value];
                        if (categoryLinks.length === 0) return null;

                        // Define gradient colors for each category
                        const gradients = {
                            website: 'from-blue-500 to-indigo-600',
                            social: 'from-pink-500 to-rose-600',
                            document: 'from-green-500 to-emerald-600',
                            other: 'from-slate-500 to-slate-600',
                        };

                        return (
                            <div key={cat.value} className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                                {/* Category Header with Gradient */}
                                <div className={`bg-gradient-to-r ${gradients[cat.value]} px-6 py-4`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{cat.icon}</span>
                                            <div>
                                                <h3 className="text-lg font-bold text-white">{cat.label}</h3>
                                                <p className="text-white/80 text-sm">{categoryLinks.length} {categoryLinks.length === 1 ? 'link' : 'links'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Links Grid */}
                                <div className="p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                        {categoryLinks.map(link => (
                                            <div
                                                key={link.id}
                                                className="group relative bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 p-4 hover:shadow-lg hover:border-blue-200 transition-all duration-300 hover:-translate-y-1"
                                            >
                                                {/* Link Icon & Title */}
                                                <div className="flex items-start gap-3 mb-3">
                                                    <div className={`h-10 w-10 rounded-xl ${cat.color} flex items-center justify-center text-lg flex-shrink-0`}>
                                                        {cat.icon}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-slate-900 truncate">{link.title}</h4>
                                                        <span className="text-xs text-slate-500">{link.company?.name}</span>
                                                    </div>
                                                </div>

                                                {/* URL */}
                                                <a
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-2 group/link"
                                                >
                                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                    </svg>
                                                    <span className="truncate group-hover/link:underline">{link.url.replace(/^https?:\/\//, '')}</span>
                                                </a>

                                                {/* Notes */}
                                                {link.notes && (
                                                    <p className="text-sm text-slate-500 line-clamp-2 mb-3">{link.notes}</p>
                                                )}

                                                {/* Actions */}
                                                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                                    <span className="text-xs text-slate-400">
                                                        {new Date(link.createdAt).toLocaleDateString()}
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => handleEdit(link)}
                                                            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                                            title="Edit"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                            </svg>
                                                        </button>
                                                        <a
                                                            href={link.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-all"
                                                            title="Open link"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                            </svg>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                    <div className="text-center py-16 px-4">
                        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No links yet</h3>
                        <p className="text-slate-500 mb-6 max-w-sm mx-auto">Start organizing your company resources by adding your first link</p>
                        <Button onClick={openNew} size="lg">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Your First Link
                        </Button>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); resetForm(); }}
                title={selectedLink ? 'Edit Link' : 'Add New Link'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    <Select
                        label="Company"
                        value={formData.companyId}
                        onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                        options={companies.map(c => ({ value: c.id, label: c.name }))}
                        required
                    />

                    <Input
                        label="Title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Company Website"
                        required
                    />

                    <Input
                        label="URL"
                        type="url"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        placeholder="https://example.com"
                        required
                    />

                    <Select
                        label="Category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        options={CATEGORIES.map(c => ({ value: c.value, label: `${c.icon} ${c.label}` }))}
                    />

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Add any notes about this link..."
                            rows={3}
                            className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 resize-none transition-all duration-200 hover:border-blue-300 hover:shadow-md focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:shadow-lg"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        {selectedLink && (
                            <Button type="button" variant="secondary" onClick={handleDelete} className="text-red-600 hover:bg-red-50">
                                Delete
                            </Button>
                        )}
                        <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1">
                            {selectedLink ? 'Update' : 'Add Link'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
