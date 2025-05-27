import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminLayout } from "@/components/admin-layout"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Eye, Check, X } from "lucide-react"

interface DisputeRecord {
  id: string
  employeeId: string
  employeeName: string
  date: string
  createdAt: string
  reason: string
  requestedChange: string
  status: "pending" | "approved" | "rejected"
  originalCheckIn?: string
  originalCheckOut?: string
  requestedCheckIn?: string
  requestedCheckOut?: string
  adminResponse?: string
}

export default function DisputePage() {
  const [selectedDispute, setSelectedDispute] = useState<DisputeRecord | null>(null)
  const [showDisputeDialog, setShowDisputeDialog] = useState(false)
  const [adminResponse, setAdminResponse] = useState("")
  const [responseStatus, setResponseStatus] = useState<"approved" | "rejected">("approved")

  // Dữ liệu mẫu
  const disputes: DisputeRecord[] = [
    {
      id: "1",
      employeeId: "E001",
      employeeName: "Nguyễn Văn A",
      date: "2025-05-16",
      createdAt: "2025-05-17 09:30",
      reason: "Quên check-out",
      requestedChange: "Thêm giờ check-out",
      status: "pending",
      originalCheckIn: "08:30",
      originalCheckOut: "",
      requestedCheckIn: "08:30",
      requestedCheckOut: "17:30",
    },
    {
      id: "2",
      employeeId: "E002",
      employeeName: "Trần Thị B",
      date: "2025-05-15",
      createdAt: "2025-05-16 08:15",
      reason: "Lỗi hệ thống",
      requestedChange: "Sửa giờ check-in",
      status: "approved",
      originalCheckIn: "09:15",
      originalCheckOut: "17:30",
      requestedCheckIn: "08:30",
      requestedCheckOut: "17:30",
      adminResponse: "Đã xác nhận với IT về lỗi hệ thống",
    },
    {
      id: "3",
      employeeId: "E003",
      employeeName: "Lê Văn C",
      date: "2025-05-14",
      createdAt: "2025-05-15 10:20",
      reason: "Không thể check-in do họp khách hàng",
      requestedChange: "Thêm cả check-in và check-out",
      status: "rejected",
      originalCheckIn: "",
      originalCheckOut: "",
      requestedCheckIn: "08:00",
      requestedCheckOut: "17:00",
      adminResponse: "Không có xác nhận từ quản lý trực tiếp về cuộc họp",
    },
    {
      id: "4",
      employeeId: "E004",
      employeeName: "Phạm Thị D",
      date: "2025-05-13",
      createdAt: "2025-05-14 09:05",
      reason: "Check-in muộn do kẹt xe",
      requestedChange: "Sửa giờ check-in",
      status: "approved",
      originalCheckIn: "09:45",
      originalCheckOut: "18:00",
      requestedCheckIn: "08:30",
      requestedCheckOut: "18:00",
      adminResponse: "Đã xác nhận với bảo vệ về thời gian đến",
    },
    {
      id: "5",
      employeeId: "E001",
      employeeName: "Nguyễn Văn A",
      date: "2025-05-12",
      createdAt: "2025-05-13 08:30",
      reason: "Quên check-in",
      requestedChange: "Thêm giờ check-in",
      status: "pending",
      originalCheckIn: "",
      originalCheckOut: "17:30",
      requestedCheckIn: "08:30",
      requestedCheckOut: "17:30",
    },
  ]

  const pendingDisputes = disputes.filter(dispute => dispute.status === "pending")
  const resolvedDisputes = disputes.filter(dispute => dispute.status !== "pending")

  const handleViewDispute = (dispute: DisputeRecord) => {
    setSelectedDispute(dispute)
    setShowDisputeDialog(true)
    setAdminResponse(dispute.adminResponse || "")
    setResponseStatus(dispute.status === "approved" ? "approved" : "rejected")
  }

  const handleResolveDispute = () => {
    // Trong ứng dụng thực tế, đây sẽ là API call
    alert(`Đã ${responseStatus === "approved" ? "chấp nhận" : "từ chối"} khiếu nại với phản hồi: ${adminResponse}`)
    setShowDisputeDialog(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Đang xử lý</Badge>
      case "approved":
        return <Badge variant="success">Đã duyệt</Badge>
      case "rejected":
        return <Badge variant="destructive">Từ chối</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Quản Lý Khiếu Nại Chấm Công</h1>
          <p className="text-muted-foreground">Xử lý các yêu cầu điều chỉnh chấm công từ nhân viên</p>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList>
            <TabsTrigger value="pending">Đang chờ xử lý ({pendingDisputes.length})</TabsTrigger>
            <TabsTrigger value="resolved">Đã xử lý ({resolvedDisputes.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Khiếu nại đang chờ xử lý</CardTitle>
                <CardDescription>Các yêu cầu điều chỉnh chấm công cần được xử lý</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-2 text-left font-medium">ID</th>
                        <th className="p-2 text-left font-medium">Nhân viên</th>
                        <th className="p-2 text-left font-medium">Ngày</th>
                        <th className="p-2 text-left font-medium">Lý do</th>
                        <th className="p-2 text-left font-medium">Yêu cầu</th>
                        <th className="p-2 text-left font-medium">Ngày tạo</th>
                        <th className="p-2 text-center font-medium">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingDisputes.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-4 text-center text-muted-foreground">
                            Không có khiếu nại nào đang chờ xử lý
                          </td>
                        </tr>
                      ) : (
                        pendingDisputes.map((dispute) => (
                          <tr key={dispute.id} className="border-b">
                            <td className="p-2">{dispute.id}</td>
                            <td className="p-2">{dispute.employeeName}</td>
                            <td className="p-2">{dispute.date}</td>
                            <td className="p-2">{dispute.reason}</td>
                            <td className="p-2">{dispute.requestedChange}</td>
                            <td className="p-2">{dispute.createdAt}</td>
                            <td className="p-2 text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDispute(dispute)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Xem
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="resolved" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Khiếu nại đã xử lý</CardTitle>
                <CardDescription>Lịch sử các yêu cầu điều chỉnh đã được xử lý</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-2 text-left font-medium">ID</th>
                        <th className="p-2 text-left font-medium">Nhân viên</th>
                        <th className="p-2 text-left font-medium">Ngày</th>
                        <th className="p-2 text-left font-medium">Lý do</th>
                        <th className="p-2 text-left font-medium">Trạng thái</th>
                        <th className="p-2 text-left font-medium">Ngày xử lý</th>
                        <th className="p-2 text-center font-medium">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resolvedDisputes.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-4 text-center text-muted-foreground">
                            Không có khiếu nại nào đã được xử lý
                          </td>
                        </tr>
                      ) : (
                        resolvedDisputes.map((dispute) => (
                          <tr key={dispute.id} className="border-b">
                            <td className="p-2">{dispute.id}</td>
                            <td className="p-2">{dispute.employeeName}</td>
                            <td className="p-2">{dispute.date}</td>
                            <td className="p-2">{dispute.reason}</td>
                            <td className="p-2">{getStatusBadge(dispute.status)}</td>
                            <td className="p-2">{dispute.createdAt}</td>
                            <td className="p-2 text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDispute(dispute)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Xem
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog xem chi tiết khiếu nại */}
      <Dialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết khiếu nại</DialogTitle>
            <DialogDescription>
              Xem và xử lý yêu cầu điều chỉnh chấm công
            </DialogDescription>
          </DialogHeader>

          {selectedDispute && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Thông tin nhân viên</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID:</span>
                      <span>{selectedDispute.employeeId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tên:</span>
                      <span>{selectedDispute.employeeName}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Thông tin khiếu nại</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID khiếu nại:</span>
                      <span>{selectedDispute.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ngày tạo:</span>
                      <span>{selectedDispute.createdAt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Trạng thái:</span>
                      <span>{getStatusBadge(selectedDispute.status)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Chi tiết yêu cầu</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Ngày chấm công</Label>
                      <Input value={selectedDispute.date} readOnly />
                    </div>
                    <div>
                      <Label>Lý do</Label>
                      <Input value={selectedDispute.reason} readOnly />
                    </div>
                  </div>

                  <div className="border rounded-md p-4 mt-4">
                    <h4 className="font-medium mb-2">Thông tin chấm công</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium mb-2">Hiện tại</h5>
                        <div className="space-y-2">
                          <div>
                            <Label>Check-in</Label>
                            <Input value={selectedDispute.originalCheckIn || "Không có"} readOnly />
                          </div>
                          <div>
                            <Label>Check-out</Label>
                            <Input value={selectedDispute.originalCheckOut || "Không có"} readOnly />
                          </div>
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium mb-2">Yêu cầu thay đổi</h5>
                        <div className="space-y-2">
                          <div>
                            <Label>Check-in</Label>
                            <Input value={selectedDispute.requestedCheckIn || "Không thay đổi"} readOnly />
                          </div>
                          <div>
                            <Label>Check-out</Label>
                            <Input value={selectedDispute.requestedCheckOut || "Không thay đổi"} readOnly />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {selectedDispute.status === "pending" && (
                <div className="space-y-2">
                  <h3 className="font-medium">Phản hồi</h3>
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor="responseStatus">Trạng thái</Label>
                      <Select value={responseStatus} onValueChange={(value: "approved" | "rejected") => setResponseStatus(value)}>
                        <SelectTrigger id="responseStatus">
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="approved">Chấp nhận</SelectItem>
                          <SelectItem value="rejected">Từ chối</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="adminResponse">Nội dung phản hồi</Label>
                      <Textarea
                        id="adminResponse"
                        value={adminResponse}
                        onChange={(e) => setAdminResponse(e.target.value)}
                        placeholder="Nhập nội dung phản hồi cho nhân viên"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedDispute.status !== "pending" && selectedDispute.adminResponse && (
                <div className="space-y-2">
                  <h3 className="font-medium">Phản hồi từ quản trị viên</h3>
                  <div className="border rounded-md p-3 bg-muted/50">
                    <p>{selectedDispute.adminResponse}</p>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDisputeDialog(false)}
                >
                  Đóng
                </Button>
                {selectedDispute.status === "pending" && (
                  <Button
                    type="button"
                    onClick={handleResolveDispute}
                    variant={responseStatus === "approved" ? "default" : "destructive"}
                  >
                    {responseStatus === "approved" ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Chấp nhận
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Từ chối
                      </>
                    )}
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
} 