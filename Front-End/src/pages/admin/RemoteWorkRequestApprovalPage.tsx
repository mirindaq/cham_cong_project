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
  RemoteWorkRequestStatus,
  type RemoteWorkRequestResponse,
} from "@/types/remoteWorkRequest.type";
import { remoteWorkRequestApi } from "@/services/remoteWorkRequest.service";
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
  Home,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Spinner from "@/components/Spinner";

export default function RemoteWorkRequestApprovalPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [remoteWorkRequests, setRemoteWorkRequests] =
    useState<RemoteWorkRequestResponse[]>();
  const [departments, setDepartments] = useState<Department[]>();
  const [shifts, setShifts] = useState<WorkShift[]>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<any>(null);
  const [showReasonForm, setShowReasonForm] = useState<
    "approve" | "reject" | null
  >(null);
  const [reasonText, setReasonText] = useState("");

  const [filterRemoteWorkRequests, setFilterRemoteWorkRequests] = useState({
    employeeName: "",
    departmentId: "all",
    workShiftId: null as number | null,
    status: "all",
    createdDate: "",
    date: "",
  });

  const [remoteWorkRequestPage, setRemoteWorkRequestPage] = useState(
    Number(searchParams.get("page")) || 1
  );
  const [remoteWorkRequestTotalPage, setRemoteWorkRequestTotalPage] = useState(1);
  const [remoteWorkRequestTotalItems, setRemoteWorkRequestTotalItems] = useState(0);

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
    loadRemoteWorkRequests();
  }, [searchParams]);

  const loadRemoteWorkRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(searchParams);
      params.set("page", remoteWorkRequestPage.toString());
      const response = await remoteWorkRequestApi.getAllRemoteWorkRequests(params);
      setRemoteWorkRequests(response.data);
      setRemoteWorkRequestTotalPage(response.totalPage);
      setRemoteWorkRequestTotalItems(response.totalItem);
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi tải dữ liệu đơn yêu cầu làm việc từ xa");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: RemoteWorkRequestStatus) => {
    switch (status) {
      case RemoteWorkRequestStatus.APPROVED:
        return <Badge className="bg-green-600 text-white">Đã duyệt</Badge>;
      case RemoteWorkRequestStatus.REJECTED:
        return <Badge variant="destructive">Từ chối</Badge>;
      case RemoteWorkRequestStatus.PENDING:
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            Đang xử lý
          </Badge>
        );
      case RemoteWorkRequestStatus.RECALLED:
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

  const getStatusLabel = (status: RemoteWorkRequestStatus | string) => {
    switch (status) {
      case RemoteWorkRequestStatus.PENDING:
        return "Đang xử lý";
      case RemoteWorkRequestStatus.APPROVED:
        return "Đã duyệt";
      case RemoteWorkRequestStatus.REJECTED:
        return "Từ chối";
      case RemoteWorkRequestStatus.RECALLED:
        return "Đã thu hồi";
      default:
        return status;
    }
  };

  const handleFilterRemoteWorkRequests = () => {
    const newParams = new URLSearchParams();

    if (filterRemoteWorkRequests.employeeName)
      newParams.set("employeeName", filterRemoteWorkRequests.employeeName);

    if (filterRemoteWorkRequests.departmentId !== "all")
      newParams.set("departmentId", filterRemoteWorkRequests.departmentId);

    if (
      filterRemoteWorkRequests.workShiftId !== null &&
      filterRemoteWorkRequests.workShiftId !== undefined
    )
      newParams.set(
        "workShiftId",
        filterRemoteWorkRequests.workShiftId.toString()
      );

    if (filterRemoteWorkRequests.status !== "all")
      newParams.set("status", filterRemoteWorkRequests.status.toLowerCase());

    if (filterRemoteWorkRequests.createdDate)
      newParams.set("createdDate", filterRemoteWorkRequests.createdDate);

    if (filterRemoteWorkRequests.date)
      newParams.set("date", filterRemoteWorkRequests.date);

    setSearchParams(newParams);
    setRemoteWorkRequestPage(1);
  };

  const handleRemoteWorkRequestPageChange = (page: number) => {
    setRemoteWorkRequestPage(page);
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);
  };

  const handleApproveRemoteWorkRequest = async (
    id: number,
    responseNote: string
  ) => {
    try {
      const response = await remoteWorkRequestApi.approveRemoteWorkRequest(id, {
        responseNote,
      });
      if (response.status === 200) {
        toast.success("Đã duyệt yêu cầu làm việc từ xa thành công!");
        setShowDetailModal(false);
        setShowReasonForm(null);
        setReasonText("");
        await loadRemoteWorkRequests();
      }
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi duyệt yêu cầu");
    }
  };

  const handleRejectRemoteWorkRequest = async (
    id: number,
    responseNote: string
  ) => {
    try {
      const response = await remoteWorkRequestApi.rejectRemoteWorkRequest(id, {
        responseNote,
      });
      if (response.status === 200) {
        toast.success("Đã từ chối yêu cầu làm việc từ xa thành công!");
        setShowDetailModal(false);
        setShowReasonForm(null);
        setReasonText("");
        await loadRemoteWorkRequests();
      }
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi từ chối yêu cầu");
    }
  };

  if (loading) {
    return <Spinner layout="admin" />;
  }

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <CardTitle>Duyệt Yêu Cầu Làm Việc Từ Xa</CardTitle>
          <CardDescription>
            Quản lý và duyệt các yêu cầu làm việc từ xa của nhân viên
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
                  value={filterRemoteWorkRequests.employeeName}
                  onChange={(e) =>
                    setFilterRemoteWorkRequests((prev) => ({
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
                  value={filterRemoteWorkRequests.createdDate}
                  onChange={(e) =>
                    setFilterRemoteWorkRequests((prev) => ({
                      ...prev,
                      createdDate: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Ngày làm việc</Label>
                <Input
                  type="date"
                  value={filterRemoteWorkRequests.date}
                  onChange={(e) =>
                    setFilterRemoteWorkRequests((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Phòng ban</Label>
                <Select
                  value={filterRemoteWorkRequests.departmentId}
                  onValueChange={(value) =>
                    setFilterRemoteWorkRequests((prev) => ({
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
                    filterRemoteWorkRequests.workShiftId !== null
                      ? filterRemoteWorkRequests.workShiftId.toString()
                      : "all"
                  }
                  onValueChange={(value) =>
                    setFilterRemoteWorkRequests((prev) => ({
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
                  value={filterRemoteWorkRequests.status}
                  onValueChange={(value) =>
                    setFilterRemoteWorkRequests((prev) => ({
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
                    {Object.values(RemoteWorkRequestStatus).map((status) => (
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
                  onClick={() => handleFilterRemoteWorkRequests()}
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
                    Ngày làm việc
                  </TableHead>
                  <TableHead className="p-2 text-left font-medium">
                    Ca đăng ký
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
                        <TableCell colSpan={9} className="p-4 text-center">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  } else if (
                    remoteWorkRequests &&
                    remoteWorkRequests.length === 0
                  ) {
                    tableContent = (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          className="p-4 text-center text-muted-foreground"
                        >
                          Không có yêu cầu làm việc từ xa nào đang chờ duyệt
                        </TableCell>
                      </TableRow>
                    );
                  } else {
                    tableContent = remoteWorkRequests?.map((request, index) => (
                      <TableRow key={request.id}>
                        <TableCell className="p-2 text-left font-medium">
                          {(remoteWorkRequestPage - 1) * 10 + index + 1}
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
                        <TableCell className="p-2 text-left font-medium">
                          <div className="max-w-xs truncate" title={request.reason}>
                            {request.reason}
                          </div>
                        </TableCell>
                        <TableCell className="p-3">
                          {getStatusBadge(
                            request.status as RemoteWorkRequestStatus
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
              currentPage={remoteWorkRequestPage}
              totalPage={remoteWorkRequestTotalPage}
              onPageChange={handleRemoteWorkRequestPageChange}
            />
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Tổng số: {remoteWorkRequestTotalItems} bản ghi
              </div>
            </CardFooter>
          </div>
        </CardContent>
      </Card>

      <Dialog 
        open={showDetailModal} 
        onOpenChange={(open) => {
          if (!open) {
            setShowDetailModal(false);
            setShowReasonForm(null);
            setReasonText("");
          }
        }}
      >
        <DialogContent className="min-w-[800px] max-h-[90vh] overflow-y-auto p-0">
          <div className="bg-white rounded-lg shadow-lg">
            <DialogHeader className="px-6 pt-6 pb-2 border-b">
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  <span>Chi tiết yêu cầu làm việc từ xa</span>
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
                      Ngày làm việc:
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
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground font-medium">
                      Lý do làm việc từ xa:
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
                      onClick={() => {
                        setShowReasonForm(null);
                        setReasonText("");
                      }}
                    >
                      Hủy
                    </Button>
                    {showReasonForm === "approve" ? (
                      <Button
                        variant="default"
                        onClick={() => {
                          handleApproveRemoteWorkRequest(
                            selectedDetail.id,
                            reasonText
                          );
                        }}
                        disabled={!reasonText.trim()}
                      >
                        Xác nhận duyệt
                      </Button>
                    ) : (
                      <Button
                        variant="destructive"
                        onClick={() => {
                          handleRejectRemoteWorkRequest(
                            selectedDetail.id,
                            reasonText
                          );
                        }}
                        disabled={!reasonText.trim()}
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
                      onClick={() => {
                        setShowDetailModal(false);
                        setShowReasonForm(null);
                        setReasonText("");
                      }}
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
                          setReasonText("");
                        }}
                        className="flex-1 sm:flex-none"
                      >
                        Từ chối
                      </Button>
                      <Button
                        onClick={() => {
                          setShowReasonForm("approve");
                          setReasonText("");
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