import { useVehicles } from "@/hooks/use-vehicles";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Loader2, MapPin, Truck, Navigation, Clock, Activity, Circle, Fuel, Gauge, Battery, AlertTriangle, ThermometerSun, Zap, X } from "lucide-react";
import { VehicleMap, type VehicleWithLocation } from "@/components/vehicle-map";
import { useState, useEffect } from "react";
import { api, buildUrl } from "@shared/routes";

// Hook to fetch location data for all vehicles
function useVehiclesWithLocation(vehicles: { sensor_imei: string; vehicle_vin: string }[] | undefined) {
  const [vehiclesWithLocation, setVehiclesWithLocation] = useState<VehicleWithLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!vehicles || vehicles.length === 0) {
      setVehiclesWithLocation([]);
      return;
    }

    const fetchAllVehicleData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("fleetpulse_token");
        const results = await Promise.all(
          vehicles.map(async (vehicle) => {
            try {
              const url = buildUrl(api.vehicles.getData.path, { vehicle_sensor_imei: vehicle.sensor_imei });
              const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (!res.ok) return null;
              const response = await res.json();
              if (response.responseCode === "00" && response.data) {
                return response.data as VehicleWithLocation;
              }
              return null;
            } catch {
              return null;
            }
          })
        );
        setVehiclesWithLocation(results.filter((v): v is VehicleWithLocation => v !== null));
      } catch (error) {
        console.error("Error fetching vehicle locations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllVehicleData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchAllVehicleData, 30000);
    return () => clearInterval(interval);
  }, [vehicles]);

  return { vehiclesWithLocation, isLoading };
}

function VehicleListItem({ vehicle, onClick }: { vehicle: VehicleWithLocation; onClick: () => void }) {
  const hasLocation = vehicle["position.latitude"] && vehicle["position.longitude"];
  const isMoving = vehicle.vehicle_state === "MOVING" || vehicle.vehicle_state === "DRIVING";

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card hover:border-border hover:bg-accent/50 transition-colors group cursor-pointer"
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
        hasLocation
          ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400'
          : 'bg-muted/50 text-muted-foreground'
      }`}>
        <Truck className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">
          {vehicle.vehicle_brand && vehicle.vehicle_model
            ? `${vehicle.vehicle_brand} ${vehicle.vehicle_model}`
            : 'Vehicle'}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-[11px] text-muted-foreground truncate">
            {vehicle.vehicle_plate_number || vehicle.vehicle_vin?.slice(-8)}
          </p>
          {vehicle.vehicle_state && (
            <Badge
              variant="secondary"
              className={`text-[9px] px-1.5 py-0 h-4 ${
                isMoving
                  ? 'bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'bg-sky-50 text-sky-700 border-sky-200/50 dark:bg-sky-900/30 dark:text-sky-400'
              }`}
            >
              {vehicle.vehicle_state}
            </Badge>
          )}
        </div>
      </div>
      <div className="shrink-0">
        {hasLocation ? (
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <Circle className="w-2 h-2 fill-current animate-pulse" />
          </div>
        ) : (
          <span className="text-[10px] text-muted-foreground">No GPS</span>
        )}
      </div>
    </div>
  );
}

// Vehicle Detail Sheet Component
function VehicleDetailSheet({ vehicle, open, onClose }: { vehicle: VehicleWithLocation | null; open: boolean; onClose: () => void }) {
  if (!vehicle) return null;

  const isMoving = vehicle.vehicle_state === "MOVING" || vehicle.vehicle_state === "DRIVING";

  // Parse faults if available
  let faults: Record<string, string> = {};
  if (vehicle.faults) {
    try {
      faults = JSON.parse(vehicle.faults);
    } catch {
      // Ignore parse errors
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl">
              {vehicle.vehicle_brand && vehicle.vehicle_model
                ? `${vehicle.vehicle_brand} ${vehicle.vehicle_model}`
                : 'Vehicle Details'}
            </SheetTitle>
            <Badge
              variant="secondary"
              className={`${
                isMoving
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              }`}
            >
              {vehicle.vehicle_state || 'Unknown'}
            </Badge>
          </div>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Vehicle Information</h3>
            <div className="grid grid-cols-2 gap-4">
              {vehicle.vehicle_plate_number && (
                <div>
                  <p className="text-xs text-muted-foreground">Plate Number</p>
                  <p className="font-medium">{vehicle.vehicle_plate_number}</p>
                </div>
              )}
              {vehicle.vehicle_vin && (
                <div>
                  <p className="text-xs text-muted-foreground">VIN</p>
                  <p className="font-medium text-sm">{vehicle.vehicle_vin}</p>
                </div>
              )}
              {vehicle.vehicle_year && (
                <div>
                  <p className="text-xs text-muted-foreground">Year</p>
                  <p className="font-medium">{vehicle.vehicle_year}</p>
                </div>
              )}
              {vehicle.vehicle_color && (
                <div>
                  <p className="text-xs text-muted-foreground">Color</p>
                  <p className="font-medium">{vehicle.vehicle_color}</p>
                </div>
              )}
              {vehicle.vehicle_fuel_type && (
                <div>
                  <p className="text-xs text-muted-foreground">Fuel Type</p>
                  <p className="font-medium">{vehicle.vehicle_fuel_type}</p>
                </div>
              )}
              {vehicle.vehicle_transmission && (
                <div>
                  <p className="text-xs text-muted-foreground">Transmission</p>
                  <p className="font-medium">{vehicle.vehicle_transmission}</p>
                </div>
              )}
            </div>
          </div>

          {/* Telemetry */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Live Telemetry</h3>
            <div className="grid grid-cols-2 gap-3">
              {vehicle["can.fuel.level"] !== undefined && (
                <Card className="border-border/50">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                      <Fuel className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Fuel Level</p>
                      <p className="font-semibold text-lg">{vehicle["can.fuel.level"]}%</p>
                    </div>
                  </CardContent>
                </Card>
              )}
              {vehicle["can.vehicle.mileage"] !== undefined && (
                <Card className="border-border/50">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                      <Gauge className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Mileage</p>
                      <p className="font-semibold">{vehicle["can.vehicle.mileage"].toLocaleString()} km</p>
                    </div>
                  </CardContent>
                </Card>
              )}
              {vehicle.battery_health && (
                <Card className="border-border/50">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      vehicle.battery_health === 'GOOD'
                        ? 'bg-green-50 dark:bg-green-900/30'
                        : 'bg-amber-50 dark:bg-amber-900/30'
                    }`}>
                      <Battery className={`w-5 h-5 ${
                        vehicle.battery_health === 'GOOD'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Battery</p>
                      <p className={`font-semibold ${
                        vehicle.battery_health === 'GOOD' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
                      }`}>{vehicle.battery_health}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
              {vehicle.engine_load && (
                <Card className="border-border/50">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Engine Load</p>
                      <p className="font-semibold">{vehicle.engine_load}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Status Indicators */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Status</h3>
            <div className="space-y-2">
              {vehicle.speeding_status && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm">Speeding Status</span>
                  <Badge variant={vehicle.speeding_status === 'BELOW LIMIT' ? 'default' : 'destructive'}>
                    {vehicle.speeding_status}
                  </Badge>
                </div>
              )}
              {vehicle.ecu_status && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm">ECU Status</span>
                  <Badge variant={vehicle.ecu_status === 'STABLE' ? 'default' : 'secondary'}>
                    {vehicle.ecu_status}
                  </Badge>
                </div>
              )}
              {vehicle.engine_stability && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm">Engine Stability</span>
                  <Badge variant={vehicle.engine_stability === 'OK' ? 'default' : 'secondary'}>
                    {vehicle.engine_stability}
                  </Badge>
                </div>
              )}
              {vehicle.overheating_risk && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm">Overheating Risk</span>
                  <Badge variant={vehicle.overheating_risk === 'LOW' ? 'default' : 'destructive'}>
                    {vehicle.overheating_risk}
                  </Badge>
                </div>
              )}
              {vehicle.charging_status && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm">Charging Status</span>
                  <Badge variant="secondary">{vehicle.charging_status}</Badge>
                </div>
              )}
            </div>
          </div>

          {/* Faults */}
          {Object.keys(faults).length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Active Faults ({Object.keys(faults).length})
              </h3>
              <div className="space-y-2">
                {Object.entries(faults).map(([code, description]) => (
                  <div key={code} className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <p className="font-mono text-sm font-semibold text-amber-700 dark:text-amber-400">{code}</p>
                    <p className="text-sm text-amber-600 dark:text-amber-300 mt-1">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location */}
          {vehicle["position.latitude"] && vehicle["position.longitude"] && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Location</h3>
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-sm font-mono">
                  {vehicle["position.latitude"].toFixed(6)}, {vehicle["position.longitude"].toFixed(6)}
                </p>
              </div>
            </div>
          )}

          {/* Last Update */}
          {vehicle.timestamp && (
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Last Updated: {new Date(vehicle.timestamp).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function MapPage() {
  const { data: vehicles, isLoading: isLoadingVehicles } = useVehicles();
  const { vehiclesWithLocation, isLoading: isLoadingLocations } = useVehiclesWithLocation(vehicles);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithLocation | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    if (vehiclesWithLocation.length > 0) {
      setLastUpdate(new Date());
    }
  }, [vehiclesWithLocation]);

  const handleVehicleClick = (vehicle: VehicleWithLocation) => {
    setSelectedVehicle(vehicle);
    setIsDetailOpen(true);
  };

  const isLoading = isLoadingVehicles || isLoadingLocations;
  const vehiclesWithGPS = vehiclesWithLocation.filter(
    v => v["position.latitude"] && v["position.longitude"]
  );
  const parkedCount = vehiclesWithLocation.filter(v => v.vehicle_state === "PARKED").length;
  const movingCount = vehiclesWithLocation.filter(v => v.vehicle_state === "MOVING" || v.vehicle_state === "DRIVING").length;

  if (isLoadingVehicles) {
    return (
      <DashboardLayout>
        <div className="h-full flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Live Map</h1>
            <p className="text-muted-foreground mt-1">Track your fleet in real-time</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            <span>Updated {lastUpdate.toLocaleTimeString()}</span>
            {isLoadingLocations && (
              <Loader2 className="w-3 h-3 animate-spin ml-1" />
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded bg-muted/50 flex items-center justify-center">
                  <Truck className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <span className="text-xs text-muted-foreground font-medium">Total</span>
              </div>
              <p className="text-xl font-semibold">{vehicles?.length || 0}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded bg-emerald-50 flex items-center justify-center">
                  <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <span className="text-xs text-muted-foreground font-medium">Tracking</span>
              </div>
              <p className="text-xl font-semibold text-emerald-600">{vehiclesWithGPS.length}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded bg-sky-50 flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5 text-sky-600" />
                </div>
                <span className="text-xs text-muted-foreground font-medium">Parked</span>
              </div>
              <p className="text-xl font-semibold text-sky-600">{parkedCount}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded bg-amber-50 flex items-center justify-center">
                  <Activity className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <span className="text-xs text-muted-foreground font-medium">Moving</span>
              </div>
              <p className="text-xl font-semibold text-amber-600">{movingCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Map and Vehicle List */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map */}
          <div className="lg:col-span-3">
            <Card className="border-border/50 overflow-hidden">
              <CardContent className="p-0">
                {vehiclesWithGPS.length > 0 ? (
                  <VehicleMap
                    vehicles={vehiclesWithLocation}
                    height="calc(100vh - 340px)"
                    zoom={13}
                  />
                ) : (
                  <div className="h-[calc(100vh-340px)] min-h-[400px] flex items-center justify-center bg-muted/20">
                    <div className="text-center">
                      <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-7 h-7 text-muted-foreground/50" />
                      </div>
                      <h3 className="font-medium text-foreground mb-1">No GPS Data</h3>
                      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                        {isLoading
                          ? "Loading vehicle locations..."
                          : "None of your vehicles have GPS data available yet."}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Vehicle List */}
          <div className="lg:col-span-1">
            <Card className="border-border/50 h-full">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Vehicles
                  </h3>
                  <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                    {vehiclesWithLocation.length}
                  </span>
                </div>
                <div className="space-y-2 max-h-[calc(100vh-420px)] min-h-[300px] overflow-y-auto scrollbar-thin pr-1">
                  {vehiclesWithLocation.length > 0 ? (
                    vehiclesWithLocation.map((vehicle) => (
                      <VehicleListItem
                        key={vehicle.vehicle_vin || vehicle.sensor_imei}
                        vehicle={vehicle}
                        onClick={() => handleVehicleClick(vehicle)}
                      />
                    ))
                  ) : isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Truck className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">No vehicles found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Vehicle Detail Sheet */}
      <VehicleDetailSheet
        vehicle={selectedVehicle}
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </DashboardLayout>
  );
}
