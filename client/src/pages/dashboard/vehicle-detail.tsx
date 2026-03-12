import { useVehicleData } from "@/hooks/use-vehicles";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VehicleMap, type VehicleWithLocation } from "@/components/vehicle-map";
import {
  Loader2,
  ArrowLeft,
  Truck,
  Fuel,
  Gauge,
  Battery,
  Zap,
  MapPin,
  Clock,
  AlertTriangle,
  Settings,
  Activity,
  Car,
  Calendar,
  Palette,
  Hash,
  Cog
} from "lucide-react";
import { Link, useParams } from "wouter";

export default function VehicleDetailPage() {
  const { imei } = useParams<{ imei: string }>();
  const { data: vehicleData, isLoading, error } = useVehicleData(imei || "");

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="h-full flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !vehicleData) {
    return (
      <DashboardLayout>
        <div className="p-6 md:p-8">
          <Link href="/dashboard/vehicles">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Vehicles
            </Button>
          </Link>
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-destructive/50" />
              <h3 className="font-medium text-destructive mb-1">Vehicle not found</h3>
              <p className="text-sm text-muted-foreground">
                Unable to load vehicle data. Please try again.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const hasDetails = vehicleData.vehicle_brand || vehicleData.vehicle_model;
  const isMoving = vehicleData.vehicle_state === "MOVING" || vehicleData.vehicle_state === "DRIVING";
  const hasLocation = vehicleData["position.latitude"] && vehicleData["position.longitude"];

  // Parse faults if available
  let faults: Record<string, string> = {};
  if (vehicleData.faults) {
    try {
      faults = JSON.parse(vehicleData.faults);
    } catch {
      // Ignore parse errors
    }
  }

  // Prepare vehicle for map
  const vehicleForMap: VehicleWithLocation = {
    sensor_imei: imei || "",
    vehicle_vin: vehicleData.vehicle_vin,
    vehicle_brand: vehicleData.vehicle_brand,
    vehicle_model: vehicleData.vehicle_model,
    vehicle_plate_number: vehicleData.vehicle_plate_number,
    vehicle_state: vehicleData.vehicle_state,
    "position.latitude": vehicleData["position.latitude"],
    "position.longitude": vehicleData["position.longitude"],
    "can.fuel.level": vehicleData["can.fuel.level"],
    "can.vehicle.mileage": vehicleData["can.vehicle.mileage"],
    battery_health: vehicleData.battery_health,
    engine_load: vehicleData.engine_load,
    speeding_status: vehicleData.speeding_status,
    ecu_status: vehicleData.ecu_status,
    timestamp: vehicleData.timestamp,
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard/vehicles">
            <span className="hover:text-foreground cursor-pointer">Vehicles</span>
          </Link>
          <span>/</span>
          <span className="text-foreground">
            {hasDetails ? `${vehicleData.vehicle_brand} ${vehicleData.vehicle_model}` : vehicleData.vehicle_vin}
          </span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Truck className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                {hasDetails ? `${vehicleData.vehicle_brand} ${vehicleData.vehicle_model}` : 'Vehicle Details'}
              </h1>
              <p className="text-muted-foreground mt-0.5">
                VIN: {vehicleData.vehicle_vin}
              </p>
            </div>
          </div>
          {vehicleData.vehicle_state && (
            <Badge
              variant="secondary"
              className={`text-sm px-4 py-1.5 ${
                isMoving
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              }`}
            >
              <Activity className="w-3.5 h-3.5 mr-1.5" />
              {vehicleData.vehicle_state}
            </Badge>
          )}
        </div>

        {/* Vehicle Information Card */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Car className="w-4 h-4 text-muted-foreground" />
              Vehicle Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              {vehicleData.vehicle_plate_number && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Hash className="w-3 h-3" />
                    Plate Number
                  </p>
                  <p className="font-semibold">{vehicleData.vehicle_plate_number}</p>
                </div>
              )}
              {vehicleData.vehicle_year && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    Year
                  </p>
                  <p className="font-semibold">{vehicleData.vehicle_year}</p>
                </div>
              )}
              {vehicleData.vehicle_color && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Palette className="w-3 h-3" />
                    Color
                  </p>
                  <p className="font-semibold capitalize">{vehicleData.vehicle_color}</p>
                </div>
              )}
              {vehicleData.vehicle_fuel_type && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Fuel className="w-3 h-3" />
                    Fuel Type
                  </p>
                  <p className="font-semibold capitalize">{vehicleData.vehicle_fuel_type}</p>
                </div>
              )}
              {vehicleData.vehicle_transmission && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Cog className="w-3 h-3" />
                    Transmission
                  </p>
                  <p className="font-semibold capitalize">{vehicleData.vehicle_transmission}</p>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Activity className="w-3 h-3" />
                  Status
                </p>
                <Badge
                  variant="secondary"
                  className={`${
                    vehicleData.is_active
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {vehicleData.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Telemetry Grid */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <Gauge className="w-4 h-4" />
            Live Telemetry
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Fuel Level */}
            {vehicleData["can.fuel.level"] !== undefined && (
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                      <Fuel className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Fuel</p>
                      <p className="font-bold text-lg truncate">{vehicleData["can.fuel.level"]}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mileage */}
            {vehicleData["can.vehicle.mileage"] !== undefined && vehicleData["can.vehicle.mileage"] !== null && (
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                      <Gauge className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Mileage</p>
                      <p className="font-bold truncate">{vehicleData["can.vehicle.mileage"].toLocaleString()} km</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Battery */}
            {vehicleData.battery_health && (
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      vehicleData.battery_health === 'GOOD'
                        ? 'bg-green-50 dark:bg-green-900/30'
                        : 'bg-amber-50 dark:bg-amber-900/30'
                    }`}>
                      <Battery className={`w-5 h-5 ${
                        vehicleData.battery_health === 'GOOD'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Battery</p>
                      <p className={`font-bold ${
                        vehicleData.battery_health === 'GOOD' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
                      }`}>{vehicleData.battery_health}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Engine Load */}
            {vehicleData.engine_load && (
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Engine</p>
                      <p className="font-bold truncate">{vehicleData.engine_load}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* MIL Mileage */}
            {vehicleData["can.mil.mileage"] !== undefined && vehicleData["can.mil.mileage"] !== null && (
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                      <Settings className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">MIL</p>
                      <p className="font-bold truncate">{vehicleData["can.mil.mileage"].toLocaleString()} km</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Location */}
            {hasLocation && (
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="font-mono text-xs truncate">
                        {vehicleData["position.latitude"]?.toFixed(4)}, {vehicleData["position.longitude"]?.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Status Indicators */}
        {(vehicleData.speeding_status || vehicleData.ecu_status || vehicleData.engine_stability ||
          vehicleData.overheating_risk || vehicleData.charging_status || vehicleData.intake_air_temperature) && (
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Activity className="w-4 h-4 text-muted-foreground" />
                Status Indicators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {vehicleData.speeding_status && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="text-sm">Speed</span>
                    <Badge variant={vehicleData.speeding_status === 'BELOW LIMIT' ? 'default' : 'destructive'} className="text-xs">
                      {vehicleData.speeding_status}
                    </Badge>
                  </div>
                )}
                {vehicleData.ecu_status && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="text-sm">ECU</span>
                    <Badge variant={vehicleData.ecu_status === 'STABLE' ? 'default' : 'secondary'} className="text-xs">
                      {vehicleData.ecu_status}
                    </Badge>
                  </div>
                )}
                {vehicleData.engine_stability && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="text-sm">Engine</span>
                    <Badge variant={vehicleData.engine_stability === 'OK' ? 'default' : 'secondary'} className="text-xs">
                      {vehicleData.engine_stability}
                    </Badge>
                  </div>
                )}
                {vehicleData.overheating_risk && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="text-sm">Heat Risk</span>
                    <Badge variant={vehicleData.overheating_risk === 'LOW' ? 'default' : 'destructive'} className="text-xs">
                      {vehicleData.overheating_risk}
                    </Badge>
                  </div>
                )}
                {vehicleData.charging_status && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="text-sm">Charging</span>
                    <Badge variant="secondary" className="text-xs">{vehicleData.charging_status}</Badge>
                  </div>
                )}
                {vehicleData.intake_air_temperature && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="text-sm">Air Temp</span>
                    <Badge variant="secondary" className="text-xs">{vehicleData.intake_air_temperature}</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fault Codes */}
        {Object.keys(faults).length > 0 && (
          <Card className="border-amber-200/50 dark:border-amber-800/50 bg-amber-50/30 dark:bg-amber-900/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                Active Faults ({Object.keys(faults).length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(faults).map(([code, description]) => (
                  <div key={code} className="p-4 rounded-lg bg-white dark:bg-background border border-amber-200 dark:border-amber-800">
                    <p className="font-mono text-sm font-semibold text-amber-700 dark:text-amber-400">{code}</p>
                    <p className="text-sm text-muted-foreground mt-1">{description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Location Map */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              Vehicle Location
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {hasLocation ? (
              <VehicleMap
                vehicles={[vehicleForMap]}
                height="400px"
                zoom={15}
                className="rounded-b-lg overflow-hidden"
              />
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center bg-muted/30 rounded-b-lg">
                <MapPin className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground font-medium">No GPS Data Available</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Location data will appear when the vehicle transmits GPS coordinates</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Last Update */}
        {vehicleData.timestamp && (
          <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            Last Updated: {new Date(vehicleData.timestamp).toLocaleString()}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
