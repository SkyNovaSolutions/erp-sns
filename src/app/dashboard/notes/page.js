'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';

const NOTE_COLORS = [
    { name: 'indigo', bg: 'bg-indigo-50', border: 'border-indigo-200', header: 'from-indigo-500 to-purple-500', text: 'text-indigo-600', light: 'bg-indigo-100', hover: 'hover:border-indigo-300' },
    { name: 'rose', bg: 'bg-rose-50', border: 'border-rose-200', header: 'from-rose-500 to-pink-500', text: 'text-rose-600', light: 'bg-rose-100', hover: 'hover:border-rose-300' },
    { name: 'emerald', bg: 'bg-emerald-50', border: 'border-emerald-200', header: 'from-emerald-500 to-teal-500', text: 'text-emerald-600', light: 'bg-emerald-100', hover: 'hover:border-emerald-300' },
    { name: 'amber', bg: 'bg-amber-50', border: 'border-amber-200', header: 'from-amber-500 to-orange-500', text: 'text-amber-600', light: 'bg-amber-100', hover: 'hover:border-amber-300' },
    { name: 'sky', bg: 'bg-sky-50', border: 'border-sky-200', header: 'from-sky-500 to-cyan-500', text: 'text-sky-600', light: 'bg-sky-100', hover: 'hover:border-sky-300' },
    { name: 'violet', bg: 'bg-violet-50', border: 'border-violet-200', header: 'from-violet-500 to-purple-500', text: 'text-violet-600', light: 'bg-violet-100', hover: 'hover:border-violet-300' },
];

export default function NotesPage() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [viewingNote, setViewingNote] = useState(null);
    const [editingNote, setEditingNote] = useState(null);
    const [formData, setFormData] = useState({ title: '', content: '', color: 'indigo', isPinned: false });
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const res = await fetch('/api/notes');
            const data = await res.json();
            setNotes(data.notes || []);
        } catch (error) {
            console.error('Failed to fetch notes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const url = editingNote ? `/api/notes/${editingNote.id}` : '/api/notes';
            const method = editingNote ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to save note');
            }

            if (editingNote) {
                setNotes(notes.map(n => n.id === editingNote.id ? data.note : n));
            } else {
                setNotes([data.note, ...notes]);
            }

            handleCloseModal();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this note?')) return;

        try {
            await fetch(`/api/notes/${id}`, { method: 'DELETE' });
            setNotes(notes.filter((n) => n.id !== id));
            if (viewingNote?.id === id) setViewingNote(null);
        } catch (error) {
            console.error('Failed to delete note:', error);
        }
    };

    const handleTogglePin = async (note) => {
        try {
            const res = await fetch(`/api/notes/${note.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...note, isPinned: !note.isPinned }),
            });

            const data = await res.json();
            if (res.ok) {
                setNotes(notes.map(n => n.id === note.id ? data.note : n));
            }
        } catch (error) {
            console.error('Failed to toggle pin:', error);
        }
    };

    const handleEdit = (note) => {
        setEditingNote(note);
        setFormData({ title: note.title, content: note.content, color: note.color || 'indigo', isPinned: note.isPinned });
        setShowModal(true);
        setViewingNote(null);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingNote(null);
        setFormData({ title: '', content: '', color: 'indigo', isPinned: false });
        setError('');
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getColorClasses = (colorName) => {
        return NOTE_COLORS.find(c => c.name === colorName) || NOTE_COLORS[0];
    };

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort: pinned first, then by date
    const sortedNotes = [...filteredNotes].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const pinnedCount = notes.filter(n => n.isPinned).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Notes
                    </h1>
                    <p className="text-slate-500 mt-1">Keep track of important information for your team</p>
                </div>
                <Button onClick={() => setShowModal(true)} className="shadow-lg shadow-indigo-500/25">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Note
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-500/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-indigo-100 text-sm font-medium">Total Notes</p>
                            <p className="text-3xl font-bold mt-1">{notes.length}</p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 text-white shadow-lg shadow-amber-500/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-amber-100 text-sm font-medium">Pinned</p>
                            <p className="text-3xl font-bold mt-1">{pinnedCount}</p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M16 4h-2V2h-4v2H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-1 9h-2v2c0 .55-.45 1-1 1s-1-.45-1-1v-2H9c-.55 0-1-.45-1-1s.45-1 1-1h2V9c0-.55.45-1 1-1s1 .45 1 1v2h2c.55 0 1 .45 1 1s-.45 1-1 1z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Search - spans 2 columns */}
                <div className="md:col-span-2">
                    <div className="relative h-full">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search notes by title or content..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 bg-white/80 backdrop-blur text-slate-900 placeholder-slate-400 transition-all duration-300 hover:border-indigo-300 hover:shadow-lg focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:shadow-xl"
                        />
                    </div>
                </div>
            </div>

            {/* Notes Grid */}
            {sortedNotes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {sortedNotes.map((note) => {
                        const colors = getColorClasses(note.color);
                        return (
                            <div
                                key={note.id}
                                onClick={() => setViewingNote(note)}
                                className={`group relative bg-white rounded-2xl shadow-sm border-2 ${colors.border} ${colors.hover} hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1`}
                            >
                                {/* Color accent bar */}
                                <div className={`h-1.5 bg-gradient-to-r ${colors.header}`} />

                                {/* Pin indicator */}
                                {note.isPinned && (
                                    <div className="absolute top-3 right-3 z-10">
                                        <div className={`h-8 w-8 rounded-full ${colors.light} flex items-center justify-center shadow-sm`}>
                                            <svg className={`w-4 h-4 ${colors.text}`} fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
                                            </svg>
                                        </div>
                                    </div>
                                )}

                                {/* Note Content */}
                                <div className="p-5">
                                    <h3 className={`font-semibold text-slate-900 text-lg line-clamp-1 group-hover:${colors.text} transition-colors pr-10`}>
                                        {note.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm line-clamp-3 mt-2 whitespace-pre-wrap leading-relaxed">
                                        {note.content}
                                    </p>
                                </div>

                                {/* Footer */}
                                <div className={`px-5 py-3 ${colors.bg} border-t ${colors.border}`}>
                                    <div className="flex items-center gap-2">
                                        <div className={`h-7 w-7 rounded-full bg-gradient-to-br ${colors.header} flex items-center justify-center text-white text-xs font-semibold shadow-sm`}>
                                            {note.createdBy?.name?.charAt(0)?.toUpperCase() || 'A'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-slate-700 truncate">
                                                {note.createdBy?.name || 'Admin'}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {formatDate(note.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-12">
                    <div className="text-center max-w-md mx-auto">
                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/10">
                            <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">
                            {searchTerm ? 'No notes found' : 'Start capturing ideas'}
                        </h3>
                        <p className="text-slate-500 mt-3">
                            {searchTerm
                                ? 'Try a different search term or create a new note'
                                : 'Create your first note to keep important information organized and accessible to your team'}
                        </p>
                        {!searchTerm && (
                            <Button onClick={() => setShowModal(true)} className="mt-6 shadow-lg shadow-indigo-500/25">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create Your First Note
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* View Note Modal */}
            <Modal
                isOpen={!!viewingNote}
                onClose={() => setViewingNote(null)}
                title=""
                size="lg"
            >
                {viewingNote && (
                    <div className="space-y-4">
                        {/* Color bar */}
                        <div className={`-mx-6 -mt-6 h-2 bg-gradient-to-r ${getColorClasses(viewingNote.color).header}`} />

                        <div className="flex items-start justify-between gap-4 pt-2">
                            <h2 className="text-2xl font-bold text-slate-900">{viewingNote.title}</h2>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handleTogglePin(viewingNote)}
                                    className={`p-2 rounded-lg transition-colors ${viewingNote.isPinned ? 'bg-amber-100 text-amber-600' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'}`}
                                    title={viewingNote.isPinned ? 'Unpin note' : 'Pin note'}
                                >
                                    <svg className="w-5 h-5" fill={viewingNote.isPinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleEdit(viewingNote)}
                                    className="p-2 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"
                                    title="Edit note"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleDelete(viewingNote.id)}
                                    className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                                    title="Delete note"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="prose prose-slate max-w-none">
                            <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{viewingNote.content}</p>
                        </div>

                        <div className={`flex items-center gap-3 pt-4 mt-4 border-t border-slate-100`}>
                            <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${getColorClasses(viewingNote.color).header} flex items-center justify-center text-white font-semibold shadow-md`}>
                                {viewingNote.createdBy?.name?.charAt(0)?.toUpperCase() || 'A'}
                            </div>
                            <div>
                                <p className="font-medium text-slate-900">{viewingNote.createdBy?.name || 'Admin'}</p>
                                <p className="text-sm text-slate-500">Created {formatDate(viewingNote.createdAt)}</p>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Add/Edit Note Modal */}
            <Modal
                isOpen={showModal}
                onClose={handleCloseModal}
                title={editingNote ? 'Edit Note' : 'Create New Note'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    <Input
                        label="Title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Give your note a title..."
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Content <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 resize-none transition-all duration-200 hover:border-indigo-300 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                            placeholder="Write your note here..."
                            rows={8}
                            required
                        />
                    </div>

                    {/* Color Picker */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">
                            Color Theme
                        </label>
                        <div className="flex gap-3">
                            {NOTE_COLORS.map((color) => (
                                <button
                                    key={color.name}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, color: color.name })}
                                    className={`h-10 w-10 rounded-xl bg-gradient-to-br ${color.header} transition-all duration-200 ${formData.color === color.name
                                        ? 'ring-4 ring-offset-2 ring-slate-400 scale-110'
                                        : 'hover:scale-105 opacity-70 hover:opacity-100'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Pin Toggle */}
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, isPinned: !formData.isPinned })}
                            className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${formData.isPinned ? 'bg-amber-500' : 'bg-slate-300'}`}
                        >
                            <div className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${formData.isPinned ? 'translate-x-5' : ''}`} />
                        </button>
                        <div>
                            <p className="font-medium text-slate-900">Pin this note</p>
                            <p className="text-sm text-slate-500">Pinned notes appear at the top of the list</p>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={handleCloseModal} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1 shadow-lg shadow-indigo-500/25">
                            {editingNote ? 'Save Changes' : 'Create Note'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
