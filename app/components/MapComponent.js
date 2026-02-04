'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMapEvents } from 'react-leaflet';
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

export default function MapComponent({
    trees,
    onMapClick,
    isSelectingPosition,
    visibleLayers,
    onPolygonClick
}) {
    // Satun Province center coordinates
    const satunCenter = [6.6238, 99.9500];
    const defaultZoom = 10;

    const [polygonData, setPolygonData] = useState({
        districts: null,
        tambons: null,
        villages: null
    });

    // Fix Leaflet default icon issue
    useEffect(() => {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: '/tree-marker.svg',
            iconUrl: '/tree-marker.svg',
            shadowUrl: '',
        });
    }, []);

    // Fetch polygon data
    useEffect(() => {
        const fetchPolygons = async () => {
            try {
                const [districts, tambons, villages] = await Promise.all([
                    fetch('/api/polygons/districts').then(r => r.json()),
                    fetch('/api/polygons/tambons').then(r => r.json()),
                    fetch('/api/polygons/villages').then(r => r.json())
                ]);

                setPolygonData({ districts, tambons, villages });
            } catch (error) {
                console.error('Error fetching polygons:', error);
            }
        };

        fetchPolygons();
    }, []);

    // Polygon styles
    const getPolygonStyle = (layer) => {
        const styles = {
            districts: {
                fillColor: '#3b82f6',
                fillOpacity: 0.1,
                color: '#1e40af',
                weight: 2,
                dashArray: '5, 5'
            },
            tambons: {
                fillColor: '#10b981',
                fillOpacity: 0.08,
                color: '#059669',
                weight: 1.5
            },
            villages: {
                fillColor: '#f59e0b',
                fillOpacity: 0.05,
                color: '#d97706',
                weight: 1
            }
        };
        return styles[layer] || {};
    };

    // Handle polygon click
    const onEachFeature = (layerType) => (feature, layer) => {
        layer.on({
            click: (e) => {
                if (isSelectingPosition && onPolygonClick) {
                    L.DomEvent.stopPropagation(e);
                    onPolygonClick(feature.properties, layerType);
                }
            },
            mouseover: (e) => {
                const layer = e.target;
                layer.setStyle({
                    fillOpacity: 0.3,
                    weight: 3
                });
            },
            mouseout: (e) => {
                const layer = e.target;
                layer.setStyle(getPolygonStyle(layerType));
            }
        });

        // Add popup with area name
        const props = feature.properties;
        let popupContent = '';
        if (layerType === 'districts') {
            popupContent = `<strong>อำเภอ${props.name}</strong>`;
        } else if (layerType === 'tambons') {
            popupContent = `<strong>ตำบล${props.name}</strong><br/>อำเภอ${props.districtName}`;
        } else if (layerType === 'villages') {
            popupContent = `<strong>หมู่บ้าน${props.name}</strong><br/>ตำบล${props.tambonName}<br/>อำเภอ${props.districtName}`;
        }
        layer.bindPopup(popupContent);
    };

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

            {/* Polygon layers */}
            {visibleLayers.districts && polygonData.districts && (
                <GeoJSON
                    data={polygonData.districts}
                    style={getPolygonStyle('districts')}
                    onEachFeature={onEachFeature('districts')}
                />
            )}

            {visibleLayers.tambons && polygonData.tambons && (
                <GeoJSON
                    data={polygonData.tambons}
                    style={getPolygonStyle('tambons')}
                    onEachFeature={onEachFeature('tambons')}
                />
            )}

            {visibleLayers.villages && polygonData.villages && (
                <GeoJSON
                    data={polygonData.villages}
                    style={getPolygonStyle('villages')}
                    onEachFeature={onEachFeature('villages')}
                />
            )}

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
                                    <h3 className="font-bold text-green-800 text-base">{tree.tree_name}</h3>
                                    <span className="text-xs text-gray-500">จำนวน {tree.quantity} ต้น</span>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-2 text-sm">
                                <div className="flex items-start gap-2">
                                    <span className="text-gray-400">👤</span>
                                    <span className="text-gray-700">{tree.planter_name}</span>
                                </div>

                                {tree.district_name && (
                                    <div className="flex items-start gap-2">
                                        <span className="text-gray-400">📍</span>
                                        <span className="text-gray-700">
                                            {tree.village_name && `${tree.village_name} `}
                                            {tree.tambon_name && `ต.${tree.tambon_name} `}
                                            {tree.district_name && `อ.${tree.district_name}`}
                                        </span>
                                    </div>
                                )}

                                {tree.location_detail && (
                                    <div className="flex items-start gap-2">
                                        <span className="text-gray-400">🗺️</span>
                                        <span className="text-gray-700">{tree.location_detail}</span>
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
                                    <span className="text-gray-500 text-xs">{formatDate(tree.created_at)}</span>
                                </div>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
