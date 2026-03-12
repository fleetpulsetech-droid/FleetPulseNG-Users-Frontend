import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons not loading in webpack/vite environments
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Vehicle data from the API (matches /vehicle/:imei/data response)
export interface VehicleWithLocation {
  id?: number;
  sensor_imei: string;
  vehicle_vin: string;
  vehicle_brand?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  vehicle_color?: string;
  vehicle_plate_number?: string;
  vehicle_fuel_type?: string;
  vehicle_transmission?: string;
  is_active?: boolean;
  timestamp?: string;
  vehicle_state?: string;
  "position.latitude"?: number;
  "position.longitude"?: number;
  // Telemetry data
  "can.fuel.level"?: number;
  "can.mil.mileage"?: number;
  "can.vehicle.mileage"?: number;
  battery_health?: string;
  charging_status?: string;
  ecu_status?: string;
  overheating_risk?: string;
  intake_air_temperature?: string;
  engine_load?: string;
  engine_stability?: string;
  speeding_status?: string;
  faults?: string;
}

interface VehicleMapProps {
  vehicles: VehicleWithLocation[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  height?: string;
}

function MapUpdater({ center, zoom }: { center?: [number, number], zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  return null;
}

export function VehicleMap({
  vehicles,
  center = [6.5244, 3.3792], // Default to Lagos, Nigeria
  zoom = 12,
  className,
  height = "400px"
}: VehicleMapProps) {
  // Filter only vehicles with valid coordinates
  const activeVehicles = vehicles.filter(v =>
    v["position.latitude"] !== null &&
    v["position.latitude"] !== undefined &&
    v["position.longitude"] !== null &&
    v["position.longitude"] !== undefined
  );

  // Auto-center on first vehicle if vehicles exist
  const effectiveCenter: [number, number] = activeVehicles.length > 0
    ? [activeVehicles[0]["position.latitude"]!, activeVehicles[0]["position.longitude"]!]
    : center;

  return (
    <div className={`rounded-xl overflow-hidden border border-border shadow-md ${className || ''}`} style={{ height }}>
      <MapContainer
        center={effectiveCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={effectiveCenter} zoom={zoom} />

        {activeVehicles.map((vehicle) => (
          <Marker
            key={vehicle.vehicle_vin || vehicle.sensor_imei}
            position={[vehicle["position.latitude"]!, vehicle["position.longitude"]!]}
          >
            <Popup className="font-sans" maxWidth={300}>
              <div className="p-1 min-w-[220px]">
                {/* Vehicle Name & Status */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm">
                    {vehicle.vehicle_brand && vehicle.vehicle_model
                      ? `${vehicle.vehicle_brand} ${vehicle.vehicle_model}`
                      : 'Vehicle'}
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                    vehicle.vehicle_state === 'DRIVING' || vehicle.vehicle_state === 'MOVING'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {vehicle.vehicle_state || 'Unknown'}
                  </span>
                </div>

                {/* Basic Info */}
                <div className="space-y-1 text-xs border-b border-gray-200 pb-2 mb-2">
                  {vehicle.vehicle_plate_number && (
                    <p className="text-gray-600">
                      <span className="font-medium">Plate:</span> {vehicle.vehicle_plate_number}
                    </p>
                  )}
                  {vehicle.vehicle_vin && (
                    <p className="text-gray-600">
                      <span className="font-medium">VIN:</span> {vehicle.vehicle_vin}
                    </p>
                  )}
                  {vehicle.vehicle_color && (
                    <p className="text-gray-600">
                      <span className="font-medium">Color:</span> {vehicle.vehicle_color}
                    </p>
                  )}
                </div>

                {/* Telemetry Data */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                  {vehicle["can.fuel.level"] !== undefined && (
                    <p className="text-gray-600">
                      <span className="font-medium">Fuel:</span> {vehicle["can.fuel.level"]}%
                    </p>
                  )}
                  {vehicle["can.vehicle.mileage"] !== undefined && vehicle["can.vehicle.mileage"] !== null && (
                    <p className="text-gray-600">
                      <span className="font-medium">Mileage:</span> {vehicle["can.vehicle.mileage"].toLocaleString()} km
                    </p>
                  )}
                  {vehicle.battery_health && (
                    <p className="text-gray-600">
                      <span className="font-medium">Battery:</span>{' '}
                      <span className={vehicle.battery_health === 'GOOD' ? 'text-green-600' : 'text-amber-600'}>
                        {vehicle.battery_health}
                      </span>
                    </p>
                  )}
                  {vehicle.engine_load && (
                    <p className="text-gray-600">
                      <span className="font-medium">Engine:</span> {vehicle.engine_load}
                    </p>
                  )}
                  {vehicle.speeding_status && (
                    <p className="text-gray-600">
                      <span className="font-medium">Speed:</span>{' '}
                      <span className={vehicle.speeding_status === 'BELOW LIMIT' ? 'text-green-600' : 'text-red-600'}>
                        {vehicle.speeding_status}
                      </span>
                    </p>
                  )}
                  {vehicle.ecu_status && (
                    <p className="text-gray-600">
                      <span className="font-medium">ECU:</span>{' '}
                      <span className={vehicle.ecu_status === 'STABLE' ? 'text-green-600' : 'text-amber-600'}>
                        {vehicle.ecu_status}
                      </span>
                    </p>
                  )}
                </div>

                {/* Timestamp */}
                {vehicle.timestamp && (
                  <p className="text-[10px] text-gray-400 mt-2 pt-2 border-t border-gray-200">
                    Updated: {new Date(vehicle.timestamp).toLocaleString()}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
