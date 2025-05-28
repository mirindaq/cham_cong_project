import { useCallback, useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  LeaveRequestStatus,
  type LeaveRequestResponse,
} from "@/types/leaveRequest.type";
import { leaveRequestApi } from "@/services/leaveRequest.service";
import { toast } from "sonner";
import {
  ComplaintStatus,
  ComplaintType,
  type ComplaintResponse,
} from "@/types/complaint.type";
import { complaintApi } from "@/services/complaint.service";
import { format, parseISO } from "date-fns";

export default function ApprovalsPage() {
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(
    null
  );
  const [selectedRequestType, setSelectedRequestType] = useState<string | null>(
    null
  );
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestResponse[]>();
  const [complaints, setComplaints] = useState<ComplaintResponse[]>([]);

  const loadLeaveRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await leaveRequestApi.getAllLeaveRequests();
      setLeaveRequests(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const response = await complaintApi.getAllComplaints();
      setComplaints(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaveRequests();
    loadComplaints();
  }, [loadLeaveRequests, loadComplaints]);

  const handleApprove = (type: string, id: number) => {
    // if (type === "Đơn nghỉ phép") {
    //   setLeaveRequests(
    //     leaveRequests.map((req) =>
    //       req.id === id ? { ...req, status: "approved" } : req
    //     )
    //   );
    // } else {
    //   setAttendanceDisputes(
    //     attendanceDisputes.map((dispute) =>
    //       dispute.id === id ? { ...dispute, status: "approved" } : dispute
    //     )
    //   );
    // }
    alert(`Đã phê duyệt ${type.toLowerCase()}!`);
  };

  const handleOpenRejectDialog = (type: string, id: number) => {
    setSelectedRequestType(type);
    setSelectedRequestId(id);
    setShowRejectDialog(true);
  };

  const handleReject = () => {
    // if (selectedRequestType === "Đơn nghỉ phép" && selectedRequestId) {
    //   setLeaveRequests(
    //     leaveRequests.map((req) =>
    //       req.id === selectedRequestId ? { ...req, status: "rejected" } : req
    //     )
    //   );
    // } else if (
    //   selectedRequestType === "Khiếu nại chấm công" &&
    //   selectedRequestId
    // ) {
    //   setAttendanceDisputes(
    //     attendanceDisputes.map((dispute) =>
    //       dispute.id === selectedRequestId
    //         ? { ...dispute, status: "rejected" }
    //         : dispute
    //     )
    //   );
    // }

    setShowRejectDialog(false);
    setRejectReason("");
    setSelectedRequestId(null);
    setSelectedRequestType(null);

    alert(`Đã từ chối ${selectedRequestType?.toLowerCase()}!`);
  };

  const getStatusBadge = (status: ComplaintStatus | LeaveRequestStatus) => {
    switch (status) {
      case LeaveRequestStatus.APPROVED:
        return <Badge className="bg-green-600 text-white">Đã duyệt</Badge>;
      case LeaveRequestStatus.REJECTED:
        return <Badge variant="destructive">Từ chối</Badge>;
      case LeaveRequestStatus.PENDING:
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            Đang xử lý
          </Badge>
        );
      case LeaveRequestStatus.RECALLED:
        return (
          <Badge
            variant="outline"
            className="text-yellow-600 border-yellow-600"
          >
            Đã thu hồi
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <CardTitle>Phê duyệt yêu cầu</CardTitle>
          <CardDescription>
            Phê duyệt các yêu cầu nghỉ phép và khiếu nại chấm công
          </CardDescription>
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
                  <CardDescription>
                    Xem xét và phê duyệt các đơn xin nghỉ phép
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {leaveRequests?.filter(
                    (req) => req.status === LeaveRequestStatus.PENDING
                  ).length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      Không có đơn nghỉ phép nào đang chờ duyệt
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="p-2 text-left font-medium">
                              Nhân viên
                            </th>
                            <th className="p-2 text-left font-medium">
                              Bộ phận
                            </th>
                            <th className="p-3 text-left font-medium">
                              Loại nghỉ phép
                            </th>
                            <th className="p-3 text-left font-medium">
                              Ngày tạo
                            </th>
                            <th className="p-3 text-left font-medium">
                              Từ ngày
                            </th>
                            <th className="p-3 text-left font-medium">
                              Đến ngày
                            </th>
                            <th className="p-3 text-left font-medium">Lý do</th>
                            <th className="p-3 text-left font-medium">
                              Trạng thái
                            </th>
                            <th className="p-3 text-left font-medium">
                              Thao tác
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {loading ? (
                            <tr>
                              <td colSpan={9} className="p-4 text-center">
                                <div className="flex items-center justify-center">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                </div>
                              </td>
                            </tr>
                          ) : leaveRequests?.map((request) => (
                            <tr key={request.id} className="border-b">
                              <td className="p-2 text-left font-medium">
                                {request.employeeName}
                              </td>
                              <td className="p-2 text-left font-medium">
                                {request.departmentName}
                              </td>
                              <td className="p-2 text-left font-medium">
                                {request.leaveType.name}
                              </td>
                              <td className="p-2 text-left font-medium">
                                {request.createdAt
                                  ? format(
                                      parseISO(request.createdAt),
                                      "dd/MM/yyyy HH:mm:ss"
                                    )
                                  : "N/A"}
                              </td>
                              <td className="p-2 text-left font-medium">
                                {request.startDate}
                              </td>
                              <td className="p-2 text-left font-medium">
                                {request.endDate}
                              </td>
                              <td className="p-2 text-left font-medium">
                                {request.reason}
                              </td>
                              <td className="p-3">
                                {getStatusBadge(
                                  request.status as LeaveRequestStatus
                                )}
                              </td>
                              <td className="p-2 text-left font-medium space-x-2">
                                {request.status === LeaveRequestStatus.PENDING && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-destructive"
                                      onClick={() =>
                                        handleOpenRejectDialog(
                                          "Đơn nghỉ phép",
                                          request.id
                                        )
                                      }
                                    >
                                      Từ chối
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleApprove("Đơn nghỉ phép", request.id)
                                      }
                                    >
                                      Duyệt
                                    </Button>
                                  </>
                                )}
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
                  <CardDescription>
                    Xem xét và xử lý các khiếu nại chấm công
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {complaints.filter(
                    (complaint) => complaint.status === ComplaintStatus.PENDING
                  ).length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      Không có khiếu nại chấm công nào đang chờ duyệt
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="p-2 text-left font-medium">
                              Nhân viên
                            </th>
                            <th className="p-2 text-left font-medium">
                              Bộ phận
                            </th>
                            <th className="p-4 text-left font-medium">
                              Ngày cần khiếu nại
                            </th>
                            <th className="p-4 text-left font-medium">
                              Ngày tạo
                            </th>
                            <th className="p-4 text-left font-medium">
                              Loại khiếu nại
                            </th>
                            <th className="p-4 text-left font-medium">Lý Do</th>
                            <th className="p-4 text-left font-medium">
                              Ngày phản hồi
                            </th>
                            <th className="p-4 text-left font-medium">
                              Người phản hồi
                            </th>

                            <th className="p-4 text-left font-medium">
                              Trạng thái
                            </th>
                            <th className="p-4 text-left font-medium">
                              Hành động
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {loading ? (
                            <tr>
                              <td colSpan={10} className="p-4 text-center">
                                <div className="flex items-center justify-center">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                </div>
                              </td>
                            </tr>
                          ) : complaints.map((complaint) => (
                            <tr key={complaint.id} className="border-b">
                              <td className="p-2">
                                {complaint.employeeFullName}
                              </td>
                              <td className="p-2">
                                {complaint.departmentName}
                              </td>
                              <td className="p-4">{complaint.date}</td>
                              <td className="p-4">
                                {complaint.createdAt
                                  ? format(
                                      parseISO(complaint.createdAt),
                                      "dd/MM/yyyy HH:mm:ss"
                                    )
                                  : "N/A"}
                              </td>

                              <td className="p-4">
                                {ComplaintType[
                                  complaint.complaintType as keyof typeof ComplaintType
                                ] ?? complaint.complaintType}
                              </td>
                              <td className="p-4">{complaint.reason}</td>
                              <td className="p-4">{complaint.responseDate}</td>
                              <td className="p-4">
                                {complaint.responseByFullName}
                              </td>

                              <td className="p-4">
                                {getStatusBadge(complaint.status)}
                              </td>
                              <td className="p-2 space-x-2">
                                {complaint.status === ComplaintStatus.PENDING && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-destructive"
                                      onClick={() =>
                                        handleOpenRejectDialog(
                                          "Đơn nghỉ phép",
                                          complaint.id
                                        )
                                      }
                                    >
                                      Từ chối
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleApprove("Đơn nghỉ phép", complaint.id)
                                      }
                                    >
                                      Duyệt
                                    </Button>
                                  </>
                                )}
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
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleReject}
              disabled={!rejectReason.trim()}
            >
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
