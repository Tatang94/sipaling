import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  LogOut, 
  Menu,
  Camera,
  Mail,
  Lock,
  Phone,
  Save,
  ArrowLeft,
  Upload,
  X
} from "lucide-react";

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const { toast } = useToast();
  
  // Get current user from localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user") || "{}");
  });

  // Form state
  const [profileData, setProfileData] = useState({
    name: currentUser.name || "",
    email: currentUser.email || "",
    phone: currentUser.phone || "",
    profilePhoto: currentUser.profilePhoto || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    // Load profile photo from localStorage if exists
    const savedPhoto = localStorage.getItem(`profilePhoto_${currentUser.id}`);
    if (savedPhoto) {
      setPreviewUrl(savedPhoto);
      setProfileData(prev => ({ ...prev, profilePhoto: savedPhoto }));
    }
  }, [currentUser.id]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setLocation("/login");
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Format file tidak valid",
        description: "Hanya file gambar yang diperbolehkan",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast({
        title: "File terlalu besar",
        description: "Ukuran file maksimal 2MB",
        variant: "destructive"
      });
      return;
    }

    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
      setProfileData(prev => ({ ...prev, profilePhoto: result }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setPreviewUrl("");
    setProfileData(prev => ({ ...prev, profilePhoto: "" }));
  };

  const validateForm = () => {
    if (!profileData.name.trim()) {
      toast({
        title: "Nama harus diisi",
        description: "Masukkan nama lengkap Anda",
        variant: "destructive"
      });
      return false;
    }

    if (!profileData.email.trim()) {
      toast({
        title: "Email harus diisi",
        description: "Masukkan alamat email yang valid",
        variant: "destructive"
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      toast({
        title: "Format email tidak valid",
        description: "Masukkan alamat email yang benar",
        variant: "destructive"
      });
      return false;
    }

    if (profileData.newPassword) {
      if (profileData.newPassword.length < 6) {
        toast({
          title: "Password terlalu pendek",
          description: "Password minimal 6 karakter",
          variant: "destructive"
        });
        return false;
      }

      if (profileData.newPassword !== profileData.confirmPassword) {
        toast({
          title: "Konfirmasi password tidak cocok",
          description: "Pastikan password dan konfirmasi password sama",
          variant: "destructive"
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Update user data in localStorage
    const updatedUser = {
      ...currentUser,
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
      profilePhoto: profileData.profilePhoto
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    
    // Save profile photo separately
    if (profileData.profilePhoto) {
      localStorage.setItem(`profilePhoto_${currentUser.id}`, profileData.profilePhoto);
    } else {
      localStorage.removeItem(`profilePhoto_${currentUser.id}`);
    }

    setCurrentUser(updatedUser);
    setIsEditing(false);

    // Clear password fields
    setProfileData(prev => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }));

    toast({
      title: "Profil berhasil diperbarui",
      description: "Perubahan telah disimpan",
    });
  };

  const Navigation = ({ isMobile = false }) => (
    <nav className={`${isMobile ? "space-y-2" : "flex space-x-4"}`}>
      <Button
        variant="ghost"
        onClick={() => setLocation("/dashboard")}
        className={`${isMobile ? "w-full justify-start" : ""} text-gray-600 hover:text-primary`}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Dashboard
      </Button>
      <Button
        variant="ghost"
        onClick={handleLogout}
        className={`${isMobile ? "w-full justify-start" : ""} text-gray-600 hover:text-red-600`}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Keluar
      </Button>
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b px-4 py-3 md:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Profil</h1>
            <p className="text-sm text-gray-600">{currentUser.name}</p>
          </div>
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="py-6">
                <Navigation isMobile={true} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Profil Pengguna</h1>
            <p className="text-gray-600">Kelola informasi akun Anda</p>
          </div>
          <Navigation />
        </div>
      </div>

      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Informasi Profil
              </CardTitle>
              {!isEditing && (
                <Button 
                  onClick={() => setIsEditing(true)}
                  size="sm"
                  className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
                >
                  Edit Profil
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!isEditing ? (
              // View Mode
              <div className="space-y-6">
                {/* Profile Photo */}
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={previewUrl || profileData.profilePhoto} />
                    <AvatarFallback className="text-2xl">
                      {currentUser.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">{currentUser.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{currentUser.role}</p>
                  </div>
                </div>

                {/* User Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Email</Label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Mail className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-sm">{currentUser.email}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Nomor WhatsApp</Label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-sm">{currentUser.phone || "Belum diatur"}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Edit Mode
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Photo Upload */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={previewUrl || profileData.profilePhoto} />
                      <AvatarFallback className="text-2xl">
                        {profileData.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {previewUrl && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={removeImage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="profile-photo-upload"
                    />
                    <label htmlFor="profile-photo-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <span>
                          <Camera className="w-4 h-4 mr-2" />
                          {previewUrl ? "Ganti Foto" : "Upload Foto"}
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Nomor WhatsApp</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+62 812 3456 7890"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Password Baru (Opsional)</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={profileData.newPassword}
                      onChange={(e) => setProfileData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Kosongkan jika tidak ingin mengubah"
                    />
                  </div>

                  {profileData.newPassword && (
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={profileData.confirmPassword}
                        onChange={(e) => setProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Ulangi password baru"
                      />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setProfileData({
                        name: currentUser.name || "",
                        email: currentUser.email || "",
                        phone: currentUser.phone || "",
                        profilePhoto: currentUser.profilePhoto || "",
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: ""
                      });
                      setPreviewUrl(currentUser.profilePhoto || "");
                      setSelectedImage(null);
                    }}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Simpan Perubahan
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}