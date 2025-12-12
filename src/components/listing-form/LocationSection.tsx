import { useState, useEffect } from "react";
import { LocationAutocomplete } from "@/components/search/LocationAutocomplete";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SectionProps } from "./types";
import { X } from "lucide-react";

export const LocationSection = ({ formData, onChange }: SectionProps) => {
    // Local state to manage editing mode and input value
    // This decoupled state prevents auto-saving on every keystroke
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(formData.addressText || "");

    // Sync local input with global state when not editing (e.g. initial load)
    useEffect(() => {
        if (!isEditing) {
            setInputValue(formData.addressText || "");
        }
    }, [formData.addressText, isEditing]);

    // Custom wrapper for handling location changes from autocomplete
    const handleLocationChange = (value: string, placeId?: string) => {
        setInputValue(value);

        // Only trigger parent update (and API save) if a specific place is selected
        if (placeId) {
            onChange("addressText", value);
            onChange("placeId", placeId);
            setIsEditing(false);
        } else if (value === "") {
            // Optional: Handle clear if needed, or just let them type
            // For now, we don't save empty strings automatically unless explicitly desired
            // If we want to allow clearing:
            // onChange("addressText", "");
            // onChange("placeId", "");
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setInputValue(formData.addressText || "");
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Location</h2>
            <div className="bg-card rounded-lg border shadow-sm px-4 py-4">
                <Label className="text-muted-foreground font-medium mb-2 block">Address</Label>

                {!isEditing && formData.addressText ? (
                    <div className="group relative flex items-center justify-between">
                        <p className="text-foreground font-medium pr-8">{formData.addressText}</p>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setIsEditing(true)}
                        >
                            Change
                        </Button>
                    </div>
                ) : (
                    <div className="relative">
                        <LocationAutocomplete
                            value={inputValue}
                            onChange={handleLocationChange}
                            placeholder="Search for your address..."
                        />
                        {isEditing && formData.addressText && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-12 top-1 bg-background/80 hover:bg-background"
                                onClick={handleCancel}
                                title="Cancel"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
