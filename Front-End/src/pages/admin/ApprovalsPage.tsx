import { useState } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface LeaveRequest {
  id: number
  employeeName: string
  employeeId: string
  department: string
  type: string
  fromDate: string
  toDate: string
  reason: string
  status: "pending" | "approved" | "rejected"
}

interface AttendanceDispute {
  id: number
  employeeName: string
  employeeId: string
  department: string
  date: string
  issue: string
  requestedChange: string
  reason: string
  status: "pending" | "approved" | "rejected"
}

export default function ApprovalsPage() {
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null)
  const [selectedRequestType, setSelectedRequestType] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  // Dữ liệu mẫu cho các yêu cầu nghỉ phép
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    {
      id: 1,
      employeeName: "Nguyễn Văn A",
      employeeId: "NV001",
      department: "Kỹ thuật",
      type: "Nghỉ phép năm",
      fromDate: "2025-06-10",
      toDate: "2025-06-15",
      reason: "Du lịch gia đình",
      status: "pending",
    },
    {
      id: 2,
      employeeName: "Trần Thị B",
      employeeId: "NV025",
      department: "Nhân sự",
      type: "Nghỉ ốm",
      fromDate: "2025-06-05",
      toDate: "2025-06-06",
      reason: "Khám bệnh",
      status: "pending",
    },
    {
      id: 3,
      employeeName: "Lê Văn C",
      employeeId: "NV042",
      department: "Kế toán",
      type: "Nghỉ việc riêng",
      fromDate: "2025-06-20",
      toDate: "2025-06-20",
      reason: "Giải quyết thủ tục hành chính",
      status: "pending",
    },
  ])

  // Dữ liệu mẫu cho khiếu nại chấm công
  const [attendanceDisputes, setAttendanceDisputes] = useState<AttendanceDispute[]>([
    {
      id: 1,
      employeeName: "Phạm Thị D",
      employeeId: "NV017",
      department: "Marketing",
      date: "2025-05-28",
      issue: "Quên check-out",
      requestedChange: "Thêm giờ check-out: 17:30",
      reason: "Hệ thống mạng bị lỗi khi chuẩn bị check-out",
      status: "pending",
    },
    {
      id: 2,
      employeeName: "Hoàng Văn E",
      employeeId: "NV033",
      department: "Kinh doanh",
      date: "2025-05-30",
      issue: "Máy chấm công lỗi",
      requestedChange: "Đánh dấu là đã check-in lúc 8:30",
      reason: "Đã có mặt nhưng máy chấm công không hoạt động",
      status: "pending",
    },
  ])

  const handleApprove = (type: string, id: number) => {
    if (type === "Đơn nghỉ phép") {
      setLeaveRequests(
        leaveRequests.map((req) => (req.id === id ? { ...req, status: "approved" } : req))
      )
    } else {
      setAttendanceDisputes(
        attendanceDisputes.map((dispute) => (dispute.id === id ? { ...dispute, status: "approved" } : dispute))
      )
    }
    alert(`Đã phê duyệt ${type.toLowerCase()}!`)
  }

  const handleOpenRejectDialog = (type: string, id: number) => {
    setSelectedRequestType(type)
    setSelectedRequestId(id)
    setShowRejectDialog(true)
  }

  const handleReject = () => {
    if (selectedRequestType === "Đơn nghỉ phép" && selectedRequestId) {
      setLeaveRequests(
        leaveRequests.map((req) =>
          req.id === selectedRequestId ? { ...req, status: "rejected" } : req
        )
      )
    } else if (selectedRequestType === "Khiếu nại chấm công" && selectedRequestId) {
      setAttendanceDisputes(
        attendanceDisputes.map((dispute) =>
          dispute.id === selectedRequestId ? { ...dispute, status: "rejected" } : dispute
        )
      )
    }

    setShowRejectDialog(false)
    setRejectReason("")
    setSelectedRequestId(null)
    setSelectedRequestType(null)

    alert(`Đã từ chối ${selectedRequestType?.toLowerCase()}!`)
  }

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <CardTitle>Phê duyệt yêu cầu</CardTitle>
          <CardDescription>Phê duyệt các yêu cầu nghỉ phép và khiếu nại chấm công</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="leave" className="space-y-4">
            <TabsList>
              <TabsTrigger value="leave">Đơn nghỉ phép</TabsTrigger>
              <TabsTrigger value="disputes">Khiếu nại chấm công</TabsTrigger>
            </TabsList>

            <TabsContent value="leave" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Đơn nghỉ phép đang chờ duyệt</CardTitle>
                  <CardDescription>Xem xét và phê duyệt các đơn xin nghỉ phép</CardDescription>
                </CardHeader>
                <CardContent>
                  {leaveRequests.filter(req => req.status === "pending").length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">Không có đơn nghỉ phép nào đang chờ duyệt</div>
                  ) : (
                    <div className="rounded-md border">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="p-2 text-left font-medium">Nhân viên</th>
                            <th className="p-2 text-left font-medium">Mã NV</th>
                            <th className="p-2 text-left font-medium">Bộ phận</th>
                            <th className="p-2 text-left font-medium">Loại nghỉ phép</th>
                            <th className="p-2 text-left font-medium">Từ ngày</th>
                            <th className="p-2 text-left font-medium">Đến ngày</th>
                            <th className="p-2 text-left font-medium">Lý do</th>
                            <th className="p-2 text-left font-medium">Trạng thái</th>
                            <th className="p-2 text-left font-medium">Hành động</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leaveRequests
                            .filter(req => req.status === "pending")
                            .map((request) => (
                              <tr key={request.id} className="border-b">
                                <td className="p-2">{request.employeeName}</td>
                                <td className="p-2">{request.employeeId}</td>
                                <td className="p-2">{request.department}</td>
                                <td className="p-2">{request.type}</td>
                                <td className="p-2">{request.fromDate}</td>
                                <td className="p-2">{request.toDate}</td>
                                <td className="p-2">{request.reason}</td>
                                <td className="p-2">
                                  <Badge>Chờ duyệt</Badge>
                                </td>
                                <td className="p-2 space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-destructive"
                                    onClick={() => handleOpenRejectDialog("Đơn nghỉ phép", request.id)}
                                  >
                                    Từ chối
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleApprove("Đơn nghỉ phép", request.id)}
                                  >
                                    Duyệt
                                  </Button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="disputes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Khiếu nại chấm công đang chờ duyệt</CardTitle>
                  <CardDescription>Xem xét và xử lý các khiếu nại chấm công</CardDescription>
                </CardHeader>
                <CardContent>
                  {attendanceDisputes.filter(dispute => dispute.status === "pending").length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">Không có khiếu nại chấm công nào đang chờ duyệt</div>
                  ) : (
                    <div className="rounded-md border">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="p-2 text-left font-medium">Nhân viên</th>
                            <th className="p-2 text-left font-medium">Mã NV</th>
                            <th className="p-2 text-left font-medium">Bộ phận</th>
                            <th className="p-2 text-left font-medium">Ngày</th>
                            <th className="p-2 text-left font-medium">Vấn đề</th>
                            <th className="p-2 text-left font-medium">Yêu cầu thay đổi</th>
                            <th className="p-2 text-left font-medium">Lý do</th>
                            <th className="p-2 text-left font-medium">Trạng thái</th>
                            <th className="p-2 text-left font-medium">Hành động</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendanceDisputes
                            .filter(dispute => dispute.status === "pending")
                            .map((dispute) => (
                              <tr key={dispute.id} className="border-b">
                                <td className="p-2">{dispute.employeeName}</td>
                                <td className="p-2">{dispute.employeeId}</td>
                                <td className="p-2">{dispute.department}</td>
                                <td className="p-2">{dispute.date}</td>
                                <td className="p-2">{dispute.issue}</td>
                                <td className="p-2">{dispute.requestedChange}</td>
                                <td className="p-2">{dispute.reason}</td>
                                <td className="p-2">
                                  <Badge>Chờ duyệt</Badge>
                                </td>
                                <td className="p-2 space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-destructive"
                                    onClick={() => handleOpenRejectDialog("Khiếu nại chấm công", dispute.id)}
                                  >
                                    Từ chối
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleApprove("Khiếu nại chấm công", dispute.id)}
                                  >
                                    Duyệt
                                  </Button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối yêu cầu</DialogTitle>
            <DialogDescription>Hãy cung cấp lý do từ chối.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Lý do từ chối</Label>
              <Textarea
                id="reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối yêu cầu"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowRejectDialog(false)}>
              Hủy
            </Button>
            <Button type="button" onClick={handleReject} disabled={!rejectReason.trim()}>
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
