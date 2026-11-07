'use client';

import React, { useEffect, useRef } from 'react';
import { GeoPoint } from '@/domain/entities/ActivityDetail';
import L from 'leaflet';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  polyline: GeoPoint[];
  hoverPoint?: GeoPoint | null;
}

export default function RouteMapInner({ polyline, hoverPoint }: Props) {
  const { theme } = useTheme();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const hoverMarkerRef = useRef<L.CircleMarker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || polyline.length === 0) return;

    // Fix default marker icon issues in Leaflet when bundled with Webpack/Turbopack
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        attributionControl: false,
        zoomControl: false,
      });

      // Add Zoom Control at bottom-right corner where it never gets covered
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // CartoDB Tile Layer with authenticated API key
      const cartoKey = process.env.NEXT_PUBLIC_CARTO_API_KEY || 'cb1_4u0l_1_73d2494ccd9b9f72868db840';
      const variant = theme === 'light' ? 'light_all' : 'dark_all';
      const tileUrl = `https://{s}.basemaps.cartocdn.com/${variant}/{z}/{x}/{y}{r}.png?key=${cartoKey}`;

      const tileLayer = L.tileLayer(tileUrl, {
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous vector layers
    map.eachLayer(layer => {
      if (layer instanceof L.Polyline || layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    const latLngs = polyline.map(pt => [pt.lat, pt.lon] as [number, number]);

    // Draw route glow outline
    L.polyline(latLngs, {
      color: theme === 'light' ? '#7c3aed' : '#4c1d95',
      weight: 8,
      opacity: theme === 'light' ? 0.35 : 0.6,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // Draw main route polyline
    const mainLine = L.polyline(latLngs, {
      color: theme === 'light' ? '#6d28d9' : '#a855f7',
      weight: 4,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // Start Marker
    const startPt = latLngs[0];
    if (startPt) {
      L.circleMarker(startPt, {
        radius: 6,
        fillColor: '#10b981',
        fillOpacity: 1,
        color: '#ffffff',
        weight: 2,
      })
        .bindTooltip('START', { permanent: false, direction: 'top' })
        .addTo(map);
    }

    // Finish Marker
    const finishPt = latLngs[latLngs.length - 1];
    if (finishPt) {
      L.circleMarker(finishPt, {
        radius: 6,
        fillColor: '#f43f5e',
        fillOpacity: 1,
        color: '#ffffff',
        weight: 2,
      })
        .bindTooltip('FINISH', { permanent: false, direction: 'top' })
        .addTo(map);
    }

    // Fit map bounds
    if (latLngs.length > 0) {
      map.fitBounds(mainLine.getBounds(), { padding: [30, 30] });
    }

    // Hover Marker
    const hoverMarker = L.circleMarker([0, 0], {
      radius: 7,
      fillColor: '#38bdf8',
      fillOpacity: 1,
      color: '#ffffff',
      weight: 3,
    });
    hoverMarkerRef.current = hoverMarker;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        tileLayerRef.current = null;
      }
    };
  }, [polyline, theme]);

  // Synchronize hover marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    const marker = hoverMarkerRef.current;
    if (!map || !marker) return;

    if (hoverPoint && hoverPoint.lat && hoverPoint.lon) {
      marker.setLatLng([hoverPoint.lat, hoverPoint.lon]);
      if (!map.hasLayer(marker)) {
        marker.addTo(map);
      }
    } else {
      if (map.hasLayer(marker)) {
        map.removeLayer(marker);
      }
    }
  }, [hoverPoint]);

  return <div ref={mapContainerRef} className="w-full h-full min-h-[360px] z-10" />;
}
