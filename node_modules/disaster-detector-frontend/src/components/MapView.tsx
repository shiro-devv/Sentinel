import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Alert } from '../types';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  alerts: Alert[];
  center?: [number, number];
  zoom?: number;
  onAlertClick?: (alert: Alert) => void;
}

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createMarkerIcon = (severity: string) => {
  const colors: Record<string, string> = {
    LOW: '#10B981',
    MEDIUM: '#F59E0B',
    HIGH: '#EF4444',
    CRITICAL: '#DC2626',
  };

  const color = colors[severity] || colors.LOW;

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const MapUpdater: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
};

const MapView: React.FC<MapViewProps> = ({
  alerts,
  center = [39.8283, -98.5795],
  zoom = 4,
  onAlertClick,
}) => {
  const mapRef = useRef<L.Map>(null);

  // Calculate map bounds from alerts
  useEffect(() => {
    if (mapRef.current && alerts.length > 0) {
      const bounds = L.latLngBounds(
        alerts.map((alert) => [alert.latitude, alert.longitude] as [number, number])
      );
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    }
  }, [alerts]);

  return (
    <div className="h-full w-full rounded-lg overflow-hidden">
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={zoom}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {alerts.map((alert) => (
          <Marker
            key={alert.id}
            position={[alert.latitude, alert.longitude]}
            icon={createMarkerIcon(alert.severity)}
            eventHandlers={{
              click: () => onAlertClick?.(alert),
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="px-2 py-0.5 text-xs font-semibold rounded"
                    style={{
                      backgroundColor:
                        alert.severity === 'CRITICAL'
                          ? '#DC2626'
                          : alert.severity === 'HIGH'
                          ? '#EF4444'
                          : alert.severity === 'MEDIUM'
                          ? '#F59E0B'
                          : '#10B981',
                      color: 'white',
                    }}
                  >
                    {alert.severity}
                  </span>
                  <span className="text-xs text-white">{alert.alert_type}</span>
                </div>

                <h3 className="text-white mb-1">{alert.title}</h3>
                <p className="text-sm text-white mb-2">
                  {alert.location_name || 'Unknown Location'}
                </p>

                {alert.magnitude && (
                  <p className="text-sm">
                    <strong>Magnitude:</strong> {alert.magnitude.toFixed(1)}
                  </p>
                )}

                {alert.wind_speed && (
                  <p className="text-sm">
                    <strong>Wind Speed:</strong> {alert.wind_speed.toFixed(0)} mph
                  </p>
                )}

                <p className="text-xs text-gray-500 mt-2">
                  {new Date(alert.event_time).toLocaleString()}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
