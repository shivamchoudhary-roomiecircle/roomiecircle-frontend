import * as React from "react";
import { cn } from "@/lib/utils";

export interface FloatingInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
    ({ className, type, label, error, ...props }, ref) => {
        return (
            <div className="relative w-full">
                <input
                    type={type}
                    className={cn(
                        "peer flex h-14 w-full rounded-lg border border-input bg-background px-3 pt-5 pb-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        error && "border-destructive focus-visible:ring-destructive",
                        className
                    )}
                    placeholder={label} // Placeholder required for peer-placeholder-shown
                    ref={ref}
                    {...props}
                />
                {label && (
                    <label
                        className={cn(
                            "absolute left-3 top-4 z-10 origin-[0] -translate-y-3 scale-75 transform text-muted-foreground duration-150 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 pointer-events-none",
                            error && "text-destructive"
                        )}
                    >
                        {label}
                    </label>
                )}
                {error && (
                    <p className="text-xs text-destructive mt-1 ml-1">{error}</p>
                )}
            </div>
        );
    }
);
FloatingInput.displayName = "FloatingInput";

export { FloatingInput };
