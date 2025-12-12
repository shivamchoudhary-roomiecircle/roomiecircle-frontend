import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { SectionProps } from "./types";
import { GENDERS, PROFESSIONS } from "@/constants/ui-constants";

export const RoommatesSection = ({ formData, onChange }: SectionProps) => {

    const handleAddRoommate = () => {
        const newRoommates = [...(formData.roommates || []), { name: "", gender: "", age: 0, profession: "", bio: "" }];
        onChange("roommates", newRoommates);
    };

    const handleRemoveRoommate = (index: number) => {
        const newRoommates = formData.roommates.filter((_, i) => i !== index);
        onChange("roommates", newRoommates);
    };

    const handleRoommateChange = (index: number, field: string, value: any) => {
        const newRoommates = formData.roommates.map((r, i) => i === index ? { ...r, [field]: value } : r);
        onChange("roommates", newRoommates);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Roommates</h2>
                <Button variant="outline" size="sm" onClick={handleAddRoommate}>
                    Add Roommate
                </Button>
            </div>
            <div className="space-y-4">
                {formData.roommates.map((roommate, index) => (
                    <div key={index} className="bg-card rounded-lg border shadow-sm p-4 relative group">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                            onClick={() => handleRemoveRoommate(index)}
                        >
                            <X className="h-4 w-4" />
                        </Button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <Label className="text-xs text-muted-foreground">Name</Label>
                                <Input
                                    value={roommate.name}
                                    onChange={(e) => handleRoommateChange(index, "name", e.target.value)}
                                    className="mt-1"
                                    placeholder="Name"
                                />
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">Gender</Label>
                                <Select
                                    value={roommate.gender}
                                    onValueChange={(v) => handleRoommateChange(index, "gender", v)}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {GENDERS.map((option: any) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">Age</Label>
                                <Input
                                    type="number"
                                    value={roommate.age || ""}
                                    onChange={(e) => handleRoommateChange(index, "age", parseInt(e.target.value))}
                                    className="mt-1"
                                    placeholder="Age"
                                />
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">Profession</Label>
                                <Select
                                    value={roommate.profession}
                                    onValueChange={(v) => handleRoommateChange(index, "profession", v)}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select profession" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PROFESSIONS.map((prof: any) => (
                                            <SelectItem key={prof.value} value={prof.value}>
                                                {prof.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">Bio</Label>
                            <Textarea
                                value={roommate.bio}
                                onChange={(e) => handleRoommateChange(index, "bio", e.target.value)}
                                className="mt-1"
                                placeholder="Tell us about this roommate..."
                                rows={2}
                            />
                        </div>
                    </div>
                ))}
                {formData.roommates.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                        No roommates added yet
                    </div>
                )}
            </div>
        </div>
    );
};
