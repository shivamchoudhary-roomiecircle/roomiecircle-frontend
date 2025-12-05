import { GoogleMap } from "@/components/search/GoogleMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Maximize2, Minimize2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ListingMapProps {
    listing: any;
}

export function ListingMap({ listing }: ListingMapProps) {
    const [isOpen, setIsOpen] = useState(false);

    const openGoogleMaps = () => {
        const url = `https://www.google.com/maps/search/?api=1&query=${listing.latitude},${listing.longitude}`;
        window.open(url, '_blank');
    };

    return (
        <Card className="border border-border/50 shadow-md bg-card overflow-hidden">
            <CardContent className="p-0">
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <div className="relative w-full h-[180px] group">
                        {/* Preview Map - Static or Non-interactive if possible, but GoogleMap component might be interactive.
                            We'll overlay a div to capture clicks for the "More Map" action if desired, 
                            or just let the button handle it. 
                            For the "More Map" button to be the primary call to action, we can overlay a gradient or semi-transparent layer.
                        */}
                        <GoogleMap
                            center={{ lat: listing.latitude, lng: listing.longitude }}
                            listings={[listing]}
                            fullscreenControl={false}
                        />

                        {/* Overlay to darken/blur slightly and hold the CTA */}
                        <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/20 pointer-events-none" />

                        <DialogTrigger asChild>
                            <Button
                                variant="secondary"
                                className="absolute bottom-4 left-4 z-10 shadow-lg bg-background/90 hover:bg-background text-foreground font-semibold gap-2"
                            >
                                <Maximize2 className="h-4 w-4" />
                                MORE MAP
                            </Button>
                        </DialogTrigger>

                        <Button
                            variant="outline"
                            size="sm"
                            className="absolute top-4 right-4 h-8 gap-2 text-xs shadow-md bg-white text-black hover:bg-gray-100 border-none z-10"
                            onClick={openGoogleMaps}
                        >
                            Open in Maps
                            <ExternalLink className="h-3 w-3" />
                        </Button>
                    </div>

                    <DialogContent className="max-w-[90vw] w-[1200px] h-[80vh] p-0 border-none bg-transparent shadow-none">
                        <VisuallyHidden>
                            <DialogTitle>Map View</DialogTitle>
                        </VisuallyHidden>
                        <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/20">
                            <GoogleMap
                                center={{ lat: listing.latitude, lng: listing.longitude }}
                                listings={[listing]}
                                fullscreenControl={false}
                            />

                            <Button
                                variant="secondary"
                                className="absolute bottom-8 left-8 z-10 shadow-lg bg-background/90 hover:bg-background text-foreground font-semibold gap-2"
                                onClick={() => setIsOpen(false)}
                            >
                                <Minimize2 className="h-4 w-4" />
                                LESS MAP
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
