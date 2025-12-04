import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface StepBasicsProps {
    formData: any;
    onChange: (field: string, value: any) => void;
}

export function StepBasics({ formData, onChange }: StepBasicsProps) {
    return (
        <div className="space-y-8">
            <div className="space-y-3">
                <Label htmlFor="floor" className="text-lg font-semibold">Which floor is it on?</Label>
                <div className="relative">
                    <Input
                        id="floor"
                        type="number"
                        placeholder="e.g. 1, 2, 0 (Ground)"
                        value={formData.floor}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || /^-?\d+$/.test(value)) {
                                onChange("floor", value);
                            }
                        }}
                        className="h-14 text-lg px-4 pr-20 rounded-xl border-2"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg text-gray-500 pointer-events-none">
                        Floor
                    </span>
                </div>
                <p className="text-sm text-muted-foreground">Use 0 for Ground floor, negative for basement.</p>
            </div>

            <div className="space-y-3">
                <Label htmlFor="description" className="text-lg font-semibold">Describe your place</Label>
                <Textarea
                    id="description"
                    placeholder="What makes your place special? Mention nearby landmarks, vibe, etc."
                    value={formData.description}
                    onChange={(e) => onChange("description", e.target.value)}
                    className="min-h-[200px] text-lg p-4 rounded-xl border-2 resize-none"
                />
                <div className="flex justify-end">
                    <span className="text-xs text-muted-foreground">
                        {formData.description?.length || 0} characters
                    </span>
                </div>
            </div>
        </div>
    );
}
