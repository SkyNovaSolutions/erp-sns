'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [formData, setFormData] = useState({ title: '', description: '', color: '#3b82f6' });
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [error, setError] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const month = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
                const res = await fetch(`/api/calendar?month=${month}`);
                const data = await res.json();
                setEvents(data.events || []);
            } catch (error) {
                console.error('Failed to fetch events:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, [currentDate]);

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const days = [];

        // Previous month days
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startingDay - 1; i >= 0; i--) {
            days.push({ day: prevMonthLastDay - i, isCurrentMonth: false, date: new Date(year, month - 1, prevMonthLastDay - i) });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ day: i, isCurrentMonth: true, date: new Date(year, month, i) });
        }

        // Next month days
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            days.push({ day: i, isCurrentMonth: false, date: new Date(year, month + 1, i) });
        }

        return days;
    };

    const getEventsForDate = (date) => {
        return events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.toDateString() === date.toDateString();
        });
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDateClick = (date) => {
        setSelectedDate(date);
        setSelectedEvent(null);
        setFormData({ title: '', description: '', color: '#3b82f6' });
        setError('');
        setIsEditMode(true); // New event is always in edit mode
        setShowModal(true);
    };

    const handleEventClick = (e, event) => {
        e.stopPropagation();
        setSelectedEvent(event);
        setSelectedDate(new Date(event.date));
        setFormData({
            title: event.title,
            description: event.description || '',
            color: event.color
        });
        setError('');
        setIsEditMode(false); // View mode first when clicking existing event
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (selectedEvent) {
                // Update
                const res = await fetch(`/api/calendar/${selectedEvent.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: formData.title,
                        description: formData.description,
                        color: formData.color,
                    }),
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error);

                setEvents(events.map(ev => ev.id === selectedEvent.id ? data.event : ev));
            } else {
                // Create
                const res = await fetch('/api/calendar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: formData.title,
                        description: formData.description,
                        date: selectedDate.toISOString(),
                        color: formData.color,
                    }),
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error);

                setEvents([...events, data.event]);
            }

            setShowModal(false);
            setFormData({ title: '', description: '', color: '#3b82f6' });
            setSelectedEvent(null);
            setIsEditMode(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async () => {
        if (!selectedEvent || !confirm('Delete this event?')) return;

        try {
            await fetch(`/api/calendar/${selectedEvent.id}`, { method: 'DELETE' });
            setEvents(events.filter(ev => ev.id !== selectedEvent.id));
            setShowModal(false);
            setSelectedEvent(null);
        } catch (error) {
            console.error('Failed to delete event:', error);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedEvent(null);
        setIsEditMode(false);
    };

    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const days = getDaysInMonth(currentDate);

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
                    <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
                    <p className="text-slate-500 mt-1">Manage your events and notes</p>
                </div>
            </div>

            {/* Calendar */}
            <Card>
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={handlePrevMonth}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h2 className="text-xl font-semibold text-slate-900">
                        {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <button
                        onClick={handleNextMonth}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Days Header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {DAYS.map(day => (
                        <div key={day} className="py-2 text-center text-sm font-semibold text-slate-500">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                    {days.map((dayInfo, index) => {
                        const dayEvents = getEventsForDate(dayInfo.date);
                        return (
                            <div
                                key={index}
                                onClick={() => handleDateClick(dayInfo.date)}
                                className={`min-h-[100px] p-2 rounded-lg border cursor-pointer transition-all hover:border-blue-300 hover:bg-blue-50/50 ${dayInfo.isCurrentMonth ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100'
                                    } ${isToday(dayInfo.date) ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                            >
                                <div className={`text-sm font-medium mb-1 ${dayInfo.isCurrentMonth ? 'text-slate-900' : 'text-slate-400'
                                    } ${isToday(dayInfo.date) ? 'text-blue-600' : ''}`}>
                                    {dayInfo.day}
                                </div>
                                <div className="space-y-1">
                                    {dayEvents.slice(0, 2).map(event => (
                                        <div
                                            key={event.id}
                                            onClick={(e) => handleEventClick(e, event)}
                                            className="text-xs px-2 py-1.5 rounded-lg text-white hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                                            style={{ backgroundColor: event.color }}
                                        >
                                            <div className="font-medium truncate">{event.title}</div>
                                            {event.createdBy && (
                                                <div className="text-white/80 text-[10px] truncate mt-0.5">
                                                    👤 {event.createdBy.name}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {dayEvents.length > 2 && (
                                        <div className="text-xs text-blue-600 font-medium px-2 cursor-pointer hover:underline">
                                            +{dayEvents.length - 2} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Event Modal */}
            <Modal
                isOpen={showModal}
                onClose={closeModal}
                title={selectedEvent ? (isEditMode ? 'Edit Event' : 'Event Details') : `Add Event - ${selectedDate?.toLocaleDateString()}`}
            >
                {selectedEvent && !isEditMode ? (
                    /* View Mode */
                    <div className="space-y-4">
                        {/* Event Color Badge */}
                        <div
                            className="h-3 w-full rounded-full"
                            style={{ backgroundColor: selectedEvent.color }}
                        />

                        {/* Event Title */}
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900">{selectedEvent.title}</h3>
                            <p className="text-slate-500 mt-1">
                                📅 {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>

                        {/* Description */}
                        {selectedEvent.description && (
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                                <h4 className="text-sm font-semibold text-slate-600 mb-2">📝 Notes</h4>
                                <p className="text-slate-700 whitespace-pre-wrap">{selectedEvent.description}</p>
                            </div>
                        )}

                        {/* Creator Info */}
                        {selectedEvent.createdBy && (
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                                    {selectedEvent.createdBy.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">{selectedEvent.createdBy.name}</p>
                                    <p className="text-sm text-slate-500">
                                        Created on {new Date(selectedEvent.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t border-slate-200">
                            <Button
                                type="button"
                                variant="danger"
                                onClick={handleDelete}
                                className="flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={closeModal}
                                className="flex-1"
                            >
                                Close
                            </Button>
                            <Button
                                type="button"
                                onClick={() => setIsEditMode(true)}
                                className="flex-1 flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                Edit
                            </Button>
                        </div>
                    </div>
                ) : (
                    /* Edit/Create Mode */
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Show creator info when editing existing event */}
                        {selectedEvent && selectedEvent.createdBy && (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                                    {selectedEvent.createdBy.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Created by {selectedEvent.createdBy.name}</p>
                                    <p className="text-xs text-slate-500">{new Date(selectedEvent.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        )}

                        <Input
                            label="Title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Event title"
                            required
                        />

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Add notes..."
                                rows={3}
                                className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 resize-none transition-all duration-200 hover:border-blue-300 hover:shadow-md focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:shadow-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Color</label>
                            <div className="flex gap-2">
                                {COLORS.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, color })}
                                        className={`h-8 w-8 rounded-full transition-all ${formData.color === color ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'
                                            }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            {selectedEvent && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setIsEditMode(false)}
                                >
                                    ← Back
                                </Button>
                            )}
                            <Button type="button" variant="secondary" onClick={closeModal} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1">
                                {selectedEvent ? 'Update Event' : 'Add Event'}
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
}
