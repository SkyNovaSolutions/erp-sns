'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Topbar() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await fetch('/api/auth/session');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                }
            } catch (error) {
                console.error('Failed to fetch session:', error);
            }
        };
        fetchSession();
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <header className="fixed top-0 left-64 right-0 z-30 h-16 bg-white/80 backdrop-blur-lg border-b border-slate-200">
            <div className="flex h-full items-center justify-between px-6">
                {/* Search */}
                <div className="flex-1 max-w-xl">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 pl-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                        <svg
                            className="absolute left-3 top-2.5 h-5 w-5 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-4">
                    {/* Notifications */}
                    <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
                        <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
                    </button>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-100 transition-colors"
                        >
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                {user?.name?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium text-slate-700">{user?.name || 'Admin'}</p>
                                <p className="text-xs text-slate-500">{user?.email || 'admin@example.com'}</p>
                            </div>
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {showDropdown && (
                            <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg border border-slate-200 py-1">
                                <button
                                    onClick={handleLogout}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
