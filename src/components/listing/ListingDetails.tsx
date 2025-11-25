import {
    MapPin,
    Share2,
    Heart,
    IndianRupee,
    Shield,
    Info,
    Calendar,
    Maximize,
    Wind,
    Bath,
    Armchair,
    Check,
    User,
    Users,
    Briefcase,
    Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconRenderer } from "@/lib/iconMapper";
import { useConfig } from "@/contexts/ConfigContext";

interface ListingDetailsProps {
    listing: any;
}

export function ListingDetails({ listing }: ListingDetailsProps) {
    const { config } = useConfig();



    return (
        <Card className="border border-border/50 shadow-md bg-card">
            <CardContent className="p-6 space-y-8">
                {/* Header Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <div className="flex flex-wrap gap-2 mb-3">
                                <Badge variant="default" className="bg-primary/90 hover:bg-primary">
                                    {listing.listingType === 'FULL_HOUSE' ? 'Full House' : 'Room'}
                                </Badge>
                                {listing.roomType && (
                                    <Badge variant="secondary">
                                        {config?.roomTypes?.find((t: any) => t.value === listing.roomType)?.label || listing.roomType}
                                    </Badge>
                                )}
                                {listing.bhkType && (
                                    <Badge variant="outline">
                                        {config?.bhkTypes?.find((t: any) => t.value === listing.bhkType)?.label || listing.bhkType}
                                    </Badge>
                                )}
                            </div>

                            <h1 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                                {listing.bhkType ? `${listing.bhkType.toUpperCase()} ` : ''}
                                {listing.propertyType?.[0] ? config?.propertyTypes?.find((t: any) => t.value === listing.propertyType[0])?.label : 'Property'}
                                {' '}in {listing.addressText?.split(',')[0]}
                            </h1>

                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                <div className="flex items-center text-muted-foreground">
                                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                                    <span className="line-clamp-1">{listing.addressText}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-background/80">
                                <Share2 className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-background/80">
                                <Heart className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Key Financials */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-background/50 border border-border/50 space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <IndianRupee className="h-4 w-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">Rent</span>
                        </div>
                        <p className="text-xl font-bold">₹{listing.monthlyRent?.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">per month</p>
                    </div>

                    <div className="p-4 rounded-xl bg-background/50 border border-border/50 space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Shield className="h-4 w-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">Deposit</span>
                        </div>
                        <p className="text-xl font-bold">₹{listing.deposit?.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">refundable</p>
                    </div>

                    {listing.maintenance !== undefined && (
                        <div className="p-4 rounded-xl bg-background/50 border border-border/50 space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <Info className="h-4 w-4" />
                                <span className="text-xs font-medium uppercase tracking-wider">Maintenance</span>
                            </div>
                            <p className="text-xl font-bold">
                                {listing.maintenance > 0 ? `₹${listing.maintenance.toLocaleString()}` : 'Zero'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {listing.maintenanceIncluded ? 'Included in rent' : 'Monthly extra'}
                            </p>
                        </div>
                    )}

                    <div className="p-4 rounded-xl bg-background/50 border border-border/50 space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Calendar className="h-4 w-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">Available</span>
                        </div>
                        <p className="text-xl font-bold">
                            {listing.availableDate
                                ? new Date(listing.availableDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
                                : 'Now'}
                        </p>
                        <p className="text-xs text-muted-foreground">Move-in date</p>
                    </div>
                </div>

                {/* Property Features */}
                <div className="flex flex-wrap gap-3">
                    <Badge variant="outline" className="px-3 py-1.5 text-sm font-normal gap-2 h-auto">
                        <Maximize className="h-4 w-4 text-muted-foreground" />
                        Floor: {listing.floor ?? 'N/A'}
                    </Badge>
                    {listing.hasBalcony && (
                        <Badge variant="outline" className="px-3 py-1.5 text-sm font-normal gap-2 h-auto">
                            <Wind className="h-4 w-4 text-muted-foreground" />
                            Balcony
                        </Badge>
                    )}
                    {listing.hasPrivateWashroom && (
                        <Badge variant="outline" className="px-3 py-1.5 text-sm font-normal gap-2 h-auto">
                            <Bath className="h-4 w-4 text-muted-foreground" />
                            Private Bath
                        </Badge>
                    )}
                    {listing.hasFurniture && (
                        <Badge variant="outline" className="px-3 py-1.5 text-sm font-normal gap-2 h-auto">
                            <Armchair className="h-4 w-4 text-muted-foreground" />
                            Furnished
                        </Badge>
                    )}
                </div>

                <Separator />

                {/* Description */}
                <div>
                    <h3 className="text-lg font-semibold mb-3">About this place</h3>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {listing.description || "No description provided."}
                    </p>
                </div>



                {/* Roommate Preferences */}
                {listing.roommatePreferences && (
                    <>
                        <Separator />
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Ideal Roommate</h3>
                            <div className="bg-muted/30 p-5 rounded-xl border border-border/50">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-lg bg-background flex items-center justify-center shadow-sm">
                                                <User className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase tracking-wide">Gender</p>
                                                <p className="font-medium capitalize">{listing.roommatePreferences.gender?.toLowerCase() || 'Any'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-lg bg-background flex items-center justify-center shadow-sm">
                                                <Users className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase tracking-wide">Age Range</p>
                                                <p className="font-medium">
                                                    {listing.roommatePreferences.minAge && listing.roommatePreferences.maxAge
                                                        ? `${listing.roommatePreferences.minAge} - ${listing.roommatePreferences.maxAge} years`
                                                        : 'Any'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-lg bg-background flex items-center justify-center shadow-sm">
                                                <Briefcase className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase tracking-wide">Profession</p>
                                                <p className="font-medium">
                                                    {listing.roommatePreferences.profession
                                                        ? (config?.professions?.find((p: any) => p.value === listing.roommatePreferences.profession)?.label ||
                                                            listing.roommatePreferences.profession)
                                                        : 'Any'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        {listing.roommatePreferences.lifestyle && listing.roommatePreferences.lifestyle.length > 0 && (
                                            <div className="flex items-start gap-3">
                                                <div className="h-9 w-9 rounded-lg bg-background flex items-center justify-center shadow-sm mt-0.5">
                                                    <Star className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Lifestyle</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {listing.roommatePreferences.lifestyle.map((tag: string) => {
                                                            const lifestyleConfig = config?.lifestylePreferences?.find((l: any) => l.value === tag);
                                                            return (
                                                                <Badge
                                                                    key={tag}
                                                                    variant="outline"
                                                                    className="text-xs font-normal border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 flex items-center gap-1.5"
                                                                >
                                                                    {lifestyleConfig?.symbol && (
                                                                        <IconRenderer symbol={lifestyleConfig.symbol} className="h-3 w-3" />
                                                                    )}
                                                                    <span>{lifestyleConfig?.label || tag.replace(/_/g, ' ').toLowerCase()}</span>
                                                                </Badge>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
