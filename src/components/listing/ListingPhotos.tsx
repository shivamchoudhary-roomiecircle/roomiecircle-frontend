import { useState, useEffect } from "react";
import { Home, X, ChevronLeft, ChevronRight, Grid } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ListingPhotosProps {
    images?: string[];
    description?: string;
}

export function ListingPhotos({ images, description }: ListingPhotosProps) {
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const openLightbox = (index: number) => {
        setActiveImageIndex(index);
        setIsLightboxOpen(true);
    };

    const nextImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (images) {
            setActiveImageIndex((prev) => (prev + 1) % images.length);
        }
    };

    const prevImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (images) {
            setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
        }
    };

    // Keyboard navigation
    useEffect(() => {
        if (!isLightboxOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") {
                nextImage();
            } else if (e.key === "ArrowLeft") {
                prevImage();
            } else if (e.key === "Escape") {
                setIsLightboxOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isLightboxOpen, images]);

    if (!images || images.length === 0) {
        return (
            <div className="relative h-[300px] md:h-[400px] rounded-xl overflow-hidden bg-muted flex items-center justify-center text-muted-foreground">
                <Home className="h-16 w-16 opacity-20" />
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[300px] md:h-[400px] rounded-xl overflow-hidden">
                {/* Main Image - Takes up 2 columns on desktop */}
                <div
                    className="md:col-span-2 h-full relative group cursor-pointer"
                    onClick={() => openLightbox(0)}
                >
                    <img
                        src={images[0]}
                        alt={description || "Listing main image"}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>

                {/* Secondary Images Grid - Takes up 2 columns */}
                <div className="hidden md:grid grid-cols-2 gap-2 md:col-span-2 h-full">
                    {images.slice(1, 5).map((img, idx) => (
                        <div
                            key={idx}
                            className="relative h-full overflow-hidden group cursor-pointer"
                            onClick={() => openLightbox(idx + 1)}
                        >
                            <img
                                src={img}
                                alt={`Listing image ${idx + 2}`}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                            {/* Show "Show all photos" on the last visible image if there are more */}
                            {idx === 3 && images.length > 5 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <Button variant="secondary" size="sm" className="gap-2 pointer-events-none">
                                        <Grid className="h-4 w-4" />
                                        Show all photos
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Mobile "Show all" button */}
                <div className="md:hidden absolute bottom-4 right-4">
                    <Button variant="secondary" size="sm" onClick={() => openLightbox(0)}>
                        Show all {images.length} photos
                    </Button>
                </div>
            </div>

            {/* Lightbox */}
            <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
                <DialogContent className="max-w-[95vw] h-[90vh] p-0 bg-black/95 border-none shadow-none flex flex-col items-center justify-center [&>button]:hidden">
                    <div className="relative w-full h-full flex items-center justify-center">
                        <img
                            src={images[activeImageIndex]}
                            alt={`Listing image ${activeImageIndex + 1}`}
                            className="max-w-full max-h-full object-contain"
                        />

                        {/* Navigation Buttons */}
                        <button
                            onClick={prevImage}
                            className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            <ChevronLeft className="h-8 w-8" />
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            <ChevronRight className="h-8 w-8" />
                        </button>

                        {/* Close Button */}
                        <button
                            onClick={() => setIsLightboxOpen(false)}
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        {/* Counter */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium px-3 py-1 rounded-full bg-black/50">
                            {activeImageIndex + 1} / {images.length}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
