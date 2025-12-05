import { useEffect, useRef, useState } from "react";
import { useConfig } from "@/contexts/ConfigContext";
import { RoomSearchResultDTO } from "@/types/api.types";
import { getImageUrl } from "@/lib/utils";

const GOOGLE_MAPS_API_KEY = "AIzaSyDf5tpCzEbN1_RHkAh0rUrbQFM9UQE-O6k";
const INDIA_GATE = { lat: 28.6129, lng: 77.2295 };

interface GoogleMapProps {
  center?: { lat: number; lng: number };
  listings?: RoomSearchResultDTO[];
  onBoundsChange?: (bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => void;
  fullscreenControl?: boolean;
  showMovablePin?: boolean;
  onCenterChange?: (center: { lat: number; lng: number }) => void;
  radiusKm?: number;
  onInitialLocationFound?: (location: { lat: number; lng: number; address: string; placeId?: string }) => void;
}

export const GoogleMap = ({
  center,
  listings = [],
  onBoundsChange,
  fullscreenControl = true,
  showMovablePin = false,
  onCenterChange,
  radiusKm = 5,
  onInitialLocationFound
}: GoogleMapProps) => {
  // Initialize Map
  useEffect(() => {
    let resizeObserver: ResizeObserver | null = null;
    let loadListener: ((this: HTMLScriptElement, ev: Event) => any) | null = null;

    const initMap = async () => {
      const el = mapRef.current;
      const google = (window as any).google;
      if (!el || !google?.maps || mapInstanceRef.current) return;

      // Wait until the element is in the DOM and has size
      if (!el.isConnected || el.offsetWidth === 0 || el.offsetHeight === 0) return;

      let initialCenter = center
        ? { lat: Number(center.lat), lng: Number(center.lng) }
        : INDIA_GATE;

      mapInstanceRef.current = new google.maps.Map(el, {
        center: initialCenter,
        zoom: 13,
        mapId: "DEMO_MAP_ID",
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
        zoomControl: false,
        scrollwheel: false,
        disableDoubleClickZoom: true,
        gestureHandling: 'greedy',
      });

      // If no center provided, try geolocation asynchronously
      if (!center) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (!mapInstanceRef.current) return;

            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            mapInstanceRef.current.setCenter(userLocation);

            // Reverse geocode
            if (onInitialLocationFound) {
              const geocoder = new google.maps.Geocoder();
              geocoder.geocode({ location: userLocation }, (results: any, status: any) => {
                if (status === "OK" && results[0]) {
                  onInitialLocationFound({
                    lat: userLocation.lat,
                    lng: userLocation.lng,
                    address: results[0].formatted_address,
                    placeId: results[0].place_id
                  });
                }
              });
            }
          },
          (error) => {
            console.log("Geolocation failed or denied, using default center (Delhi)");
            // Already at India Gate
            if (onInitialLocationFound) {
              onInitialLocationFound({
                lat: INDIA_GATE.lat,
                lng: INDIA_GATE.lng,
                address: "New Delhi, Delhi, India",
                placeId: "ChIJLbZ-NFv9DDkRzk0gTkm3wlI"
              });
            }
          },
          { timeout: 5000 }
        );
      }

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

          if (onCenterChange) {
            const center = mapInstanceRef.current.getCenter();
            onCenterChange({ lat: center.lat(), lng: center.lng() });
          }
        });
      }

      // Initialize Movable Pin if enabled
      if (showMovablePin) {
        const pinSvg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
            <defs>
              <linearGradient id="roomie-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:hsl(14, 85%, 58%);stop-opacity:1" />
                <stop offset="100%" style="stop-color:hsl(180, 65%, 45%);stop-opacity:1" />
              </linearGradient>
              <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.3"/>
              </filter>
            </defs>
            <g filter="url(#dropShadow)">
              <path d="M25 2C15.059 2 7 10.059 7 20c0 5.5 2.5 10.5 6.5 14l11.5 14 11.5-14c4-3.5 6.5-8.5 6.5-14 0-9.941-8.059-18-18-18z" fill="url(#roomie-gradient)" stroke="white" stroke-width="2"/>
              <circle cx="25" cy="20" r="8" fill="white"/>
            </g>
          </svg>
        `;

        // Using standard Marker for reliable dragging as per user snippet
        // AdvancedMarkerElement dragging is newer and might require different setup
        centerMarkerRef.current = new google.maps.Marker({
          position: initialCenter,
          map: mapInstanceRef.current,
          draggable: true,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(pinSvg),
            scaledSize: new google.maps.Size(50, 50),
            anchor: new google.maps.Point(25, 50)
          },
          zIndex: 1000 // Ensure it's on top
        });

        // 1. Sync Marker with Map Movement
        mapInstanceRef.current.addListener("center_changed", () => {
          if (centerMarkerRef.current) {
            centerMarkerRef.current.setPosition(mapInstanceRef.current.getCenter());
          }
        });

        // 2. Sync Map with Marker Drag
        centerMarkerRef.current.addListener("dragend", () => {
          if (centerMarkerRef.current) {
            const newPos = centerMarkerRef.current.getPosition();
            mapInstanceRef.current.setCenter(newPos);
            // This will trigger center_changed, which updates marker position again (no harm)
            // and then 'idle' which triggers onBoundsChange
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
        if (centerMarkerRef.current) {
          centerMarkerRef.current.setMap(null);
          centerMarkerRef.current = null;
        }
        mapInstanceRef.current = null;
        setIsMapReady(false);
      }
    };
  }, []); // Run once on mount

  const { config } = useConfig();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const centerMarkerRef = useRef<any>(null);
  const radiusCircleRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Update zoom and circle when radius changes
  useEffect(() => {
    if (isMapReady && mapInstanceRef.current) {
      const google = (window as any).google;
      if (!google?.maps) return;

      const currentCenter = center
        ? { lat: Number(center.lat), lng: Number(center.lng) }
        : mapInstanceRef.current.getCenter();

      if (!currentCenter) return;

      // Create circle if it doesn't exist
      if (!radiusCircleRef.current) {
        radiusCircleRef.current = new google.maps.Circle({
          strokeColor: "#4B0082", // Indigo
          strokeOpacity: 0.6,
          strokeWeight: 2,
          fillColor: "#4B0082",   // Indigo
          fillOpacity: 0.15,      // Subtle transparency
          map: mapInstanceRef.current,
          center: currentCenter,
          radius: (radiusKm || 5) * 1000,
          clickable: false
        });
      } else {
        // Update existing circle
        radiusCircleRef.current.setCenter(currentCenter);
        radiusCircleRef.current.setRadius((radiusKm || 5) * 1000);
      }

      // Fit bounds to circle with 0 padding for tighter fit
      const bounds = radiusCircleRef.current.getBounds();
      if (bounds) {
        mapInstanceRef.current.fitBounds(bounds, 0);
      }
    }
  }, [isMapReady, radiusKm, center]);

  // Sync circle with movable pin
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !centerMarkerRef.current || !radiusCircleRef.current) return;

    const google = (window as any).google;
    if (!google) return;

    const listener = centerMarkerRef.current.addListener("drag", () => {
      const pos = centerMarkerRef.current.getPosition();
      radiusCircleRef.current.setCenter(pos);
    });

    const mapListener = mapInstanceRef.current.addListener("center_changed", () => {
      // If we are in "movable pin" mode (implied by centerMarkerRef existence), 
      // the marker usually stays at center or moves with map.
      // The existing logic at line 137 syncs marker to map center.
      // We should also sync the circle.
      if (centerMarkerRef.current) {
        radiusCircleRef.current.setCenter(mapInstanceRef.current.getCenter());
      }
    });

    return () => {
      google.maps.event.removeListener(listener);
      google.maps.event.removeListener(mapListener);
    };
  }, [isMapReady]);

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
      const lat = Number(listing.latitude);
      const lng = Number(listing.longitude);

      if (isNaN(lat) || isNaN(lng)) return;

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
        position: { lat, lng },
        map: mapInstanceRef.current!,
        title: listing.address,
        content: markerContent,
      });

      // Helper to get property label
      const getPropertyLabel = (value: string) => {
        return config?.propertyTypes?.find((t: any) => t.value === value)?.label || value;
      };

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="width: 260px; font-family: 'Inter', system-ui, sans-serif; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.15); background: white;">
            ${listing.photos?.[0]?.url ? `
              <div style="position: relative; height: 150px; width: 100%;">
                <img src="${getImageUrl(listing.photos[0].url)}" style="width: 100%; height: 100%; object-fit: cover;" alt="Listing" />
                <div style="position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.6); color: white; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${listing.roomType === 'entire_place' ? 'Full House' : 'Room'}
                </div>
              </div>
            ` : ''}
            <div style="padding: 16px;">
              <h3 style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: #111827; line-height: 1.4;">
                ${listing.address ? listing.address.split(',')[0] : 'Location'}
              </h3>
              <p style="margin: 0 0 12px 0; font-size: 12px; color: #6B7280; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${listing.address || ''}
              </p>
              
              <div style="display: flex; align-items: baseline; gap: 4px; margin-bottom: 12px;">
                <span style="font-size: 18px; font-weight: 700; color: #FF5A5F;">₹${listing.monthlyRent.toLocaleString()}</span>
                <span style="font-size: 12px; color: #6B7280;">/mo</span>
              </div>

              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                ${listing.propertyTypes?.[0] ? `
                  <span style="background: #F3F4F6; color: #374151; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 500;">
                    ${listing.propertyTypes[0]}
                  </span>
                ` : ''}
                ${listing.bhkType !== undefined && listing.bhkType !== null ? `
                  <span style="background: #F3F4F6; color: #374151; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 500;">
                    ${listing.bhkType === 0 ? 'RK' : listing.bhkType + ' BHK'}
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
      mapInstanceRef.current.setCenter({ lat: Number(center.lat), lng: Number(center.lng) });
      // We do NOT set zoom here anymore, as it's controlled by radius
    }
  }, [isMapReady, center]);

  return (
    <div className="w-full h-full min-h-[400px]">
      <div ref={mapRef} className="w-full h-full min-h-[400px]" />
    </div>
  );
};
