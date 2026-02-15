
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'icon' | 'outline';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    fullWidth?: boolean;
}

export const Button = ({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className = '',
    children,
    ...props
}: ButtonProps) => {
    const baseClass = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 border-none",
        secondary: "bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200",
        outline: "bg-transparent hover:bg-gray-50 text-gray-700 border-2 border-gray-200",
        ghost: "bg-transparent hover:bg-gray-100 text-gray-600",
        icon: "bg-transparent hover:bg-gray-100 text-gray-500 rounded-full",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs font-semibold uppercase tracking-wider",
        md: "px-5 py-2.5 text-sm",
        lg: "px-6 py-3.5 text-base font-bold",
        icon: "p-2",
    };

    const widthClass = fullWidth ? "w-full" : "";
    const sizeClass = variant === 'icon' ? sizes['icon'] : sizes[size];

    return (
        <button
            className={`${baseClass} ${variants[variant]} ${sizeClass} ${widthClass} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
