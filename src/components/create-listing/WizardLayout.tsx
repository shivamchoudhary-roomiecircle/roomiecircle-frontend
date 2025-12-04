import React from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from 'react-router-dom';

interface WizardLayoutProps {
    currentStep: number;
    totalSteps: number;
    title?: string;
    description?: string;
    children: React.ReactNode;
    onNext?: () => void;
    onBack?: () => void;
    onSkip?: () => void;
    isNextDisabled?: boolean;
    nextLabel?: string;
    showBackButton?: boolean;
    showCloseButton?: boolean;
    showSkipButton?: boolean;
    onClose?: () => void;
}

export function WizardLayout({
    currentStep,
    totalSteps,
    title,
    description,
    children,
    onNext,
    onBack,
    onSkip,
    isNextDisabled = false,
    nextLabel = "Next",
    showBackButton = true,
    showCloseButton = true,
    showSkipButton = false,
    onClose,
}: WizardLayoutProps) {
    const navigate = useNavigate();
    const progress = ((currentStep + 1) / totalSteps) * 100;

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else {
            navigate('/my-listings');
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative shadow-2xl overflow-hidden h-screen">
            {/* Header */}
            <div className="px-6 pt-6 pb-2 flex items-center justify-between shrink-0 z-10 bg-background/80 backdrop-blur-sm">
                {showCloseButton ? (
                    <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full hover:bg-muted/50 -ml-2 border border-primary">
                        <X className="h-6 w-6" />
                    </Button>
                ) : (
                    <div className="w-10" />
                )}

                {/* Progress Dots/Bar */}
                <div className="flex-1 mx-4 flex gap-1">
                    {Array.from({ length: totalSteps }).map((_, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "h-1 flex-1 rounded-full transition-all duration-300",
                                idx <= currentStep ? "bg-primary" : "bg-muted"
                            )}
                        />
                    ))}
                </div>

                {showSkipButton && onSkip ? (
                    <Button variant="ghost" onClick={onSkip} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                        Skip
                    </Button>
                ) : (
                    <div className="w-10" />
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col">
                {title && (
                    <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-foreground mb-2">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-muted-foreground text-lg">
                                {description}
                            </p>
                        )}
                    </div>
                )}

                <div className="flex-1 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    {children}
                </div>
            </div>

            {/* Footer / Navigation */}
            <div className="p-6 bg-background/80 backdrop-blur-sm shrink-0 flex justify-between items-center z-10">
                {showBackButton && onBack ? (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onBack}
                        className="rounded-full h-12 w-12 hover:bg-muted/50 text-muted-foreground border border-primary"
                    >
                        <ChevronLeft className="h-8 w-8" />
                    </Button>
                ) : (
                    <div className="w-12" />
                )}

                {onNext && (
                    <Button
                        onClick={onNext}
                        disabled={isNextDisabled}
                        className={cn(
                            "rounded-full h-14 w-14 p-0 shadow-lg transition-all duration-300 hover:scale-105 active:scale-95",
                            "bg-primary text-primary-foreground hover:bg-primary/90"
                        )}
                    >
                        <ChevronRight className="h-8 w-8" />
                    </Button>
                )}
            </div>
        </div>
    );
}
