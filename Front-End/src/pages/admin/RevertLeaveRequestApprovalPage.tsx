import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  RevertLeaveRequestStatus,
  type RevertLeaveRequestResponse,
} from "@/types/revertLeaveRequest.type";
import { revertLeaveRequestApi } from "@/services/revertLeaveRequest.service";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { departmentApi } from "@/services/department.service";
import type { Department } from "@/types/department.type";
import { workShiftApi } from "@/services/workShift.service";
import type { WorkShift } from "@/types/workShiftAssignment.type";
import { useSearchParams } from "react-router";
import PaginationComponent from "@/components/PaginationComponent";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  MoreHorizontal,
  Calendar,
  User,
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
import Spinner from "@/components/Spinner";

export default function RevertLeaveRequestApprovalPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [revertRequests, setRevertRequests] =
    useState<RevertLeaveRequestResponse[]>();
  const [departments, setDepartments] = useState<Department[]>();
  const [shifts, setShifts] = useState<WorkShift[]>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<any>(null);
  const [showReasonForm, setShowReasonForm] = useState<
    "approve" | "reject" | null
  >(null);
  const [reasonText, setReasonText] = useState("");

  const [filterRevertRequests, setFilterRevertRequests] = useState({
    employeeName: "",
    departmentId: "all",
    workShiftId: null as number | null,
    status: "all",
    createdDate: "",
    date: "",
  });

  const [revertRequestPage, setRevertRequestPage] = useState(
    Number(searchParams.get("page")) || 1
  );
  const [revertRequestTotalPage, setRevertRequestTotalPage] = useState(1);
  const [revertRequestTotalItems, setRevertRequestTotalItems] = useState(0);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [departmentsData, shiftsData] = await Promise.all([
          departmentApi.getAllDepartments(),
          workShiftApi.getAllShifts(),
        ]);

        setDepartments(departmentsData);
        setShifts(shiftsData);
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
    loadRevertRequests();
  }, [searchParams]);

  const loadRevertRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(searchParams);
      params.set("page", revertRequestPage.toString());
      const response = await revertLeaveRequestApi.getAllRevertLeaveRequests(
        params
      );
      setRevertRequests(response.data.data);
      setRevertRequestTotalPage(response.data.totalPage);
      setRevertRequestTotalItems(response.data.totalItem);
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi tải dữ liệu đơn xin đi làm lại");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: RevertLeaveRequestStatus) => {
    switch (status) {
      case RevertLeaveRequestStatus.APPROVED:
        return <Badge className="bg-green-600 text-white">Đã duyệt</Badge>;
      case RevertLeaveRequestStatus.REJECTED:
        return <Badge variant="destructive">Từ chối</Badge>;
      case RevertLeaveRequestStatus.PENDING:
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            Đang xử lý
          </Badge>
        );
      case RevertLeaveRequestStatus.RECALLED:
        return (
          <Badge
            variant="outline"
            className="text-yellow-600 border-yellow-600"
          >
            Đã thu hồi
          </Badge>
        );
    }
  };

  const getStatusLabel = (status: RevertLeaveRequestStatus | string) => {
    switch (status) {
      case RevertLeaveRequestStatus.PENDING:
        return "Đang xử lý";
      case RevertLeaveRequestStatus.APPROVED:
        return "Đã duyệt";
      case RevertLeaveRequestStatus.REJECTED:
        return "Từ chối";
      case RevertLeaveRequestStatus.RECALLED:
        return "Đã thu hồi";
      default:
        return status;
    }
  };

  const handleFilterRevertRequests = () => {
    const newParams = new URLSearchParams();

    if (filterRevertRequests.employeeName)
      newParams.set("employeeName", filterRevertRequests.employeeName);

    if (filterRevertRequests.departmentId !== "all")
      newParams.set("departmentId", filterRevertRequests.departmentId);

    if (
      filterRevertRequests.workShiftId !== null &&
      filterRevertRequests.workShiftId !== undefined
    )
      newParams.set("workShiftId", filterRevertRequests.workShiftId.toString());

    if (filterRevertRequests.status !== "all")
      newParams.set("status", filterRevertRequests.status.toLowerCase());

    if (filterRevertRequests.createdDate)
      newParams.set("createdDate", filterRevertRequests.createdDate);

    if (filterRevertRequests.date)
      newParams.set("date", filterRevertRequests.date);

    setSearchParams(newParams);
    setRevertRequestPage(1);
  };

  const handleRevertRequestPageChange = (page: number) => {
    setRevertRequestPage(page);
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);
  };

  const handleApproveRevertRequest = async (
    id: number,
    responseNote: string
  ) => {
    try {
      const response = await revertLeaveRequestApi.approveRevertLeaveRequest(
        id,
        responseNote
      );
      if (response.status === 200) {
        toast.success("Phê duyệt đơn xin đi làm lại thành công");
      }
      setShowDetailModal(false);
      setReasonText("");
      setShowReasonForm(null);
      await loadRevertRequests();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi phê duyệt đơn xin đi làm lại");
    }
  };

  const handleRejectRevertRequest = async (
    id: number,
    responseNote: string
  ) => {
    try {
      const response = await revertLeaveRequestApi.rejectRevertLeaveRequest(
        id,
        responseNote
      );
      if (response.status === 200) {
        toast.success("Từ chối đơn xin đi làm lại thành công");
      }
      setShowDetailModal(false);
      setReasonText("");
      setShowReasonForm(null);
      await loadRevertRequests();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi từ chối đơn xin đi làm lại");
    }
  };

  if (loading) {
    return <Spinner layout="admin" />;
  }

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <CardTitle>Duyệt đơn xin đi làm lại</CardTitle>
          <CardDescription>
            Phê duyệt các yêu cầu xin đi làm lại của nhân viên
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 py-2 rounded-lg mb-6 px-2">
            <div className="flex items-center gap-4">
              <div>
                <Label className="text-sm font-medium">Nhân viên</Label>
                <Input
                  placeholder="Tìm theo tên..."
                  className="w-full sm:w-[220px]"
                  value={filterRevertRequests.employeeName}
                  onChange={(e) =>
                    setFilterRevertRequests((prev) => ({
                      ...prev,
                      employeeName: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Ngày tạo</Label>
                <Input
                  type="date"
                  value={filterRevertRequests.createdDate}
                  onChange={(e) =>
                    setFilterRevertRequests((prev) => ({
                      ...prev,
                      createdDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Ngày đi làm lại</Label>
                <Input
                  type="date"
                  value={filterRevertRequests.date}
                  onChange={(e) =>
                    setFilterRevertRequests((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Phòng ban</Label>
                <Select
                  value={filterRevertRequests.departmentId}
                  onValueChange={(value) =>
                    setFilterRevertRequests((prev) => ({
                      ...prev,
                      departmentId: value,
                    }))
                  }
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Tất cả phòng ban" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả phòng ban</SelectItem>
                    {departments?.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Ca làm</Label>
                <Select
                  value={
                    filterRevertRequests.workShiftId !== null
                      ? filterRevertRequests.workShiftId.toString()
                      : "all"
                  }
                  onValueChange={(value) =>
                    setFilterRevertRequests((prev) => ({
                      ...prev,
                      workShiftId: value === "all" ? null : Number(value),
                    }))
                  }
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Tất cả ca" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả ca</SelectItem>
                    {shifts?.map((shift) => (
                      <SelectItem key={shift.id} value={shift.id.toString()}>
                        {shift.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Trạng thái</Label>
                <Select
                  value={filterRevertRequests.status}
                  onValueChange={(value) =>
                    setFilterRevertRequests((prev) => ({
                      ...prev,
                      status: value,
                    }))
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Lọc theo trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    {Object.values(RevertLeaveRequestStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {getStatusLabel(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end mt-5">
                <Button
                  className="w-full sm:w-auto hover:cursor-pointer"
                  onClick={() => handleFilterRevertRequests()}
                >
                  Lọc
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="border-b bg-muted/50">
                  <TableHead className="p-2 text-left font-medium">
                    STT
                  </TableHead>
                  <TableHead className="p-2 text-left font-medium">
                    Nhân viên
                  </TableHead>
                  <TableHead className="p-2 text-left font-medium">
                    Bộ phận
                  </TableHead>
                  <TableHead className="p-2 text-left font-medium">
                    Ngày tạo
                  </TableHead>
                  <TableHead className="p-2 text-left font-medium">
                    Ca xin đi làm lại
                  </TableHead>
                  <TableHead className="p-2 text-left font-medium">
                    Ngày xin đi làm lại
                  </TableHead>
                  <TableHead className="p-2 text-left font-medium">
                    Lý do
                  </TableHead>
                  <TableHead className="p-2 text-left font-medium">
                    Trạng thái
                  </TableHead>
                  <TableHead className="p-2 text-left font-medium">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  let tableContent;
                  if (loading) {
                    tableContent = (
                      <TableRow>
                        <TableCell colSpan={7} className="p-4 text-center">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  } else if (revertRequests && revertRequests.length === 0) {
                    tableContent = (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="p-4 text-center text-muted-foreground"
                        >
                          Không có đơn xin đi làm lại nào đang chờ duyệt
                        </TableCell>
                      </TableRow>
                    );
                  } else {
                    tableContent = revertRequests?.map((request, index) => (
                      <TableRow key={request.id}>
                        <TableCell className="p-2 text-left font-medium">
                          {(revertRequestPage - 1) * 10 + index + 1}
                        </TableCell>
                        <TableCell className="p-2 text-left font-medium">
                          {request.employeeName}
                        </TableCell>
                        <TableCell className="p-2 text-left font-medium">
                          {request.departmentName}
                        </TableCell>
                        <TableCell className="p-2 text-left font-medium">
                          {request.createdAt
                            ? format(
                                parseISO(request.createdAt),
                                "dd/MM/yyyy HH:mm:ss"
                              )
                            : "N/A"}
                        </TableCell>
                        <TableCell className="p-2 text-left font-medium">
                          {request.workShift.name} (
                          {request.workShift.startTime} -
                          {request.workShift.endTime})
                        </TableCell>

                        <TableCell className="p-2 text-left font-medium">
                          {request.date
                            ? format(parseISO(request.date), "dd/MM/yyyy")
                            : "N/A"}
                        </TableCell>
                        <TableCell className="p-2 text-left font-medium">
                          {request.reason}
                        </TableCell>
                        <TableCell className="p-3">
                          {getStatusBadge(
                            request.status as RevertLeaveRequestStatus
                          )}
                        </TableCell>
                        <TableCell className="p-2 text-left font-medium">
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
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ));
                  }
                  return tableContent;
                })()}
              </TableBody>
            </Table>
            <PaginationComponent
              currentPage={revertRequestPage}
              totalPage={revertRequestTotalPage}
              onPageChange={handleRevertRequestPageChange}
            />
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Tổng số: {revertRequestTotalItems} bản ghi
              </div>
            </CardFooter>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="min-w-[800px] max-h-[90vh] overflow-y-auto p-0">
          <div className="bg-white rounded-lg shadow-lg">
            <DialogHeader className="px-6 pt-6 pb-2 border-b">
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  <span>Chi tiết phiếu xin đi làm lại</span>
                </DialogTitle>
                {getStatusBadge(selectedDetail?.status)}
              </div>
            </DialogHeader>

            {selectedDetail && (
              <div className="px-6 py-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Họ tên:
                    </span>
                    <span className="text-sm font-medium">
                      {selectedDetail.employeeName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Bộ phận:
                    </span>
                    <span className="text-sm font-medium">
                      {selectedDetail.departmentName}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Ngày xin đi làm lại:
                    </span>
                    <span className="text-sm font-medium">
                      {selectedDetail.date
                        ? format(parseISO(selectedDetail.date), "dd/MM/yyyy")
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Ngày tạo:
                    </span>
                    <span className="text-sm font-medium">
                      {selectedDetail.createdAt
                        ? format(
                            parseISO(selectedDetail.createdAt),
                            "dd/MM/yyyy HH:mm:ss"
                          )
                        : "N/A"}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm text-muted-foreground font-medium">
                      Lý do xin đi làm lại:
                    </span>
                  </div>
                  <div className="bg-gray-50 border rounded p-3 text-sm text-gray-700 whitespace-pre-line">
                    {selectedDetail.reason}
                  </div>
                </div>

                {(selectedDetail.status === "APPROVED" ||
                  selectedDetail.status === "REJECTED") && (
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm text-muted-foreground font-medium">
                        Thông tin phản hồi:
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Người duyệt:
                        </span>
                        <span className="text-sm font-medium">
                          {selectedDetail.responseBy || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Ngày duyệt:
                        </span>
                        <span className="text-sm font-medium">
                          {selectedDetail.responseDate
                            ? format(
                                parseISO(selectedDetail.responseDate),
                                "dd/MM/yyyy HH:mm:ss"
                              )
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm text-muted-foreground font-medium">
                          Lý do{" "}
                          {selectedDetail.status === "APPROVED"
                            ? "duyệt"
                            : "từ chối"}
                          :
                        </span>
                      </div>
                      <div className="bg-gray-50 border rounded p-3 text-sm text-gray-700 whitespace-pre-line">
                        {selectedDetail.responseNote || "Không có"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="flex flex-col sm:flex-row gap-2 px-6 pb-6 pt-2 border-t mt-2">
              {selectedDetail?.status === "PENDING" &&
              (showReasonForm === "approve" || showReasonForm === "reject") ? (
                <div className="w-full space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reason" className="font-medium">
                      Lý do {showReasonForm === "approve" ? "duyệt" : "từ chối"}
                      :
                    </Label>
                    <Textarea
                      id="reason"
                      placeholder={`Nhập lý do ${
                        showReasonForm === "approve" ? "duyệt" : "từ chối"
                      }...`}
                      value={reasonText}
                      onChange={(e) => setReasonText(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowReasonForm(null)}
                    >
                      Hủy
                    </Button>
                    {showReasonForm === "approve" ? (
                      <Button
                        variant="default"
                        onClick={() => {
                          handleApproveRevertRequest(
                            selectedDetail.id,
                            reasonText
                          );
                        }}
                      >
                        Xác nhận duyệt
                      </Button>
                    ) : (
                      <Button
                        variant="destructive"
                        onClick={() => {
                          handleRejectRevertRequest(
                            selectedDetail.id,
                            reasonText
                          );
                        }}
                      >
                        Xác nhận từ chối
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      onClick={() => setShowDetailModal(false)}
                      className="flex-1 sm:flex-none"
                    >
                      Đóng
                    </Button>
                  </div>
                  {selectedDetail?.status === "PENDING" && (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setShowReasonForm("reject");
                        }}
                        className="flex-1 sm:flex-none"
                      >
                        Từ chối
                      </Button>
                      <Button
                        onClick={() => {
                          setShowReasonForm("approve");
                        }}
                        className="flex-1 sm:flex-none"
                      >
                        Duyệt
                      </Button>
                    </div>
                  )}
                </>
              )}
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
