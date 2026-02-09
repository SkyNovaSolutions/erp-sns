'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import StatusBadge from '@/components/ui/StatusBadge';

const TODO_STATUSES = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
];

export default function TodosPage() {
    const [todos, setTodos] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTodo, setEditingTodo] = useState(null);
    const [formData, setFormData] = useState({ title: '', description: '', status: 'pending', selectedAssignees: [] });
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [todosRes, employeesRes, usersRes] = await Promise.all([
                fetch('/api/todos'),
                fetch('/api/employees'),
                fetch('/api/users'),
            ]);
            const [todosData, employeesData, usersData] = await Promise.all([
                todosRes.json(),
                employeesRes.json(),
                usersRes.json(),
            ]);
            setTodos(todosData.todos || []);
            setEmployees(employeesData.employees || []);
            setUsers(usersData.users || []);
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
            const url = editingTodo ? `/api/todos/${editingTodo.id}` : '/api/todos';
            const method = editingTodo ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    status: formData.status,
                    assigneeIds: formData.selectedAssignees,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to save todo');
            }

            if (editingTodo) {
                setTodos(todos.map(t => t.id === editingTodo.id ? data.todo : t));
            } else {
                setTodos([data.todo, ...todos]);
            }
            handleCloseModal();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const res = await fetch(`/api/todos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to update todo');
            }

            setTodos(todos.map(t => t.id === id ? data.todo : t));
        } catch (err) {
            console.error('Failed to update todo:', err);
        }
    };

    const handleEdit = (todo) => {
        setEditingTodo(todo);
        // Convert assignees to the format used in formData
        const selectedAssignees = todo.assignees?.map(a => ({
            type: a.userId ? 'user' : 'employee',
            id: a.userId || a.employeeId,
        })) || [];

        setFormData({
            title: todo.title,
            description: todo.description || '',
            status: todo.status,
            selectedAssignees,
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingTodo(null);
        setFormData({ title: '', description: '', status: 'pending', selectedAssignees: [] });
        setError('');
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this task?')) return;

        try {
            await fetch(`/api/todos/${id}`, { method: 'DELETE' });
            setTodos(todos.filter((t) => t.id !== id));
        } catch (error) {
            console.error('Failed to delete todo:', error);
        }
    };

    const toggleAssignee = (type, id) => {
        const exists = formData.selectedAssignees.some(a => a.type === type && a.id === id);
        if (exists) {
            setFormData({
                ...formData,
                selectedAssignees: formData.selectedAssignees.filter(a => !(a.type === type && a.id === id)),
            });
        } else {
            setFormData({
                ...formData,
                selectedAssignees: [...formData.selectedAssignees, { type, id }],
            });
        }
    };

    const isAssigneeSelected = (type, id) => {
        return formData.selectedAssignees.some(a => a.type === type && a.id === id);
    };

    // Get assignee names for display
    const getAssigneeNames = (assignees) => {
        if (!assignees || assignees.length === 0) return null;
        return assignees.map(a => {
            if (a.user) return { name: a.user.name, type: 'user' };
            if (a.employee) return { name: a.employee.name, type: 'employee' };
            return null;
        }).filter(Boolean);
    };

    const filteredTodos = filterStatus
        ? todos.filter(t => t.status === filterStatus)
        : todos;

    const todoCounts = {
        pending: todos.filter(t => t.status === 'pending').length,
        in_progress: todos.filter(t => t.status === 'in_progress').length,
        completed: todos.filter(t => t.status === 'completed').length,
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Tasks / Todos</h1>
                    <p className="text-slate-500 mt-1">Manage tasks and assign to team members</p>
                </div>
                <Button onClick={() => setShowModal(true)}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Task
                </Button>
            </div>

            {/* Status Overview */}
            <div className="grid grid-cols-3 gap-4">
                <div
                    onClick={() => setFilterStatus(filterStatus === 'pending' ? '' : 'pending')}
                    className={`bg-white rounded-xl p-5 shadow-sm border-2 cursor-pointer transition-all ${filterStatus === 'pending' ? 'border-yellow-500' : 'border-slate-200 hover:border-yellow-200'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold text-yellow-600">{todoCounts.pending}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-600 mt-2">Pending</p>
                </div>

                <div
                    onClick={() => setFilterStatus(filterStatus === 'in_progress' ? '' : 'in_progress')}
                    className={`bg-white rounded-xl p-5 shadow-sm border-2 cursor-pointer transition-all ${filterStatus === 'in_progress' ? 'border-blue-500' : 'border-slate-200 hover:border-blue-200'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold text-blue-600">{todoCounts.in_progress}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-600 mt-2">In Progress</p>
                </div>

                <div
                    onClick={() => setFilterStatus(filterStatus === 'completed' ? '' : 'completed')}
                    className={`bg-white rounded-xl p-5 shadow-sm border-2 cursor-pointer transition-all ${filterStatus === 'completed' ? 'border-green-500' : 'border-slate-200 hover:border-green-200'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold text-green-600">{todoCounts.completed}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-600 mt-2">Completed</p>
                </div>
            </div>

            {/* Todos List */}
            <Card
                title={filterStatus ? `${TODO_STATUSES.find(s => s.value === filterStatus)?.label} Tasks` : 'All Tasks'}
                action={
                    filterStatus && (
                        <Button variant="secondary" size="sm" onClick={() => setFilterStatus('')}>
                            Clear Filter
                        </Button>
                    )
                }
            >
                <div className="space-y-3">
                    {filteredTodos.map((todo) => {
                        const assigneeNames = getAssigneeNames(todo.assignees);
                        return (
                            <div
                                key={todo.id}
                                className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                            >
                                {/* Checkbox visual */}
                                <button
                                    onClick={() => handleStatusUpdate(todo.id, todo.status === 'completed' ? 'pending' : 'completed')}
                                    className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${todo.status === 'completed'
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : 'border-slate-300 hover:border-green-400'
                                        }`}
                                >
                                    {todo.status === 'completed' && (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </button>

                                <div className="flex-1">
                                    <h4 className={`font-medium ${todo.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                                        {todo.title}
                                    </h4>
                                    {todo.description && (
                                        <p className="text-sm text-slate-500 mt-0.5">{todo.description}</p>
                                    )}
                                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                                        {assigneeNames && assigneeNames.length > 0 && (
                                            <div className="flex items-center gap-1 flex-wrap">
                                                {assigneeNames.map((a, idx) => (
                                                    <span key={idx} className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${a.type === 'user' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                        <div className={`h-4 w-4 rounded-full flex items-center justify-center text-xs font-medium ${a.type === 'user' ? 'bg-blue-200 text-blue-700' : 'bg-purple-200 text-purple-700'}`}>
                                                            {a.name.charAt(0)}
                                                        </div>
                                                        {a.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {(!assigneeNames || assigneeNames.length === 0) && (
                                            <span className="text-xs text-slate-400 italic">Unassigned</span>
                                        )}
                                        <StatusBadge status={todo.status} type="todo" />
                                        {todo.createdBy && (
                                            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Created by: {todo.createdBy.name}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Status buttons */}
                                <div className="hidden md:flex gap-1">
                                    {TODO_STATUSES.map((status) => (
                                        <button
                                            key={status.value}
                                            onClick={() => handleStatusUpdate(todo.id, status.value)}
                                            disabled={todo.status === status.value}
                                            className={`px-2 py-1 rounded text-xs transition-colors ${todo.status === status.value
                                                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            {status.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Edit button */}
                                <button
                                    onClick={() => handleEdit(todo)}
                                    className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                                    title="Edit task"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>

                                {/* Delete button */}
                                <button
                                    onClick={() => handleDelete(todo.id)}
                                    className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        );
                    })}

                    {filteredTodos.length === 0 && (
                        <div className="text-center py-12">
                            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-slate-900">
                                {filterStatus ? 'No tasks with this status' : 'No tasks yet'}
                            </h3>
                            <p className="text-slate-500 mt-1">
                                {filterStatus ? 'Try a different filter' : 'Create your first task to get started'}
                            </p>
                        </div>
                    )}
                </div>
            </Card>

            {/* Add/Edit Todo Modal */}
            <Modal isOpen={showModal} onClose={handleCloseModal} title={editingTodo ? 'Edit Task' : 'Add New Task'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    <Input
                        label="Task Title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter task title"
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 resize-none transition-all duration-200 hover:border-blue-300 hover:shadow-md focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:shadow-lg"
                            placeholder="Task details..."
                            rows={3}
                        />
                    </div>

                    <Select
                        label="Status"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        options={TODO_STATUSES}
                    />

                    {/* Multi-Select Assignees */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Assign To (Optional - Select multiple)
                        </label>

                        {/* Employees Section */}
                        {employees.length > 0 && (
                            <div>
                                <div className="flex flex-wrap gap-2">
                                    {employees.map((employee) => (
                                        <button
                                            key={employee.id}
                                            type="button"
                                            onClick={() => toggleAssignee('employee', employee.id)}
                                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isAssigneeSelected('employee', employee.id)
                                                ? 'bg-purple-500 text-white shadow-md'
                                                : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                                                }`}
                                        >
                                            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${isAssigneeSelected('employee', employee.id) ? 'bg-purple-400' : 'bg-purple-200'}`}>
                                                {employee.name.charAt(0).toUpperCase()}
                                            </div>
                                            {employee.name}
                                            {isAssigneeSelected('employee', employee.id) && (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {employees.length === 0 && (
                            <p className="text-sm text-slate-400 italic">No employees available to assign</p>
                        )}

                        {formData.selectedAssignees.length > 0 && (
                            <p className="text-xs text-slate-500 mt-2">
                                {formData.selectedAssignees.length} assignee{formData.selectedAssignees.length > 1 ? 's' : ''} selected
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={handleCloseModal} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1">
                            {editingTodo ? 'Save Changes' : 'Add Task'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
