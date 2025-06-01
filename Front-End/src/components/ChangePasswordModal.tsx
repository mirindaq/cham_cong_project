import { useState } from "react";
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
  CardTitle,
} from "@/components/ui/card";
import { authApi } from "@/services/authe.service";
import { toast } from "sonner";
import { localStorageUtil } from "@/utils/localStorageUtil";

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
        localStorageUtil.setUserToLocalStorage(response.data);
        toast.success("Đổi mật khẩu thành công!");
        onSuccess?.(response.data);
        onClose();
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
        <Card className="border-0 shadow-none">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Đổi mật khẩu</CardTitle>
            <CardDescription>
              Vui lòng đặt mật khẩu mới cho tài khoản <b>{username}</b>
            </CardDescription>
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
      </DialogContent>
    </Dialog>
  );
}
