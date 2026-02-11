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
  onSelect: (address: string) => void;
}

interface SavedLocation {
  label: string;
  coords: [number, number];
}

export default function LocationPicker({ onSelect }: Props) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  
  useEffect(() => {
  const saved = localStorage.getItem("savedLocations");
  if (saved) setSavedLocations(JSON.parse(saved));
}, []);


const saveLocation = () => {
  if (!position || !address) return;
  const label = prompt("Bu manzilni qaysi nom bilan saqlaysiz?")?.trim();
  if (!label) return;

  const exists = savedLocations.find((l) => l.label === label);
  if (exists) {
    alert("Bu nom bilan saqlangan manzil mavjud!");
    return;
  }

  const newLoc: SavedLocation = { label, coords: position };
  const updated = [...savedLocations, newLoc];
  setSavedLocations(updated);
  localStorage.setItem("savedLocations", JSON.stringify(updated)); // localStorage ga yozish
};


  // 🌍 Get current location on mount
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const coords: [number, number] = [
        pos.coords.latitude,
        pos.coords.longitude,
      ];
      setPosition(coords);
      await fetchAddress(coords);
    });
  }, []);

  // Reverse geocode
  const fetchAddress = async (coords: [number, number]) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[0]}&lon=${coords[1]}`
      );
      const data = await res.json();
      const foundAddress = data.display_name || "Manzil topilmadi";
      setAddress(foundAddress);
      onSelect(foundAddress);
    } catch (err) {
      console.error(err);
    }
  };

  // Forward geocode
  const searchLocation = async () => {
    if (!searchQuery) return;
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`
    );
    const results = await res.json();
    if (results.length === 0) return;
    const loc = results[0];
    const coords: [number, number] = [parseFloat(loc.lat), parseFloat(loc.lon)];
    setPosition(coords);
    await fetchAddress(coords);
  };

  // Map click
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

  // Save current location with custom label
//   const saveLocation = () => {
//     if (!position || !address) return;
//     const label = prompt("Bu manzilni qaysi nom bilan saqlaysiz?")?.trim();
//     if (!label) return;
//     const exists = savedLocations.find((l) => l.label === label);
//     if (exists) {
//       alert("Bu nom bilan saqlangan manzil mavjud!");
//       return;
//     }
//     const newLoc: SavedLocation = { label, coords: position };
//     setSavedLocations((prev) => [...prev, newLoc]);
//   };

  return (
    <div className="space-y-4">
      {/* 🔎 Search Input */}
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

      {/* ⭐ Saved locations */}
      <div className="flex gap-2">
        <select
          className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0a1b30]/50 text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          onChange={(e) => {
            const loc = savedLocations.find((l) => l.label === e.target.value);
            if (loc) {
              setPosition(loc.coords);
              fetchAddress(loc.coords);
            }
          }}
        >
          <option value="">Saqlangan joylar</option>
          {savedLocations.map((loc) => (
            <option key={loc.label} value={loc.label}>
              {loc.label}
            </option>
          ))}
        </select>
        <button
          onClick={saveLocation}
          className="px-4 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium transition-all"
        >
          Saqlash
        </button>
      </div>

      {/* 🗺 Map */}
      <div className="w-full max-w-full h-72 md:h-80 rounded-2xl overflow-hidden border border-white/10">
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


      {/* 📍 Tanlangan address */}
      <p className="text-sm text-blue-300 truncate">
        Tanlangan: {address || "Hali tanlanmagan"}
      </p>
    </div>
  );
}
