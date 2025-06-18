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
  ComplaintStatus,
  ComplaintType,
  type ComplaintResponse,
} from "@/types/complaint.type";
import { complaintApi } from "@/services/complaint.service";
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

export default function ComplaintApprovalPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [complaints, setComplaints] = useState<ComplaintResponse[]>([]);
  const [departments, setDepartments] = useState<Department[]>();
  const [shifts, setShifts] = useState<WorkShift[]>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<any>(null);
  const [showReasonForm, setShowReasonForm] = useState<
    "approve" | "reject" | null
  >(null);
  const [reasonText, setReasonText] = useState("");

  const [filterComplaints, setFilterComplaints] = useState({
    employeeName: "",
    departmentId: "all",
    workShiftId: null as number | null,
    complaintType: "all",
    status: "all",
    createdDate: "",
    date: "",
  });

  const [complaintPage, setComplaintPage] = useState(
    Number(searchParams.get("page")) || 1
  );
  const [complaintTotalPage, setComplaintTotalPage] = useState(1);
  const [complaintTotalItems, setComplaintTotalItems] = useState(0);

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
    loadComplaints();
  }, [searchParams]);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(searchParams);
      params.set("page", complaintPage.toString());
      const response = await complaintApi.getAllComplaints(params);
      setComplaints(response.data);
      setComplaintTotalPage(response.totalPage);
      setComplaintTotalItems(response.totalItem);
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi tải dữ liệu khiếu nại");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case ComplaintStatus.APPROVED:
        return <Badge className="bg-green-600 text-white">Đã duyệt</Badge>;
      case ComplaintStatus.REJECTED:
        return <Badge variant="destructive">Từ chối</Badge>;
      case ComplaintStatus.PENDING:
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            Đang xử lý
          </Badge>
        );
      case ComplaintStatus.RECALLED:
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

  const getStatusLabel = (status: ComplaintStatus | string) => {
    switch (status) {
      case ComplaintStatus.PENDING:
        return "Đang xử lý";
      case ComplaintStatus.APPROVED:
        return "Đã duyệt";
      case ComplaintStatus.REJECTED:
        return "Từ chối";
      case ComplaintStatus.RECALLED:
        return "Đã thu hồi";
      default:
        return status;
    }
  };

  const handleFilterComplaints = () => {
    const newParams = new URLSearchParams();

    if (filterComplaints.employeeName)
      newParams.set("employeeName", filterComplaints.employeeName);

    if (filterComplaints.departmentId !== "all")
      newParams.set("departmentId", filterComplaints.departmentId);

    if (
      filterComplaints.workShiftId !== null &&
      filterComplaints.workShiftId !== undefined
    )
      newParams.set("workShiftId", filterComplaints.workShiftId.toString());

    if (filterComplaints.complaintType !== "all")
      newParams.set("complaintType", filterComplaints.complaintType);

    if (filterComplaints.status !== "all")
      newParams.set("status", filterComplaints.status);

    if (
      filterComplaints.createdDate &&
      filterComplaints.createdDate !== format(new Date(), "dd/MM/yyyy")
    )
      newParams.set("createdDate", filterComplaints.createdDate);

    if (filterComplaints.date) newParams.set("date", filterComplaints.date);

    setSearchParams(newParams);
    setComplaintPage(1);
  };

  const handleComplaintPageChange = (page: number) => {
    setComplaintPage(page);
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);
  };

  const handleApproveComplaint = async (id: number, responseNote: string) => {
    try {
      const response = await complaintApi.approveComplaint(id, responseNote);
      if (response.status === 200) {
        toast.success("Phê duyệt đơn khiếu nại thành công");
      }
      setShowDetailModal(false);
      setReasonText("");
      setShowReasonForm(null);
      await loadComplaints();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi phê duyệt đơn khiếu nại");
    }
  };

  const handleRejectComplaint = async (id: number, responseNote: string) => {
    try {
      const response = await complaintApi.rejectComplaint(id, responseNote);
      if (response.status === 200) {
        toast.success("Từ chối đơn khiếu nại thành công");
      }
      setShowDetailModal(false);
      setReasonText("");
      setShowReasonForm(null);
      await loadComplaints();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi từ chối đơn khiếu nại");
    }
  };

  if (loading) {
    return <Spinner layout="admin" />;
  }

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <CardTitle>Duyệt khiếu nại chấm công</CardTitle>
          <CardDescription>
            Phê duyệt các yêu cầu khiếu nại chấm công của nhân viên
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
                  value={filterComplaints.employeeName}
                  onChange={(e) =>
                    setFilterComplaints((prev) => ({
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
                  value={filterComplaints.createdDate}
                  onChange={(e) =>
                    setFilterComplaints((prev) => ({
                      ...prev,
                      createdDate: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Ngày khiếu nại</Label>
                <Input
                  type="date"
                  value={filterComplaints.date}
                  onChange={(e) =>
                    setFilterComplaints((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Phòng ban</Label>
                <Select
                  value={filterComplaints.departmentId}
                  onValueChange={(value) =>
                    setFilterComplaints((prev) => ({
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
                <Label className="text-sm font-medium">Loại khiếu nại</Label>
                <Select
                  value={filterComplaints.complaintType}
                  onValueChange={(value) =>
                    setFilterComplaints((prev) => ({
                      ...prev,
                      complaintType: value,
                    }))
                  }
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Lọc theo loại khiếu nại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả loại khiếu nại</SelectItem>
                    {Object.entries(ComplaintType).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Trạng thái</Label>
                <Select
                  value={filterComplaints.status}
                  onValueChange={(value) =>
                    setFilterComplaints((prev) => ({
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
                    {Object.values(ComplaintStatus).map((status) => (
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
                  onClick={() => handleFilterComplaints()}
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
                    Ngày cần khiếu nại
                  </TableHead>
                  <TableHead className="p-2 text-left font-medium">
                    Ngày tạo
                  </TableHead>
                  <TableHead className="p-2 text-left font-medium">
                    Loại khiếu nại
                  </TableHead>
                  <TableHead className="p-2 text-left font-medium">
                    Lý Do
                  </TableHead>
                  <TableHead className="p-2 text-left font-medium">
                    Trạng thái
                  </TableHead>
                  <TableHead className="p-2 text-left font-medium">
                    Hành động
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  let tableContent;
                  if (complaints && complaints.length === 0) {
                    tableContent = (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          className="p-4 text-center text-muted-foreground"
                        >
                          Không có khiếu nại chấm công nào đang chờ duyệt
                        </TableCell>
                      </TableRow>
                    );
                  } else {
                    tableContent = complaints.map((complaint, index) => (
                      <TableRow key={complaint.id}>
                        <TableCell className="p-2">
                          {(complaintPage - 1) * 10 + index + 1}
                        </TableCell>
                        <TableCell className="p-2">
                          {complaint.employeeName}
                        </TableCell>
                        <TableCell className="p-2">
                          {complaint.departmentName}
                        </TableCell>
                        <TableCell className="p-2">
                          {complaint.date
                            ? format(parseISO(complaint.date), "dd/MM/yyyy")
                            : "N/A"}
                        </TableCell>
                        <TableCell className="p-2">
                          {complaint.createdAt
                            ? format(
                                parseISO(complaint.createdAt),
                                "dd/MM/yyyy HH:mm:ss"
                              )
                            : "N/A"}
                        </TableCell>
                        <TableCell className="p-2">
                          {ComplaintType[
                            complaint.complaintType as keyof typeof ComplaintType
                          ] ?? complaint.complaintType}
                        </TableCell>
                        <TableCell className="p-2">
                          {complaint.reason}
                        </TableCell>
                        <TableCell className="p-2">
                          {getStatusBadge(complaint.status)}
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
                                  setSelectedDetail(complaint);
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
              currentPage={complaintPage}
              totalPage={complaintTotalPage}
              onPageChange={handleComplaintPageChange}
            />
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Tổng số: {complaintTotalItems} bản ghi
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
                  <span>Chi tiết phiếu khiếu nại</span>
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
                      {selectedDetail.employeeFullName}
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
                      Loại khiếu nại:
                    </span>
                    <span className="text-sm font-medium">
                      {ComplaintType[
                        selectedDetail.complaintType as keyof typeof ComplaintType
                      ] ?? selectedDetail.complaintType}
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

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Ngày cần khiếu nại:
                  </span>
                  <span className="text-sm font-medium">
                    {selectedDetail.date
                      ? format(parseISO(selectedDetail.date), "dd/MM/yyyy")
                      : "N/A"}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm text-muted-foreground font-medium">
                      Lý do khiếu nại:
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
                          handleApproveComplaint(selectedDetail.id, reasonText);
                        }}
                      >
                        Xác nhận duyệt
                      </Button>
                    ) : (
                      <Button
                        variant="destructive"
                        onClick={() => {
                          handleRejectComplaint(selectedDetail.id, reasonText);
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
