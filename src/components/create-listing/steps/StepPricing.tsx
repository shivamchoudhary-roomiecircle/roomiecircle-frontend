import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { DollarSign } from "lucide-react";

interface StepPricingProps {
    formData: any;
    onChange: (field: string, value: any) => void;
}

export function StepPricing({ formData, onChange }: StepPricingProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <Label htmlFor="monthlyRent" className="text-lg font-semibold">Monthly Rent</Label>
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        ₹
                    </div>
                    <Input
                        id="monthlyRent"
                        type="number"
                        placeholder="0"
                        value={formData.monthlyRent}
                        onChange={(e) => onChange("monthlyRent", e.target.value)}
                        className="pl-8 h-14 text-lg rounded-xl border-2"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <Label htmlFor="deposit" className="text-lg font-semibold">Security Deposit</Label>
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        ₹
                    </div>
                    <Input
                        id="deposit"
                        type="number"
                        placeholder="0"
                        value={formData.deposit}
                        onChange={(e) => onChange("deposit", e.target.value)}
                        className="pl-8 h-14 text-lg rounded-xl border-2"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <Label htmlFor="maintenance" className="text-lg font-semibold">Maintenance</Label>
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        ₹
                    </div>
                    <Input
                        id="maintenance"
                        type="number"
                        placeholder="0"
                        value={formData.maintenance}
                        onChange={(e) => onChange("maintenance", e.target.value)}
                        className="pl-8 h-14 text-lg rounded-xl border-2"
                    />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                        id="maintenanceIncluded"
                        checked={formData.maintenanceIncluded}
                        onCheckedChange={(checked) => onChange("maintenanceIncluded", checked)}
                        className="h-5 w-5 border-2"
                    />
                    <Label htmlFor="maintenanceIncluded" className="text-base font-medium cursor-pointer">
                        Maintenance included in rent
                    </Label>
                </div>
            </div>
        </div>
    );
}
