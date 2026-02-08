export default function Card({
    children,
    className = '',
    title,
    subtitle,
    action,
    noPadding = false,
    ...props
}) {
    return (
        <div
            className={`
                bg-white rounded-2xl shadow-sm border border-slate-200/60 
                overflow-hidden
                transition-all duration-200
                hover:shadow-md hover:border-slate-200
                ${className}
            `}
            {...props}
        >
            {(title || action) && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white">
                    <div>
                        {title && (
                            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                        )}
                        {subtitle && (
                            <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
                        )}
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className={noPadding ? '' : 'p-6'}>
                {children}
            </div>
        </div>
    );
}
