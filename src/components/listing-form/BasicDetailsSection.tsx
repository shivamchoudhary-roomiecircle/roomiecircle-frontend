import { EditableField } from "./EditableField";
import { IconRenderer } from "@/lib/iconMapper";
import { SectionProps } from "./types";
import { ROOM_TYPES, BHK_TYPES, PROPERTY_TYPES } from "@/constants/ui-constants";

export const BasicDetailsSection = ({ formData, onChange }: SectionProps) => {

    const handlePropertyTypeToggle = (typeValue: string) => {
        const currentTypes = formData.propertyType || [];
        const newTypes = currentTypes.includes(typeValue)
            ? currentTypes.filter(p => p !== typeValue)
            : [...currentTypes, typeValue];

        onChange("propertyType", newTypes);
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Details</h2>
            <div className="bg-card rounded-lg border shadow-sm px-4">
                <EditableField
                    label="Description"
                    value={formData.description}
                    onSave={(val) => onChange("description", val)}
                    multiline
                />
                <EditableField
                    label="Room Type"
                    value={formData.roomType}
                    onSave={(val) => onChange("roomType", val)}
                    type="select"
                    options={ROOM_TYPES}
                />
                <EditableField
                    label="BHK Type"
                    value={formData.bhkType}
                    onSave={(val) => onChange("bhkType", val)}
                    type="select"
                    options={BHK_TYPES}
                />
                <EditableField
                    label="Floor"
                    value={formData.floor}
                    onSave={(val) => onChange("floor", val)}
                    type="number"
                />
                <EditableField
                    label="Available From"
                    value={formData.availableDate}
                    onSave={(val) => onChange("availableDate", val)}
                    type="date"
                />

                {/* Property Types */}
                <div className="py-4 border-b border-border/50">
                    <span className="text-muted-foreground font-medium block mb-2">Property Type</span>
                    <div className="flex flex-wrap gap-2">
                        {PROPERTY_TYPES.map((type: any) => (
                            <div
                                key={type.value}
                                className={`px-3 py-1.5 rounded-full text-sm border cursor-pointer transition-colors ${formData.propertyType?.includes(type.value)
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background hover:bg-muted"
                                    }`}
                                onClick={() => handlePropertyTypeToggle(type.value)}
                            >
                                <div className="flex items-center gap-1.5">
                                    <IconRenderer symbol={type.iconName} /> {/* Using iconName as symbol for IconRenderer which handles both via map */}
                                    <span>{type.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};
