export default function Input({
    label,
    error,
    className = '',
    required = false,
    ...props
}) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <input
                className={`
                    w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 
                    placeholder-slate-400 
                    transition-all duration-200
                    hover:border-blue-300 hover:shadow-md
                    focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:shadow-lg
                    disabled:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60
                    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}
                    ${className}
                `}
                required={required}
                {...props}
            />
            {error && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
                    <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}
