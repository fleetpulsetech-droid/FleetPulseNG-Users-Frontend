import { useVehicles, type Vehicle } from "@/hooks/use-vehicles";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Truck, Fuel, Car, Calendar, ChevronRight } from "lucide-react";
import { Link } from "wouter";

function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const hasDetails = vehicle.vehicle_brand || vehicle.vehicle_model;

  return (
    <Link href={`/dashboard/vehicle/${vehicle.sensor_imei}`}>
      <Card className="border-border/50 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer group">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <Truck className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-medium text-sm text-foreground truncate">
                    {hasDetails ? `${vehicle.vehicle_brand} ${vehicle.vehicle_model}` : 'Vehicle'}
                  </h3>
                  {(vehicle.vehicle_year || vehicle.vehicle_color) && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {vehicle.vehicle_year}{vehicle.vehicle_year && vehicle.vehicle_color ? ' · ' : ''}{vehicle.vehicle_color}
                    </p>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
              </div>

              {/* Details row */}
              <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                {vehicle.vehicle_plate_number && (
                  <span className="flex items-center gap-1">
                    <Car className="w-3 h-3" />
                    {vehicle.vehicle_plate_number}
                  </span>
                )}
                {vehicle.vehicle_fuel_type && (
                  <span className="flex items-center gap-1">
                    <Fuel className="w-3 h-3" />
                    {vehicle.vehicle_fuel_type}
                  </span>
                )}
                {vehicle.created_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(vehicle.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>

              {/* VIN */}
              <div className="mt-3 pt-3 border-t border-border/30">
                <p className="text-[10px] text-muted-foreground/70 font-mono">
                  VIN: {vehicle.vehicle_vin}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function VehiclesPage() {
  const { data: vehicles, isLoading, error } = useVehicles();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="h-full flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  const totalCount = vehicles?.length || 0;

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Vehicles</h1>
          <p className="text-muted-foreground mt-1">View and manage your fleet</p>
        </div>

        {/* Fleet Summary */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Truck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Vehicles</p>
                <p className="text-xl font-semibold">{totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-4 text-sm text-destructive">
              Failed to load vehicles. Please try again.
            </CardContent>
          </Card>
        )}

        {/* Vehicles Grid */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
            All Vehicles
          </h2>

          {vehicles && vehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {vehicles.map((vehicle, index) => (
                <VehicleCard key={vehicle.id || vehicle.sensor_imei || index} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-border/50">
              <CardContent className="py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-6 h-6 text-muted-foreground/50" />
                </div>
                <h3 className="font-medium text-foreground mb-1">No vehicles</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Contact your administrator to register vehicles to your account.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
