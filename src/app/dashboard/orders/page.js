'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import StatusBadge from '@/components/ui/StatusBadge';

const ORDER_STATUSES = [
    { value: 'active', label: 'Active', color: 'bg-green-100 text-green-700' },
    { value: 'on_hold', label: 'On Hold', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'in_meeting', label: 'In Meeting', color: 'bg-blue-100 text-blue-700' },
    { value: 'completed', label: 'Completed', color: 'bg-slate-100 text-slate-700' },
];

// Status workflow - defines valid transitions
const STATUS_TRANSITIONS = {
    active: ['on_hold', 'in_meeting', 'completed'],
    on_hold: ['active', 'in_meeting', 'completed'],
    in_meeting: ['active', 'on_hold', 'completed'],
    completed: ['active'], // Can reopen
};

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [formData, setFormData] = useState({ title: '', description: '', status: 'active', companyId: '', amount: '', orderNumber: '' });
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [ordersRes, companiesRes] = await Promise.all([
                fetch('/api/orders'),
                fetch('/api/companies'),
            ]);
            const [ordersData, companiesData] = await Promise.all([
                ordersRes.json(),
                companiesRes.json(),
            ]);
            setOrders(ordersData.orders || []);
            setCompanies(companiesData.companies || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const url = editingOrder ? `/api/orders/${editingOrder.id}` : '/api/orders';
            const method = editingOrder ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to save order');
            }

            if (editingOrder) {
                setOrders(orders.map(o => o.id === editingOrder.id ? data.order : o));
            } else {
                setOrders([data.order, ...orders]);
            }

            handleCloseModal();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to update order');
            }

            setOrders(orders.map(o => o.id === id ? data.order : o));
        } catch (err) {
            console.error('Failed to update order:', err);
        }
    };

    const handleEdit = (order) => {
        setEditingOrder(order);
        setFormData({
            title: order.title,
            description: order.description || '',
            status: order.status,
            companyId: order.companyId,
            amount: order.amount || '',
            orderNumber: order.orderNumber || '',
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingOrder(null);
        setFormData({ title: '', description: '', status: 'active', companyId: '', amount: '', orderNumber: '' });
        setError('');
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this order?')) return;

        try {
            await fetch(`/api/orders/${id}`, { method: 'DELETE' });
            setOrders(orders.filter((o) => o.id !== id));
        } catch (error) {
            console.error('Failed to delete order:', error);
        }
    };

    const filteredOrders = filterStatus
        ? orders.filter(o => o.status === filterStatus)
        : orders;

    const orderCounts = {
        active: orders.filter(o => o.status === 'active').length,
        on_hold: orders.filter(o => o.status === 'on_hold').length,
        in_meeting: orders.filter(o => o.status === 'in_meeting').length,
        completed: orders.filter(o => o.status === 'completed').length,
    };

    // Calculate total amount
    const totalAmount = orders.reduce((sum, o) => sum + (o.amount || 0), 0);

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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
                    <p className="text-slate-500 mt-1">Manage and track your orders</p>
                </div>
                <Button onClick={() => setShowModal(true)}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Order
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl p-4 text-white shadow-lg">
                    <p className="text-orange-100 text-xs font-medium">Total Orders</p>
                    <p className="text-2xl font-bold mt-1">{orders.length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-4 text-white shadow-lg">
                    <p className="text-green-100 text-xs font-medium">Total Amount</p>
                    <p className="text-2xl font-bold mt-1">₹{totalAmount.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border-2 border-green-200 shadow-sm">
                    <p className="text-slate-500 text-xs font-medium">Active</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{orderCounts.active}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border-2 border-yellow-200 shadow-sm">
                    <p className="text-slate-500 text-xs font-medium">On Hold</p>
                    <p className="text-2xl font-bold text-yellow-600 mt-1">{orderCounts.on_hold}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border-2 border-slate-200 shadow-sm">
                    <p className="text-slate-500 text-xs font-medium">Completed</p>
                    <p className="text-2xl font-bold text-slate-600 mt-1">{orderCounts.completed}</p>
                </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setFilterStatus('')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === ''
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                >
                    All ({orders.length})
                </button>
                {ORDER_STATUSES.map((status) => (
                    <button
                        key={status.value}
                        onClick={() => setFilterStatus(filterStatus === status.value ? '' : status.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === status.value
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        {status.label} ({orderCounts[status.value]})
                    </button>
                ))}
            </div>

            {/* Orders Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Order #</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Title</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Company</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Amount</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Status</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Change Status</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Created By</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Date</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="py-4 px-4">
                                        {order.orderNumber ? (
                                            <span className="text-sm font-mono bg-slate-100 px-2 py-1 rounded text-slate-700">
                                                {order.orderNumber}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-slate-400">-</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-4">
                                        <div>
                                            <p className="font-medium text-slate-900">{order.title}</p>
                                            {order.description && (
                                                <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{order.description}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="text-sm text-slate-600">{order.company?.name || '-'}</span>
                                    </td>
                                    <td className="py-4 px-4">
                                        {order.amount ? (
                                            <span className="text-sm font-semibold text-green-600">
                                                ₹{order.amount.toLocaleString('en-IN')}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-slate-400">-</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-4">
                                        <StatusBadge status={order.status} type="order" />
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="relative">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                className="appearance-none text-xs rounded-lg border border-slate-200 bg-white pl-3 pr-8 py-2 text-slate-700 transition-all duration-200 hover:border-slate-300 hover:shadow focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer"
                                            >
                                                <option value={order.status}>
                                                    {ORDER_STATUSES.find(s => s.value === order.status)?.label}
                                                </option>
                                                {STATUS_TRANSITIONS[order.status]?.map((nextStatus) => (
                                                    <option key={nextStatus} value={nextStatus}>
                                                        → {ORDER_STATUSES.find(s => s.value === nextStatus)?.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        {order.createdBy ? (
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-medium">
                                                    {order.createdBy.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-sm text-slate-600">{order.createdBy.name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-slate-400">-</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="text-sm text-slate-500">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => handleEdit(order)}
                                                className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                                                title="Edit order"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(order.id)}
                                                className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                                                title="Delete order"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredOrders.length === 0 && (
                        <div className="text-center py-12">
                            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-slate-900">
                                {filterStatus ? 'No orders with this status' : 'No orders yet'}
                            </h3>
                            <p className="text-slate-500 mt-1">
                                {filterStatus ? 'Try a different filter' : 'Create your first order to get started'}
                            </p>
                        </div>
                    )}
                </div>
            </Card>

            {/* Create/Edit Order Modal */}
            <Modal isOpen={showModal} onClose={handleCloseModal} title={editingOrder ? 'Edit Order' : 'Create New Order'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Order Title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Enter order title"
                            required
                        />

                        <Input
                            label="Order Number (Optional)"
                            value={formData.orderNumber}
                            onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                            placeholder="e.g., ORD-001"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 resize-none transition-all duration-200 hover:border-blue-300 hover:shadow-md focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:shadow-lg"
                            placeholder="Order details..."
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Company"
                            value={formData.companyId}
                            onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                            options={[
                                { value: '', label: 'Select a company' },
                                ...companies.map((c) => ({ value: c.id, label: c.name })),
                            ]}
                            required
                        />

                        <Select
                            label="Status"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            options={ORDER_STATUSES}
                        />
                    </div>

                    {/* Amount Field */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Order Amount (Optional)
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="w-full rounded-xl border-2 border-slate-200 bg-white pl-8 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition-all duration-200 hover:border-blue-300 hover:shadow-md focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:shadow-lg"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            This is for reference only and doesn&apos;t affect company balance
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={handleCloseModal} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1">
                            {editingOrder ? 'Save Changes' : 'Create Order'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
