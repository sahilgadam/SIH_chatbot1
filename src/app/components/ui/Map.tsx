// src/app/components/ui/Map.tsx
"use client";

import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L, { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

// Import leaflet images directly to resolve issues with bundlers like Turbopack
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Declare icon variables to be assigned later on the client-side
let floatIcon: L.Icon;
let selectedFloatIcon: L.Icon;

// This code block runs only on the client side, after the component has mounted
if (typeof window !== 'undefined') {
    // Fix for default icon paths
    // This is necessary because Next.js bundles can break the default icon URLs
    delete (L.Icon.Default as any).prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: iconRetinaUrl.src,
        iconUrl: iconUrl.src,
        shadowUrl: shadowUrl.src,
    });

    floatIcon = new L.Icon({
        iconUrl: '/float-icon.svg',
        iconSize: [25, 25],
        iconAnchor: [12, 25],
        popupAnchor: [0, -25]
    });

    selectedFloatIcon = new L.Icon({
        iconUrl: '/float-icon-selected.svg',
        iconSize: [35, 35],
        iconAnchor: [17, 35],
        popupAnchor: [0, -35]
    });
}

// Custom hook to handle map view changes
const ChangeView = ({ center, zoom, transition }: { center: LatLngExpression; zoom: number; transition: 'fly' | 'instant' }) => {
  const map = useMap();
  useEffect(() => {
    // FIX: Add a guard to ensure the map is ready before calling flyTo
    // The map container check prevents calling methods on an uninitialized map object.
    if (map && map.getContainer()) {
      if (transition === 'instant') {
        map.setView(center, zoom);
      } else {
        // We also check if the center and zoom have changed to avoid unnecessary flyTo calls
        if (map.getCenter().lat !== center[0] || map.getCenter().lng !== center[1] || map.getZoom() !== zoom) {
            map.flyTo(center, zoom, { duration: 2 });
        }
      }
    }
  }, [center, zoom, transition, map]);
  return null;
};

interface MapProps {
  center: LatLngExpression;
  zoom: number;
  selectedFloatId: number | null;
  onFloatSelect: (float: any) => void;
  transition: 'fly' | 'instant';
  floats: any[];
  theme: 'light' | 'dark';
}

export default function Map({ center, zoom, selectedFloatId, onFloatSelect, transition, floats, theme }: MapProps) {
  // We still need this check here for the main component's render logic
  if (typeof window === "undefined") return null;

  const lightTileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}";
  const darkTileUrl = "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png";

  const lightAttribution = 'Tiles &copy; <a href="https://www.esri.com">Esri</a> &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community';
  const darkAttribution = '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
      <ChangeView center={center} zoom={zoom} transition={transition} />
      
      {/* The key prop is crucial here. It forces React to re-render the TileLayer when the theme changes. */}
      <TileLayer
        key={theme} 
        url={theme === 'dark' ? darkTileUrl : lightTileUrl}
        attribution={theme === 'dark' ? darkAttribution : lightAttribution}
      />

      {floats.map((f) => (
          <React.Fragment key={f.id}>
            {/* FIX: Only render Polyline if trajectory data exists and is not empty */}
            {f.trajectory && f.trajectory.length > 0 && (
              <Polyline positions={f.trajectory} color="#3b82f6" weight={2} opacity={0.7} />
            )}
            <Marker
              icon={selectedFloatId === f.id ? selectedFloatIcon : floatIcon}
              position={f.position}
              eventHandlers={{ click: () => onFloatSelect(f) }}
            >
              <Popup>
                <div className="text-sm">
                    <p className="font-bold text-base">Float #{f.platform_number}</p>
                    {f.project_name && <p><strong>Project:</strong> {f.project_name}</p>}
                    <p>Click marker to see details.</p>
                </div>
              </Popup>
            </Marker>
        </React.Fragment>
      ))}
    </MapContainer>
  );
}