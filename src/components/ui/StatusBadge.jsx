export default function StatusBadge({ status, type = 'order' }) {
    const orderStatuses = {
        active: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', label: 'Active' },
        on_hold: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500', label: 'On Hold' },
        in_meeting: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500', label: 'In Meeting' },
        completed: { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-500', label: 'Completed' },
    };

    const todoStatuses = {
        pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500', label: 'Pending' },
        in_progress: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500', label: 'In Progress' },
        completed: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', label: 'Completed' },
    };

    const transactionTypes = {
        credit: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', label: 'Credit' },
        debit: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', label: 'Debit' },
    };

    const statuses = type === 'order' ? orderStatuses : type === 'todo' ? todoStatuses : transactionTypes;
    const config = statuses[status] || { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-500', label: status };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
            {config.label}
        </span>
    );
}
