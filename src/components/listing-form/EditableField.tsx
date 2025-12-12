import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Check, X, Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface EditableFieldProps {
    label: string;
    value: any;
    onSave: (val: any) => void;
    type?: "text" | "number" | "date" | "select";
    options?: { label: string; value: string; symbol?: string }[];
    placeholder?: string;
    multiline?: boolean;
    className?: string;
}

export const EditableField = ({
    label,
    value,
    onSave,
    type = "text",
    options = [],
    placeholder = "Click to edit",
    multiline = false,
    className = ""
}: EditableFieldProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    useEffect(() => {
        setTempValue(value);
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleSave = () => {
        onSave(tempValue);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setTempValue(value);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className={`py-3 border-b border-border/50 animate-in fade-in zoom-in-95 duration-200 ${className}`}>
                <Label className="text-xs text-primary font-semibold mb-1.5 block uppercase tracking-wider">{label}</Label>
                <div className="flex gap-2 items-start">
                    <div className="flex-1">
                        {type === "select" ? (
                            <Select value={tempValue?.toString()} onValueChange={setTempValue}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {options.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.symbol && <span className="mr-2">{opt.symbol}</span>}
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : type === "date" ? (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal h-9",
                                            !tempValue && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {tempValue ? format(new Date(tempValue), "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={tempValue ? new Date(tempValue) : undefined}
                                        onSelect={(date) => date && setTempValue(date.toISOString())}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        ) : multiline ? (
                            <Textarea
                                ref={inputRef as any}
                                value={tempValue || ""}
                                onChange={(e) => setTempValue(e.target.value)}
                                className="min-h-[100px] text-sm resize-none"
                                placeholder={placeholder}
                            />
                        ) : (
                            <Input
                                ref={inputRef as any}
                                type={type}
                                value={tempValue || ""}
                                onChange={(e) => setTempValue(e.target.value)}
                                className="h-9 text-sm"
                                placeholder={placeholder}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSave();
                                    if (e.key === 'Escape') handleCancel();
                                }}
                            />
                        )}
                    </div>
                    <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-9 w-9 text-green-500 hover:text-green-600 hover:bg-green-500/10" onClick={handleSave}>
                            <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={handleCancel}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Display Mode
    let displayValue = value;
    if (type === "select" && options.length > 0) {
        const selected = options.find(o => o.value === value);
        if (selected) displayValue = selected.label;
    } else if (type === "date" && value) {
        try {
            displayValue = format(new Date(value), "MMMM d, yyyy");
        } catch (e) {
            displayValue = value;
        }
    } else if (!value) {
        displayValue = <span className="text-muted-foreground italic text-sm">{placeholder}</span>;
    }

    return (
        <div
            className={`py-4 border-b border-border/50 group cursor-pointer hover:bg-muted/30 -mx-4 px-4 transition-colors ${className}`}
            onClick={() => setIsEditing(true)}
        >
            <div className="flex justify-between items-center mb-0.5">
                <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</Label>
                <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-sm font-medium text-foreground leading-relaxed break-words pr-4">
                {displayValue}
            </div>
        </div>
    );
};
