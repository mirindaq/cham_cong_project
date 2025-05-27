import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { EmployeeLayout } from "@/components/employee-layout"

function DisputesPage() {
  const [disputeDate, setDisputeDate] = useState<Date | undefined>(undefined)
  const [disputeType, setDisputeType] = useState("")
  const [requestedChange, setRequestedChange] = useState("")
  const [reason, setReason] = useState("")
  const [disputes, setDisputes] = useState([
    {
      id: 1,
      date: "2025-04-10",
      type: "Quên Checkout",
      requestedChange: "Thêm giờ checkout: 17:30",
      reason: "Lỗi hệ thống ngăn việc checkout",
      status: "pending",
    },
    {
      id: 2,
      date: "2025-03-22",
      type: "Lỗi Hệ Thống",
      requestedChange: "Đánh dấu có mặt",
      reason: "Ứng dụng bị crash trong lúc checkin",
      status: "approved",
    },
    {
      id: 3,
      date: "2025-02-15",
      type: "Giờ Không Chính Xác",
      requestedChange: "Cập nhật giờ: 8:30 - 17:30",
      reason: "Đã checkin nhưng hệ thống ghi nhận sai giờ",
      status: "rejected",
    },
  ])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // In a real app, this would send the data to an API
    alert("Đã gửi yêu cầu khiếu nại thành công!")
    // Reset form
    setDisputeDate(undefined)
    setDisputeType("")
    setRequestedChange("")
    setReason("")
  }

  const handleWithdraw = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn thu hồi đơn khiếu nại này?")) {
      setDisputes(disputes.filter(dispute => dispute.id !== id))
      alert("Đã thu hồi đơn khiếu nại thành công!")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Đã duyệt</Badge>
      case "rejected":
        return <Badge variant="destructive">Từ chối</Badge>
      case "pending":
        return <Badge variant="outline">Đang xử lý</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Gửi Khiếu Nại Chấm Công</CardTitle>
              <CardDescription>Yêu cầu chỉnh sửa thông tin chấm công của bạn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="disputeDate">Ngày Cần Khiếu Nại</Label>
                <Input
                  id="disputeDate"
                  type="date"
                  value={disputeDate ? format(disputeDate, "yyyy-MM-dd") : ""}
                  onChange={(e) => setDisputeDate(e.target.value ? new Date(e.target.value) : undefined)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="disputeType">Loại Vấn Đề</Label>
                <Select value={disputeType} onValueChange={setDisputeType} required>
                  <SelectTrigger id="disputeType">
                    <SelectValue placeholder="Chọn loại vấn đề" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="missed-checkin">Quên Checkin</SelectItem>
                    <SelectItem value="missed-checkout">Quên Checkout</SelectItem>
                    <SelectItem value="wrong-time">Sai Giờ</SelectItem>
                    <SelectItem value="wrong-location">Sai Địa Điểm</SelectItem>
                    <SelectItem value="system-error">Lỗi Hệ Thống</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requestedChange">Yêu Cầu Thay Đổi</Label>
                <Input
                  id="requestedChange"
                  placeholder="Ví dụ: Thêm giờ checkout: 17:30"
                  value={requestedChange}
                  onChange={(e) => setRequestedChange(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Lý Do Khiếu Nại</Label>
                <Textarea
                  id="reason"
                  placeholder="Vui lòng giải thích lý do cần chỉnh sửa"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit">Gửi Khiếu Nại</Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lịch Sử Khiếu Nại</CardTitle>
            <CardDescription>Xem lịch sử khiếu nại chấm công của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-4 text-left font-medium">Ngày</th>
                    <th className="p-4 text-left font-medium">Vấn Đề</th>
                    <th className="p-4 text-left font-medium">Yêu Cầu Thay Đổi</th>
                    <th className="p-4 text-left font-medium">Lý Do</th>
                    <th className="p-4 text-left font-medium">Trạng Thái</th>
                    <th className="p-4 text-left font-medium">Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {disputes.map((dispute) => (
                    <tr key={dispute.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">{dispute.date}</td>
                      <td className="p-4">{dispute.type}</td>
                      <td className="p-4">{dispute.requestedChange}</td>
                      <td className="p-4">{dispute.reason}</td>
                      <td className="p-4">{getStatusBadge(dispute.status)}</td>
                      <td className="p-4">
                        {dispute.status === "pending" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleWithdraw(dispute.id)}
                          >
                            Thu hồi
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </EmployeeLayout>
  )
}

export default DisputesPage
