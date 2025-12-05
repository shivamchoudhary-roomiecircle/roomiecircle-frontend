import React from 'react';
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
        <div className="flex items-center justify-between p-3 rounded-lg border border-muted hover:border-muted-foreground/20 transition-all bg-card">
            <span className="text-sm font-medium">{label}</span>
            <div className="flex gap-1.5">
                <button
                    type="button"
                    onClick={() => onChange(false)}
                    className={cn(
                        "h-8 px-3 rounded-md border font-medium transition-all text-sm",
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
                        "h-8 px-3 rounded-md border font-medium transition-all text-sm",
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
        <div className="space-y-3">
            <div className="space-y-2">
                <Label className="text-sm font-semibold">Key Features</Label>

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
