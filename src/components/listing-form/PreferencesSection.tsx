import { useState } from "react";
import { EditableField } from "./EditableField";
import { IconRenderer } from "@/lib/iconMapper";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SectionProps } from "./types";
import { GENDERS, PROFESSIONS, LIFESTYLE_UI, LIFESTYLES } from "@/constants/ui-constants";
import { LifestylePreference } from "@api-docs/typescript/enums";

export const PreferencesSection = ({ formData, onChange }: SectionProps) => {
    const [isLifestyleModalOpen, setIsLifestyleModalOpen] = useState(false);
    const [customLifestyle, setCustomLifestyle] = useState("");

    const handleLifestyleToggle = (val: string) => {
        const current = formData.lifestyle || [];
        const newItem = current.includes(val)
            ? current.filter(l => l !== val)
            : [...current, val];
        onChange("lifestyle", newItem);
    };

    const handleAddCustomLifestyle = () => {
        if (!customLifestyle.trim()) return;
        const val = customLifestyle.trim();
        if (!formData.lifestyle.includes(val)) {
            handleLifestyleToggle(val);
            setCustomLifestyle("");
        }
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Roommate Preferences</h2>
            <div className="bg-card rounded-lg border shadow-sm px-4">
                <EditableField
                    label="Min Age"
                    value={formData.minAge}
                    onSave={(val) => onChange("minAge", val)}
                    type="number"
                />
                <EditableField
                    label="Max Age"
                    value={formData.maxAge}
                    onSave={(val) => onChange("maxAge", val)}
                    type="number"
                />
                <EditableField
                    label="Preferred Gender"
                    value={formData.gender}
                    onSave={(val) => onChange("gender", val)}
                    type="select"
                    options={GENDERS}
                />
                <EditableField
                    label="Preferred Profession"
                    value={formData.profession}
                    onSave={(val) => onChange("profession", val)}
                    type="select"
                    options={PROFESSIONS}
                />

                <div className="py-4 border-b border-border/50">
                    <span className="text-muted-foreground font-medium block mb-2">Lifestyle Preferences</span>
                    <div className="flex flex-wrap gap-2">
                        {formData.lifestyle.map(value => {
                            const configItem = LIFESTYLE_UI[value as LifestylePreference];
                            return (
                                <div
                                    key={value}
                                    className="px-3 py-1.5 rounded-full text-sm border bg-primary text-primary-foreground border-primary flex items-center gap-2"
                                >
                                    {configItem ? <IconRenderer symbol={configItem.iconName} /> : null}
                                    <span>{configItem ? configItem.label : value}</span>
                                </div>
                            );
                        })}
                        <button
                            onClick={() => setIsLifestyleModalOpen(true)}
                            className="px-3 py-1.5 rounded-full text-sm border border-dashed border-muted-foreground/50 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center gap-1 text-muted-foreground"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Lifestyle Modal */}
            {isLifestyleModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-2xl rounded-2xl shadow-2xl border border-border/50 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-border/50">
                            <h3 className="text-xl font-semibold">Lifestyle Preferences</h3>
                            <Button variant="ghost" size="icon" onClick={() => setIsLifestyleModalOpen(false)} className="rounded-full hover:bg-muted">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <div className="mb-8">
                                <Label className="text-sm font-medium text-muted-foreground mb-3 block">Add Custom Preference</Label>
                                <div className="flex gap-3">
                                    <Input
                                        value={customLifestyle}
                                        onChange={(e) => setCustomLifestyle(e.target.value)}
                                        placeholder="e.g. Early Riser, Yoga Lover..."
                                        className="flex-1"
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddCustomLifestyle()}
                                    />
                                    <Button onClick={handleAddCustomLifestyle}>Add</Button>
                                </div>
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-muted-foreground mb-3 block">Popular Tags</Label>
                                <div className="flex flex-wrap gap-3">
                                    {LIFESTYLES.map((lifestyle: any) => {
                                        const isSelected = formData.lifestyle.includes(lifestyle.value);
                                        return (
                                            <div
                                                key={lifestyle.value}
                                                className={`px-4 py-2 rounded-full text-sm border cursor-pointer transition-all duration-200 flex items-center gap-2 ${isSelected
                                                    ? "bg-primary text-primary-foreground border-primary shadow-md transform scale-105"
                                                    : "bg-background hover:bg-muted hover:border-primary/50"
                                                    }`}
                                                onClick={() => handleLifestyleToggle(lifestyle.value)}
                                            >
                                                <IconRenderer symbol={lifestyle.iconName} />
                                                <span>{lifestyle.label}</span>
                                                {isSelected && <X className="w-3 h-3 ml-1 opacity-70" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Custom tags list could go here too but maybe overkill for now, as they are shown in selected state above */}
                        </div>

                        <div className="p-4 border-t border-border/50 bg-muted/20 rounded-b-2xl flex justify-end">
                            <Button onClick={() => setIsLifestyleModalOpen(false)}>Done</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
