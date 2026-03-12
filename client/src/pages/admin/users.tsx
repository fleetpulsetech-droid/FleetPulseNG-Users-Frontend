import { useState } from "react";
import { useAdminUser, useAdminUserVehicles, useResetPassword, type User } from "@/hooks/use-admin";
import { useRegisterVehicle } from "@/hooks/use-vehicles";
import { DashboardLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, UserSearch, Car, Key, Plus, Mail, Calendar, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function ResetPasswordDialog({ user }: { user: User }) {
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(false);
  const { mutate: resetPassword, isPending } = useResetPassword();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetPassword(
      { email: user.email, new_password: password },
      {
        onSuccess: () => {
          toast({ title: "Password reset successfully" });
          setOpen(false);
          setPassword("");
        },
        onError: (error) => {
          toast({ title: "Failed to reset password", description: error.message, variant: "destructive" });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Key className="w-4 h-4 mr-1" />
          Reset Password
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for {user.full_name} ({user.email})
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              className="mt-2"
              required
              minLength={6}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Reset Password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RegisterVehicleDialog({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const { mutate: registerVehicle, isPending } = useRegisterVehicle();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    sensor_imei: "",
    vehicle_vin: "",
    vehicle_brand: "",
    vehicle_model: "",
    vehicle_year: new Date().getFullYear(),
    vehicle_color: "",
    vehicle_plate_number: "",
    vehicle_fuel_type: "Gasoline",
    vehicle_transmission: "Automatic",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerVehicle(
      { user_id: user.id, ...formData },
      {
        onSuccess: () => {
          toast({ title: "Vehicle registered successfully" });
          setOpen(false);
          setFormData({
            sensor_imei: "",
            vehicle_vin: "",
            vehicle_brand: "",
            vehicle_model: "",
            vehicle_year: new Date().getFullYear(),
            vehicle_color: "",
            vehicle_plate_number: "",
            vehicle_fuel_type: "Gasoline",
            vehicle_transmission: "Automatic",
          });
        },
        onError: (error) => {
          toast({ title: "Failed to register vehicle", description: error.message, variant: "destructive" });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Add Vehicle
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Register New Vehicle</DialogTitle>
            <DialogDescription>
              Add a new vehicle for {user.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sensor_imei">Sensor IMEI *</Label>
                <Input
                  id="sensor_imei"
                  value={formData.sensor_imei}
                  onChange={(e) => setFormData({ ...formData, sensor_imei: e.target.value })}
                  placeholder="Enter IMEI"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle_vin">VIN *</Label>
                <Input
                  id="vehicle_vin"
                  value={formData.vehicle_vin}
                  onChange={(e) => setFormData({ ...formData, vehicle_vin: e.target.value })}
                  placeholder="Vehicle VIN"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle_brand">Brand *</Label>
                <Input
                  id="vehicle_brand"
                  value={formData.vehicle_brand}
                  onChange={(e) => setFormData({ ...formData, vehicle_brand: e.target.value })}
                  placeholder="e.g. Toyota"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle_model">Model *</Label>
                <Input
                  id="vehicle_model"
                  value={formData.vehicle_model}
                  onChange={(e) => setFormData({ ...formData, vehicle_model: e.target.value })}
                  placeholder="e.g. Camry"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle_year">Year *</Label>
                <Input
                  id="vehicle_year"
                  type="number"
                  value={formData.vehicle_year}
                  onChange={(e) => setFormData({ ...formData, vehicle_year: parseInt(e.target.value) })}
                  min={1900}
                  max={new Date().getFullYear() + 1}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle_color">Color *</Label>
                <Input
                  id="vehicle_color"
                  value={formData.vehicle_color}
                  onChange={(e) => setFormData({ ...formData, vehicle_color: e.target.value })}
                  placeholder="e.g. Black"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle_plate_number">Plate Number *</Label>
                <Input
                  id="vehicle_plate_number"
                  value={formData.vehicle_plate_number}
                  onChange={(e) => setFormData({ ...formData, vehicle_plate_number: e.target.value })}
                  placeholder="ABC-123"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle_fuel_type">Fuel Type</Label>
                <Select value={formData.vehicle_fuel_type} onValueChange={(v) => setFormData({ ...formData, vehicle_fuel_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gasoline">Gasoline</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Electric">Electric</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle_transmission">Transmission</Label>
                <Select value={formData.vehicle_transmission} onValueChange={(v) => setFormData({ ...formData, vehicle_transmission: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Automatic">Automatic</SelectItem>
                    <SelectItem value="Manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Register Vehicle
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function UserDetails({ email }: { email: string }) {
  const { data: user, isLoading: isLoadingUser } = useAdminUser(email);
  const { data: vehicles, isLoading: isLoadingVehicles } = useAdminUserVehicles(email);

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="py-8 text-center">
          <UserSearch className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">User Not Found</p>
          <p className="text-muted-foreground">No user exists with email: {email}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                {user.full_name?.substring(0, 2).toUpperCase() || user.email?.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <CardTitle className="text-xl">{user.full_name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <ResetPasswordDialog user={user} />
              <RegisterVehicleDialog user={user} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Status
              </p>
              <Badge variant={user.is_active ? "default" : "secondary"} className={user.is_active ? "bg-green-500" : ""}>
                {user.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Member Since
              </p>
              <p className="font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Car className="w-3 h-3" />
                Vehicles
              </p>
              <p className="font-medium">{vehicles?.length || 0}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">User ID</p>
              <p className="font-mono text-sm">{user.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Vehicles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            User Vehicles
          </CardTitle>
          <CardDescription>Vehicles assigned to this user</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingVehicles ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : vehicles && vehicles.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Plate</TableHead>
                    <TableHead>IMEI</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle: any) => (
                    <TableRow key={vehicle.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{vehicle.vehicle_brand} {vehicle.vehicle_model}</p>
                          <p className="text-xs text-muted-foreground">{vehicle.vehicle_year} • {vehicle.vehicle_color}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{vehicle.vehicle_plate_number}</TableCell>
                      <TableCell className="font-mono text-xs">{vehicle.sensor_imei}</TableCell>
                      <TableCell>
                        <Badge variant={vehicle.is_active ? "default" : "secondary"} className={vehicle.is_active ? "bg-green-500" : ""}>
                          {vehicle.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 bg-muted/20 rounded-xl border border-dashed">
              <Car className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-20" />
              <p className="text-muted-foreground">No vehicles assigned to this user</p>
              <RegisterVehicleDialog user={user} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminUsersPage() {
  const [searchEmail, setSearchEmail] = useState("");
  const [searchedEmail, setSearchedEmail] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchedEmail(searchEmail.trim());
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Search for users by email to manage their accounts and vehicles</p>
        </div>

        {/* Search Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserSearch className="w-5 h-5" />
              Search User
            </CardTitle>
            <CardDescription>Enter a user's email address to view their details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Enter user email..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button type="submit">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchedEmail && <UserDetails email={searchedEmail} />}

        {/* Empty State */}
        {!searchedEmail && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <UserSearch className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium mb-2">Search for a User</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Enter an email address above to search for a user. You can then view their profile,
                manage their vehicles, and reset their password.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
