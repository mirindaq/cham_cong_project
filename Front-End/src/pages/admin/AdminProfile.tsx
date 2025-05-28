import { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { userApi } from "@/services/user.service"
import { localStorageUtil } from "@/utils/localStorageUtil"
import { authApi } from "@/services/authe.service"
import { toast } from "sonner"
import { AdminLayout } from "@/components/admin-layout"

function AdminProfile() {
  const [loading, setLoading] = useState(true)
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
  })

  const [passwordData, setPasswordData] = useState({
    username: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    const user = localStorageUtil.getUserFromLocalStorage();
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const response = await userApi.getProfile(user.id);
        const userData = response.data;
        setProfileData({
          fullName: userData.fullName,
          email: userData.email,
          phone: userData.phone,
          department: userData.departmentName,
          position: userData.position,
          employeeId: userData.id.toString(),
          joinDate: userData.joinDate,
          address: userData.address,
          dob: userData.dob,
          employeeType: userData.employeeType,
        });

        setPasswordData(prev => ({
          ...prev,
          username: userData.email
        }));
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Có lỗi xảy ra khi tải thông tin");
      } finally {
        setLoading(false)
      }
    }
    fetchProfile();
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const submitData = {
        phone: profileData.phone,
        address: profileData.address,
        dob: profileData.dob,
      }
      await userApi.updateProfile(Number(profileData.employeeId), submitData);
      toast.success("Cập nhật thông tin thành công!")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi cập nhật thông tin")
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu mới không khớp!")
      return
    }

    try {
      await authApi.changePassword(passwordData);

      toast.success("Cập nhật mật khẩu thành công!")
      setPasswordData({
        username: "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi đổi mật khẩu")
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src="/placeholder.svg?height=80&width=80" alt={profileData.fullName} />
            <AvatarFallback>
              {profileData.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
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
                  <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Họ và tên</Label>
                      <Input id="name" name="name" value={profileData.fullName} disabled onChange={handleProfileChange} />
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
                      <Input id="phone" name="phone" value={profileData.phone} onChange={handleProfileChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Địa chỉ</Label>
                      <Input id="address" name="address" value={profileData.address} onChange={handleProfileChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dob">Ngày sinh</Label>
                      <Input id="dob" name="dob" type="date" value={profileData.dob} onChange={handleProfileChange} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Thông tin công việc</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="department">Phòng ban</Label>
                        <Input id="department" name="department" value={profileData.department} readOnly disabled />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="position">Chức vụ</Label>
                        <Input id="position" name="position" value={profileData.position} readOnly disabled />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="employeeId">Mã nhân viên</Label>
                        <Input id="employeeId" name="employeeId" value={profileData.employeeId} readOnly disabled />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="joinDate">Ngày vào làm</Label>
                        <Input id="joinDate" name="joinDate" value={profileData.joinDate} readOnly disabled />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="employeeType">Loại nhân viên</Label>
                        <Input id="employeeType" name="employeeType" value={profileData.employeeType} readOnly disabled />
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
                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
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
  )
}

export default AdminProfile
