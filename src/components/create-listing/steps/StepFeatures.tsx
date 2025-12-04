import React from 'react';
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface StepFeaturesProps {
    formData: any;
    onChange: (field: string, value: any) => void;
}

export function StepFeatures({ formData, onChange }: StepFeaturesProps) {

    const ToggleCard = ({
        label,
        checked,
        onChange
    }: {
        label: string;
        checked: boolean;
        onChange: (val: boolean) => void;
    }) => (
        <div className="flex items-center justify-between p-5 rounded-xl border-2 border-muted hover:border-muted-foreground/20 transition-all bg-card">
            <span className="text-lg font-medium">{label}</span>
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => onChange(false)}
                    className={cn(
                        "h-10 px-4 rounded-lg border-2 font-medium transition-all",
                        !checked
                            ? "border-destructive/50 bg-destructive/10 text-destructive"
                            : "border-muted text-muted-foreground hover:bg-muted"
                    )}
                >
                    No
                </button>
                <button
                    type="button"
                    onClick={() => onChange(true)}
                    className={cn(
                        "h-10 px-4 rounded-lg border-2 font-medium transition-all",
                        checked
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-muted text-muted-foreground hover:bg-muted"
                    )}
                >
                    Yes
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <Label className="text-lg font-semibold">Key Features</Label>

                <ToggleCard
                    label="Has Balcony?"
                    checked={formData.hasBalcony}
                    onChange={(val) => onChange("hasBalcony", val)}
                />

                <ToggleCard
                    label="Private Washroom?"
                    checked={formData.hasPrivateWashroom}
                    onChange={(val) => onChange("hasPrivateWashroom", val)}
                />

                <ToggleCard
                    label="Furnished?"
                    checked={formData.hasFurniture}
                    onChange={(val) => onChange("hasFurniture", val)}
                />
            </div>
        </div>
    );
}
