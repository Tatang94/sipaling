import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Building2, 
  Users, 
  CreditCard, 
  Settings, 
  LogOut,
  Menu
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function DashboardSidebar({ activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { id: "beranda", label: "Beranda", icon: Home },
    { id: "kamar", label: "Daftar Kamar", icon: Building2 },
    { id: "penyewa", label: "Penyewa", icon: Users },
    { id: "pembayaran", label: "Pembayaran", icon: CreditCard },
    { id: "pengaturan", label: "Pengaturan", icon: Settings },
  ];

  return (
    <div className={cn(
      "bg-gradient-to-b from-teal-50 to-blue-50 border-r border-teal-100 h-screen transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-teal-100">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div>
              <h2 className="text-lg font-bold text-teal-700">SI PALING KOST</h2>
              <p className="text-sm text-teal-600">Dashboard Pemilik</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="text-teal-600 hover:text-teal-700 hover:bg-teal-100"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start text-left",
                isActive 
                  ? "bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-md" 
                  : "text-teal-700 hover:bg-teal-100 hover:text-teal-800",
                collapsed && "justify-center px-2"
              )}
              onClick={() => onTabChange(item.id)}
            >
              <Icon className={cn("h-4 w-4", !collapsed && "mr-3")} />
              {!collapsed && item.label}
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-4 left-4 right-4">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-teal-700 hover:bg-red-100 hover:text-red-700",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className={cn("h-4 w-4", !collapsed && "mr-3")} />
          {!collapsed && "Keluar"}
        </Button>
      </div>
    </div>
  );
}