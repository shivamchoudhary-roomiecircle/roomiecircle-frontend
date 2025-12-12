import React, { useState, useEffect, useMemo } from 'react';
import './PremiumSlider.css';

interface PremiumSliderProps {
    value: number;
    onChange: (value: number) => void;
    onCommit: (value: number) => void;
    min?: number; // Ignored in favor of fixed scale, kept for compatibility
    max?: number; // Ignored in favor of fixed scale, kept for compatibility
    hideValue?: boolean;
}

export const PremiumSlider: React.FC<PremiumSliderProps> = ({
    value,
    onChange,
    onCommit,
    hideValue = false
}) => {
    // Generate non-linear scale values
    const radiusValues = useMemo(() => {
        const values: number[] = [];

        // 1 to 10, step 1
        for (let i = 1; i <= 10; i++) values.push(i);

        // 12 to 30, step 2
        for (let i = 12; i <= 30; i += 2) values.push(i);

        // 40 to 100, step 10
        for (let i = 40; i <= 100; i += 10) values.push(i);

        return values;
    }, []);

    // Find the index that corresponds to the current value
    // If value is not in array (e.g. initial load), find closest
    const getIndexFromValue = (val: number) => {
        const index = radiusValues.findIndex(v => v === val);
        if (index !== -1) return index;

        // Find closest
        let closestIndex = 0;
        let minDiff = Math.abs(val - radiusValues[0]);

        for (let i = 1; i < radiusValues.length; i++) {
            const diff = Math.abs(val - radiusValues[i]);
            if (diff < minDiff) {
                minDiff = diff;
                closestIndex = i;
            }
        }
        return closestIndex;
    };

    const [sliderIndex, setSliderIndex] = useState(getIndexFromValue(value));
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value.toString());

    useEffect(() => {
        setSliderIndex(getIndexFromValue(value));
        setInputValue(value.toString());
    }, [value, radiusValues]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newIndex = parseInt(e.target.value);
        setSliderIndex(newIndex);
        const newValue = radiusValues[newIndex];
        onChange(newValue);
    };

    const handleMouseUp = () => {
        const newValue = radiusValues[sliderIndex];
        onCommit(newValue);
    };

    const handleTouchEnd = () => {
        const newValue = radiusValues[sliderIndex];
        onCommit(newValue);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleInputBlur = () => {
        setIsEditing(false);
        let newValue = parseInt(inputValue);
        if (isNaN(newValue)) {
            newValue = value;
        } else {
            // Clamp to reasonable limits if needed, or just allow it
            // For now, let's clamp to 1-100 to match the general range
            newValue = Math.min(Math.max(newValue, 1), 100);
        }
        onChange(newValue);
        onCommit(newValue);
        setInputValue(newValue.toString());
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleInputBlur();
        }
    };



    return (
        <div className="PB-range-slider-div">
            {!hideValue && (
                isEditing ? (
                    <input
                        autoFocus
                        type="number"
                        value={inputValue}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        onKeyDown={handleKeyDown}
                        className="w-12 text-center text-sm border rounded p-1"
                    />
                ) : (
                    <div
                        className="PB-range-slidervalue text-sm cursor-pointer hover:underline"
                        onClick={() => setIsEditing(true)}
                    >
                        {value} km
                    </div>
                )
            )}
            <input
                type="range"
                min={0}
                max={radiusValues.length - 1}
                value={sliderIndex}
                className="PB-range-slider"
                onChange={handleChange}
                onMouseUp={handleMouseUp}
                onTouchEnd={handleTouchEnd}
            />
        </div>
    );
};
