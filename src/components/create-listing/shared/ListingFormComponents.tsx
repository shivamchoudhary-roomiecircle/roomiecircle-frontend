import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { IconRenderer } from "@/lib/iconMapper";
import { Plus, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface OptionItem {
    label: string;
    value: string;
    symbol?: string;
}

interface SingleSelectOptionProps {
    label: string;
    value: string;
    symbol?: string;
    selected: boolean;
    onClick: () => void;
    className?: string;
}

export function SingleSelectOption({
    label,
    value,
    symbol,
    selected,
    onClick,
    className
}: SingleSelectOptionProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-xs font-medium whitespace-nowrap",
                selected
                    ? "border-black bg-white text-black shadow-sm ring-1 ring-black"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
                className
            )}
        >
            {symbol && <IconRenderer symbol={symbol} className="h-3 w-3" />}
            <span className="whitespace-nowrap">{label}</span>
            <div className={cn(
                "w-3 h-3 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                selected ? "border-black" : "border-gray-300"
            )}>
                {selected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
            </div>
        </button>
    );
}

interface MultiSelectChipProps {
    label: string;
    value: string;
    symbol?: string;
    selected: boolean;
    onClick: () => void;
    className?: string;
}

export function MultiSelectChip({
    label,
    value,
    symbol,
    selected,
    onClick,
    className
}: MultiSelectChipProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-xs font-medium",
                selected
                    ? "border-black bg-white text-black shadow-sm ring-1 ring-black"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
                className
            )}
        >
            {symbol && <IconRenderer symbol={symbol} className="h-3 w-3" />}
            {label}
        </button>
    );
}

interface MultiSelectGroupProps {
    options: OptionItem[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
    limit?: number;
    className?: string;
    dialogTitle?: string;
}

export function MultiSelectGroup({
    options,
    selectedValues,
    onChange,
    limit = 5,
    className,
    dialogTitle = "Select Options"
}: MultiSelectGroupProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleToggle = (value: string) => {
        const current = selectedValues || [];
        const updated = current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value];
        onChange(updated);
    };

    const visibleOptions = options.slice(0, limit);
    const hasMore = options.length > limit;

    return (
        <>
            <div className={cn("flex flex-wrap gap-3", className)}>
                {visibleOptions.map((option) => (
                    <MultiSelectChip
                        key={option.value}
                        label={option.label}
                        value={option.value}
                        symbol={option.symbol}
                        selected={selectedValues.includes(option.value)}
                        onClick={() => handleToggle(option.value)}
                    />
                ))}

                {hasMore && (
                    <button
                        type="button"
                        onClick={() => setIsDialogOpen(true)}
                        className="h-10 w-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{dialogTitle}</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto py-4">
                        <div className="flex flex-wrap gap-3">
                            {options.map((option) => (
                                <MultiSelectChip
                                    key={option.value}
                                    label={option.label}
                                    value={option.value}
                                    symbol={option.symbol}
                                    selected={selectedValues.includes(option.value)}
                                    onClick={() => handleToggle(option.value)}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end pt-4 border-t">
                        <Button onClick={() => setIsDialogOpen(false)}>
                            Done
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

interface SingleSelectGroupProps {
    options: OptionItem[];
    selectedValue: string | undefined;
    onChange: (value: string) => void;
    limit?: number;
    className?: string;
    dialogTitle?: string;
}

export function SingleSelectGroup({
    options,
    selectedValue,
    onChange,
    limit = 5,
    className,
    dialogTitle = "Select Option"
}: SingleSelectGroupProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleSelect = (value: string) => {
        onChange(value);
        setIsDialogOpen(false);
    };

    const visibleOptions = options.slice(0, limit);
    const hasMore = options.length > limit;

    return (
        <>
            <div className={cn("flex flex-wrap gap-3", className)}>
                {visibleOptions.map((option) => (
                    <SingleSelectOption
                        key={option.value}
                        label={option.label}
                        value={option.value}
                        symbol={option.symbol}
                        selected={selectedValue === option.value}
                        onClick={() => onChange(option.value)}
                    />
                ))}

                {hasMore && (
                    <button
                        type="button"
                        onClick={() => setIsDialogOpen(true)}
                        className="h-10 w-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{dialogTitle}</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto py-4">
                        <div className="flex flex-wrap gap-3">
                            {options.map((option) => (
                                <SingleSelectOption
                                    key={option.value}
                                    label={option.label}
                                    value={option.value}
                                    symbol={option.symbol}
                                    selected={selectedValue === option.value}
                                    onClick={() => handleSelect(option.value)}
                                />
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
