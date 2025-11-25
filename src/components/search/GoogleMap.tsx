import { useEffect, useRef, useState, useCallback } from "react";
import { useConfig } from "@/contexts/ConfigContext";

const GOOGLE_MAPS_API_KEY = "AIzaSyDf5tpCzEbN1_RHkAh0rUrbQFM9UQE-O6k";

interface Listing {
  id: string;
  latitude: number;
  longitude: number;
  monthlyRent: number;
  addressText: string;
  description?: string;
  listingType?: string;
  propertyType?: string[];
  images?: string[];
}

interface GoogleMapProps {
  center?: { lat: number; lng: number };
  listings?: Listing[];
  onBoundsChange?: (bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => void;
  fullscreenControl?: boolean;
}

export const GoogleMap = ({ center, listings = [], onBoundsChange, fullscreenControl = true }: GoogleMapProps) => {
  const { config } = useConfig();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize Map
  useEffect(() => {
    let resizeObserver: ResizeObserver | null = null;
    let loadListener: ((this: HTMLScriptElement, ev: Event) => any) | null = null;

    const initMap = () => {
      const el = mapRef.current;
      const google = (window as any).google;
      if (!el || !google?.maps || mapInstanceRef.current) return;

      // Wait until the element is in the DOM and has size
      if (!el.isConnected || el.offsetWidth === 0 || el.offsetHeight === 0) return;

      const defaultCenter = center || { lat: 37.7749, lng: -122.4194 };

      mapInstanceRef.current = new google.maps.Map(el, {
        center: defaultCenter,
        zoom: 12,
        mapId: "DEMO_MAP_ID", // Required for AdvancedMarkerElement
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
        mapTypeControl: false,
        fullscreenControl: fullscreenControl,
        streetViewControl: false,
      });

      // Add idle listener for bounds changes
      if (onBoundsChange) {
        mapInstanceRef.current.addListener('idle', () => {
          const bounds = mapInstanceRef.current.getBounds();
          if (bounds) {
            const ne = bounds.getNorthEast();
            const sw = bounds.getSouthWest();
            onBoundsChange({
              minLat: sw.lat(),
              maxLat: ne.lat(),
              minLng: sw.lng(),
              maxLng: ne.lng(),
            });
          }
        });
      }

      setIsMapReady(true);

      // Trigger initial bounds callback after map is ready
      if (onBoundsChange) {
        google.maps.event.addListenerOnce(mapInstanceRef.current, 'idle', () => {
          const bounds = mapInstanceRef.current.getBounds();
          if (bounds) {
            const ne = bounds.getNorthEast();
            const sw = bounds.getSouthWest();
            onBoundsChange({
              minLat: sw.lat(),
              maxLat: ne.lat(),
              minLng: sw.lng(),
              maxLng: ne.lng(),
            });
          }
        });
      }
      // Stop observing once initialized
      resizeObserver?.disconnect();
    };

    const loadGoogleMaps = (): Promise<void> => {
      if ((window as any).google?.maps) {
        return Promise.resolve();
      }

      if ((window as any).googleMapsPromise) {
        return (window as any).googleMapsPromise;
      }

      (window as any).googleMapsPromise = new Promise<void>((resolve, reject) => {
        const callbackName = "__googleMapsCallback";
        (window as any)[callbackName] = () => {
          resolve();
          delete (window as any)[callbackName];
        };

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,marker&v=weekly&loading=async&callback=${callbackName}`;
        script.async = true;
        script.defer = true;
        script.onerror = (err) => reject(err);
        document.head.appendChild(script);
      });

      return (window as any).googleMapsPromise;
    };

    loadGoogleMaps().then(() => {
      requestAnimationFrame(initMap);
    }).catch(err => {
      console.error("Failed to load Google Maps API", err);
    });

    // Observe size changes of the container and (re)try init
    if (mapRef.current && 'ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(() => initMap());
      resizeObserver.observe(mapRef.current);
    }
    // Fallback attempt on next frame
    const raf = requestAnimationFrame(() => initMap());

    return () => {
      resizeObserver?.disconnect();
      cancelAnimationFrame(raf);
      const script = document.querySelector('script[data-google-maps]') as HTMLScriptElement | null;
      if (script && loadListener) script.removeEventListener('load', loadListener as any);

      // Cleanup map instance
      if (mapInstanceRef.current) {
        // Clear markers
        markersRef.current.forEach(marker => marker.map = null);
        markersRef.current = [];
        mapInstanceRef.current = null;
        setIsMapReady(false);
      }
    };
  }, []); // Run once on mount

  // Update markers when listings change or map becomes ready
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current) return;

    const google = (window as any).google;
    if (!google?.maps) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.map = null);
    markersRef.current = [];

    if (listings.length === 0) return;

    listings.forEach((listing) => {
      // Create a DOM element for the marker content
      const markerContent = document.createElement('div');
      markerContent.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
          <defs>
            <linearGradient id="grad-${listing.id}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:hsl(14, 85%, 58%);stop-opacity:1" />
              <stop offset="100%" style="stop-color:hsl(180, 65%, 45%);stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="40" height="40" rx="12" fill="url(#grad-${listing.id})" />
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" transform="translate(10, 10)" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M9 22V12h6v10" transform="translate(10, 10)" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      `;

      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: { lat: listing.latitude, lng: listing.longitude },
        map: mapInstanceRef.current!,
        title: listing.addressText,
        content: markerContent,
      });

      // Helper to get property label
      const getPropertyLabel = (value: string) => {
        return config?.propertyTypes?.find((t: any) => t.value === value)?.label || value;
      };

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="width: 260px; font-family: 'Inter', system-ui, sans-serif; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.15); background: white;">
            ${listing.images?.[0] ? `
              <div style="position: relative; height: 150px; width: 100%;">
                <img src="${listing.images[0]}" style="width: 100%; height: 100%; object-fit: cover;" alt="Listing" />
                <div style="position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.6); color: white; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${listing.listingType === 'FULL_HOUSE' ? 'Full House' : 'Room'}
                </div>
              </div>
            ` : ''}
            <div style="padding: 16px;">
              <h3 style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: #111827; line-height: 1.4;">
                ${listing.addressText ? listing.addressText.split(',')[0] : 'Location'}
              </h3>
              <p style="margin: 0 0 12px 0; font-size: 12px; color: #6B7280; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${listing.addressText || ''}
              </p>
              
              <div style="display: flex; align-items: baseline; gap: 4px; margin-bottom: 12px;">
                <span style="font-size: 18px; font-weight: 700; color: #FF5A5F;">₹${listing.monthlyRent.toLocaleString()}</span>
                <span style="font-size: 12px; color: #6B7280;">/mo</span>
              </div>

              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                ${listing.propertyType?.[0] ? `
                  <span style="background: #F3F4F6; color: #374151; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 500;">
                    ${getPropertyLabel(listing.propertyType[0])}
                  </span>
                ` : ''}
                ${(listing as any).bhkType ? `
                  <span style="background: #F3F4F6; color: #374151; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 500;">
                    ${(listing as any).bhkType}
                  </span>
                ` : ''}
              </div>
            </div>
          </div>
        `,
      });

      // Add smooth hover effect with animation
      let hoverTimeout: any;
      // AdvancedMarkerElement uses DOM events on the content element
      markerContent.addEventListener("mouseenter", () => {
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => {
          infoWindow.open(mapInstanceRef.current!, marker);
        }, 200);
      });

      markerContent.addEventListener("mouseleave", () => {
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => {
          infoWindow.close();
        }, 300);
      });

      marker.addListener("click", () => {
        clearTimeout(hoverTimeout);
        infoWindow.open(mapInstanceRef.current!, marker);
      });

      markersRef.current.push(marker);
    });
  }, [isMapReady, listings, config]);

  // Update map center when center prop changes
  useEffect(() => {
    if (isMapReady && mapInstanceRef.current && center) {
      mapInstanceRef.current.setCenter(center);
      mapInstanceRef.current.setZoom(14);
    }
  }, [isMapReady, center]);

  return (
    <div className="w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

