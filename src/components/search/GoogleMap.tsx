import { useEffect, useRef } from "react";

const GOOGLE_MAPS_API_KEY = "AIzaSyDf5tpCzEbN1_RHkAh0rUrbQFM9UQE-O6k";

export const GoogleMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

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

      const defaultCenter = { lat: 37.7749, lng: -122.4194 };

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

      initialized = true;
      addSampleMarkers();
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

    const addSampleMarkers = () => {
      if (!mapInstanceRef.current) return;

      const google = (window as any).google;

      const sampleLocations = [
        { lat: 37.7749, lng: -122.4194, price: "$1,900", title: "Room 1" },
        { lat: 37.7849, lng: -122.4094, price: "$2,100", title: "Room 2" },
        { lat: 37.7649, lng: -122.4294, price: "$1,750", title: "Room 3" },
        { lat: 37.7549, lng: -122.4394, price: "$2,300", title: "Room 4" },
        { lat: 37.7949, lng: -122.3994, price: "$1,850", title: "Room 5" },
      ];

      sampleLocations.forEach((location) => {
        const marker = new google.maps.Marker({
          position: { lat: location.lat, lng: location.lng },
          map: mapInstanceRef.current!,
          title: location.title,
          label: {
            text: location.price,
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
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 8px 0; font-weight: 600;">${location.title}</h3>
              <p style="margin: 0; font-size: 14px; color: #666;">${location.price}/mo</p>
            </div>
          `,
        });

        marker.addListener("click", () => {
          infoWindow.open(mapInstanceRef.current!, marker);
        });
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
      mapInstanceRef.current = null;
    };
  }, []);

  return (
    <div className="w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};
