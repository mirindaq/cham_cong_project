import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { EmployeeLayout } from "@/components/employee-layout"
import { vi } from "date-fns/locale"
import { Input } from "@/components/ui/input"

function LeaveRequestsPage() {
  const [leaveType, setLeaveType] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [reason, setReason] = useState("")

  // Mock leave requests data
  const leaveRequests = [
    {
      id: 1,
      type: "Annual Leave",
      startDate: "2025-05-20",
      endDate: "2025-05-22",
      status: "pending",
      reason: "Family vacation",
    },
    {
      id: 2,
      type: "Sick Leave",
      startDate: "2025-04-16",
      endDate: "2025-04-17",
      status: "approved",
      reason: "Doctor's appointment",
    },
    {
      id: 3,
      type: "Personal Leave",
      startDate: "2025-03-10",
      endDate: "2025-03-10",
      status: "approved",
      reason: "Personal matters",
    },
    {
      id: 4,
      type: "Annual Leave",
      startDate: "2025-02-05",
      endDate: "2025-02-07",
      status: "rejected",
      reason: "Family event",
    },
  ]

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // In a real app, this would send the data to an API
    alert("Leave request submitted successfully!")
    // Reset form
    setLeaveType("")
    setStartDate(undefined)
    setEndDate(undefined)
    setReason("")
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
              <CardTitle>Đăng ký nghỉ phép</CardTitle>
              <CardDescription>Gửi đơn xin nghỉ phép mới</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="leaveType">Loại nghỉ phép</Label>
                <Select value={leaveType} onValueChange={setLeaveType} required>
                  <SelectTrigger id="leaveType">
                    <SelectValue placeholder="Chọn loại nghỉ phép" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">Nghỉ phép năm</SelectItem>
                    <SelectItem value="sick">Nghỉ ốm</SelectItem>
                    <SelectItem value="personal">Nghỉ việc riêng</SelectItem>
                    <SelectItem value="unpaid">Nghỉ không lương</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Từ ngày</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    className="w-full"
                    value={startDate ? format(startDate, "yyyy-MM-dd") : ""}
                    onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : undefined)}
                    min={format(new Date(), "yyyy-MM-dd")}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">Đến ngày</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    className="w-full"
                    value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
                    onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : undefined)}
                    min={startDate ? format(startDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Lý do nghỉ phép</Label>
                <Textarea
                  id="reason"
                  placeholder="Vui lòng cung cấp lý do xin nghỉ phép"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit">Gửi đơn xin nghỉ</Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lịch sử nghỉ phép</CardTitle>
            <CardDescription>Xem lịch sử đơn xin nghỉ phép của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left font-medium">Loại nghỉ phép</th>
                    <th className="p-3 text-left font-medium">Từ ngày</th>
                    <th className="p-3 text-left font-medium">Đến ngày</th>
                    <th className="p-3 text-left font-medium">Trạng thái</th>
                    <th className="p-3 text-left font-medium">Lý do</th>
                    <th className="p-3 text-left font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveRequests.map((request) => (
                    <tr key={request.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">{request.type}</td>
                      <td className="p-3">{request.startDate}</td>
                      <td className="p-3">{request.endDate}</td>
                      <td className="p-3">{getStatusBadge(request.status)}</td>
                      <td className="p-3">{request.reason}</td>
                      <td className="p-3">
                        {request.status === "pending" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (window.confirm("Bạn có chắc chắn muốn thu hồi đơn này?")) {
                                // Xử lý thu hồi đơn ở đây
                                alert("Đã thu hồi đơn thành công!")
                              }
                            }}
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

export default LeaveRequestsPage
