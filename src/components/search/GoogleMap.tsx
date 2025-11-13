import { useEffect, useRef } from "react";

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
}

export const GoogleMap = ({ center, listings = [], onBoundsChange }: GoogleMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    let initialized = false;
    let resizeObserver: ResizeObserver | null = null;
    let loadListener: ((this: HTMLScriptElement, ev: Event) => any) | null = null;

    const tryInit = () => {
      const el = mapRef.current as HTMLDivElement | null;
      const google = (window as any).google;
      if (!el || !google?.maps || initialized) return;
      // Wait until the element is in the DOM and has size
      if (!el.isConnected || el.offsetWidth === 0 || el.offsetHeight === 0) return;

      const defaultCenter = center || { lat: 37.7749, lng: -122.4194 };

      mapInstanceRef.current = new google.maps.Map(el, {
        center: defaultCenter,
        zoom: 12,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
        mapTypeControl: false,
        fullscreenControl: true,
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

      initialized = true;
      
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

    const loadGoogleMaps = () => {
      if ((window as any).google?.maps) {
        tryInit();
        return;
      }

      let script = document.querySelector('script[data-google-maps]') as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&v=weekly`;
        script.async = true;
        script.defer = true;
        script.setAttribute('data-google-maps', 'true');
        document.head.appendChild(script);
      }

      loadListener = () => {
        // Give React a frame to commit the DOM
        requestAnimationFrame(tryInit);
      };
      script.addEventListener('load', loadListener, { once: true } as any);
    };

    const addListingMarkers = (listingsData: Listing[]) => {
      if (!mapInstanceRef.current) return;
      
      const google = (window as any).google;
      
      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      listingsData.forEach((listing) => {
        const marker = new google.maps.Marker({
          position: { lat: listing.latitude, lng: listing.longitude },
          map: mapInstanceRef.current!,
          title: listing.addressText,
          label: {
            text: `₹${listing.monthlyRent.toLocaleString()}`,
            color: "white",
            fontSize: "12px",
            fontWeight: "bold",
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: "#FF6B35",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
            scale: 20,
          },
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 12px; max-width: 280px; font-family: system-ui, -apple-system, sans-serif;">
              ${listing.images?.[0] ? `<img src="${listing.images[0]}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 12px;" alt="Listing" />` : ''}
              <h3 style="margin: 0 0 8px 0; font-weight: 600; font-size: 16px; color: #1a1a1a;">${listing.addressText}</h3>
              <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: 700; color: #FF6B35;">₹${listing.monthlyRent.toLocaleString()}<span style="font-size: 14px; font-weight: 400; color: #666;">/mo</span></p>
              ${listing.description ? `<p style="margin: 0 0 8px 0; font-size: 14px; color: #666; line-height: 1.4;">${listing.description.substring(0, 100)}${listing.description.length > 100 ? '...' : ''}</p>` : ''}
              <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px;">
                ${listing.listingType ? `<span style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px; font-size: 12px; color: #666;">${listing.listingType}</span>` : ''}
                ${listing.propertyType?.[0] ? `<span style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px; font-size: 12px; color: #666;">${listing.propertyType[0]}</span>` : ''}
              </div>
            </div>
          `,
        });

        // Add smooth hover effect with animation
        let hoverTimeout: any;
        marker.addListener("mouseover", () => {
          clearTimeout(hoverTimeout);
          hoverTimeout = setTimeout(() => {
            infoWindow.open(mapInstanceRef.current!, marker);
          }, 200);
        });

        marker.addListener("mouseout", () => {
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
    };

    loadGoogleMaps();

    // Observe size changes of the container and (re)try init
    if (mapRef.current && 'ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(() => tryInit());
      resizeObserver.observe(mapRef.current);
    }
    // Fallback attempt on next frame
    const raf = requestAnimationFrame(() => tryInit());

    return () => {
      resizeObserver?.disconnect();
      cancelAnimationFrame(raf);
      // No need to remove script, but detach listener if any
      const script = document.querySelector('script[data-google-maps]') as HTMLScriptElement | null;
      if (script && loadListener) script.removeEventListener('load', loadListener as any);
      // Clear markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers when listings change
  useEffect(() => {
    if (mapInstanceRef.current && listings.length > 0) {
      const google = (window as any).google;
      if (google?.maps) {
        const addListingMarkers = (listingsData: Listing[]) => {
          const google = (window as any).google;
          
          // Clear existing markers
          markersRef.current.forEach(marker => marker.setMap(null));
          markersRef.current = [];

          listingsData.forEach((listing) => {
            const marker = new google.maps.Marker({
              position: { lat: listing.latitude, lng: listing.longitude },
              map: mapInstanceRef.current!,
              title: listing.addressText,
              label: {
                text: `₹${listing.monthlyRent.toLocaleString()}`,
                color: "white",
                fontSize: "12px",
                fontWeight: "bold",
              },
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: "#FF6B35",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
                scale: 20,
              },
            });

            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div style="padding: 12px; max-width: 280px; font-family: system-ui, -apple-system, sans-serif;">
                  ${listing.images?.[0] ? `<img src="${listing.images[0]}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 12px;" alt="Listing" />` : ''}
                  <h3 style="margin: 0 0 8px 0; font-weight: 600; font-size: 16px; color: #1a1a1a;">${listing.addressText}</h3>
                  <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: 700; color: #FF6B35;">₹${listing.monthlyRent.toLocaleString()}<span style="font-size: 14px; font-weight: 400; color: #666;">/mo</span></p>
                  ${listing.description ? `<p style="margin: 0 0 8px 0; font-size: 14px; color: #666; line-height: 1.4;">${listing.description.substring(0, 100)}${listing.description.length > 100 ? '...' : ''}</p>` : ''}
                  <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px;">
                    ${listing.listingType ? `<span style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px; font-size: 12px; color: #666;">${listing.listingType}</span>` : ''}
                    ${listing.propertyType?.[0] ? `<span style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px; font-size: 12px; color: #666;">${listing.propertyType[0]}</span>` : ''}
                  </div>
                </div>
              `,
            });

            // Add smooth hover effect with animation
            let hoverTimeout: any;
            marker.addListener("mouseover", () => {
              clearTimeout(hoverTimeout);
              hoverTimeout = setTimeout(() => {
                infoWindow.open(mapInstanceRef.current!, marker);
              }, 200);
            });

            marker.addListener("mouseout", () => {
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
        };
        
        addListingMarkers(listings);
      }
    }
  }, [listings]);

  // Update map center when center prop changes
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setCenter(center);
      mapInstanceRef.current.setZoom(14);
    }
  }, [center]);

  return (
    <div className="w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};
