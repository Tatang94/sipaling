import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  MoreHorizontal,
  AlertCircle,
  Users
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Tenant {
  id: number;
  name: string;
  email: string;
  phone: string;
  roomNumber: string;
  kosName: string;
  checkInDate: string;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  rentAmount: number;
  nextPaymentDate: string;
}

interface DashboardTenantsProps {
  tenants: Tenant[];
}

export function DashboardTenants({ tenants }: DashboardTenantsProps) {
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Lunas';
      case 'pending':
        return 'Tertunda';
      case 'overdue':
        return 'Terlambat';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-teal-800">Daftar Penyewa Aktif</h2>
        <div className="flex gap-2">
          <Button variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50">
            Filter
          </Button>
          <Button className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600">
            Tambah Penyewa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tenants.map((tenant) => (
          <Card key={tenant.id} className="bg-gradient-to-br from-white to-teal-50 border-teal-100 hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12 border-2 border-teal-200">
                    <AvatarFallback className="bg-gradient-to-br from-teal-100 to-blue-100 text-teal-700 font-semibold">
                      {tenant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-teal-800">{tenant.name}</h3>
                    <p className="text-sm text-teal-600">Kamar {tenant.roomNumber}</p>
                    <p className="text-xs text-teal-500">{tenant.kosName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getPaymentStatusColor(tenant.paymentStatus)}>
                    {getPaymentStatusText(tenant.paymentStatus)}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Lihat Detail</DropdownMenuItem>
                      <DropdownMenuItem>Edit Data</DropdownMenuItem>
                      <DropdownMenuItem>Kirim Reminder</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Hapus</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 text-sm text-teal-600">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{tenant.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-teal-600">
                  <Phone className="h-4 w-4" />
                  <span>{tenant.phone}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 text-sm text-teal-600">
                  <Calendar className="h-4 w-4" />
                  <span>Masuk: {new Date(tenant.checkInDate).toLocaleDateString('id-ID')}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-teal-600">
                  <MapPin className="h-4 w-4" />
                  <span>Rp {tenant.rentAmount.toLocaleString()}/bulan</span>
                </div>
              </div>

              {tenant.paymentStatus === 'overdue' && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg border border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-700">
                    Pembayaran terlambat sejak {new Date(tenant.nextPaymentDate).toLocaleDateString('id-ID')}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-teal-100">
                <span className="text-sm text-teal-600">
                  Bayar berikutnya: {new Date(tenant.nextPaymentDate).toLocaleDateString('id-ID')}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-teal-200 text-teal-700 hover:bg-teal-50">
                    Kontak
                  </Button>
                  {tenant.paymentStatus !== 'paid' && (
                    <Button size="sm" className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600">
                      Konfirmasi Bayar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tenants.length === 0 && (
        <Card className="bg-gradient-to-br from-white to-teal-50 border-teal-100">
          <CardContent className="text-center py-12">
            <Users className="h-16 w-16 text-teal-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-teal-700 mb-2">Belum Ada Penyewa</h3>
            <p className="text-teal-600 mb-4">Tambahkan penyewa pertama Anda untuk mulai mengelola kos</p>
            <Button className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600">
              Tambah Penyewa Baru
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}