import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface StepPricingProps {
    formData: any;
    onChange: (field: string, value: any) => void;
}

export function StepPricing({ formData, onChange }: StepPricingProps) {
    return (
        <div className="h-full flex flex-col gap-3">
            <div className="space-y-1 shrink-0">
                <Label htmlFor="monthlyRent" className="text-sm font-semibold">Monthly Rent</Label>
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        ₹
                    </div>
                    <Input
                        id="monthlyRent"
                        type="number"
                        placeholder="0"
                        value={formData.monthlyRent}
                        onChange={(e) => onChange("monthlyRent", e.target.value)}
                        className="pl-7 h-10 text-sm rounded-lg border"
                    />
                </div>
            </div>

            <div className="space-y-1 shrink-0">
                <Label htmlFor="deposit" className="text-sm font-semibold">Security Deposit</Label>
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        ₹
                    </div>
                    <Input
                        id="deposit"
                        type="number"
                        placeholder="0"
                        value={formData.deposit}
                        onChange={(e) => onChange("deposit", e.target.value)}
                        className="pl-7 h-10 text-sm rounded-lg border"
                    />
                </div>
            </div>

            <div className="space-y-1 shrink-0">
                <Label htmlFor="maintenance" className="text-sm font-semibold">Maintenance</Label>
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        ₹
                    </div>
                    <Input
                        id="maintenance"
                        type="number"
                        placeholder="0"
                        value={formData.maintenance}
                        onChange={(e) => onChange("maintenance", e.target.value)}
                        className="pl-7 h-10 text-sm rounded-lg border"
                    />
                </div>

                <div className="flex items-center space-x-2 pt-1">
                    <Checkbox
                        id="maintenanceIncluded"
                        checked={formData.maintenanceIncluded}
                        onCheckedChange={(checked) => onChange("maintenanceIncluded", checked)}
                        className="h-4 w-4 border"
                    />
                    <Label htmlFor="maintenanceIncluded" className="text-xs font-medium cursor-pointer">
                        Maintenance included in rent
                    </Label>
                </div>
            </div>
        </div>
    );
}
