import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Building2, 
  Users, 
  DollarSign, 
  Bed,
  TrendingUp,
  TrendingDown 
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

function StatsCard({ title, value, subtitle, icon, trend, className }: StatsCardProps) {
  return (
    <Card className={`bg-gradient-to-br from-white to-teal-50 border-teal-100 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-teal-700">{title}</CardTitle>
        <div className="p-2 bg-gradient-to-br from-teal-100 to-blue-100 rounded-lg">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-teal-800 mb-1">{value}</div>
        <p className="text-xs text-teal-600 mb-2">{subtitle}</p>
        {trend && (
          <div className={`flex items-center text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {trend.isPositive ? '+' : ''}{trend.value}% dari bulan lalu
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface DashboardStatsProps {
  stats: {
    totalRooms: number;
    occupiedRooms: number;
    availableRooms: number;
    monthlyRevenue: number;
    activeTenants: number;
    pendingPayments: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const occupancyRate = stats.totalRooms > 0 ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatsCard
        title="Kamar Terisi"
        value={stats.occupiedRooms}
        subtitle={`${occupancyRate}% tingkat hunian`}
        icon={<Bed className="h-4 w-4 text-teal-600" />}
        trend={{ value: 12, isPositive: true }}
      />
      
      <StatsCard
        title="Kamar Kosong"
        value={stats.availableRooms}
        subtitle={`dari ${stats.totalRooms} total kamar`}
        icon={<Building2 className="h-4 w-4 text-teal-600" />}
        trend={{ value: 8, isPositive: false }}
      />
      
      <StatsCard
        title="Penghasilan Bulan Ini"
        value={formatPrice(stats.monthlyRevenue)}
        subtitle="Total pendapatan"
        icon={<DollarSign className="h-4 w-4 text-teal-600" />}
        trend={{ value: 15, isPositive: true }}
      />
      
      <StatsCard
        title="Penyewa Aktif"
        value={stats.activeTenants}
        subtitle={`${stats.pendingPayments} pembayaran tertunda`}
        icon={<Users className="h-4 w-4 text-teal-600" />}
        trend={{ value: 5, isPositive: true }}
      />
    </div>
  );
}