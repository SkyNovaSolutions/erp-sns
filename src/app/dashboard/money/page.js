'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';

export default function MoneyPage() {
    const [transactions, setTransactions] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [formData, setFormData] = useState({ amount: '', type: 'credit', description: '', companyId: '', orderNumber: '' });
    const [error, setError] = useState('');
    const [filterCompany, setFilterCompany] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [transactionsRes, companiesRes] = await Promise.all([
                fetch('/api/transactions'),
                fetch('/api/companies'),
            ]);
            const [transactionsData, companiesData] = await Promise.all([
                transactionsRes.json(),
                companiesRes.json(),
            ]);
            setTransactions(transactionsData.transactions || []);
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
            if (editingTransaction) {
                // Update transaction (only description, orderNumber - NOT amount)
                const res = await fetch(`/api/transactions/${editingTransaction.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        description: formData.description,
                        orderNumber: formData.orderNumber,
                    }),
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || 'Failed to update transaction');
                }

                setTransactions(transactions.map(t => t.id === editingTransaction.id ? data.transaction : t));
            } else {
                // Create new transaction
                const res = await fetch('/api/transactions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...formData,
                        amount: parseFloat(formData.amount),
                    }),
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || 'Failed to create transaction');
                }

                setTransactions([data.transaction, ...transactions]);
                // Update company balance in local state
                setCompanies(companies.map(c =>
                    c.id === formData.companyId
                        ? { ...c, balance: data.newBalance }
                        : c
                ));
            }

            handleCloseModal();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (transaction) => {
        setEditingTransaction(transaction);
        setFormData({
            amount: transaction.amount,
            type: transaction.type,
            description: transaction.description || '',
            companyId: transaction.companyId,
            orderNumber: transaction.orderNumber || '',
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingTransaction(null);
        setFormData({ amount: '', type: 'credit', description: '', companyId: '', orderNumber: '' });
        setError('');
    };

    const filteredTransactions = filterCompany
        ? transactions.filter(t => t.companyId === filterCompany)
        : transactions;

    const selectedCompany = companies.find(c => c.id === filterCompany);

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
                    <h1 className="text-2xl font-bold text-slate-900">Money Management</h1>
                    <p className="text-slate-500 mt-1">Track company transactions and balances</p>
                </div>
                <Button onClick={() => setShowModal(true)}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Transaction
                </Button>
            </div>

            {/* Company Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {companies.map((company) => (
                    <div
                        key={company.id}
                        onClick={() => setFilterCompany(filterCompany === company.id ? '' : company.id)}
                        className={`bg-white rounded-xl p-5 shadow-sm border-2 cursor-pointer transition-all ${filterCompany === company.id
                            ? 'border-blue-500 shadow-lg'
                            : 'border-slate-200 hover:border-slate-300'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-500">{company.name}</span>
                            {filterCompany === company.id && (
                                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Filtered</span>
                            )}
                        </div>
                        <p className={`text-2xl font-bold mt-1 ${company.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ₹{company.balance.toLocaleString('en-IN')}
                        </p>
                    </div>
                ))}
            </div>

            {/* Transactions Table */}
            <Card
                title={selectedCompany ? `${selectedCompany.name} Transactions` : 'All Transactions'}
                subtitle={`${filteredTransactions.length} transactions`}
                action={
                    filterCompany && (
                        <Button variant="secondary" size="sm" onClick={() => setFilterCompany('')}>
                            Clear Filter
                        </Button>
                    )
                }
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Type</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Description</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Order #</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Company</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Created By</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Date</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Amount</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map((transaction) => (
                                <tr key={transaction.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="py-4 px-4">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${transaction.type === 'credit'
                                            ? 'bg-green-100 text-green-600'
                                            : 'bg-red-100 text-red-600'
                                            }`}>
                                            {transaction.type === 'credit' ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                                </svg>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <p className="font-medium text-slate-900">
                                            {transaction.description || (transaction.type === 'credit' ? 'Money Received' : 'Money Sent')}
                                        </p>
                                    </td>
                                    <td className="py-4 px-4">
                                        {transaction.orderNumber ? (
                                            <span className="text-sm font-mono bg-slate-100 px-2 py-1 rounded text-slate-700">
                                                {transaction.orderNumber}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-slate-400">-</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="text-sm text-slate-600">{transaction.company?.name || '-'}</span>
                                    </td>
                                    <td className="py-4 px-4">
                                        {transaction.createdBy ? (
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-medium">
                                                    {transaction.createdBy.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-sm text-slate-600">{transaction.createdBy.name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-slate-400">-</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="text-sm text-slate-500">
                                            {new Date(transaction.createdAt).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <span className={`text-lg font-semibold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN')}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <button
                                            onClick={() => handleEdit(transaction)}
                                            className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                                            title="Edit transaction"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredTransactions.length === 0 && (
                        <div className="text-center py-12">
                            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-slate-900">No transactions yet</h3>
                            <p className="text-slate-500 mt-1">Create your first transaction to get started</p>
                        </div>
                    )}
                </div>
            </Card>

            {/* Add/Edit Transaction Modal */}
            <Modal isOpen={showModal} onClose={handleCloseModal} title={editingTransaction ? 'Edit Transaction' : 'New Transaction'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    {editingTransaction ? (
                        <>
                            {/* Edit mode - only show editable fields */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <p className="text-sm text-slate-500 mb-1">Transaction Amount (Read-only)</p>
                                <p className={`text-2xl font-bold ${editingTransaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                    {editingTransaction.type === 'credit' ? '+' : '-'}₹{editingTransaction.amount.toLocaleString('en-IN')}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                    Amount cannot be changed after creation
                                </p>
                            </div>

                            <Input
                                label="Description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Payment for services, refund, etc."
                            />

                            <Input
                                label="Order Number (Optional)"
                                value={formData.orderNumber}
                                onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                                placeholder="e.g., ORD-001"
                            />
                        </>
                    ) : (
                        <>
                            {/* Create mode - show all fields */}
                            <Select
                                label="Company"
                                value={formData.companyId}
                                onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                                options={[
                                    { value: '', label: 'Select a company' },
                                    ...companies.map((c) => ({ value: c.id, label: `${c.name} (₹${c.balance.toLocaleString('en-IN')})` })),
                                ]}
                                required
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Select
                                    label="Type"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    options={[
                                        { value: 'credit', label: 'Credit (Add Money)' },
                                        { value: 'debit', label: 'Debit (Remove Money)' },
                                    ]}
                                />

                                <Input
                                    label="Amount"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="0.00"
                                    required
                                />
                            </div>

                            <Input
                                label="Description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Payment for services, refund, etc."
                            />

                            <Input
                                label="Order Number (Optional)"
                                value={formData.orderNumber}
                                onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                                placeholder="e.g., ORD-001"
                            />
                        </>
                    )}

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={handleCloseModal} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1">
                            {editingTransaction ? 'Save Changes' : 'Create Transaction'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
