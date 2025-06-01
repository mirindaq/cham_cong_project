import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { EmployeeLayout } from "@/components/employee-layout";
import { Input } from "@/components/ui/input";
import { leaveTypeApi } from "@/services/leaveType.service";
import { toast } from "sonner";
import type { User } from "@/types/user.type";
import {
  LeaveRequestStatus,
  type LeaveRequestAdd,
  type LeaveRequestResponse,
} from "@/types/leaveRequest.type";
import { leaveRequestApi } from "@/services/leaveRequest.service";
import { localStorageUtil } from "@/utils/localStorageUtil";
import PaginationComponent from "@/components/PaginationComponent";
import type { WorkShift } from "@/types/workShiftAssignment.type";
import { workShiftApi } from "@/services/workShift.service";
import type { LeaveType } from "@/types/leaveType";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MoreHorizontal,
  Calendar,
  User as UserIcon,
  Building,
  FileText,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function LeaveRequestsPage() {
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [user, setUser] = useState<User>(
    localStorageUtil.getUserFromLocalStorage()
  );
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestResponse[]>(
    []
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [shifts, setShifts] = useState<WorkShift[]>([]);
  const [selectedShift, setSelectedShift] = useState("");
  const [loadingShifts, setLoadingShifts] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<any>(null);

  useEffect(() => {
    const loadShifts = async () => {
      setLoadingShifts(true);
      try {
        if (!startDate || !endDate) {
          setShifts([]);
          return;
        }
        const response =
          await workShiftApi.getWorkShiftsByEmployeeIdBetweenDate(
            user.id,
            format(startDate, "yyyy-MM-dd"),
            format(endDate, "yyyy-MM-dd")
          );
        setShifts(response);
      } catch (error) {
        console.error(error);
        toast.error("Có lỗi xảy ra khi tải dữ liệu ca làm");
      } finally {
        setLoadingShifts(false);
      }
    };
    loadShifts();
  }, [user, startDate, endDate]);

  useEffect(() => {
    const loadLeaveTypes = async () => {
      setLoading(true);
      try {
        const response = await leaveTypeApi.getLeaveTypeEnableInYear(user.id);
        setLeaveTypes(response);
      } catch (error) {
        console.error(error);
        toast.error("Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    loadLeaveTypes();
  }, []);

  const loadLeaveRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await leaveRequestApi.getAllLeaveRequestsByEmployee(
        user.id,
        currentPage,
        3
      );
      setLeaveRequests(response.data);
      setTotalPage(response.totalPage);
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [user, currentPage]);

  useEffect(() => {
    if (!user) return;
    loadLeaveRequests();
  }, [user, loadLeaveRequests]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error("Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc!");
      return;
    }

    if (!selectedShift) {
      toast.error("Vui lòng chọn ca làm việc!");
      return;
    }

    if (!user) {
      toast.error("User chưa đăng nhập!");
      return;
    }

    const newLeaveRequest: LeaveRequestAdd = {
      employeeId: user.id,
      startDate,
      endDate,
      reason,
      leaveTypeId: Number.parseInt(leaveType),
      workShiftId: Number.parseInt(selectedShift)
    };

    try {
      await leaveRequestApi.createLeaveRequest(newLeaveRequest);
      toast.success("Đăng ký giấy nghỉ phép thành công");
      setLeaveType("");
      setStartDate(undefined);
      setEndDate(undefined);
      setReason("");
      setSelectedShift("");
      loadLeaveRequests();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Lỗi khi thêm ngày nghỉ phép";
      toast.error(message);
    }
  };

  const getStatusBadge = (status: LeaveRequestStatus) => {
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

  if (!loading) {
    <div>Đang tải </div>;
  }

  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRecall = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn thu hồi đơn này?")) {
      try {
        await leaveRequestApi.recallLeaveRequest(id);
        toast.success("Đã thu hồi đơn thành công!");
        loadLeaveRequests();
      } catch (error) {
        console.error("Lỗi khi thu hồi đơn:", error);
        toast.error("Thu hồi đơn không thành công. Vui lòng thử lại.");
      }
    }
  };

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
                    {leaveTypes.map((item) => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.name}
                      </SelectItem>
                    ))}
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
                    onChange={(e) =>
                      setStartDate(
                        e.target.value ? new Date(e.target.value) : undefined
                      )
                    }
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
                    onChange={(e) =>
                      setEndDate(
                        e.target.value ? new Date(e.target.value) : undefined
                      )
                    }
                    min={
                      startDate
                        ? format(startDate, "yyyy-MM-dd")
                        : format(new Date(), "yyyy-MM-dd")
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shift">Ca làm muốn nghỉ</Label>
                <Select
                  value={selectedShift}
                  onValueChange={setSelectedShift}
                  disabled={loadingShifts}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn ca làm " />
                  </SelectTrigger>
                  <SelectContent>
                    {shifts.length > 0 && !loadingShifts ? (
                      shifts.map((shift) => (
                        <SelectItem key={shift.id} value={shift.id.toString()}>
                          {shift.name}
                          <br />
                          <span className=" text-muted-foreground">
                            {(shift.startTime || "00:00") +
                              " - " +
                              (shift.endTime || "00:00")}
                          </span>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        Không có ca làm việc nào
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
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
            <CardDescription>
              Xem lịch sử đơn xin nghỉ phép của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="border-b bg-muted/50">
                    <TableHead className="p-3 text-left font-medium">
                      STT
                    </TableHead>
                    <TableHead className="p-3 text-left font-medium">
                      Loại nghỉ phép
                    </TableHead>
                    <TableHead className="p-4 text-left font-medium">
                      Ngày tạo phiếu
                    </TableHead>
                    <TableHead className="p-3 text-left font-medium">
                      Nghỉ từ ngày
                    </TableHead>
                    <TableHead className="p-3 text-left font-medium">
                      Nghỉ đến ngày
                    </TableHead>
                    <TableHead className="p-3 text-left font-medium">
                      Trạng thái
                    </TableHead>
                    <TableHead className="p-3 text-left font-medium">
                      Lý do
                    </TableHead>
                    <TableHead className="p-3 text-left font-medium">
                      Thao tác
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="p-4 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : leaveRequests?.length > 0 ? (
                    leaveRequests.map((request) => (
                      <TableRow
                        key={request.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <TableCell className="p-3">
                          {leaveRequests.findIndex(
                            (req) => req.id === request.id
                          ) + 1}
                        </TableCell>
                        <TableCell className="p-3">
                          {request.leaveType.name}
                        </TableCell>
                        <TableCell className="p-3">
                          {request.createdAt
                            ? format(
                                parseISO(request.createdAt),
                                "dd/MM/yyyy HH:mm:ss"
                              )
                            : "N/A"}
                        </TableCell>
                        <TableCell className="p-3">
                          {request.startDate
                            ? format(parseISO(request.startDate), "dd/MM/yyyy")
                            : "N/A"}
                        </TableCell>
                        <TableCell className="p-3">
                          {request.endDate
                            ? format(parseISO(request.endDate), "dd/MM/yyyy")
                            : "N/A"}
                        </TableCell>
                        <TableCell className="p-3">
                          {getStatusBadge(request.status as LeaveRequestStatus)}
                        </TableCell>
                        <TableCell className="p-3">{request.reason}</TableCell>
                        <TableCell className="p-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost">
                                <MoreHorizontal />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedDetail(request);
                                  setShowDetailModal(true);
                                }}
                              >
                                Xem chi tiết
                              </DropdownMenuItem>
                              {request.status === "PENDING" && (
                                <DropdownMenuItem
                                  onClick={() => handleRecall(request.id)}
                                >
                                  Thu hồi
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="p-4 text-center text-muted-foreground"
                      >
                        Không có đơn xin nghỉ phép nào.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <PaginationComponent
                currentPage={currentPage}
                totalPage={totalPage}
                onPageChange={onPageChange}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="min-w-[800px] max-h-[90vh] overflow-y-auto p-0">
          <div className="bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <span className="text-base font-semibold">Chi tiết phiếu nghỉ phép</span>
              </div>
              {getStatusBadge(selectedDetail?.status)}
            </div>

            {selectedDetail && (
              <div className="px-6 py-4 space-y-6">
                {/* Thông tin nhân viên */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Họ tên:</span>
                    <span className="text-sm font-medium">{selectedDetail.employeeName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Bộ phận:</span>
                    <span className="text-sm font-medium">{selectedDetail.departmentName}</span>
                  </div>
                </div>

                {/* Thông tin nghỉ phép */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Loại nghỉ phép:</span>
                    <span className="text-sm font-medium">{selectedDetail.leaveType?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Ngày tạo:</span>
                    <span className="text-sm font-medium">{selectedDetail.createdAt ? format(parseISO(selectedDetail.createdAt), "dd/MM/yyyy HH:mm:ss") : "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Từ ngày:</span>
                    <span className="text-sm font-medium">{selectedDetail.startDate ? format(parseISO(selectedDetail.startDate), "dd/MM/yyyy") : "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Đến ngày:</span>
                    <span className="text-sm font-medium">{selectedDetail.endDate ? format(parseISO(selectedDetail.endDate), "dd/MM/yyyy") : "N/A"}</span>
                  </div>
                </div>

                {/* Lý do */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm text-muted-foreground font-medium">Lý do xin nghỉ:</span>
                  </div>
                  <div className="bg-gray-50 border rounded p-3 text-sm text-gray-700 whitespace-pre-line">
                    {selectedDetail.reason}
                  </div>
                </div>

                {/* Thông tin duyệt */}
                {(selectedDetail.status === "APPROVED" || selectedDetail.status === "REJECTED") && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground font-medium">Thông tin duyệt:</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Người duyệt:</span>
                        <span className="text-sm font-medium">{selectedDetail.responseBy || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Ngày duyệt:</span>
                        <span className="text-sm font-medium">
                          {selectedDetail.responseDate ? format(parseISO(selectedDetail.responseDate), "dd/MM/yyyy HH:mm:ss") : "N/A"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground font-medium">
                          Lý do {selectedDetail.status === "APPROVED" ? "duyệt" : "từ chối"}:
                        </span>
                      </div>
                      <div className="bg-gray-50 border rounded p-3 text-sm text-gray-700 whitespace-pre-line">
                        {selectedDetail.responseNote || "N/A"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="flex flex-col sm:flex-row gap-2 px-6 pb-6 pt-2 border-t mt-2">
              <Button
                variant="outline"
                onClick={() => setShowDetailModal(false)}
                className="flex-1 sm:flex-none"
              >
                Đóng
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </EmployeeLayout>
  );
}

export default LeaveRequestsPage;
