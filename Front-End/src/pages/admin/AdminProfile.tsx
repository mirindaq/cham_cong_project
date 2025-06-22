import { useState, useEffect, useRef } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { userApi } from "@/services/user.service";
import { authApi } from "@/services/authe.service";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin-layout";
import Spinner from "@/components/Spinner";
import { useAuth } from "@/contexts/AuthContext";

function AdminProfile() {
  const [loading, setLoading] = useState(true);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    employeeId: "",
    joinDate: "",
    address: "",
    dob: "",
    employeeType: "",
  });

  const [passwordData, setPasswordData] = useState({
    username: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const { user, setUser } = useAuth();

  useEffect(() => {
    setLoading(true);

    if (user) {
      setLoading(false);
      setProfileData({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        department: user.departmentName,
        position: user.position,
        employeeId: user.id.toString(),
        joinDate: user.joinDate,
        address: user.address,
        dob: user.dob,
        employeeType: user.employeeType,
      });

      // Set avatar URL if available
      if (user.avatar) {
        setAvatarUrl(user.avatar);
      }

      setPasswordData((prev) => ({
        ...prev,
        username: user.email,
      }));
    }
  }, [user]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Vui lòng chọn file hình ảnh!");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước file không được vượt quá 5MB!");
      return;
    }

    try {
      setAvatarLoading(true);
      const response = await userApi.updateAvatar(file);
      
      if (response.data?.avatar) {
        setAvatarUrl(response.data.avatar);
        toast.success("Cập nhật avatar thành công!");
        
        // Refresh user data to get updated avatar
        try {
          const profileResponse = await userApi.getProfile();
          if (profileResponse.data) {
            // Update the user context with new data
            setUser(profileResponse.data);
          }
        } catch (error) {
          console.error("Lỗi khi refresh thông tin user:", error);
        }
      } else {
        toast.success("Cập nhật avatar thành công!");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật avatar:", error);
      toast.error("Có lỗi xảy ra khi cập nhật avatar. Vui lòng thử lại!");
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const submitData = {
        phone: profileData.phone,
        address: profileData.address,
        dob: profileData.dob,
      };
      await userApi.updateProfile(submitData);
      toast.success("Cập nhật thông tin thành công!");
    } catch (error: any) {
      toast.error("Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại!");
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu mới không khớp!");
      return;
    }

    try {
      await authApi.changePassword(passwordData);

      toast.success("Cập nhật mật khẩu thành công!");
      setPasswordData({
        username: "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error("Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại!");
    }
  };

  if (loading) {
    return <Spinner layout="admin" />;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className={`relative group ${avatarLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`} onClick={avatarLoading ? undefined : handleAvatarClick}>
            <Avatar className="h-20 w-20 transition-opacity group-hover:opacity-80">
              <AvatarImage
                src={avatarUrl || "/placeholder.svg?height=80&width=80"}
                alt={profileData.fullName}
              />
              <AvatarFallback>
                {profileData.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            {avatarLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-xs font-medium">Thay đổi</span>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
          <div>
            <h1 className="text-2xl font-bold">{profileData.fullName}</h1>
            <p className="text-muted-foreground">
              {profileData.position} - {profileData.department}
            </p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList>
            <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
            <TabsTrigger value="password">Đổi mật khẩu</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <Card>
              <form onSubmit={handleProfileSubmit}>
                <CardHeader>
                  <CardTitle>Thông tin cá nhân</CardTitle>
                  <CardDescription>
                    Cập nhật thông tin cá nhân của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Họ và tên</Label>
                      <Input
                        id="name"
                        name="name"
                        value={profileData.fullName}
                        disabled
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={profileData.email}
                        disabled
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Địa chỉ</Label>
                      <Input
                        id="address"
                        name="address"
                        value={profileData.address}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dob">Ngày sinh</Label>
                      <Input
                        id="dob"
                        name="dob"
                        type="date"
                        value={profileData.dob}
                        onChange={handleProfileChange}
                        max={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Thông tin công việc</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="department">Phòng ban</Label>
                        <Input
                          id="department"
                          name="department"
                          value={profileData.department}
                          readOnly
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="position">Chức vụ</Label>
                        <Input
                          id="position"
                          name="position"
                          value={profileData.position}
                          readOnly
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="employeeId">Mã nhân viên</Label>
                        <Input
                          id="employeeId"
                          name="employeeId"
                          value={profileData.employeeId}
                          readOnly
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="joinDate">Ngày vào làm</Label>
                        <Input
                          id="joinDate"
                          name="joinDate"
                          value={profileData.joinDate}
                          readOnly
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="employeeType">Loại nhân viên</Label>
                        <Input
                          id="employeeType"
                          name="employeeType"
                          value={profileData.employeeType}
                          readOnly
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit">Lưu thay đổi</Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          <TabsContent value="password">
            <Card>
              <form onSubmit={handlePasswordSubmit}>
                <CardHeader>
                  <CardTitle>Đổi mật khẩu</CardTitle>
                  <CardDescription>Cập nhật mật khẩu của bạn</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="oldPassword">Mật khẩu hiện tại</Label>
                    <Input
                      placeholder="Mật khẩu hiện tại"
                      id="oldPassword"
                      name="oldPassword"
                      type="password"
                      value={passwordData.oldPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Mật khẩu mới</Label>
                    <Input
                      placeholder="Mật khẩu mới"
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Xác nhận mật khẩu mới
                    </Label>
                    <Input
                      placeholder="Xác nhận mật khẩu mới"
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit">Cập nhật mật khẩu</Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

export default AdminProfile;
