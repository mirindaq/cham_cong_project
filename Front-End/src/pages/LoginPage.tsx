import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { authApi } from "@/services/authe.service";
import { localStorageUtil } from "@/utils/localStorageUtil";
import { toast } from "sonner";
import ChangePasswordModal from "@/components/ChangePasswordModal";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [pendingUsername, setPendingUsername] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await authApi.login(username, password);
      localStorageUtil.setUserToLocalStorage(response.data);
      if (response.data.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (response.data.role === "EMPLOYEE") {
        navigate("/employee/dashboard");
      }
    } catch (error: any) {
      if (error.response.data.message.includes("change your password")) {
        sessionStorage.setItem("pendingUsername", username);
        setPendingUsername(username);
        setShowChangePasswordModal(true);
        toast.success(
          "Đăng nhập lần đầu, vui lòng thiết lập mật khẩu để tiếp tục."
        );
        // Không navigate nữa!
      } else {
        toast.error("Tên đăng nhập hoặc mật khẩu không đúng!");
      }
    }
  };

  return (
    <div
      style={{
        backgroundImage:
          "url('https://fptsmartcloud.com/wp-content/uploads/2022/06/img-number-mbs.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      className="flex min-h-screen items-center justify-center bg-orange-100 px-4"
    >
      <div className="flex w-full max-w-4xl overflow-hidden rounded-lg shadow-lg">
        <div
          className="hidden md:block md:w-1/2 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/login-bg.jpg')" }}
        >
          <div className="flex h-full items-center justify-center bg-blue-900/20 p-12">
            <div className="text-center text-white">
              <h2 className="text-3xl font-bold">FPT University</h2>
              <p className="mt-4 text-lg">Attendance Management System</p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 bg-white p-8">
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-48">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/6/68/Logo_FPT_Education.png"
                  alt="Logo"
                  className="w-full"
                />
              </div>
              <CardTitle className="text-2xl">Đăng nhập hệ thống</CardTitle>
              <CardDescription>
                Nhập thông tin đăng nhập để tiếp tục
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Tên đăng nhập</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Nhập tên đăng nhập"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Mật khẩu</Label>
                    <a
                      href="/forgot-password"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Quên mật khẩu?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(!!checked)}
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Ghi nhớ đăng nhập
                  </label>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Đang đăng nhập..." : "Đăng nhập"}
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
      {showChangePasswordModal && pendingUsername && (
        <ChangePasswordModal
          open={showChangePasswordModal}
          username={pendingUsername}
          onClose={() => setShowChangePasswordModal(false)}
          onSuccess={() => {
            setShowChangePasswordModal(false);
            setPendingUsername(null);
          }}
        />
      )}
    </div>
  );
}
