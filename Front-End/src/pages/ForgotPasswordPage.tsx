import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Check, Mail, Lock, Key } from "lucide-react"
import { otpApi } from "@/services/otp.service"
import { toast } from "sonner"

type Step = 'email' | 'otp' | 'password' | 'success'

function ForgotPasswordPage() {
  const [currentStep, setCurrentStep] = useState<Step>('email')
  const [email, setEmail] = useState<string>("")
  const [otpCode, setOtpCode] = useState<string>("")
  const [newPassword, setNewPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", "", ""])

  const handleOtpChange = (index: number, value: string) => {
    // Cho phép nhập cả chữ và số, tự động chuyển thành in hoa
    if (value.length > 1) {
      value = value.slice(0, 1)
    }
    
    // Chuyển thành chữ in hoa
    value = value.toUpperCase()
    
    const newOtpValues = [...otpValues]
    newOtpValues[index] = value
    setOtpValues(newOtpValues)
    
    // Auto focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
    
    // Update otpCode string
    const otpString = newOtpValues.join("")
    setOtpCode(otpString)
  }

  // Handle backspace
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  // Handle paste
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6).toUpperCase()
    const pastedArray = pastedData.split('')
    
    const newOtpValues = [...otpValues]
    pastedArray.forEach((char, index) => {
      if (index < 6) {
        newOtpValues[index] = char
      }
    })
    
    setOtpValues(newOtpValues)
    setOtpCode(newOtpValues.join(""))
    
    // Focus last filled input or first empty input
    const lastFilledIndex = newOtpValues.findIndex(val => !val)
    const focusIndex = lastFilledIndex === -1 ? 5 : lastFilledIndex
    otpRefs.current[focusIndex]?.focus()
  }

  // Reset OTP when step changes
  useEffect(() => {
    if (currentStep === 'otp') {
      setOtpValues(["", "", "", "", "", ""])
      setOtpCode("")
      // Focus first input
      setTimeout(() => {
        otpRefs.current[0]?.focus()
      }, 100)
    }
  }, [currentStep])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await otpApi.sendOtp(email)
      if (response.status === 200) {
        toast.success("Mã OTP đã được gửi đến email của bạn")
        setCurrentStep('otp')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi gửi OTP")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await otpApi.verifyOtp(email, otpCode)
      if (response.status === 200 && response.data.isValid) {
        toast.success("Xác thực OTP thành công")
        setCurrentStep('password')
      } else {
        toast.error("Mã OTP không chính xác")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi xác thực OTP")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp")
      return
    }

    if (newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự")
      return
    }

    setLoading(true)

    try {
      const response = await otpApi.resetPasswordWithOtp({
        email,
        otpCode,
        newPassword,
        confirmPassword
      })
      if (response.status === 200) {
        toast.success("Đặt lại mật khẩu thành công")
        setCurrentStep('success')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi đặt lại mật khẩu")
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'email':
        return (
          <form onSubmit={handleSendOtp}>
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
                {loading ? "Đang gửi..." : "Gửi mã OTP"}
              </Button>
            </CardFooter>
          </form>
        )

      case 'otp':
        return (
          <form onSubmit={handleVerifyOtp}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Mã OTP</Label>
                <div className="flex space-x-2">
                  {otpValues.map((value, index) => (
                    <Input
                      key={index}
                      ref={(el) => {
                        otpRefs.current[index] = el
                      }}
                      type="text"
                      required
                      value={value}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={index === 0 ? handleOtpPaste : undefined}
                      maxLength={1}
                      className="w-12 h-12 text-center text-lg font-semibold"
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Mã OTP đã được gửi đến <strong>{email}</strong>
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Đang xác thực..." : "Xác thực OTP"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => setCurrentStep('email')}
              >
                Quay lại
              </Button>
            </CardFooter>
          </form>
        )

      case 'password':
        return (
          <form onSubmit={handleResetPassword}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Nhập mật khẩu mới"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => setCurrentStep('otp')}
              >
                Quay lại
              </Button>
            </CardFooter>
          </form>
        )

      case 'success':
        return (
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center space-y-2 py-6">
              <div className="rounded-full bg-primary/10 p-3">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Đặt lại mật khẩu thành công!
              </p>
              <p className="text-center text-sm text-muted-foreground">
                Bạn có thể đăng nhập với mật khẩu mới
              </p>
            </div>
          </CardContent>
        )

      default:
        return null
    }
  }

  const getStepIcon = () => {
    switch (currentStep) {
      case 'email':
        return <Mail className="h-6 w-6" />
      case 'otp':
        return <Key className="h-6 w-6" />
      case 'password':
        return <Lock className="h-6 w-6" />
      case 'success':
        return <Check className="h-6 w-6" />
      default:
        return <Mail className="h-6 w-6" />
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 'email':
        return "Quên mật khẩu"
      case 'otp':
        return "Xác thực OTP"
      case 'password':
        return "Đặt lại mật khẩu"
      case 'success':
        return "Thành công"
      default:
        return "Quên mật khẩu"
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 'email':
        return "Nhập địa chỉ email của bạn để nhận mã OTP"
      case 'otp':
        return "Nhập mã OTP đã được gửi đến email của bạn. Mã OTP có thời hạn 5 phút"
      case 'password':
        return "Nhập mật khẩu mới cho tài khoản của bạn"
      case 'success':
        return "Mật khẩu đã được đặt lại thành công"
      default:
        return "Nhập địa chỉ email của bạn để nhận mã OTP"
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
          <div className="flex items-center space-x-2">
            <div className="rounded-full bg-primary/10 p-2">
              {getStepIcon()}
            </div>
            <CardTitle className="text-2xl font-bold">{getStepTitle()}</CardTitle>
          </div>
          <CardDescription>
            {getStepDescription()}
          </CardDescription>
        </CardHeader>
        {renderStepContent()}
        {currentStep !== 'success' && (
          <div className="px-8 pb-6">
            <Button variant="link" asChild className="px-0">
              <Link to="/login" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại đăng nhập
              </Link>
            </Button>
          </div>
        )}
        {currentStep === 'success' && (
          <div className="px-8 pb-6">
            <Button variant="link" asChild className="px-0">
              <Link to="/login" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Đăng nhập ngay
              </Link>
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}

export default ForgotPasswordPage
