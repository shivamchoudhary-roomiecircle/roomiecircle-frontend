import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Shield, Wifi, Coffee, X } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { useState } from "react";

interface ListingNeighborhoodProps {
    review?: string;
    ratings?: {
        safety?: number;
        connectivity?: number;
        amenities?: number;
    };
    images?: string[];
}

export function ListingNeighborhood({ review, ratings, images }: ListingNeighborhoodProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const hasRatings = ratings && Object.values(ratings).some(val => val !== undefined);
    const hasImages = images && images.length > 0;
    const hasReview = review && review.trim().length > 0;

    if (!hasReview && !hasRatings && !hasImages) return null;

    return (
        <Card className="border border-border/50 shadow-md bg-card">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Neighborhood</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Review */}
                {review && (
                    <div>
                        <p className="text-muted-foreground italic">"{review}"</p>
                    </div>
                )}

                {/* Ratings */}
                {hasRatings && (
                    <div className="space-y-3">
                        {ratings.safety !== undefined && (
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-muted-foreground" />
                                        <span>Safety</span>
                                    </div>
                                    <span className="font-medium">{ratings.safety}/5</span>
                                </div>
                                <Progress value={(ratings.safety / 5) * 100} className="h-2" />
                            </div>
                        )}
                        {ratings.connectivity !== undefined && (
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <Wifi className="h-4 w-4 text-muted-foreground" />
                                        <span>Connectivity</span>
                                    </div>
                                    <span className="font-medium">{ratings.connectivity}/5</span>
                                </div>
                                <Progress value={(ratings.connectivity / 5) * 100} className="h-2" />
                            </div>
                        )}
                        {ratings.amenities !== undefined && (
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <Coffee className="h-4 w-4 text-muted-foreground" />
                                        <span>Amenities</span>
                                    </div>
                                    <span className="font-medium">{ratings.amenities}/5</span>
                                </div>
                                <Progress value={(ratings.amenities / 5) * 100} className="h-2" />
                            </div>
                        )}
                    </div>
                )}

                {/* Images */}
                {images && images.length > 0 && (
                    <>
                        <div className="grid grid-cols-2 gap-2">
                            {images.slice(0, 4).map((img, idx) => (
                                <div
                                    key={idx}
                                    className="aspect-square rounded-md overflow-hidden bg-muted cursor-pointer relative group"
                                    onClick={() => setSelectedImage(img)}
                                >
                                    <img
                                        src={img}
                                        alt={`Neighborhood ${idx + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                    {idx === 3 && images.length > 4 && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-medium">
                                            +{images.length - 4}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
                            <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none shadow-none [&>button]:hidden">
                                <div className="relative w-full h-[80vh] flex items-center justify-center">
                                    {selectedImage && (
                                        <img
                                            src={selectedImage}
                                            alt="Neighborhood Full View"
                                            className="max-w-full max-h-full object-contain rounded-lg"
                                        />
                                    )}
                                    <button
                                        onClick={() => setSelectedImage(null)}
                                        className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
