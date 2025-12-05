import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from 'react-router-dom';

interface DesktopWizardLayoutProps {
    currentStep: number;
    totalSteps: number;
    steps: { id: string; title: string; description?: string }[];
    title?: string;
    description?: string;
    children: React.ReactNode;
    onNext?: () => void;
    onBack?: () => void;
    onStepClick?: (index: number) => void;
    isNextDisabled?: boolean;
    nextLabel?: string;
    showBackButton?: boolean;
    showCloseButton?: boolean;
    onClose?: () => void;
}

export function DesktopWizardLayout({
    currentStep,
    totalSteps,
    steps,
    title,
    description,
    children,
    onNext,
    onBack,
    onStepClick,
    isNextDisabled = false,
    nextLabel = "Next",
    showBackButton = true,
    showCloseButton = true,
    onClose,
}: DesktopWizardLayoutProps) {
    const navigate = useNavigate();

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else {
            navigate('/my-listings');
        }
    };

    return (
        <div className="h-screen w-screen flex bg-background overflow-hidden">
            {/* Fixed Sidebar - 320px width */}
            <aside className="w-80 shrink-0 border-r bg-muted/30 flex flex-col h-full">
                <div className="p-6 border-b shrink-0">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={handleClose} className="-ml-2">
                            <X className="h-5 w-5" />
                        </Button>
                        <span className="font-semibold text-lg">Create Listing</span>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                    {steps.map((step, idx) => {
                        const isCompleted = idx < currentStep;
                        const isCurrent = idx === currentStep;
                        const isClickable = idx < currentStep;

                        return (
                            <div
                                key={step.id}
                                onClick={() => isClickable && onStepClick?.(idx)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm",
                                    isCurrent ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground",
                                    isClickable ? "cursor-pointer hover:bg-muted" : "cursor-default opacity-60"
                                )}
                            >
                                <div className={cn(
                                    "h-6 w-6 rounded-full flex items-center justify-center border text-xs shrink-0",
                                    isCompleted ? "bg-primary border-primary text-primary-foreground" :
                                        isCurrent ? "border-primary text-primary" : "border-muted-foreground"
                                )}>
                                    {isCompleted ? <Check className="h-3 w-3" /> : idx + 1}
                                </div>
                                <span className="truncate">{step.title}</span>
                            </div>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content Area - Takes remaining width */}
            <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
                {/* Content - scrollable when needed */}
                <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
                    <div className="max-w-3xl mx-auto px-8 py-6 w-full flex-1 flex flex-col min-h-0">
                        {title && (
                            <div className="mb-4 shrink-0">
                                <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
                                    {title}
                                </h1>
                                {description && (
                                    <p className="text-muted-foreground text-base">
                                        {description}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="flex-1 min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {children}
                        </div>
                    </div>
                </div>

                {/* Fixed Footer Bar */}
                <footer className="shrink-0 p-4 border-t bg-background">
                    <div className="max-w-3xl mx-auto flex justify-between items-center">
                        {showBackButton && onBack ? (
                            <Button
                                variant="outline"
                                onClick={onBack}
                                className="gap-2"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Back
                            </Button>
                        ) : (
                            <div />
                        )}

                        {onNext && (
                            <Button
                                onClick={onNext}
                                disabled={isNextDisabled}
                                className="gap-2 min-w-[120px]"
                            >
                                {nextLabel}
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </footer>
            </main>
        </div>
    );
}
