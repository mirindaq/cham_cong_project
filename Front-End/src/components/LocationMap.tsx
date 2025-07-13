import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix cho icon marker mặc định của Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationMapProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
  height?: string;
}

// Component để xử lý sự kiện click và drag trên bản đồ
function MapEventHandler({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationChange(lat, lng);
    },
  });
  return null;
}

// Component marker có thể kéo thả
function DraggableMarker({ 
  position, 
  onLocationChange 
}: { 
  position: [number, number]; 
  onLocationChange: (lat: number, lng: number) => void;
}) {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = {
    dragend: () => {
      const marker = markerRef.current;
      if (marker) {
        const latlng = marker.getLatLng();
        onLocationChange(latlng.lat, latlng.lng);
      }
    },
  };

  return (
    <Marker
      ref={markerRef}
      position={position}
      draggable={true}
      eventHandlers={eventHandlers}
    />
  );
}

export default function LocationMap({ 
  latitude, 
  longitude, 
  onLocationChange, 
  height = "400px" 
}: LocationMapProps) {
  const [position, setPosition] = useState<[number, number]>([latitude, longitude]);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    setPosition([latitude, longitude]);
  }, [latitude, longitude]);

  const handleLocationChange = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onLocationChange(lat, lng);
  };

  return (
    <div className="w-full border rounded-md overflow-hidden">
      <MapContainer
        center={position}
        zoom={13}
        style={{ height, width: "100%" }}
        ref={mapRef}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <DraggableMarker position={position} onLocationChange={handleLocationChange} />
        <MapEventHandler onLocationChange={handleLocationChange} />
      </MapContainer>
      <div className="p-3 bg-gray-50 border-t text-sm text-gray-600">
        <p>💡 Nhấp vào bản đồ để chọn vị trí hoặc kéo marker để di chuyển</p>
        <p className="mt-1 text-xs text-gray-500">
          Vị trí hiện tại: {position[0].toFixed(6)}, {position[1].toFixed(6)}
        </p>
      </div>
    </div>
  );
} 