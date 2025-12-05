import { useState } from "react";
import { getImageUrl } from "@/lib/utils";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Loader2, X, Plus, Image as ImageIcon } from "lucide-react";

interface SortablePhotoProps {
    id: string;
    url: string;
    onRemove: () => void;
    isUploading: boolean;
}

const SortablePhoto = ({ id, url, onRemove, isUploading }: SortablePhotoProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="relative group aspect-square touch-none"
        >
            <div className="w-full h-full rounded-lg overflow-hidden bg-card relative border border-border shadow-sm transition-shadow hover:shadow-md">
                {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                    </div>
                )}
                <img
                    src={getImageUrl(url)}
                    alt="Listing photo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        console.error("Failed to load image:", url);
                        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3EImage%3C/text%3E%3C/svg%3E";
                    }}
                />
            </div>
            <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()} // Prevent drag start when clicking remove
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                }}
                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:scale-110"
                aria-label="Remove photo"
                disabled={isUploading}
            >
                <X className="h-3 w-3" />
            </button>
        </div>
    );
};

interface SortablePhotoGridProps {
    images: { id: number; url: string; isUploading?: boolean }[];
    onImagesChange: (newImages: { id: number; url: string; isUploading?: boolean }[]) => void;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    maxImages?: number;
    uploadId: string;
}

export function SortablePhotoGrid({
    images,
    onImagesChange,
    onUpload,
    maxImages = 8,
    uploadId,
}: SortablePhotoGridProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require 8px movement to start drag, prevents accidental drags on click
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = images.findIndex(img => img.url === active.id);
            const newIndex = images.findIndex(img => img.url === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                onImagesChange(arrayMove(images, oldIndex, newIndex));
            }
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={images.map(img => img.url)}
                strategy={rectSortingStrategy}
            >
                <div className="grid grid-cols-4 gap-2">
                    {/* Render Sortable Images */}
                    {images.map((img, index) => (
                        <SortablePhoto
                            key={img.url} // Using URL as key/id since they should be unique.
                            id={img.url}
                            url={img.url}
                            onRemove={() => {
                                const newImages = images.filter((_, i) => i !== index);
                                onImagesChange(newImages);
                            }}
                            isUploading={!!img.isUploading}
                        />
                    ))}

                    {/* Render Upload Button (if space available) */}
                    {images.length < maxImages && (
                        <div
                            className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 hover:border-primary/50 transition-all duration-300 bg-card/50 group"
                            onClick={() => document.getElementById(uploadId)?.click()}
                        >
                            <div className="h-6 w-6 rounded-full bg-muted/50 flex items-center justify-center mb-1 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
                                <Plus className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <span className="text-[10px] text-muted-foreground font-medium group-hover:text-primary transition-colors">Add</span>
                        </div>
                    )}

                    {/* Render Placeholders */}
                    {Array.from({ length: Math.max(0, maxImages - images.length - 1) }).map((_, i) => (
                        <div
                            key={`placeholder-${i}`}
                            className="aspect-square rounded-lg bg-muted/30 border border-muted flex items-center justify-center"
                        >
                            <ImageIcon className="h-4 w-4 text-muted-foreground/20" />
                        </div>
                    ))}
                </div>
            </SortableContext>

            <input
                type="file"
                id={uploadId}
                accept="image/jpeg,image/jpg,image/png,image/webp"
                capture="environment"
                multiple
                className="hidden"
                onChange={onUpload}
                disabled={images.length >= maxImages}
            />
        </DndContext>
    );
}
