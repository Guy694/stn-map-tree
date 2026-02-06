'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function MiniMapPicker({ selectedPosition, onSelectPosition, height = 300 }) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Initialize map
        if (!mapInstanceRef.current) {
            // Create map centered on Satun province
            mapInstanceRef.current = L.map(mapRef.current, {
                center: [6.6238, 100.0673], // Satun coordinates
                zoom: 10,
                zoomControl: true,
                scrollWheelZoom: true
            });

            // Add OpenStreetMap tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(mapInstanceRef.current);

            // Add click handler
            mapInstanceRef.current.on('click', (e) => {
                const { lat, lng } = e.latlng;
                onSelectPosition({ lat, lng });
            });
        }

        // Update or create marker when position changes
        if (selectedPosition) {
            if (markerRef.current) {
                // Update existing marker position
                markerRef.current.setLatLng([selectedPosition.lat, selectedPosition.lng]);
            } else {
                // Create new marker
                const greenIcon = L.divIcon({
                    className: 'custom-marker',
                    html: '<div style="font-size: 32px; filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.5));">📍</div>',
                    iconSize: [40, 40],
                    iconAnchor: [20, 40]
                });

                markerRef.current = L.marker(
                    [selectedPosition.lat, selectedPosition.lng],
                    { icon: greenIcon }
                ).addTo(mapInstanceRef.current);

                // Center map on marker
                mapInstanceRef.current.setView([selectedPosition.lat, selectedPosition.lng], 13);
            }
        }

        // Cleanup
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                markerRef.current = null;
            }
        };
    }, [selectedPosition, onSelectPosition]);

    return (
        <div className="space-y-2">
            <div
                ref={mapRef}
                style={{ height: `${height}px` }}
                className="w-full rounded-lg border-2 border-gray-300 overflow-hidden shadow-md"
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2 text-sm">
                    <span className="text-lg">💡</span>
                    <div>
                        <p className="font-medium text-blue-900">คลิกบนแผนที่เพื่อเลือกตำแหน่งปลูกต้นไม้</p>
                        {selectedPosition && (
                            <p className="text-xs text-blue-700 mt-1">
                                Lat: {selectedPosition.lat.toFixed(6)}, Lng: {selectedPosition.lng.toFixed(6)}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
