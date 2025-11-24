
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import "./ListingCard.css";

interface Listing {
  id: string;
  monthlyRent: number | null;
  address: string;
  hasBrokerage: boolean;
  photos: string[];
  lister: {
    id: number;
    name: string;
    profilePicture: string | null;
    verified: boolean;
    verificationLevel: string | null;
    profileScore: number | null;
  };
  roomType: string | null;
  bhkType: string | null;
  layoutType: string | null;
  layoutTypeKey: string | null;
  propertyTypes: string[];
  propertyTypeKeys: string[];
  status?: string;
}

interface ListingCardProps {
  listing: Listing;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: string) => void;
}

const ListingCard = ({ listing, onEdit, onDelete, onStatusChange }: ListingCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Format room type display
  const formatRoomType = (roomType: string | null | undefined, bhkType: string | null | undefined) => {
    if (!roomType && !bhkType) {
      return "Room details not specified";
    }
    if (!roomType) {
      return bhkType ? `Room in a ${bhkType.toUpperCase()} ` : "Room";
    }
    if (!bhkType) {
      const roomTypeFormatted = roomType.split('_').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      return roomTypeFormatted;
    }
    const roomTypeFormatted = roomType.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    const bhkFormatted = bhkType.toUpperCase();
    return `${roomTypeFormatted} in a ${bhkFormatted} `;
  };

  // Format address to show only first part
  const formatAddress = (address: string | null | undefined) => {
    if (!address) {
      return "Address not provided";
    }
    const parts = address.split(',');
    return parts.slice(0, 2).join(',').trim();
  };

  const defaultImage = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80';

  const handleToggleStatus = () => {
    const newStatus = listing.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    onStatusChange(listing.id, newStatus);
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-elevated relative transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            {/* Status Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id={`status-${listing.id}`}
                checked={listing.status === "ACTIVE"}
                onCheckedChange={handleToggleStatus}
              />
              <Label htmlFor={`status-${listing.id}`} className="text-sm font-medium">
                {listing.status === "ACTIVE" ? "Active" : "Inactive"}
              </Label>
            </div>

            <div className="ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(listing.id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Listing Image */}
          <div className="aspect-video rounded-md overflow-hidden bg-muted">
            <img
              src={listing.photos && listing.photos.length > 0 ? listing.photos[0] : defaultImage}
              alt="Room listing"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Listing Details */}
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-bold">
                {listing.monthlyRent ? `₹${listing.monthlyRent.toLocaleString()} ` : "Price not set"}
              </h3>
              {listing.monthlyRent && <span className="text-sm text-muted-foreground">/month</span>}
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">
                {formatRoomType(listing.roomType, listing.bhkType)}
              </p>
              {listing.propertyTypes && listing.propertyTypes.length > 0 && (
                <p className="text-foreground">{listing.propertyTypes[0]}</p>
              )}
              <p className="line-clamp-1">{formatAddress(listing.address)}</p>
            </div>

            {/* Lister Info */}
            <div className="flex items-center gap-2 pt-2 border-t">
              <div className="flex items-center gap-2 flex-1">
                {listing.lister.profilePicture ? (
                  <img
                    src={listing.lister.profilePicture}
                    alt={listing.lister.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium">{listing.lister.name.charAt(0)}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{listing.lister.name}</p>
                </div>
              </div>
              {listing.lister.verified && (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 font-medium whitespace-nowrap">
                  ✓ Verified
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Delete Confirmation Popup */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="delete-card">
            <div className="delete-header">
              <div className="delete-image">
                <svg aria-hidden="true" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" fill="none">
                  <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" strokeLinejoin="round" strokeLinecap="round"></path>
                </svg>
              </div>
              <div className="delete-content">
                <span className="delete-title">Delete Listing</span>
                <p className="delete-message">Are you sure you want to delete this listing? This action cannot be undone.</p>

              </div>
              <div className="delete-actions">
                <button
                  className="delete-desactivate"
                  type="button"
                  onClick={() => {
                    onDelete(listing.id);
                    setShowDeleteDialog(false);
                  }}
                >
                  Delete
                </button>
                <button
                  className="delete-cancel"
                  type="button"
                  onClick={() => setShowDeleteDialog(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ListingCard;
