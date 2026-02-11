import {
	MapContainer,
	TileLayer,
	Marker,
	useMapEvents,
	useMap,
} from "react-leaflet";
import { useState, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// 📍 Standart marker ikonkasini sozlash (React uchun muhim)
const customIcon = new L.Icon({
	iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // Chiroyliroq marker
	iconSize: [38, 38],
	iconAnchor: [19, 38],
	popupAnchor: [0, -38],
});

interface Props {
	initialCoords: [number, number];
	onLocationSelect: (latlng: L.LatLng, address: string) => void;
}

export default function Map({ initialCoords, onLocationSelect }: Props) {
	const [position, setPosition] = useState<L.LatLng>(
		new L.LatLng(initialCoords[0], initialCoords[1]),
	);
	const [loading, setLoading] = useState(false);

	const fetchAddress = async (latlng: L.LatLng) => {
		try {
			const res = await fetch(
				`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`,
			);
			const data = await res.json();
			const address = data.display_name || "Noma'lum manzil";
			onLocationSelect(latlng, address);
		} catch (error) {
			console.error("Manzilni aniqlashda xato:", error);
		}
	};

	// Xarita bosilganda markerni ko'chirish
	function LocationMarker() {
		useMapEvents({
			click(e) {
				setPosition(e.latlng);
				fetchAddress(e.latlng);
			},
		});

		return <Marker position={position} icon={customIcon} />;
	}

	// Xarita markazini boshqarish uchun yordamchi komponent
	function MapController({ targetPos }: { targetPos: L.LatLng }) {
		const map = useMap();
		useEffect(() => {
			// Faqat tugma bosilganda uchib borish uchun
			if (loading) {
				map.flyTo(targetPos, 16, { animate: true, duration: 1.5 });
			}
		}, [targetPos, map, loading]);
		return null;
	}

	const getMyLocation = () => {
		if (!navigator.geolocation) {
			alert("Geolokatsiya brauzeringizda qo'llab-quvvatlanmaydi");
			return;
		}

		setLoading(true);
		navigator.geolocation.getCurrentPosition(
			async pos => {
				const latlng = new L.LatLng(pos.coords.latitude, pos.coords.longitude);
				setPosition(latlng);
				await fetchAddress(latlng);
				setLoading(false);
			},
			() => {
				setLoading(false);
				alert("Joylashuvni aniqlashga ruxsat berilmadi");
			},
			{ enableHighAccuracy: true },
		);
	};

	return (
		<div className='relative w-full h-[400px] rounded-2xl overflow-hidden border border-gray-200 shadow-lg'>
			{/* 📍 Mening joylashuvim tugmasi - MapContainer tashqarisida, lekin relative div ichida */}
			<button
				type='button'
				onClick={getMyLocation}
				disabled={loading}
				className={`
          absolute z-[1001] bottom-4 right-4 
          bg-white hover:bg-gray-50 active:scale-95
          text-gray-700 font-medium px-4 py-2.5 
          rounded-xl shadow-xl flex items-center gap-2 
          transition-all duration-200 border border-gray-100
          disabled:opacity-80
        `}
			>
				{loading ? (
					<span className='animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full' />
				) : (
					<svg
						className='w-5 h-5 text-blue-600'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth='2'
							d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
						/>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth='2'
							d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
						/>
					</svg>
				)}
				<span className='text-sm'>
					{loading ? "Aniqlanmoqda..." : "Mening joylashuvim"}
				</span>
			</button>

			<MapContainer
				center={position}
				zoom={14}
				zoomControl={false} // Standart zoomni o'chirib, o'zimiznikini pastroqqa qo'yishimiz mumkin
				className='w-full h-full'
			>
				<TileLayer
					url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
				/>
				<MapController targetPos={position} />
				<LocationMarker />
			</MapContainer>
			{/* yaxshilash kerak ancha sekin ishlayapti */}
			{/* Map markazida doimiy ko'rsatkich (ixtiyoriy) */}
		</div>
	);
}
