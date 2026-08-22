import * as React from 'react';
import { cn } from '@/lib/utils';

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
    ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
        return (
            <label
                className={cn(
                    'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background',
                    checked ? 'bg-primary' : 'bg-input',
                    disabled && 'cursor-not-allowed opacity-50',
                    className
                )}
            >
                <input
                    type="checkbox"
                    className="sr-only"
                    ref={ref}
                    checked={checked}
                    disabled={disabled}
                    onChange={(e) => onCheckedChange?.(e.target.checked)}
                    {...props}
                />
                <span
                    className={cn(
                        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out',
                        checked ? 'translate-x-5 bg-white dark:bg-black' : 'translate-x-0'
                    )}
                />
            </label>
        );
    }
);
Switch.displayName = 'Switch';

export { Switch };
