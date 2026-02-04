'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Custom tree icon
const treeIcon = new L.DivIcon({
    className: 'tree-marker-icon',
    html: '<div style="font-size: 32px; filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.3));">🌳</div>',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

// Component to handle map clicks
function MapClickHandler({ onMapClick, isSelectingPosition }) {
    useMapEvents({
        click(e) {
            if (isSelectingPosition) {
                onMapClick(e.latlng);
            }
        },
    });
    return null;
}

// Format date to Thai format
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

export default function MapComponent({ trees, onMapClick, isSelectingPosition }) {
    // Satun Province center coordinates
    const satunCenter = [6.6238, 99.9500];
    const defaultZoom = 10;

    // Fix Leaflet default icon issue
    useEffect(() => {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: '/tree-marker.svg',
            iconUrl: '/tree-marker.svg',
            shadowUrl: '',
        });
    }, []);

    return (
        <MapContainer
            center={satunCenter}
            zoom={defaultZoom}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapClickHandler
                onMapClick={onMapClick}
                isSelectingPosition={isSelectingPosition}
            />

            {/* Tree markers */}
            {trees.map((tree) => (
                <Marker
                    key={tree.id}
                    position={[tree.lat, tree.lng]}
                    icon={treeIcon}
                >
                    <Popup>
                        <div className="min-w-[200px]">
                            {/* Header */}
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                                <span className="text-2xl">🌳</span>
                                <div>
                                    <h3 className="font-bold text-green-800 text-base">{tree.treeName}</h3>
                                    <span className="text-xs text-gray-500">จำนวน {tree.quantity} ต้น</span>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-2 text-sm">
                                <div className="flex items-start gap-2">
                                    <span className="text-gray-400">👤</span>
                                    <span className="text-gray-700">{tree.planterName}</span>
                                </div>

                                {tree.location && (
                                    <div className="flex items-start gap-2">
                                        <span className="text-gray-400">📍</span>
                                        <span className="text-gray-700">{tree.location}</span>
                                    </div>
                                )}

                                {tree.note && (
                                    <div className="flex items-start gap-2">
                                        <span className="text-gray-400">📝</span>
                                        <span className="text-gray-600 text-xs">{tree.note}</span>
                                    </div>
                                )}

                                <div className="flex items-start gap-2 pt-2 border-t border-gray-100">
                                    <span className="text-gray-400">📅</span>
                                    <span className="text-gray-500 text-xs">{formatDate(tree.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
