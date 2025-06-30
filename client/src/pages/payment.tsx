import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft, Calendar, CreditCard, Smartphone, Building2, Receipt, CheckCircle } from "lucide-react";

interface PaymentData {
  id: number;
  tenantName: string;
  roomNumber: string;
  kosName: string;
  amount: string;
  dueDate: string;
  paidDate?: string | null;
  status: 'paid' | 'pending' | 'overdue';
  paymentMethod?: string | null;
  notes?: string | null;
  ownerId: number;
  bookingId: number;
}

export default function PaymentPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [notes, setNotes] = useState("");

  // Get payment ID from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const paymentId = urlParams.get('id');

  // Check for dynamic payment data from booking
  const [dynamicPayment, setDynamicPayment] = useState<PaymentData | null>(null);

  useEffect(() => {
    // Check if this is a new booking payment (not in database yet)
    const bookings = JSON.parse(localStorage.getItem("userBookings") || "[]");
    const currentBooking = bookings.find((b: any) => b.paymentId === parseInt(paymentId || "0"));
    
    if (currentBooking && !dynamicPayment) {
      // Create dynamic payment data from booking
      const payment: PaymentData = {
        id: currentBooking.paymentId,
        bookingId: currentBooking.paymentId,
        tenantName: "Pencari Kos",
        roomNumber: `${currentBooking.kosId.toString().padStart(2, '0')}1`,
        kosName: currentBooking.kosName,
        amount: currentBooking.pricePerMonth,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        paidDate: null,
        status: 'pending',
        paymentMethod: null,
        notes: null,
        ownerId: 1
      };
      setDynamicPayment(payment);
    }
  }, [paymentId, dynamicPayment]);

  const { data: apiPayment, isLoading } = useQuery<PaymentData>({
    queryKey: ['/api/payments', paymentId],
    enabled: !!paymentId && !dynamicPayment,
  });

  const payment = dynamicPayment || apiPayment;

  const paymentMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      // If this is a dynamic payment (from new booking), handle locally
      if (dynamicPayment) {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update local booking data
        const bookings = JSON.parse(localStorage.getItem("userBookings") || "[]");
        const updatedBookings = bookings.map((b: any) => {
          if (b.paymentId === dynamicPayment.id) {
            return {
              ...b,
              paymentStatus: 'processing',
              paymentMethod: selectedMethod,
              paymentDate: new Date().toISOString()
            };
          }
          return b;
        });
        localStorage.setItem("userBookings", JSON.stringify(updatedBookings));
        
        return { success: true, paymentId: dynamicPayment.id };
      }
      
      // Otherwise, use API for existing payments
      const response = await fetch(`/api/payments/${paymentId}/pay`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to process payment');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Pembayaran Berhasil!",
        description: "Pembayaran Anda telah diterima dan sedang diverifikasi.",
      });
      
      // Send WhatsApp notification
      const message = `🎉 Pembayaran Berhasil!

Terima kasih telah melakukan pembayaran untuk:
📍 ${payment?.kosName}
💰 ${payment?.amount ? `Rp ${parseInt(payment.amount).toLocaleString('id-ID')}` : ''}

Status: Sedang diverifikasi
Metode: ${selectedMethod}

Pemilik kos akan segera menghubungi Anda untuk konfirmasi lebih lanjut.

Terima kasih telah menggunakan SI PALING KOST! 🏠`;

      // Open WhatsApp with pre-filled message
      const phoneNumber = "6281234567890"; // Owner's WhatsApp
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
      queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
      
      setTimeout(() => {
        setLocation('/dashboard');
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Gagal Memproses Pembayaran",
        description: error.message || "Terjadi kesalahan saat memproses pembayaran.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMethod) {
      toast({
        title: "Pilih Metode Pembayaran",
        description: "Silakan pilih metode pembayaran terlebih dahulu.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('paymentMethod', selectedMethod);
    formData.append('notes', notes);
    if (proofImage) {
      formData.append('proofImage', proofImage);
    }

    paymentMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data pembayaran...</p>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">Data pembayaran tidak ditemukan</p>
            <Button onClick={() => setLocation('/dashboard')}>
              Kembali ke Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOverdue = new Date(payment.dueDate) < new Date() && payment.status === 'pending';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-teal-600 text-white p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/dashboard')}
            className="text-white hover:bg-teal-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-xl font-bold">Pembayaran Sewa</h1>
            <p className="text-teal-100">Bayar tagihan sewa kos Anda</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Payment Status */}
        {payment.status === 'paid' && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <div>
                  <p className="font-medium">Pembayaran Lunas</p>
                  <p className="text-sm text-green-600">
                    Dibayar pada: {new Date(payment.paidDate!).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Detail Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-600">Nama Tenant</Label>
                <p className="font-medium">{payment.tenantName}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Nomor Kamar</Label>
                <p className="font-medium">{payment.roomNumber}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Nama Kos</Label>
                <p className="font-medium">{payment.kosName}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Status</Label>
                <div>
                  <Badge variant={
                    payment.status === 'paid' ? 'default' :
                    isOverdue ? 'destructive' : 'secondary'
                  }>
                    {payment.status === 'paid' ? 'Lunas' :
                     isOverdue ? 'Terlambat' : 'Belum Bayar'}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-600">Tanggal Jatuh Tempo</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="font-medium">
                    {new Date(payment.dueDate).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Jumlah Tagihan</Label>
                <p className="text-2xl font-bold text-teal-600">
                  {formatPrice(parseFloat(payment.amount || '0'))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form - Only show if not paid */}
        {payment.status !== 'paid' && (
          <Card>
            <CardHeader>
              <CardTitle>Lakukan Pembayaran</CardTitle>
              <CardDescription>
                Pilih metode pembayaran dan upload bukti transfer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitPayment} className="space-y-6">
                {/* Payment Method */}
                <div>
                  <Label htmlFor="payment-method">Metode Pembayaran</Label>
                  <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Pilih metode pembayaran" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank-transfer">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          Transfer Bank
                        </div>
                      </SelectItem>
                      <SelectItem value="e-wallet">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4" />
                          E-Wallet (GoPay, OVO, DANA)
                        </div>
                      </SelectItem>
                      <SelectItem value="virtual-account">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          Virtual Account
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bank Details - Show when bank transfer selected */}
                {selectedMethod === 'bank-transfer' && (
                  <Card className="border-teal-200 bg-teal-50">
                    <CardContent className="pt-4">
                      <h4 className="font-medium text-teal-800 mb-3">Informasi Rekening</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-teal-700">Bank BCA</span>
                          <span className="font-mono font-medium">1234567890</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-teal-700">Atas Nama</span>
                          <span className="font-medium">SI PALING KOST</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-teal-700">Jumlah Transfer</span>
                          <span className="font-bold text-teal-800">{formatPrice(parseFloat(payment.amount || '0'))}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* E-Wallet Details */}
                {selectedMethod === 'e-wallet' && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="pt-4">
                      <h4 className="font-medium text-blue-800 mb-3">Informasi E-Wallet</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-700">GoPay/OVO/DANA</span>
                          <span className="font-mono font-medium">0812-3456-7890</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Atas Nama</span>
                          <span className="font-medium">SI PALING KOST</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Jumlah Transfer</span>
                          <span className="font-bold text-blue-800">{formatPrice(payment.amount)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Virtual Account Details */}
                {selectedMethod === 'virtual-account' && (
                  <Card className="border-purple-200 bg-purple-50">
                    <CardContent className="pt-4">
                      <h4 className="font-medium text-purple-800 mb-3">Virtual Account</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-purple-700">Bank Mandiri VA</span>
                          <span className="font-mono font-medium">89012-{payment.id.toString().padStart(6, '0')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-700">Jumlah Tagihan</span>
                          <span className="font-bold text-purple-800">{formatPrice(payment.amount)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Upload Proof */}
                <div>
                  <Label htmlFor="proof">Upload Bukti Pembayaran</Label>
                  <Input
                    id="proof"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProofImage(e.target.files?.[0] || null)}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Upload screenshot atau foto bukti transfer (maks. 2MB)
                  </p>
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes">Catatan (Opsional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Tambahkan catatan jika diperlukan..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  disabled={paymentMutation.isPending}
                >
                  {paymentMutation.isPending ? "Memproses..." : "Konfirmasi Pembayaran"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Butuh Bantuan?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <p>
                <strong>Kendala Pembayaran:</strong> Hubungi pemilik kos melalui WhatsApp untuk bantuan lebih lanjut.
              </p>
              <p>
                <strong>Verifikasi:</strong> Pembayaran akan diverifikasi dalam 1x24 jam setelah bukti transfer diunggah.
              </p>
              <Button
                variant="outline"
                onClick={() => window.open(`https://wa.me/6281234567890?text=Halo, saya butuh bantuan untuk pembayaran sewa kamar ${payment.roomNumber} di ${payment.kosName}`, '_blank')}
                className="w-full"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Hubungi Pemilik via WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}