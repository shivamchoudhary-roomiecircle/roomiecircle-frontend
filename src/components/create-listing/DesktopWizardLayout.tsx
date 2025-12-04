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
        <div className="min-h-screen bg-background flex overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 border-r bg-muted/30 flex flex-col h-screen shrink-0">
                <div className="p-6 border-b">
                    <div className="flex items-center gap-2 mb-6">
                        <Button variant="ghost" size="icon" onClick={handleClose} className="-ml-2">
                            <X className="h-5 w-5" />
                        </Button>
                        <span className="font-semibold text-lg">Create Listing</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                    {steps.map((step, idx) => {
                        const isCompleted = idx < currentStep;
                        const isCurrent = idx === currentStep;
                        const isClickable = idx < currentStep; // Only allow going back to completed steps

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
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-3xl mx-auto px-8 py-12">
                        {title && (
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
                                    {title}
                                </h1>
                                {description && (
                                    <p className="text-muted-foreground text-lg">
                                        {description}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {children}
                        </div>
                    </div>
                </div>

                {/* Footer Bar */}
                <div className="p-6 border-t bg-background flex justify-between items-center max-w-3xl mx-auto w-full">
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
            </div>
        </div>
    );
}
