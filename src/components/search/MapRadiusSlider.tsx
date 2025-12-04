import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";



interface MapRadiusSliderProps {
    value: number;
    onChange: (value: number) => void;
    onCommit: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    className?: string;
    orientation?: "horizontal" | "vertical";
}

export const MapRadiusSlider = ({
    value,
    onChange,
    onCommit,
    min = 0.5,
    max = 100,
    step = 0.5,
    className,
    orientation = "vertical",
}: MapRadiusSliderProps) => {
    return (
        <SliderPrimitive.Root
            className={cn(
                "relative flex touch-none select-none items-center",
                orientation === "vertical" ? "flex-col w-full h-full" : "w-full",
                className
            )}
            value={[value]}
            onValueChange={(vals) => onChange(vals[0])}
            onValueCommit={(vals) => onCommit(vals[0])}
            min={min}
            max={max}
            step={step}
            orientation={orientation}
        >
            {/* Track - Thin black line */}
            <SliderPrimitive.Track className={cn(
                "relative grow overflow-hidden bg-black rounded-full",
                orientation === "vertical" ? "w-[2px] h-full" : "h-[2px] w-full"
            )}>
                <SliderPrimitive.Range className="absolute bg-black" />
            </SliderPrimitive.Track>

            {/* Thumb - Solid Indigo Circle */}
            <SliderPrimitive.Thumb className="block h-6 w-6 rounded-full bg-[#4B0082] shadow-lg ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
        </SliderPrimitive.Root>
    );
};
