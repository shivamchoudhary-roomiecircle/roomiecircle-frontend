import { useEffect, useRef } from "react";

const GOOGLE_MAPS_API_KEY = "AIzaSyDf5tpCzEbN1_RHkAh0rUrbQFM9UQE-O6k";

export const GoogleMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if ((window as any).google?.maps) {
        // Delay initialization to ensure DOM is ready
        setTimeout(initializeMap, 100);
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
      script.async = true;
      script.defer = true;
      script.onload = () => setTimeout(initializeMap, 100);
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current || !(window as any).google?.maps) return;

      const google = (window as any).google;
      
      // Default to a central location (e.g., San Francisco)
      const defaultCenter = { lat: 37.7749, lng: -122.4194 };

      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
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

      // Add sample markers (this will be replaced with actual room data)
      addSampleMarkers();
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

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};
