import { EditableField } from "./EditableField";
import { SectionProps } from "./types";

export const PricingSection = ({ formData, onChange }: SectionProps) => {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Pricing</h2>
            <div className="bg-card rounded-lg border shadow-sm px-4">
                <EditableField
                    label="Monthly Rent (₹)"
                    value={formData.monthlyRent}
                    onSave={(val) => onChange("monthlyRent", val)}
                    type="number"
                />
                <EditableField
                    label="Security Deposit (₹)"
                    value={formData.deposit}
                    onSave={(val) => onChange("deposit", val)}
                    type="number"
                />
                <EditableField
                    label="Maintenance (₹)"
                    value={formData.maintenance}
                    onSave={(val) => onChange("maintenance", val)}
                    type="number"
                />

                <div className="py-4 flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">Maintenance Included</span>
                    <div
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer ${formData.maintenanceIncluded ? "bg-primary text-primary-foreground" : "bg-background"
                            }`}
                        onClick={() => onChange("maintenanceIncluded", !formData.maintenanceIncluded)}
                    >
                        <span>{formData.maintenanceIncluded ? "Yes" : "No"}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
