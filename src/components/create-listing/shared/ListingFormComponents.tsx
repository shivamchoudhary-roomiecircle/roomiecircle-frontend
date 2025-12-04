import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { IconRenderer } from "@/lib/iconMapper";
import { Plus, Minus } from "lucide-react";

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
                "flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-sm font-medium whitespace-nowrap",
                selected
                    ? "border-black bg-white text-black shadow-sm ring-1 ring-black"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
                className
            )}
        >
            {symbol && <IconRenderer symbol={symbol} className="h-4 w-4" />}
            <span className="whitespace-nowrap">{label}</span>
            <div className={cn(
                "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                selected ? "border-black" : "border-gray-300"
            )}>
                {selected && <div className="w-2 h-2 rounded-full bg-black" />}
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
                "flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-sm font-medium",
                selected
                    ? "border-black bg-white text-black shadow-sm ring-1 ring-black"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
                className
            )}
        >
            {symbol && <IconRenderer symbol={symbol} className="h-4 w-4" />}
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
}

export function MultiSelectGroup({
    options,
    selectedValues,
    onChange,
    limit = 5,
    className
}: MultiSelectGroupProps) {
    const [expanded, setExpanded] = useState(false);

    const handleToggle = (value: string) => {
        const current = selectedValues || [];
        const updated = current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value];
        onChange(updated);
    };

    const visibleOptions = expanded ? options : options.slice(0, limit);
    const hasMore = options.length > limit;

    return (
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
                    onClick={() => setExpanded(!expanded)}
                    className="h-10 w-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
                >
                    {expanded ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </button>
            )}
        </div>
    );
}
