import { cn } from "@/lib/utils";

export function VehicleStatusBadge({ isActive, lastSync }: { isActive: boolean, lastSync?: Date | string | null }) {
  // Consider offline if no sync in last 5 minutes
  const isOnline = isActive && lastSync && (new Date().getTime() - new Date(lastSync).getTime() < 5 * 60 * 1000);
  
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
      isOnline 
        ? "bg-green-50 text-green-700 border-green-200" 
        : isActive 
          ? "bg-amber-50 text-amber-700 border-amber-200"
          : "bg-gray-50 text-gray-600 border-gray-200"
    )}>
      <span className={cn(
        "w-1.5 h-1.5 rounded-full animate-pulse",
        isOnline ? "bg-green-600" : isActive ? "bg-amber-500" : "bg-gray-400"
      )} />
      {isOnline ? "Online" : isActive ? "Idle" : "Inactive"}
    </div>
  );
}
