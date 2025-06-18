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
  PartTimeRequestStatus,
  type PartTimeRequestResponse,
} from "@/types/partTime.type";
import { partTimeApi } from "@/services/partTime.service";
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

export default function PartTimeRequestApprovalPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [partTimeRequests, setPartTimeRequests] =
    useState<PartTimeRequestResponse[]>();
  const [departments, setDepartments] = useState<Department[]>();
  const [shifts, setShifts] = useState<WorkShift[]>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<any>(null);
  const [showReasonForm, setShowReasonForm] = useState<
    "approve" | "reject" | null
  >(null);
  const [reasonText, setReasonText] = useState("");

  const [filterPartTimeRequests, setFilterPartTimeRequests] = useState({
    employeeName: "",
    departmentId: "all",
    workShiftId: null as number | null,
    status: "all",
    createdDate: "",
    date: "",
  });

  const [partTimeRequestPage, setPartTimeRequestPage] = useState(
    Number(searchParams.get("page")) || 1
  );
  const [partTimeRequestTotalPage, setPartTimeRequestTotalPage] = useState(1);
  const [partTimeRequestTotalItems, setPartTimeRequestTotalItems] = useState(0);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [departmentsData, shiftsData] = await Promise.all([
          departmentApi.getAllDepartments(),
          workShiftApi.getAllWorkShiftsPartTime(),
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
    loadPartTimeRequests();
  }, [searchParams]);

  const loadPartTimeRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(searchParams);
      params.set("page", partTimeRequestPage.toString());
      const response = await partTimeApi.getAllPartTimeRequests(params);
      setPartTimeRequests(response.data);
      setPartTimeRequestTotalPage(response.totalPage);
      setPartTimeRequestTotalItems(response.totalItem);
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi tải dữ liệu đơn đăng ký parttime");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: PartTimeRequestStatus) => {
    switch (status) {
      case PartTimeRequestStatus.APPROVED:
        return <Badge className="bg-green-600 text-white">Đã duyệt</Badge>;
      case PartTimeRequestStatus.REJECTED:
        return <Badge variant="destructive">Từ chối</Badge>;
      case PartTimeRequestStatus.PENDING:
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            Đang xử lý
          </Badge>
        );
      case PartTimeRequestStatus.RECALLED:
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

  const getStatusLabel = (status: PartTimeRequestStatus | string) => {
    switch (status) {
      case PartTimeRequestStatus.PENDING:
        return "Đang xử lý";
      case PartTimeRequestStatus.APPROVED:
        return "Đã duyệt";
      case PartTimeRequestStatus.REJECTED:
        return "Từ chối";
      case PartTimeRequestStatus.RECALLED:
        return "Đã thu hồi";
      default:
        return status;
    }
  };

  const handleFilterPartTimeRequests = () => {
    const newParams = new URLSearchParams();

    if (filterPartTimeRequests.employeeName)
      newParams.set("employeeName", filterPartTimeRequests.employeeName);

    if (filterPartTimeRequests.departmentId !== "all")
      newParams.set("departmentId", filterPartTimeRequests.departmentId);

    if (
      filterPartTimeRequests.workShiftId !== null &&
      filterPartTimeRequests.workShiftId !== undefined
    )
      newParams.set(
        "workShiftId",
        filterPartTimeRequests.workShiftId.toString()
      );

    if (filterPartTimeRequests.status !== "all")
      newParams.set("status", filterPartTimeRequests.status.toLowerCase());

    if (filterPartTimeRequests.createdDate)
      newParams.set("createdDate", filterPartTimeRequests.createdDate);

    if (filterPartTimeRequests.date)
      newParams.set("date", filterPartTimeRequests.date);

    setSearchParams(newParams);
    setPartTimeRequestPage(1);
  };

  const handlePartTimeRequestPageChange = (page: number) => {
    setPartTimeRequestPage(page);
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);
  };

  const handleApprovePartTimeRequest = async (
    id: number,
    responseNote: string
  ) => {
    try {
      const response = await partTimeApi.approvePartTimeRequest(
        id,
        responseNote
      );
      if (response.status === 200) {
        toast.success("Phê duyệt đơn đăng ký parttime thành công");
      }
      setShowDetailModal(false);
      setReasonText("");
      setShowReasonForm(null);
      await loadPartTimeRequests();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi phê duyệt đơn đăng ký parttime");
    }
  };

  const handleRejectPartTimeRequest = async (
    id: number,
    responseNote: string
  ) => {
    try {
      const response = await partTimeApi.rejectPartTimeRequest(
        id,
        responseNote
      );
      if (response.status === 200) {
        toast.success("Từ chối đơn đăng ký parttime thành công");
      }
      setShowDetailModal(false);
      setReasonText("");
      setShowReasonForm(null);
      await loadPartTimeRequests();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi từ chối đơn đăng ký parttime");
    }
  };

  if (loading) {
    return <Spinner layout="admin" />;
  }

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <CardTitle>Duyệt đơn đăng ký parttime</CardTitle>
          <CardDescription>
            Phê duyệt các yêu cầu đăng ký parttime của nhân viên
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
                  value={filterPartTimeRequests.employeeName}
                  onChange={(e) =>
                    setFilterPartTimeRequests((prev) => ({
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
                  value={filterPartTimeRequests.createdDate}
                  onChange={(e) =>
                    setFilterPartTimeRequests((prev) => ({
                      ...prev,
                      createdDate: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Ngày đăng ký</Label>
                <Input
                  type="date"
                  value={filterPartTimeRequests.date}
                  onChange={(e) =>
                    setFilterPartTimeRequests((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Phòng ban</Label>
                <Select
                  value={filterPartTimeRequests.departmentId}
                  onValueChange={(value) =>
                    setFilterPartTimeRequests((prev) => ({
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
                    filterPartTimeRequests.workShiftId !== null
                      ? filterPartTimeRequests.workShiftId.toString()
                      : "all"
                  }
                  onValueChange={(value) =>
                    setFilterPartTimeRequests((prev) => ({
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
                  value={filterPartTimeRequests.status}
                  onValueChange={(value) =>
                    setFilterPartTimeRequests((prev) => ({
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
                    {Object.values(PartTimeRequestStatus).map((status) => (
                      <SelectItem
                        key={status as string}
                        value={status as string}
                      >
                        {getStatusLabel(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end mt-5">
                <Button
                  className="w-full sm:w-auto hover:cursor-pointer"
                  onClick={() => handleFilterPartTimeRequests()}
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
                    Ngày đăng ký
                  </TableHead>
                  <TableHead className="p-2 text-left font-medium">
                    Ca đăng ký
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
                  } else if (
                    partTimeRequests &&
                    partTimeRequests.length === 0
                  ) {
                    tableContent = (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="p-4 text-center text-muted-foreground"
                        >
                          Không có đơn đăng ký parttime nào đang chờ duyệt
                        </TableCell>
                      </TableRow>
                    );
                  } else {
                    tableContent = partTimeRequests?.map((request, index) => (
                      <TableRow key={request.id}>
                        <TableCell className="p-2 text-left font-medium">
                          {(partTimeRequestPage - 1) * 10 + index + 1}
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
                          {request.date
                            ? format(parseISO(request.date), "dd/MM/yyyy")
                            : "N/A"}
                        </TableCell>
                        <TableCell className="p-2 text-left font-medium">
                          {request.workShift.name} (
                          {request.workShift.startTime} -
                          {request.workShift.endTime})
                        </TableCell>

                        <TableCell className="p-3">
                          {getStatusBadge(
                            request.status as PartTimeRequestStatus
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
              currentPage={partTimeRequestPage}
              totalPage={partTimeRequestTotalPage}
              onPageChange={handlePartTimeRequestPageChange}
            />
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Tổng số: {partTimeRequestTotalItems} bản ghi
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
                  <span>Chi tiết phiếu đăng ký parttime</span>
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
                      Ngày đăng ký:
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
                          handleApprovePartTimeRequest(
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
                          handleRejectPartTimeRequest(
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
