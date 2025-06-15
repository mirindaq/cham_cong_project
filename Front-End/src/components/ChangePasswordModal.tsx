import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { authApi } from "@/services/authe.service";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, Eye, EyeOff, Building } from "lucide-react";

interface ChangePasswordModalProps {
  open: boolean;
  username: string;
  onClose: () => void;
  onSuccess?: (user: any) => void;
}

export default function ChangePasswordModal({
  open,
  username,
  onClose,
  onSuccess,
}: ChangePasswordModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { login, role } = useAuth();

  useEffect(() => {
    if (role === "ADMIN") {
      navigate("/admin/dashboard");
    } else if (role === "EMPLOYEE") {
      navigate("/employee/dashboard");
    }
  }, [role, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới không khớp!");
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.changePasswordFirstLogin({
        newPassword,
        confirmPassword,
        username,
      });
      if (response.status === 200) {
        sessionStorage.removeItem("pendingUsername");
        toast.success("Đổi mật khẩu thành công!");
        onSuccess?.(response.data);
        onClose();
        login(username, newPassword);
      } else {
        toast.error("Có lỗi xảy ra khi đổi mật khẩu!");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi đổi mật khẩu!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            Đổi mật khẩu
          </DialogTitle>
        </DialogHeader>

        <Card className="border-0 shadow-none">
          <CardHeader className="text-center pb-4">
            <CardDescription className="text-base leading-relaxed">
              Xin chào{" "}
              <span className="font-semibold text-blue-600">{username}</span>,
              vui lòng thiết lập mật khẩu mới để tiếp tục.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang xử lý...
                  </div>
                ) : (
                  "Thiết lập mật khẩu"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col items-center space-y-2 pt-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building className="w-4 h-4" />
              <span>Hệ thống Chấm công © {new Date().getFullYear()}</span>
            </div>
            <p className="text-xs text-gray-500">
              Công ty ABC - Bảo mật thông tin là ưu tiên hàng đầu
            </p>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
