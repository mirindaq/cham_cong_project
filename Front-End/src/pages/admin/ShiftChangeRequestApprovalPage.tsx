import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MoreHorizontal,
  Eye,
  FileText,
  UserIcon,
  Building,
  Calendar,
  Clock,
  AlertCircle,
  Users,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { Textarea } from "@/components/ui/textarea";
import { AdminLayout } from "@/components/admin-layout";
import {
  ShiftChangeRequestStatus,
  type ShiftChangeRequestResponse,
} from "@/types/shiftChangeRequest.type";
import { useSearchParams } from "react-router";
import { shiftChangeRequestApi } from "@/services/shiftChangeRequest.service";
import { departmentApi } from "@/services/department.service";
import { workShiftApi } from "@/services/workShift.service";
import type { Department } from "@/types/department.type";
import type { WorkShiftResponse } from "@/types/workShift.type";
import PaginationComponent from "@/components/PaginationComponent";
import Spinner from "@/components/Spinner";

export default function ShiftChangeRequestApprovalPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({
    employeeName: "",
    createdDate: "",
    date: "",
    departmentId: "all",
    workShiftId: "all",
    status: "all",
  });

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<ShiftChangeRequestResponse | null>(null);
  const [responseNote, setResponseNote] = useState("");
  const [shiftChangeRequests, setShiftChangeRequests] = useState<
    ShiftChangeRequestResponse[]
  >([]);
  const [currentPage, setCurrentPage] = useState<number>(
    Number(searchParams.get("page")) || 1
  );
  const [totalPage, setTotalPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [loadingAction, setLoadingAction] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [workShifts, setWorkShifts] = useState<WorkShiftResponse[]>([]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [departmentsData, shiftsData] = await Promise.all([
          departmentApi.getAllDepartments(),
          workShiftApi.getAllShifts(),
        ]);

        setDepartments(departmentsData);
        setWorkShifts(shiftsData);
      } catch (error) {
        console.error(error);
        toast.error("Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    loadShiftChangeRequests();
  }, [searchParams]);

  const loadShiftChangeRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams);
      params.set("page", currentPage.toString());
      const response = await shiftChangeRequestApi.getShiftChangeRequestAdmin(
        params
      );

      setShiftChangeRequests(response.data);
      setTotalItems(response.totalItem);
      setTotalPage(response.totalPage);
    } catch (error) {
      toast.error("Không thể tải dữ liệu yêu cầu đổi ca");
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    const newParams = new URLSearchParams();
    if (filter.employeeName) {
      newParams.set("employeeName", filter.employeeName);
    }
    if (filter.createdDate) {
      newParams.set("createdDate", filter.createdDate);
    }
    if (filter.date) {
      newParams.set("date", filter.date);
    }
    if (filter.departmentId && filter.departmentId !== "all") {
      newParams.set("departmentId", filter.departmentId);
    }
    if (filter.workShiftId && filter.workShiftId !== "all") {
      newParams.set("workShiftId", filter.workShiftId);
    }
    if (filter.status && filter.status !== "all") {
      newParams.set("status", filter.status);
    }
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    try {
      await shiftChangeRequestApi.adminApproveShiftChangeRequest(
        selectedRequest.id,
        {
          responseNote,
        }
      );
      setShowDetailModal(false);
      setResponseNote("");
      toast.success("Đã duyệt yêu cầu đổi ca!");
      await loadShiftChangeRequests();
    } catch (error: any) {
      if (error.message === "Cannot approve shift change request with past date or work shift that has already started") {
        toast.error("Không thể duyệt yêu cầu đổi ca vì ngày yêu cầu đã qua hoặc ca làm việc đã bắt đầu!");
      } else if (error.message === "Target employee cannot have work shift required for this shift change request") {
        toast.error("Không thể duyệt yêu cầu đổi ca vì nhân viên được yêu cầu không sở hữu ca làm việc này!");
      } else {
        toast.error("Có lỗi xảy ra. Vui lòng thử lại!");
      }
    } 
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    setLoadingAction(true);
    try {
      await shiftChangeRequestApi.adminRejectShiftChangeRequest(
        selectedRequest.id,
        {
          responseNote,
        }
      );

      setShowDetailModal(false);
      setResponseNote("");
      await loadShiftChangeRequests();
      toast.success("Đã từ chối yêu cầu đổi ca!");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi từ chối yêu cầu");
    } finally {
      setLoadingAction(false);
    }
  };

  const getStatusBadge = (status: ShiftChangeRequestStatus) => {
    switch (status) {
      case ShiftChangeRequestStatus.PENDING:
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            Chờ nhân viên xác nhận
          </Badge>
        );

      case ShiftChangeRequestStatus.PENDING_APPROVAL:
        return <Badge className="bg-orange-500 text-white">Chờ quản lý duyệt</Badge>;

      case ShiftChangeRequestStatus.REJECTED_APPROVAL:
        return (
          <Badge className="bg-red-50 text-red-600 border border-red-200">
            Nhân viên từ chối
          </Badge>
        );

      case ShiftChangeRequestStatus.APPROVED:
        return <Badge className="bg-green-600 text-white">Quản lý đã duyệt</Badge>;

      case ShiftChangeRequestStatus.REJECTED:
        return (
          <Badge className="bg-red-600 text-white border-red-600 hover:bg-red-700">
            Quản lý đã từ chối
          </Badge>
        );

      case ShiftChangeRequestStatus.RECALLED:
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
  const onPageChange = (page: number) => {
    setCurrentPage(page);
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Danh sách yêu cầu đổi ca</CardTitle>
                <CardDescription>
                  Theo dõi và duyệt các yêu cầu đổi ca của nhân viên
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 py-4 rounded-lg mb-6 px-4">
              <div className="flex items-center gap-4">
                <div>
                  <Label className="text-sm font-medium mb-1">
                    Tên nhân viên
                  </Label>
                  <Input
                    placeholder="Tìm theo tên..."
                    className="w-full"
                    value={filter.employeeName}
                    onChange={(e) =>
                      setFilter((prev) => ({
                        ...prev,
                        employeeName: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-1">Ngày tạo</Label>
                  <Input
                    type="date"
                    className="w-[220px]"
                    value={filter.createdDate}
                    onChange={(e) =>
                      setFilter((prev) => ({
                        ...prev,
                        createdDate: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-1">
                    Ngày yêu cầu
                  </Label>
                  <Input
                    type="date"
                    className="w-full"
                    value={filter.date}
                    onChange={(e) =>
                      setFilter((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-1">Phòng ban</Label>
                  <Select
                    value={filter.departmentId}
                    onValueChange={(value) =>
                      setFilter((prev) => ({ ...prev, departmentId: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Phòng ban" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả phòng ban</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-1">Ca làm</Label>
                  <Select
                    value={filter.workShiftId}
                    onValueChange={(value) =>
                      setFilter((prev) => ({ ...prev, workShiftId: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Ca làm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả ca làm</SelectItem>
                      {workShifts.map((shift) => (
                        <SelectItem key={shift.id} value={shift.id.toString()}>
                          {shift.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-1">Trạng thái</Label>
                  <Select
                    value={filter.status}
                    onValueChange={(value) =>
                      setFilter((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger className="w-[220px]">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="PENDING">Chờ nhân viên xác nhận</SelectItem>
                      <SelectItem value="PENDING_APPROVAL">
                        Chờ quản lý duyệt
                      </SelectItem>
                      <SelectItem value="REJECTED_APPROVAL">
                        Nhân viên từ chối
                      </SelectItem>
                      <SelectItem value="APPROVED">Quản lý đã duyệt</SelectItem>
                      <SelectItem value="REJECTED">Quản lý đã từ chối</SelectItem>
                      <SelectItem value="RECALLED">Đã thu hồi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end mt-4">
                  <Button onClick={handleFilter}>Lọc</Button>
                </div>
              </div>
            </div>

            <div className="rounded-md border">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="border-b bg-muted/50">
                    <TableHead className="p-3 text-left font-medium">
                      STT
                    </TableHead>
                    <TableHead className="p-3 text-left font-medium">
                      Người gửi
                    </TableHead>
                    <TableHead className="p-3 text-left font-medium">
                      Phòng ban
                    </TableHead>
                    <TableHead className="p-3 text-left font-medium">
                      Ngày tạo
                    </TableHead>
                    <TableHead className="p-3 text-left font-medium">
                      Người được yêu cầu
                    </TableHead>
                    <TableHead className="p-3 text-left font-medium">
                      Ngày yêu cầu
                    </TableHead>
                    <TableHead className="p-3 text-left font-medium">
                      Ca làm
                    </TableHead>
                    <TableHead className="p-3 text-left font-medium">
                      Lý do
                    </TableHead>
                    <TableHead className="p-3 text-left font-medium">
                      Trạng thái
                    </TableHead>
                    <TableHead className="p-3 text-left font-medium">
                      Thao tác
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shiftChangeRequests?.length > 0 ? (
                    shiftChangeRequests.map((request, index) => (
                      <TableRow
                        key={request.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <TableCell className="p-3">
                          {(currentPage - 1) * 10 + index + 1}
                        </TableCell>
                        <TableCell className="p-3">
                          {request.employeeName}
                        </TableCell>
                        <TableCell className="p-3">
                          {request.departmentName}
                        </TableCell>
                        <TableCell className="p-3">
                          {format(
                            parseISO(request.createdAt),
                            "dd/MM/yyyy HH:mm:ss",
                            { locale: vi }
                          )}
                        </TableCell>
                        <TableCell className="p-3">
                          {request.targetEmployeeName} - {request.targetDepartmentName}
                        </TableCell>

                        <TableCell className="p-3">
                          {format(parseISO(request.date), "dd/MM/yyyy", {
                            locale: vi,
                          })}
                        </TableCell>
                        <TableCell className="p-3">
                          <div>
                            <div className="font-medium">
                              {request.workShift.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {request.workShift.startTime} -{" "}
                              {request.workShift.endTime}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="p-3 max-w-[200px]">
                          <div className="truncate" title={request.reason}>
                            {request.reason}
                          </div>
                        </TableCell>
                        <TableCell className="p-3">
                          {getStatusBadge(
                            request.status as ShiftChangeRequestStatus
                          )}
                        </TableCell>
                        <TableCell className="p-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowDetailModal(true);
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Xem
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        className="p-4 text-center text-muted-foreground"
                      >
                        Không có yêu cầu đổi ca nào.
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
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              Tổng số: {totalItems} bản ghi
            </div>
          </CardFooter>
        </Card>

        {/* Detail Modal */}
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="min-w-[800px] max-h-[90vh] overflow-y-auto p-0">
            <div className="bg-white rounded-lg shadow-lg">
              <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b">
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  <span className="text-base font-semibold">
                    Chi tiết yêu cầu đổi ca
                  </span>
                </DialogTitle>
                {selectedRequest &&
                  getStatusBadge(
                    selectedRequest.status as ShiftChangeRequestStatus
                  )}
              </div>

              {selectedRequest && (
                <div className="px-6 py-4 space-y-6">
                  {/* Thông tin người gửi */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Người gửi:
                      </span>
                      <span className="text-sm font-medium">
                        {selectedRequest.employeeName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Phòng ban:
                      </span>
                      <span className="text-sm font-medium">
                        {selectedRequest.departmentName}
                      </span>
                    </div>
                  </div>

                  {/* Thông tin người nhận */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Người được yêu cầu:
                      </span>
                      <span className="text-sm font-medium">
                        {selectedRequest.targetEmployeeName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Phòng ban:
                      </span>
                      <span className="text-sm font-medium">
                        {selectedRequest.targetDepartmentName}
                      </span>
                    </div>
                  </div>

                  {/* Thông tin thời gian */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Ngày tạo:
                      </span>
                      <span className="text-sm font-medium">
                        {format(
                          parseISO(selectedRequest.createdAt),
                          "dd/MM/yyyy HH:mm:ss"
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Ngày yêu cầu:
                      </span>
                      <span className="text-sm font-medium">
                        {format(parseISO(selectedRequest.date), "dd/MM/yyyy")}
                      </span>
                    </div>
                  </div>

                  {/* Thông tin ca làm */}
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Ca làm:
                    </span>
                    <span className="text-sm font-medium">
                      {selectedRequest.workShift.name} (
                      {selectedRequest.workShift.startTime} -{" "}
                      {selectedRequest.workShift.endTime})
                    </span>
                  </div>

                  {/* Lý do */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm text-muted-foreground font-medium">
                        Lý do đổi ca:
                      </span>
                    </div>
                    <div className="bg-gray-50 border rounded p-3 text-sm text-gray-700 whitespace-pre-line">
                      {selectedRequest.reason}
                    </div>
                  </div>

                  {/* Thông tin phản hồi */}
                  {(selectedRequest.status === "APPROVED" ||
                    selectedRequest.status === "REJECTED") && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground font-medium">
                            Thông tin phản hồi:
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Người phản hồi:
                            </span>
                            <span className="text-sm font-medium">
                              {selectedRequest.responseBy || "Chưa phản hồi"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Ngày phản hồi:
                            </span>
                            <span className="text-sm font-medium">
                              {selectedRequest.responseDate
                                ? format(
                                  parseISO(selectedRequest.responseDate),
                                  "dd/MM/yyyy HH:mm:ss"
                                )
                                : "Chưa phản hồi"}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <AlertCircle className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground font-medium">
                              Ghi chú phản hồi:
                            </span>
                          </div>
                          <div className="bg-gray-50 border rounded p-3 text-sm text-gray-700 whitespace-pre-line">
                            {selectedRequest.responseNote || "Không có ghi chú"}
                          </div>
                        </div>
                      </div>
                    )}
                  {selectedRequest?.status === "PENDING_APPROVAL" && (
                    <div className="space-y-2">
                      <Label htmlFor="responseNote">Ghi chú phản hồi</Label>
                      <Textarea
                        id="responseNote"
                        placeholder="Nhập ghi chú phản hồi (tùy chọn)"
                        value={responseNote}
                        onChange={(e) => setResponseNote(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              )}

              <DialogFooter className="flex flex-col sm:flex-row gap-2 px-6 pb-6 pt-2 border-t mt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetailModal(false);
                    setResponseNote("");
                  }}
                  className="flex-1 sm:flex-none"
                >
                  Đóng
                </Button>
                {selectedRequest?.status === "PENDING_APPROVAL" && (
                  <>
                    <Button
                      variant="destructive"
                      onClick={handleReject}
                      disabled={loadingAction}
                      className="flex-1 sm:flex-none"
                    >
                      {loadingAction ? "Đang xử lý..." : "Từ chối"}
                    </Button>
                    <Button
                      onClick={handleApprove}
                      disabled={loadingAction}
                      className="flex-1 sm:flex-none"
                    >
                      {loadingAction ? "Đang xử lý..." : "Duyệt"}
                    </Button>
                  </>
                )}
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
