import type React from "react"

import { useState } from "react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Check } from "lucide-react"
import { authApi } from "@/services/authe.service"
import { toast } from "sonner"

function ForgotPasswordPage() {
  const [email, setEmail] = useState<string>("")
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try { 
      const response = await authApi.forgotPassword(email);
      if (response.status === 200) {
        setIsSubmitted(true);
      } else {
        throw new Error('Có lỗi xảy ra khi gửi yêu cầu');
      }
    } catch (error: any) {
      toast.error(error.response.data.message)
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      backgroundImage: "url('https://fptsmartcloud.com/wp-content/uploads/2022/06/img-number-mbs.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat"
    }} className="flex min-h-screen items-center justify-center bg-orange-100 p-10">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Quên mật khẩu</CardTitle>
          <CardDescription>
            {isSubmitted
              ? "Vui lòng kiểm tra email của bạn để nhận mật khẩu mới"
              : "Nhập địa chỉ email của bạn và chúng tôi sẽ gửi mật khẩu mới đến email của bạn"}
          </CardDescription>
        </CardHeader>
        {isSubmitted ? (
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center space-y-2 py-6">
              <div className="rounded-full bg-primary/10 p-3">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Chúng tôi đã gửi mật khẩu mới đến email <strong>{email}</strong>
              </p>
              <p className="text-center text-sm text-muted-foreground">
                Vui lòng kiểm tra hộp thư đến và thư mục spam của bạn
              </p>
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@gmail.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Đang xử lý..." : "Gửi mật khẩu mới"}
              </Button>
            </CardFooter>
          </form>
        )}
        <div className="px-8 pb-6">
          <Button variant="link" asChild className="px-0">
            <Link to="/login" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại đăng nhập
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default ForgotPasswordPage
