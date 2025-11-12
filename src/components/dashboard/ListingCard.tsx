import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreVertical, Edit, Power, Trash2, AlertCircle } from "lucide-react";
import { useState } from "react";

interface Listing {
  id: string;
  monthlyRent: number;
  listingType: string;
  propertyType: string[];
  layoutType: string;
  bedroomCount: number;
  addressText: string;
  status: string;
  completionScore: number;
  missingSections: Record<string, string[]>;
  images: string[];
}

interface ListingCardProps {
  listing: Listing;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: string) => void;
}

const ListingCard = ({ listing, onEdit, onDelete, onStatusChange }: ListingCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isIncomplete = listing.status === "DRAFT" || listing.completionScore < 100;
  const isActive = listing.status === "ACTIVE";

  const formatMissingSections = () => {
    const messages: string[] = [];
    
    if (listing.missingSections) {
      Object.entries(listing.missingSections).forEach(([section, fields]) => {
        if (Array.isArray(fields) && fields.length > 0) {
          fields.forEach(field => {
            if (field === "images") {
              const imageCount = listing.images?.length || 0;
              messages.push(`Missing images (${imageCount} of 3)`);
            } else if (field === "address" || field === "addressText") {
              messages.push("Missing address");
            } else if (field === "placeId") {
              messages.push("Missing display location");
            } else if (field === "availableDate") {
              messages.push("Stale available date");
            } else {
              // Format field name nicely
              const formatted = field.replace(/([A-Z])/g, " $1").toLowerCase();
              messages.push(`Missing ${formatted}`);
            }
          });
        }
      });
    }
    
    return messages;
  };

  const missingMessages = formatMissingSections();

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Listing Creator</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(listing.id)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                {isActive ? (
                  <DropdownMenuItem onClick={() => onStatusChange(listing.id, "INACTIVE")}>
                    <Power className="h-4 w-4 mr-2" />
                    Deactivate
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => onStatusChange(listing.id, "ACTIVE")}>
                    <Power className="h-4 w-4 mr-2" />
                    Activate
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Incomplete Warning */}
          {isIncomplete && missingMessages.length > 0 && (
            <div className="border-2 border-destructive/50 rounded-lg p-4 bg-destructive/5">
              <div className="flex items-start gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  {missingMessages.map((msg, idx) => (
                    <p key={idx} className="text-sm text-destructive">{msg}</p>
                  ))}
                </div>
              </div>
              <Button 
                variant="destructive" 
                size="sm" 
                className="w-full"
                onClick={() => onEdit(listing.id)}
              >
                EDIT
              </Button>
            </div>
          )}

          {/* Listing Info */}
          <div className="space-y-2">
            <div className="text-2xl font-bold">₹{listing.monthlyRent?.toLocaleString() || 0}/mo</div>
            <div className="text-sm text-muted-foreground capitalize">
              {listing.listingType?.replace(/_/g, " ")}
            </div>
            <div className="text-sm">
              {listing.layoutType} · {listing.bedroomCount} BR · {listing.propertyType?.[0] || "Property"}
            </div>
            <div className="text-sm text-muted-foreground truncate" title={listing.addressText}>
              {listing.addressText || "No address provided"}
            </div>
          </div>

          {/* Status Badge */}
          <div className="pt-2">
            <span 
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isActive 
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your listing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(listing.id);
                setShowDeleteDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ListingCard;
