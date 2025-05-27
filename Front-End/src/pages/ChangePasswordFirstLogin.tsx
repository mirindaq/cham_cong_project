import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { authApi } from "@/services/authe.service"
import { toast } from "sonner"
import { localStorageUtil } from "@/utils/localStorageUtil"

export default function ChangePasswordFirstLogin() {
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    const storedUsername = sessionStorage.getItem("pendingUsername")
    if (!storedUsername) {
      navigate("/login")
      return
    }
    setUsername(storedUsername)
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới không khớp!")
      setLoading(false)
      return
    }

    try {
      const response = await authApi.changePasswordFirstLogin({
        newPassword,
        confirmPassword,
        username
      })
      if (response.status === 200) {
        sessionStorage.removeItem("pendingUsername")
        localStorageUtil.setUserToLocalStorage(response.data)
        toast.success("Đổi mật khẩu thành công!")
        if (response.data.role === "ADMIN") {
          navigate("/admin/dashboard")
        } else if (response.data.role === "EMPLOYEE") {
          navigate("/employee/dashboard")
        }
      } else {
        toast.error("Có lỗi xảy ra khi đổi mật khẩu!")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi đổi mật khẩu!")
    } finally {
      setLoading(false)
    }
  }

  if (!username) {
    return null
  }

  return (
    <div style={{
      backgroundImage: "url('https://fptsmartcloud.com/wp-content/uploads/2022/06/img-number-mbs.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat"
    }} className="flex min-h-screen items-center justify-center bg-orange-100 px-4">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-lg shadow-lg">
        <div className="hidden md:block md:w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('/images/login-bg.jpg')" }}>
          <div className="flex h-full items-center justify-center bg-blue-900/20 p-12">
            <div className="text-center text-white">
              <h2 className="text-3xl font-bold">FPT University</h2>
              <p className="mt-4 text-lg">
                Attendance Management System
              </p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 bg-white p-8">
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-48">
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/68/Logo_FPT_Education.png" alt="Logo" className="w-full" />
              </div>
              <CardTitle className="text-2xl">Đổi mật khẩu</CardTitle>
              <CardDescription>Vui lòng đặt mật khẩu mới cho tài khoản {username}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Mật khẩu mới</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Nhập mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-gray-600">
                Hệ thống Chấm công © {new Date().getFullYear()} | Công ty ABC
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
} 