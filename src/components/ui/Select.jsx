'use client';

import { useState, useRef, useEffect } from 'react';

export default function Select({
    label,
    error,
    options = [],
    placeholder = 'Select an option',
    className = '',
    value,
    onChange,
    disabled = false,
    required = false,
    ...props
}) {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);

    // Find selected option based on value
    const selectedOption = options.find(opt => opt.value === value || opt.value === String(value)) || null;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        setIsOpen(false);
        if (onChange) {
            const syntheticEvent = {
                target: { value: option.value, name: props.name },
            };
            onChange(syntheticEvent);
        }
    };

    return (
        <div className={`w-full ${className}`} ref={selectRef}>
            {label && (
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {/* Hidden input for form compatibility */}
            <input type="hidden" value={value || ''} name={props.name} required={required} />

            {/* Custom Select Button */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className={`
                        relative w-full rounded-xl border-2 bg-white px-4 py-3 text-left text-sm
                        transition-all duration-200 ease-out
                        ${isOpen
                            ? 'border-blue-500 ring-4 ring-blue-500/10 shadow-lg'
                            : 'border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-md'
                        }
                        ${error ? 'border-red-500 focus:border-red-500 ring-red-500/10' : ''}
                        ${disabled ? 'bg-slate-50 cursor-not-allowed opacity-60' : 'cursor-pointer'}
                    `}
                >
                    <div className="flex items-center justify-between">
                        <span className={`block truncate font-medium ${selectedOption ? 'text-slate-900' : 'text-slate-400'}`}>
                            {selectedOption ? selectedOption.label : placeholder}
                        </span>
                        <div className={`ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </button>

                {/* Dropdown Options */}
                {isOpen && (
                    <div className="absolute z-50 mt-2 w-full max-h-60 overflow-auto rounded-xl border-2 border-slate-200 bg-white shadow-xl"
                        style={{
                            animation: 'fadeInDown 0.2s ease-out'
                        }}
                    >
                        <div className="p-1.5">
                            {options.length > 0 ? (
                                options.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleSelect(option)}
                                        className={`
                                            w-full px-4 py-2.5 text-left text-sm rounded-lg
                                            transition-all duration-150 flex items-center justify-between
                                            ${selectedOption?.value === option.value
                                                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-semibold'
                                                : 'text-slate-700 hover:bg-slate-50 font-medium'
                                            }
                                        `}
                                    >
                                        <span>{option.label}</span>
                                        {selectedOption?.value === option.value && (
                                            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-sm text-slate-400 text-center">
                                    No options available
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
                    <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                </p>
            )}

            <style jsx>{`
                @keyframes fadeInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-8px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}
