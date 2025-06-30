import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Users, 
  Plus,
  Bed,
  Wifi,
  Car,
  Utensils,
  ShowerHead,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Room {
  id: number;
  number: string;
  kosName: string;
  type: string;
  price: number;
  isOccupied: boolean;
  tenantName?: string;
  facilities: string[];
  size: string;
  floor: number;
}

interface DashboardRoomsProps {
  rooms: Room[];
}

export function DashboardRooms({ rooms }: DashboardRoomsProps) {
  const getFacilityIcon = (facility: string) => {
    switch (facility.toLowerCase()) {
      case 'wifi':
        return <Wifi className="h-3 w-3" />;
      case 'parkir':
        return <Car className="h-3 w-3" />;
      case 'dapur':
        return <Utensils className="h-3 w-3" />;
      case 'kamar mandi dalam':
        return <ShowerHead className="h-3 w-3" />;
      default:
        return <Bed className="h-3 w-3" />;
    }
  };

  const occupiedRooms = rooms.filter(room => room.isOccupied).length;
  const availableRooms = rooms.filter(room => !room.isOccupied).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-teal-800">Manajemen Kamar</h2>
          <p className="text-teal-600">
            {occupiedRooms} kamar terisi, {availableRooms} kamar tersedia
          </p>
        </div>
        <Button className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Kamar Baru
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Kamar Terisi</p>
                <p className="text-2xl font-bold text-green-800">{occupiedRooms}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-teal-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Kamar Kosong</p>
                <p className="text-2xl font-bold text-blue-800">{availableRooms}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bed className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-teal-700">Total Kamar</p>
                <p className="text-2xl font-bold text-teal-800">{rooms.length}</p>
              </div>
              <div className="p-2 bg-teal-100 rounded-lg">
                <Building2 className="h-5 w-5 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <Card key={room.id} className="bg-gradient-to-br from-white to-teal-50 border-teal-100 hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg text-teal-800">
                    Kamar {room.number}
                  </CardTitle>
                  <p className="text-sm text-teal-600">{room.kosName}</p>
                  <p className="text-xs text-teal-500">Lantai {room.floor} • {room.size}</p>
                </div>
                <Badge 
                  variant={room.isOccupied ? "destructive" : "default"}
                  className={room.isOccupied ? 
                    "bg-red-100 text-red-700 hover:bg-red-200" : 
                    "bg-green-100 text-green-700 hover:bg-green-200"
                  }
                >
                  {room.isOccupied ? "Terisi" : "Kosong"}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-teal-700">Tipe:</span>
                <span className="text-sm text-teal-600">{room.type}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-teal-700">Harga:</span>
                <span className="text-lg font-bold text-teal-800">
                  {formatPrice(room.price)}/bulan
                </span>
              </div>

              {room.isOccupied && room.tenantName && (
                <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                  <p className="text-sm font-medium text-teal-700">Penyewa:</p>
                  <p className="text-sm text-teal-800">{room.tenantName}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-teal-700 mb-2">Fasilitas:</p>
                <div className="flex flex-wrap gap-2">
                  {room.facilities.map((facility, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-1 px-2 py-1 bg-teal-100 rounded-full text-xs text-teal-700"
                    >
                      {getFacilityIcon(facility)}
                      <span>{facility}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between gap-2 pt-3 border-t border-teal-100">
                <Button variant="outline" size="sm" className="flex-1 border-teal-200 text-teal-700 hover:bg-teal-50">
                  <Eye className="h-3 w-3 mr-1" />
                  Detail
                </Button>
                <Button variant="outline" size="sm" className="flex-1 border-teal-200 text-teal-700 hover:bg-teal-50">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="border-red-200 text-red-700 hover:bg-red-50">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rooms.length === 0 && (
        <Card className="bg-gradient-to-br from-white to-teal-50 border-teal-100">
          <CardContent className="text-center py-12">
            <Building2 className="h-16 w-16 text-teal-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-teal-700 mb-2">Belum Ada Kamar</h3>
            <p className="text-teal-600 mb-4">Tambahkan kamar pertama untuk mulai mengelola kos Anda</p>
            <Button className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Kamar Baru
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}