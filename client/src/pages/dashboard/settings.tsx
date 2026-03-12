import { useUser, useLogout } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2, User, Mail, Calendar, Shield, LogOut, Bell, Lock, ChevronRight, Moon, Sun, Palette } from "lucide-react";

export default function SettingsPage() {
  const { data: user, isLoading } = useUser();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const { theme, toggleTheme } = useTheme();

  if (isLoading) {
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
      <div className="p-6 md:p-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Avatar and name */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-semibold text-lg">
                  {user?.full_name?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{user?.full_name || "User"}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <Badge
                    variant="secondary"
                    className={`mt-2 text-xs ${user?.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' : ''}`}
                  >
                    {user?.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <p className="text-sm font-medium">{user?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Member since</p>
                  <p className="text-sm font-medium">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    }) : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Section */}
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="flex items-center justify-between py-3 px-1">
                <div>
                  <p className="text-sm font-medium">Password</p>
                  <p className="text-xs text-muted-foreground">
                    Contact administrator to reset
                  </p>
                </div>
                <Button size="sm" disabled className="text-xs bg-muted/50 text-muted-foreground border-0 shadow-none hover:bg-muted">
                  Change
                </Button>
              </div>

              <div className="flex items-center justify-between py-3 px-1 border-t border-border/50">
                <div>
                  <p className="text-sm font-medium">Two-factor authentication</p>
                  <p className="text-xs text-muted-foreground">
                    Extra security for your account
                  </p>
                </div>
                <span className="text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
                  Coming soon
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Appearance Section */}
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Palette className="w-4 h-4 text-muted-foreground" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between py-3 px-1">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                    theme === 'dark'
                      ? 'bg-indigo-500/10 text-indigo-400'
                      : 'bg-amber-500/10 text-amber-600'
                  }`}>
                    {theme === 'dark' ? (
                      <Moon className="w-4 h-4" />
                    ) : (
                      <Sun className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">Dark mode</p>
                    <p className="text-xs text-muted-foreground">
                      {theme === 'dark' ? 'Currently using dark theme' : 'Currently using light theme'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={toggleTheme}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications Section */}
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Bell className="w-4 h-4 text-muted-foreground" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between py-3 px-1">
                <div>
                  <p className="text-sm font-medium">Email notifications</p>
                  <p className="text-xs text-muted-foreground">
                    Get updates about your fleet
                  </p>
                </div>
                <span className="text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
                  Coming soon
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Session */}
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Shield className="w-4 h-4 text-muted-foreground" />
                Session
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between py-2 px-1">
                <div>
                  <p className="text-sm font-medium">Current session</p>
                  <p className="text-xs text-muted-foreground">
                    Sign out from this device
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => logout()}
                  disabled={isLoggingOut}
                  className="text-xs bg-muted/50 text-foreground border-0 shadow-none hover:bg-muted"
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                      Signing out...
                    </>
                  ) : (
                    <>
                      <LogOut className="w-3 h-3 mr-1.5" />
                      Sign out
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
