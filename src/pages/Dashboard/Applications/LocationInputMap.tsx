// src/pages/Dashboard/Applications/LocationInputMap.tsx
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Default marker icon fix
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface Props {
  initialLocation?: string;
  initialCoords?: [number, number];
  onLocationChange: (address: string, coords: [number, number]) => void;
}

export default function LocationPicker({
  initialLocation,
  initialCoords,
  onLocationChange,
}: Props) {
  const [position, setPosition] = useState<[number, number] | null>(
    initialCoords || null
  );
  const [address, setAddress] = useState(initialLocation || "");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (initialCoords) {
      setPosition(initialCoords);
    } else {
      navigator.geolocation.getCurrentPosition((pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  }, [initialCoords]);

  const fetchAddress = async (coords: [number, number]) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[0]}&lon=${coords[1]}`
      );

      const data = await res.json();
      const foundAddress = data.display_name || "Manzil topilmadi";
      setAddress(foundAddress);
      onLocationChange(foundAddress, coords);
    } catch (err) {
      console.error(err);
    }
  };

  // Forward geocode
  const searchLocation = async () => {
    if (!searchQuery) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`
      );
      const results = await res.json();
      if (results.length === 0) {
        alert("Manzil topilmadi");
        return;
      }
      const loc = results[0];
      const coords: [number, number] = [
        parseFloat(loc.lat),
        parseFloat(loc.lon),
      ];
      setPosition(coords);
      await fetchAddress(coords);
    } catch (err) {
      console.error(err);
    }
  };

  // Map click handler
  function LocationMarker() {
    useMapEvents({
      click(e) {
        const coords: [number, number] = [e.latlng.lat, e.latlng.lng];
        setPosition(coords);
        fetchAddress(coords);
      },
    });
    return position ? <Marker position={position} /> : null;
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex gap-2">
        <input
          className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0a1b30]/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          placeholder="Manzil izlash..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchLocation()}
        />
        <button
          onClick={searchLocation}
          className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg shadow-blue-500/20 transition-all"
        >
          Qidirish
        </button>
      </div>

      {/* Map */}
      <div className="w-full h-72 md:h-80 rounded-2xl overflow-hidden border border-white/10">
        {position && (
          <MapContainer
            center={position}
            zoom={14}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationMarker />
          </MapContainer>
        )}
      </div>

      {/* Selected Address Display */}
      <p className="text-sm text-blue-300 truncate">
        Tanlangan: {address || "Hali tanlanmagan"}
      </p>
    </div>
  );
}
