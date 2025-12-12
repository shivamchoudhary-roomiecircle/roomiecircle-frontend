import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { PropertyCard } from "@/components/shared/PropertyCard";
import { wishlistApi, WishlistRoomDto } from "@/lib/api/wishlist";
import { useToast } from "@/hooks/use-toast";
import { Loader2, HeartOff, MapPin, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export default function Wishlist() {
    const { user, isAuthenticated } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [wishlist, setWishlist] = useState<WishlistRoomDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchWishlist();
    }, [isAuthenticated]);

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const response = await wishlistApi.getWishlist();
            if (response.success && response.data) {
                setWishlist(response.data.content);
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to load wishlist", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (roomId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await wishlistApi.removeFromWishlist(roomId);
            setWishlist(prev => prev.filter(item => item.id !== roomId));
            toast({ title: "Removed", description: "Item removed from wishlist" });
        } catch (error) {
            toast({ title: "Error", description: "Failed to remove item", variant: "destructive" });
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center min-h-screen">
                <Navbar />
                <div className="flex-1 flex flex-col justify-center items-center">
                    <p className="text-muted-foreground mb-4">Please sign in to view your wishlist</p>
                    <Button onClick={() => navigate('/auth/login')}>Sign In</Button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <SEO title="My Wishlist | Roomiecircle" description="View and manage your saved rooms." />
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="flex items-center gap-3 mb-8">
                    <h1 className="text-2xl font-bold">My Wishlist</h1>
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                        {wishlist.length} Items
                    </span>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : wishlist.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/30 rounded-2xl border border-dashed border-border/50">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <HeartOff className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
                        <p className="text-muted-foreground max-w-sm mb-6">
                            Start exploring rooms and save your favorites here to keep track of them.
                        </p>
                        <Button onClick={() => navigate('/')}>Explore Rooms</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlist.map(item => (
                            <PropertyCard
                                key={item.id}
                                id={item.id}
                                images={item.photos.map(p => ({ url: p.url })) || []}
                                price={item.monthlyRent || 0}
                                address={item.address || "Unknown Location"}
                                badges={
                                    item.roomStatus !== 'ACTIVE' ? [
                                        <Badge key="status" variant="secondary">{item.roomStatus}</Badge>
                                    ] : undefined
                                }
                                onClick={() => navigate(`/listings/${item.id}`)}
                                footer={
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="w-full bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                                        onClick={(e) => handleRemove(item.id, e)}
                                    >
                                        <HeartOff className="w-4 h-4 mr-2" />
                                        Remove
                                    </Button>
                                }
                            >
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Home className="w-4 h-4 text-muted-foreground" />
                                        <span>
                                            {item.bhkType !== null ? (item.bhkType === 0 ? "RK" : item.bhkType + " BHK") : "Room"}
                                            {item.roomType ? ` • ${item.roomType}` : ""}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {item.propertyTypes.slice(0, 2).map((pt, i) => (
                                            <Badge key={i} variant="outline" className="text-[10px] font-normal">{pt}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </PropertyCard>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
