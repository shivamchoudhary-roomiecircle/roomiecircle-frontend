import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { convertFileToJpeg } from "@/lib/image-utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Image as ImageIcon, X, Plus } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface MediaItem {
  id: number;
  url: string;
  isUploading?: boolean;
}

// Sortable Photo Component
interface SortablePhotoProps {
  id: string; // Unique ID for dnd-kit (can be URL or stringified ID)
  item: MediaItem | null;
  index: number;
  type: 'property' | 'neighborhood';
  onDelete: (index: number, type: 'property' | 'neighborhood') => void;
  onUpload: (file: File, index: number, type: 'property' | 'neighborhood') => void;
}

const SortablePhoto = ({ id, item, index, type, onDelete, onUpload }: SortablePhotoProps) => {
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
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative aspect-square rounded-xl border-2 border-dashed 
        flex items-center justify-center overflow-hidden bg-muted/30
        ${!item ? 'hover:border-primary/50 cursor-pointer transition-colors' : 'border-border'}
        ${item ? 'cursor-grab active:cursor-grabbing' : ''}
      `}
    >
      {item ? (
        <>
          <div
            {...attributes}
            {...listeners}
            className="w-full h-full"
          >
            <img
              src={item.url}
              alt="Uploaded"
              className="w-full h-full object-cover pointer-events-none"
            />
          </div>
          {item.isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(index, type);
            }}
            className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-90 hover:opacity-100 transition-opacity shadow-lg z-10"
          >
            <X className="h-4 w-4" />
          </button>
        </>
      ) : (
        <label className="w-full h-full flex items-center justify-center cursor-pointer">
          <Plus className="h-8 w-8 text-muted-foreground/50" />
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file, index, type);
              e.target.value = '';
            }}
          />
        </label>
      )}
    </div>
  );
};

// Helper function to left-shift photos (remove gaps)
const compactPhotos = (photos: (MediaItem | null)[]): (MediaItem | null)[] => {
  const filled = photos.filter((item): item is MediaItem => item !== null && !item.isUploading);
  const uploading = photos.filter(item => item?.isUploading);
  return [...filled, ...uploading, ...Array(8 - filled.length - uploading.length).fill(null)];
};

interface UploadPhotosContentProps {
  listingId: string;
  onFinish: () => void;
}

export default function UploadPhotosContent({ listingId, onFinish }: UploadPhotosContentProps) {
  const navigate = useNavigate();
  // const [searchParams] = useSearchParams(); // Removed
  // const location = useLocation(); // Removed
  // const listingId = searchParams.get("id"); // Removed
  // const navigationState = location.state as { skipListingFetch?: boolean } | null; // Removed
  // const shouldSkipListingFetch = Boolean(navigationState?.skipListingFetch); // Removed
  const shouldSkipListingFetch = false; // Default to false or pass as prop if needed, but for now we can probably just fetch or rely on parent. 
  // Actually, if we just created it, we might want to skip fetch if we passed data, but here we only pass ID. 
  // The original code used state to skip fetch. 
  // If we are in the same flow, we might not need to fetch, but the component fetches images. 
  // Let's keep it simple and allow fetching to ensure we have the latest state (or empty state).


  const [loading, setLoading] = useState(false);
  const [propertyImages, setPropertyImages] = useState<(MediaItem | null)[]>(Array(8).fill(null));
  const [neighborhoodImages, setNeighborhoodImages] = useState<(MediaItem | null)[]>(Array(8).fill(null));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<MediaItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts to prevent accidental drags on clicks
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load existing photos
  useEffect(() => {
    const loadExistingPhotos = async () => {
      if (!listingId) {
        toast({
          title: "Error",
          description: "No listing ID provided",
          variant: "destructive",
        });
        navigate("/my-listings");
        return;
      }

      if (shouldSkipListingFetch) return;

      try {
        setLoading(true);
        const listing = await apiClient.getRoomListing(listingId);

        // Fetch actual media objects to get IDs
        try {
          const roomMedia = await apiClient.fetchMediaForResource(listingId, "IMAGE", "LISTING");
          const neighborhoodMedia = await apiClient.fetchMediaForResource(listingId, "IMAGE", "NEIGHBORHOOD");

          // Map to 8-grid with left-shift (compact)
          const propertyPhotos: MediaItem[] = roomMedia ? roomMedia.slice(0, 8).map((item: any) => ({ id: item.id, url: item.url })) : [];
          const newPropertyImages = compactPhotos([...propertyPhotos, ...Array(8 - propertyPhotos.length).fill(null)]);
          setPropertyImages(newPropertyImages);

          const neighborhoodPhotos: MediaItem[] = neighborhoodMedia ? neighborhoodMedia.slice(0, 8).map((item: any) => ({ id: item.id, url: item.url })) : [];
          const newNeighborhoodImages = compactPhotos([...neighborhoodPhotos, ...Array(8 - neighborhoodPhotos.length).fill(null)]);
          setNeighborhoodImages(newNeighborhoodImages);

        } catch (mediaError) {
          console.warn("Failed to fetch detailed media, falling back to listing images", mediaError);
          if (listing) {
            const listingData = listing.data || listing;

            const newPropertyImages = Array(8).fill(null);
            (listingData.images || []).forEach((url: string, index: number) => {
              if (index < 8) newPropertyImages[index] = { id: index, url }; // Fake ID
            });
            setPropertyImages(newPropertyImages);

            const newNeighborhoodImages = Array(8).fill(null);
            (listingData.neighborhoodImages || []).forEach((url: string, index: number) => {
              if (index < 8) newNeighborhoodImages[index] = { id: index + 100, url }; // Fake ID
            });
            setNeighborhoodImages(newNeighborhoodImages);
          }
        }

      } catch (error: any) {
        console.error("Error loading listing:", error);
        toast({
          title: "Error",
          description: "Failed to load listing photos",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadExistingPhotos();
  }, [listingId, navigate, shouldSkipListingFetch]);

  const handleUpload = async (originalFile: File, index: number, type: 'property' | 'neighborhood') => {
    if (!listingId) return;

    if (!originalFile.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    const setImages = type === 'property' ? setPropertyImages : setNeighborhoodImages;
    const currentImages = type === 'property' ? propertyImages : neighborhoodImages;

    const previewUrl = URL.createObjectURL(originalFile);
    const tempId = Date.now();

    setImages(prev => {
      const newImages = [...prev];
      newImages[index] = { id: tempId, url: previewUrl, isUploading: true };
      return newImages;
    });

    try {
      let file = originalFile;
      try {
        file = await convertFileToJpeg(originalFile);
      } catch (conversionError) {
        console.error("Conversion failed:", conversionError);
        throw new Error("Image conversion failed");
      }

      const { uploadId, presigned_url } = await apiClient.requestMediaUploadUrl(
        listingId,
        type === 'property' ? "LISTING" : "NEIGHBORHOOD",
        file.type,
        file.name
      );

      const uploadResponse = await fetch(presigned_url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) throw new Error("Upload failed");

      const confirmResponse = await apiClient.confirmMediaUpload(uploadId);

      if (confirmResponse.success && confirmResponse.data) {
        setImages(prev => {
          const newImages = [...prev];
          if (newImages[index]?.id === tempId) {
            newImages[index] = {
              id: confirmResponse.data.id,
              url: confirmResponse.data.url,
              isUploading: false
            };
          }
          // Apply left-shift after upload
          return compactPhotos(newImages);
        });

        // No need to call syncOrder - backend assigns priority automatically

      } else {
        throw new Error("Confirmation failed");
      }

    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
      setImages(prev => {
        const newImages = [...prev];
        if (newImages[index]?.id === tempId) {
          newImages[index] = null;
        }
        return newImages;
      });
    }
  };

  const handleDelete = async (index: number, type: 'property' | 'neighborhood') => {
    const setImages = type === 'property' ? setPropertyImages : setNeighborhoodImages;
    const images = type === 'property' ? propertyImages : neighborhoodImages;
    const item = images[index];

    if (!item) return;

    // Optimistic remove and left-shift
    setImages(prev => {
      const newImages = [...prev];
      newImages.splice(index, 1);
      newImages.push(null); // Add null at end to maintain size 8
      return compactPhotos(newImages);
    });

    try {
      await apiClient.deleteMedia(item.id);
      const newImages = [...images];
      newImages.splice(index, 1);
      newImages.push(null);
      await syncOrder(newImages, type);
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
      // Revert
      setImages(prev => {
        const newImages = [...prev];
        newImages.pop();
        newImages.splice(index, 0, item);
        return newImages;
      });
    }
  };

  const syncOrder = async (images: (MediaItem | null)[], type: 'property' | 'neighborhood') => {
    if (!listingId) return;

    const mediaOrder = images
      .filter((img): img is MediaItem => img !== null && !img.isUploading)
      .map(img => ({ id: img.id }));

    if (mediaOrder.length === 0) return;

    try {
      await apiClient.reorderMedia(
        listingId,
        "image",
        type === 'property' ? "LISTING" : "NEIGHBORHOOD",
        mediaOrder
      );
    } catch (error) {
      console.error("Reorder error:", error);
    }
  };

  const handleDragStart = (event: DragStartEvent, type: 'property' | 'neighborhood') => {
    const { active } = event;
    setActiveId(active.id as string);
    const images = type === 'property' ? propertyImages : neighborhoodImages;

    // Parse index from ID "type-index"
    const index = parseInt((active.id as string).split('-')[1]);
    setActiveItem(images[index]);
  };

  const handleDragEnd = (event: DragEndEvent, type: 'property' | 'neighborhood') => {
    const { active, over } = event;
    setActiveId(null);
    setActiveItem(null);

    if (!over) return;

    if (active.id !== over.id) {
      const setImages = type === 'property' ? setPropertyImages : setNeighborhoodImages;

      setImages((items) => {
        const oldIndex = parseInt((active.id as string).split('-')[1]);
        const newIndex = parseInt((over.id as string).split('-')[1]);

        const newItems = arrayMove(items, oldIndex, newIndex);

        // Sync order
        syncOrder(newItems, type);

        return newItems;
      });
    }
  };

  const renderGrid = (type: 'property' | 'neighborhood') => {
    const images = type === 'property' ? propertyImages : neighborhoodImages;
    // Use stable IDs based on index for the grid slots
    const items = images.map((_, index) => `${type}-${index}`);

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={(e) => handleDragStart(e, type)}
        onDragEnd={(e) => handleDragEnd(e, type)}
      >
        <SortableContext
          items={items}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((item, index) => (
              <SortablePhoto
                key={`${type}-${index}`}
                id={`${type}-${index}`}
                index={index}
                item={item}
                type={type}
                onDelete={handleDelete}
                onUpload={handleUpload}
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay adjustScale={true} dropAnimation={null}>
          {activeId && activeItem ? (
            <div className="aspect-square rounded-xl border-2 border-primary overflow-hidden bg-background shadow-2xl cursor-grabbing" style={{ width: '200px', height: '200px' }}>
              <img
                src={activeItem.url}
                alt="Dragging"
                className="w-full h-full object-cover"
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    );
  };

  const handleSave = () => {
    onFinish();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!listingId) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar removed */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload Photos</h1>
          <p className="text-muted-foreground">Add photos to showcase your property. Drag to reorder.</p>
        </div>

        <div className="space-y-8">
          {/* Property Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Property Photos
              </CardTitle>
              <CardDescription>
                Upload up to 8 photos of your property
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderGrid('property')}
            </CardContent>
          </Card>

          {/* Neighborhood Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Neighborhood Photos
              </CardTitle>
              <CardDescription>
                Upload up to 8 photos of the surrounding neighborhood
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderGrid('neighborhood')}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onFinish}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save & Finish
            </Button>
          </div>
        </div>
      </div>
      {/* Footer removed */}
    </div>
  );
}
