'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

// Function to generate color from tree name (consistent hashing)
const getTreeColor = (treeName) => {
    // Simple hash function to get consistent color for each tree name
    let hash = 0;
    for (let i = 0; i < treeName.length; i++) {
        hash = treeName.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Convert to HSL color (good saturation and lightness for visibility)
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 45%)`;
};

// Function to create tree icon with specific color
const createTreeIcon = (treeName) => {
    const color = getTreeColor(treeName);
    return new L.DivIcon({
        className: 'tree-marker-icon',
        html: `<div style="font-size: 32px; filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.3)); color: ${color};">🌳</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
    });
};

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

// Heatmap Layer Component
function HeatmapLayer({ trees, map }) {
    useEffect(() => {
        if (!map || !trees || trees.length === 0) return;

        // Create heatmap data: [lat, lng, intensity]
        const heatData = trees.map(tree => [
            tree.lat,
            tree.lng,
            tree.quantity || 1 // Use quantity as intensity
        ]);

        // Create heatmap layer
        const heat = L.heatLayer(heatData, {
            radius: 25,
            blur: 15,
            maxZoom: 17,
            max: 1.0,
            gradient: {
                0.0: '#00ff00',
                0.5: '#ffff00',
                0.7: '#ff9900',
                1.0: '#ff0000'
            }
        }).addTo(map);

        // Cleanup
        return () => {
            map.removeLayer(heat);
        };
    }, [map, trees]);

    return null;
}

// Map events to get map instance
function MapInstanceHandler({ onMapReady }) {
    const map = useMapEvents({});
    useEffect(() => {
        if (map && onMapReady) {
            onMapReady(map);
        }
    }, [map, onMapReady]);
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

    const [map, setMap] = useState(null);

    // Fix Leaflet default icon issue
    useEffect(() => {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: '/tree-marker.svg',
            iconUrl: '/tree-marker.svg',
            shadowUrl: '',
        });
    }, []);

    // Helper function to validate GeoJSON
    const isValidGeoJSON = (data) => {
        if (!data || typeof data !== 'object') return false;
        if (data.error) return false; // API returned an error
        if (data.type !== 'FeatureCollection') return false;
        if (!Array.isArray(data.features)) return false;
        return true;
    };

    // Fetch polygon data
    useEffect(() => {
        const fetchPolygons = async () => {
            try {
                const [districtsRes, tambonsRes, villagesRes] = await Promise.all([
                    fetch('/api/polygons/districts').then(r => r.json()),
                    fetch('/api/polygons/tambons').then(r => r.json()),
                    fetch('/api/polygons/villages').then(r => r.json())
                ]);

                // Validate and set only valid GeoJSON data
                const validatedData = {
                    districts: isValidGeoJSON(districtsRes) ? districtsRes : null,
                    tambons: isValidGeoJSON(tambonsRes) ? tambonsRes : null,
                    villages: isValidGeoJSON(villagesRes) ? villagesRes : null
                };

                // Log any errors
                if (districtsRes?.error) console.error('Districts API error:', districtsRes.error);
                if (tambonsRes?.error) console.error('Tambons API error:', tambonsRes.error);
                if (villagesRes?.error) console.error('Villages API error:', villagesRes.error);

                setPolygonData(validatedData);
            } catch (error) {
                console.error('Error fetching polygons:', error);
            }
        };

        fetchPolygons();
    }, []);

    // Polygon styles - เส้นขอบเขตอย่างเดียว ไม่มีสีเติม
    const getPolygonStyle = (layer) => {
        const styles = {
            districts: {
                fillOpacity: 0, // ไม่เติมสี
                color: '#1e40af', // สีน้ำเงิน
                weight: 2,
                dashArray: '5, 5' // เส้นประ
            },
            tambons: {
                fillOpacity: 0, // ไม่เติมสี
                color: '#059669', // สีเขียว
                weight: 1.5
            },
            villages: {
                fillOpacity: 0, // ไม่เติมสี
                color: '#ea580c', // สีส้มสดเข้มขึ้น
                weight: 2, // เพิ่มความหนาเส้นเป็น 2
                opacity: 0.8 // ความทึบของเส้น
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
            <MapInstanceHandler onMapReady={setMap} />

            {/* Base Layer - controlled by Sidebar */}
            {visibleLayers.satellite ? (
                <TileLayer
                    attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    maxZoom={19}
                />
            ) : (
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
            )}

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

            {/* Heatmap Layer */}
            {visibleLayers.heatmap && map && (
                <HeatmapLayer trees={trees} map={map} />
            )}

            {/* Tree markers */}
            {trees.map((tree) => (
                <Marker
                    key={tree.id}
                    position={[tree.lat, tree.lng]}
                    icon={createTreeIcon(tree.tree_name)}
                >
                    <Popup>
                        <div className="min-w-[200px]">
                            {/* Header */}
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                                <span className="text-2xl">🌳</span>
                                <div>
                                    <h3 className="font-bold text-green-800 text-base">ต้น{tree.tree_name}</h3>

                                </div>
                            </div>

                            {/* Images Gallery */}
                            {tree.images && tree.images.length > 0 && (
                                <div className="mb-3">
                                    <div className={`grid gap-2 ${tree.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                        {tree.images.map((imagePath, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={imagePath}
                                                    alt={`${tree.tree_name} - รูปที่ ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition"
                                                    onClick={() => window.open(imagePath, '_blank')}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    {tree.images.length > 1 && (
                                        <p className="text-xs text-gray-500 text-center mt-1">
                                            คลิกที่รูปเพื่อดูขนาดเต็ม ({tree.images.length} รูป)
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Details */}
                            <div className="space-y-2 text-sm">
                                <div className="flex items-start gap-2">
                                    <span className="text-gray-400">👤</span>
                                    <span className="text-gray-700">ผู้ปลูก : {tree.planter_name}</span>
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
