'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';

export default function DashboardPage() {
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [stats, setStats] = useState({
        orders: [],
        todos: [],
        transactions: [],
        totalBalance: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (companies.length > 0) {
            calculateStats();
        }
    }, [selectedCompany, companies]);

    const fetchData = async () => {
        try {
            const [companiesRes, ordersRes, todosRes, transactionsRes] = await Promise.all([
                fetch('/api/companies'),
                fetch('/api/orders'),
                fetch('/api/todos'),
                fetch('/api/transactions'),
            ]);

            const [companiesData, ordersData, todosData, transactionsData] = await Promise.all([
                companiesRes.json(),
                ordersRes.json(),
                todosRes.json(),
                transactionsRes.json(),
            ]);

            setCompanies(companiesData.companies || []);
            setStats({
                orders: ordersData.orders || [],
                todos: todosData.todos || [],
                transactions: transactionsData.transactions || [],
                totalBalance: companiesData.companies?.reduce((sum, c) => sum + c.balance, 0) || 0,
            });
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = () => {
        // Stats are already loaded, filtering happens in render
    };

    // Filter data by selected company
    const filteredOrders = selectedCompany
        ? stats.orders.filter(o => o.companyId === selectedCompany)
        : stats.orders;

    const filteredTransactions = selectedCompany
        ? stats.transactions.filter(t => t.companyId === selectedCompany)
        : stats.transactions;

    const filteredBalance = selectedCompany
        ? companies.find(c => c.id === selectedCompany)?.balance || 0
        : stats.totalBalance;

    // Order counts by status
    const ordersByStatus = {
        active: filteredOrders.filter(o => o.status === 'active').length,
        on_hold: filteredOrders.filter(o => o.status === 'on_hold').length,
        in_meeting: filteredOrders.filter(o => o.status === 'in_meeting').length,
        completed: filteredOrders.filter(o => o.status === 'completed').length,
    };

    // Todo counts by status
    const todosByStatus = {
        pending: stats.todos.filter(t => t.status === 'pending').length,
        in_progress: stats.todos.filter(t => t.status === 'in_progress').length,
        completed: stats.todos.filter(t => t.status === 'completed').length,
    };

    // Recent transactions
    const recentTransactions = filteredTransactions.slice(0, 5);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Company Selector */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-500 mt-1">
                        {selectedCompany
                            ? `Viewing stats for ${companies.find(c => c.id === selectedCompany)?.name}`
                            : 'Overview of all companies'}
                    </p>
                </div>
                <div className="w-64">
                    <Select
                        value={selectedCompany}
                        onChange={(e) => setSelectedCompany(e.target.value)}
                        placeholder="All Companies"
                        options={[
                            { value: '', label: 'All Companies' },
                            ...companies.map((c) => ({ value: c.id, label: c.name }))
                        ]}
                    />
                </div>
            </div>

            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Balance Card */}
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium">Total Balance</p>
                            <p className="text-3xl font-bold mt-1">₹{filteredBalance.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Orders Card */}
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Total Orders</p>
                            <p className="text-3xl font-bold mt-1">{filteredOrders.length}</p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Companies Card */}
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium">Companies</p>
                            <p className="text-3xl font-bold mt-1">{companies.length}</p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Todos Card */}
                <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm font-medium">Pending Tasks</p>
                            <p className="text-3xl font-bold mt-1">{todosByStatus.pending}</p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Orders by Status */}
                <Card title="Orders by Status" subtitle="Distribution of orders">
                    <div className="space-y-4">
                        {[
                            { label: 'Active', value: ordersByStatus.active, color: 'bg-green-500', total: filteredOrders.length },
                            { label: 'On Hold', value: ordersByStatus.on_hold, color: 'bg-yellow-500', total: filteredOrders.length },
                            { label: 'In Meeting', value: ordersByStatus.in_meeting, color: 'bg-blue-500', total: filteredOrders.length },
                            { label: 'Completed', value: ordersByStatus.completed, color: 'bg-slate-400', total: filteredOrders.length },
                        ].map((item) => (
                            <div key={item.label}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-slate-600">{item.label}</span>
                                    <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${item.color} rounded-full transition-all duration-500`}
                                        style={{ width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Todo Progress */}
                <Card title="Task Progress" subtitle="Your todo completion rate">
                    <div className="flex items-center justify-center py-6">
                        <div className="relative">
                            <svg className="w-40 h-40 transform -rotate-90">
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="70"
                                    stroke="#e2e8f0"
                                    strokeWidth="12"
                                    fill="none"
                                />
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="70"
                                    stroke="#22c55e"
                                    strokeWidth="12"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeDasharray={`${((todosByStatus.completed) / (stats.todos.length || 1)) * 440} 440`}
                                    className="transition-all duration-500"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold text-slate-900">
                                    {stats.todos.length > 0
                                        ? Math.round((todosByStatus.completed / stats.todos.length) * 100)
                                        : 0}%
                                </span>
                                <span className="text-sm text-slate-500">Completed</span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="text-center p-3 rounded-lg bg-yellow-50">
                            <p className="text-2xl font-bold text-yellow-600">{todosByStatus.pending}</p>
                            <p className="text-xs text-slate-500">Pending</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-blue-50">
                            <p className="text-2xl font-bold text-blue-600">{todosByStatus.in_progress}</p>
                            <p className="text-xs text-slate-500">In Progress</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-green-50">
                            <p className="text-2xl font-bold text-green-600">{todosByStatus.completed}</p>
                            <p className="text-xs text-slate-500">Completed</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card title="Recent Transactions" subtitle="Latest financial activities">
                {recentTransactions.length > 0 ? (
                    <div className="space-y-3">
                        {recentTransactions.map((t) => (
                            <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${t.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                        }`}>
                                        {t.type === 'credit' ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                            </svg>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">{t.description || (t.type === 'credit' ? 'Money Received' : 'Money Sent')}</p>
                                        <p className="text-sm text-slate-500">{t.company?.name} • {new Date(t.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className={`text-lg font-semibold ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                    {t.type === 'credit' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-slate-500">
                        No recent transactions
                    </div>
                )}
            </Card>

            {/* Quick Actions */}
            <Card title="Quick Actions">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <a href="/dashboard/companies" className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors text-center group">
                        <div className="h-10 w-10 rounded-lg bg-blue-500 text-white flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <div className="text-blue-600 font-medium text-sm">Companies</div>
                    </a>
                    <a href="/dashboard/orders" className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 transition-colors text-center group">
                        <div className="h-10 w-10 rounded-lg bg-orange-500 text-white flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div className="text-orange-600 font-medium text-sm">Orders</div>
                    </a>
                    <a href="/dashboard/money" className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-colors text-center group">
                        <div className="h-10 w-10 rounded-lg bg-green-500 text-white flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="text-green-600 font-medium text-sm">Money</div>
                    </a>
                    <a href="/dashboard/calendar" className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-colors text-center group">
                        <div className="h-10 w-10 rounded-lg bg-purple-500 text-white flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="text-purple-600 font-medium text-sm">Calendar</div>
                    </a>
                    <a href="/dashboard/links" className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-teal-50 hover:from-cyan-100 hover:to-teal-100 transition-colors text-center group">
                        <div className="h-10 w-10 rounded-lg bg-cyan-500 text-white flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        </div>
                        <div className="text-cyan-600 font-medium text-sm">Links</div>
                    </a>
                </div>
            </Card>
        </div>
    );
}
