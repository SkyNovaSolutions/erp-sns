export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    ...props
}) {
    const baseStyles = `
        inline-flex items-center justify-center font-semibold rounded-xl
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-4 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        active:scale-[0.98]
    `;

    const variants = {
        primary: `
            bg-gradient-to-r from-blue-600 to-indigo-600 text-white 
            hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30
            focus:ring-blue-500/50 
            shadow-lg shadow-blue-500/25
        `,
        secondary: `
            bg-white border-2 border-slate-200 text-slate-700 
            hover:bg-slate-50 hover:border-slate-300 hover:shadow-md
            focus:ring-slate-500/30
        `,
        danger: `
            bg-gradient-to-r from-red-500 to-rose-500 text-white 
            hover:from-red-600 hover:to-rose-600 hover:shadow-xl hover:shadow-red-500/30
            focus:ring-red-500/50 
            shadow-lg shadow-red-500/25
        `,
        success: `
            bg-gradient-to-r from-green-500 to-emerald-500 text-white 
            hover:from-green-600 hover:to-emerald-600 hover:shadow-xl hover:shadow-green-500/30
            focus:ring-green-500/50 
            shadow-lg shadow-green-500/25
        `,
        outline: `
            border-2 border-blue-500 text-blue-600 bg-transparent
            hover:bg-blue-50 hover:shadow-md
            focus:ring-blue-500/30
        `,
        ghost: `
            text-slate-600 bg-transparent
            hover:bg-slate-100 hover:text-slate-900
            focus:ring-slate-500/30
        `,
    };

    const sizes = {
        sm: 'px-3 py-2 text-xs gap-1.5',
        md: 'px-5 py-2.5 text-sm gap-2',
        lg: 'px-7 py-3.5 text-base gap-2.5',
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
