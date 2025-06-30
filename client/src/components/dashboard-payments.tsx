import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  Download, 
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  User,
  Building2
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Payment {
  id: number;
  tenantName: string;
  roomNumber: string;
  kosName: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'paid' | 'pending' | 'overdue';
  paymentMethod?: string;
  notes?: string;
}

interface DashboardPaymentsProps {
  payments: Payment[];
}

export function DashboardPayments({ payments }: DashboardPaymentsProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
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

  const getStatusText = (status: string) => {
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

  const paidPayments = payments.filter(p => p.status === 'paid');
  const pendingPayments = payments.filter(p => p.status === 'pending');
  const overduePayments = payments.filter(p => p.status === 'overdue');

  const totalRevenue = paidPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const pendingAmount = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const overdueAmount = overduePayments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-teal-800">Manajemen Pembayaran</h2>
          <p className="text-teal-600">
            {paidPayments.length} pembayaran lunas, {pendingPayments.length} tertunda, {overduePayments.length} terlambat
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Total Pendapatan</p>
                <p className="text-xl font-bold text-green-800">{formatPrice(totalRevenue)}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700">Pembayaran Tertunda</p>
                <p className="text-xl font-bold text-yellow-800">{formatPrice(pendingAmount)}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Pembayaran Terlambat</p>
                <p className="text-xl font-bold text-red-800">{formatPrice(overdueAmount)}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-teal-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Transaksi</p>
                <p className="text-xl font-bold text-blue-800">{payments.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Actions */}
      {overduePayments.length > 0 && (
        <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Perhatian: Pembayaran Terlambat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overduePayments.slice(0, 3).map((payment) => (
                <div key={payment.id} className="flex justify-between items-center p-3 bg-white rounded-lg border border-red-200">
                  <div>
                    <p className="font-medium text-red-800">{payment.tenantName}</p>
                    <p className="text-sm text-red-600">Kamar {payment.roomNumber} - {formatPrice(payment.amount)}</p>
                    <p className="text-xs text-red-500">Jatuh tempo: {new Date(payment.dueDate).toLocaleDateString('id-ID')}</p>
                  </div>
                  <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white">
                    Kirim Reminder
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card className="bg-gradient-to-br from-white to-teal-50 border-teal-100">
        <CardHeader>
          <CardTitle className="text-teal-800">Riwayat Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(payment.status)}
                    <div>
                      <h3 className="font-semibold text-teal-800">{payment.tenantName}</h3>
                      <div className="flex items-center space-x-4 text-sm text-teal-600">
                        <div className="flex items-center">
                          <Building2 className="h-3 w-3 mr-1" />
                          {payment.kosName}
                        </div>
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          Kamar {payment.roomNumber}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(payment.status)}>
                      {getStatusText(payment.status)}
                    </Badge>
                    <p className="text-lg font-bold text-teal-800 mt-1">
                      {formatPrice(payment.amount)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center text-teal-600">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>Jatuh tempo: {new Date(payment.dueDate).toLocaleDateString('id-ID')}</span>
                  </div>
                  {payment.paidDate && (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      <span>Dibayar: {new Date(payment.paidDate).toLocaleDateString('id-ID')}</span>
                    </div>
                  )}
                  {payment.paymentMethod && (
                    <div className="flex items-center text-teal-600">
                      <CreditCard className="h-3 w-3 mr-1" />
                      <span>Via: {payment.paymentMethod}</span>
                    </div>
                  )}
                </div>

                {payment.notes && (
                  <div className="mt-3 p-2 bg-teal-50 rounded text-sm text-teal-700">
                    <strong>Catatan:</strong> {payment.notes}
                  </div>
                )}

                {payment.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600">
                      Konfirmasi Pembayaran
                    </Button>
                    <Button size="sm" variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50">
                      Kirim Reminder
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {payments.length === 0 && (
            <div className="text-center py-8">
              <CreditCard className="h-16 w-16 text-teal-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-teal-700 mb-2">Belum Ada Transaksi</h3>
              <p className="text-teal-600">Transaksi pembayaran akan muncul di sini</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}