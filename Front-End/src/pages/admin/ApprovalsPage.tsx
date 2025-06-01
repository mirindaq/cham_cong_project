import { useEffect, useState } from "react";
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
import { Label } from "@/components/ui/label";
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
import type { LeaveType } from "@/types/leaveType";
import { leaveTypeApi } from "@/services/leaveType.service";
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
import { localStorageUtil } from "@/utils/localStorageUtil";

export default function ApprovalsPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestResponse[]>();
  const [complaints, setComplaints] = useState<ComplaintResponse[]>([]);
  const [departments, setDepartments] = useState<Department[]>();
  const [shifts, setShifts] = useState<WorkShift[]>();
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>();
  const [tab, setTab] = useState<string>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get("tab") || "leaveRequests";
  });
  const [leaveRequestSearchParams, setLeaveRequestSearchParams] = useSearchParams();
  const [complaintSearchParams, setComplaintSearchParams] = useSearchParams();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<any>(null);
  const [showReasonForm, setShowReasonForm] = useState<"approve" | "reject" | null>(null);
  const [reasonText, setReasonText] = useState("");

  const [filterLeaveRequests, setFilterLeaveRequests] = useState({
    employeeName: "",
    departmentId: "all",
    workShiftId: null as number | null,
    leaveTypeId: "all",
    status: "all",
    startDate: format(new Date(), "dd/MM/yyyy"),
    endDate: format(new Date(), "dd/MM/yyyy"),
  });

  const [filterComplaints, setFilterComplaints] = useState({
    employeeName: "",
    departmentId: "all",
    workShiftId: null as number | null,
    complaintType: "all",
    status: "all",
    startDate: format(new Date(), "dd/MM/yyyy"),
    endDate: format(new Date(), "dd/MM/yyyy"),
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const [leaveRequestPage, setLeaveRequestPage] = useState(
    Number(searchParams.get("leavePage")) || 1
  );
  const [leaveRequestTotalPage, setLeaveRequestTotalPage] = useState(1);

  const [complaintPage, setComplaintPage] = useState(
    Number(searchParams.get("complaintPage")) || 1
  );
  const [complaintTotalPage, setComplaintTotalPage] = useState(1);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [departmentsData, shiftsData, leaveTypesData] = await Promise.all([
          departmentApi.getAllDepartments(),
          workShiftApi.getAllShifts(),
          leaveTypeApi.getAllLeaveTypes()
        ]);

        setDepartments(departmentsData);
        setShifts(shiftsData);
        setLeaveTypes(leaveTypesData);
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
    const loadData = async () => {
      if (tab === "leaveRequests") {
        await loadLeaveRequests();
      } else if (tab === "complaints") {
        await loadComplaints();
      }
    };

    loadData();
  }, [tab, leaveRequestPage, complaintPage, leaveRequestSearchParams, complaintSearchParams]);

  useEffect(() => {
    if (tab === "leaveRequests") {
      const params = {
        employeeName: leaveRequestSearchParams.get("employeeName") || "",
        departmentId: leaveRequestSearchParams.get("departmentId") || "all",
        workShiftId: leaveRequestSearchParams.get("workShiftId") ? Number(leaveRequestSearchParams.get("workShiftId")) : null,
        leaveTypeId: leaveRequestSearchParams.get("leaveTypeId") || "all",
        status: leaveRequestSearchParams.get("status") || "all",
        startDate: leaveRequestSearchParams.get("startDate") || "",
        endDate: leaveRequestSearchParams.get("endDate") || ""
      };
      setFilterLeaveRequests(prev => ({ ...prev, ...params }));
    } else if (tab === "complaints") {
      const params = {
        employeeName: complaintSearchParams.get("employeeName") || "",
        departmentId: complaintSearchParams.get("departmentId") || "all",
        workShiftId: complaintSearchParams.get("workShiftId") ? Number(complaintSearchParams.get("workShiftId")) : null,
        complaintType: complaintSearchParams.get("complaintType") || "all",
        status: complaintSearchParams.get("status") || "all",
        startDate: complaintSearchParams.get("startDate") || filterComplaints.startDate,
        endDate: complaintSearchParams.get("endDate") || filterComplaints.endDate
      };
      setFilterComplaints(prev => ({ ...prev, ...params }));
    }
  }, [tab, leaveRequestSearchParams, complaintSearchParams]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("tab", tab);
    window.history.pushState({}, "", `?${searchParams.toString()}`);
  }, [tab]);

  const loadLeaveRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(leaveRequestSearchParams);
      params.set("page", leaveRequestPage.toString());
      const response = await leaveRequestApi.getAllLeaveRequests(params);
      setLeaveRequests(response.data);
      setLeaveRequestTotalPage(response.totalPage);
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi tải dữ liệu đơn nghỉ phép");
    } finally {
      setLoading(false);
    }
  };

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(complaintSearchParams);
      params.set("page", complaintPage.toString());
      const response = await complaintApi.getAllComplaints(params);
      setComplaints(response.data);
      setComplaintTotalPage(response.totalPage);
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi tải dữ liệu khiếu nại");
    } finally {
      setLoading(false);
    }
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

  const getStatusLabel = (status: LeaveRequestStatus | ComplaintStatus) => {
    switch (status) {
      case LeaveRequestStatus.PENDING:
        return "Đang xử lý";
      case LeaveRequestStatus.APPROVED:
        return "Đã duyệt";
      case LeaveRequestStatus.REJECTED:
        return "Từ chối";
      case LeaveRequestStatus.RECALLED:
        return "Đã thu hồi";
      default:
        return status;
    }
  };

  const handleFilterLeaveRequests = () => {
    const newParams = new URLSearchParams();
    newParams.set("tab", "leaveRequests");

    if (filterLeaveRequests.employeeName)
      newParams.set("employeeName", filterLeaveRequests.employeeName);

    if (filterLeaveRequests.departmentId !== "all")
      newParams.set("departmentId", filterLeaveRequests.departmentId);

    if (
      filterLeaveRequests.workShiftId !== null &&
      filterLeaveRequests.workShiftId !== undefined
    )
      newParams.set("workShiftId", filterLeaveRequests.workShiftId.toString());

    if (filterLeaveRequests.leaveTypeId !== "all")
      newParams.set("leaveTypeId", filterLeaveRequests.leaveTypeId);

    if (filterLeaveRequests.status !== "all")
      newParams.set("status", filterLeaveRequests.status.toLowerCase());

    if (filterLeaveRequests.startDate)
      newParams.set("startDate", filterLeaveRequests.startDate);

    if (filterLeaveRequests.endDate)
      newParams.set("endDate", filterLeaveRequests.endDate);

    setLeaveRequestSearchParams(newParams);
    setLeaveRequestPage(1);
  };

  const handleFilterComplaints = () => {
    const newParams = new URLSearchParams();
    newParams.set("tab", "complaints");

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

    if (filterComplaints.startDate && filterComplaints.startDate !== format(new Date(), "dd/MM/yyyy"))
      newParams.set("startDate", filterComplaints.startDate);

    if (filterComplaints.endDate && filterComplaints.endDate !== format(new Date(), "dd/MM/yyyy"))
      newParams.set("endDate", filterComplaints.endDate);

    setComplaintSearchParams(newParams);
    setComplaintPage(1);
  };

  const handleLeaveRequestPageChange = (page: number) => {
    setLeaveRequestPage(page);
    const params = new URLSearchParams(searchParams);
    params.set("leavePage", page.toString());
    setSearchParams(params);
  };

  const handleComplaintPageChange = (page: number) => {
    setComplaintPage(page);
    const params = new URLSearchParams(searchParams);
    params.set("complaintPage", page.toString());
    setSearchParams(params);
  };


  const handleApproveLeaveRequest = async (id: number, responseNote: string) => {
    try {
      await leaveRequestApi.approveLeaveRequest(id, responseNote, localStorageUtil.getUserFromLocalStorage().id);
      toast.success("Phê duyệt đơn nghỉ phép thành công");
      setShowDetailModal(false);
      setReasonText("");
      setShowReasonForm(null);
      // Reload data
      if (tab === "leaveRequests") {
        await loadLeaveRequests();
      }
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi phê duyệt đơn nghỉ phép");
    }
  };

  const handleRejectLeaveRequest = async (id: number, responseNote: string) => {
    try {
      await leaveRequestApi.rejectLeaveRequest(id, responseNote, localStorageUtil.getUserFromLocalStorage().id);
      toast.success("Từ chối đơn nghỉ phép thành công");
      setShowDetailModal(false);
      setReasonText("");
      setShowReasonForm(null);
      // Reload data
      if (tab === "leaveRequests") {
        await loadLeaveRequests();
      }
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi từ chối đơn nghỉ phép");
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
          <Tabs
            className="space-y-4"
            value={tab}
            onValueChange={setTab}
          >
            <TabsList>
              <TabsTrigger value="leaveRequests">Đơn nghỉ phép</TabsTrigger>
              <TabsTrigger value="complaints">Khiếu nại chấm công</TabsTrigger>
            </TabsList>

            <TabsContent value="leaveRequests" className="space-y-4">
              <>
                <div className="bg-muted/50 py-2 rounded-lg mb-6 px-2">
                  <div className="flex items-center gap-4">
                    <div>
                      <Label className="text-sm font-medium">Nhân viên</Label>
                      <Input
                        placeholder="Tìm theo tên..."
                        className="w-full sm:w-[220px]"
                        value={filterLeaveRequests.employeeName}
                        onChange={(e) =>
                          setFilterLeaveRequests((prev) => ({
                            ...prev,
                            employeeName: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Từ ngày</Label>
                      <Input
                        type="date"
                        value={filterLeaveRequests.startDate}
                        onChange={(e) =>
                          setFilterLeaveRequests((prev) => ({
                            ...prev,
                            startDate: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Đến ngày</Label>
                      <Input
                        type="date"
                        value={filterLeaveRequests.endDate}
                        onChange={(e) =>
                          setFilterLeaveRequests((prev) => ({
                            ...prev,
                            endDate: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Phòng ban</Label>
                      <Select
                        value={filterLeaveRequests.departmentId}
                        onValueChange={(value) =>
                          setFilterLeaveRequests((prev) => ({
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
                            <SelectItem
                              key={dept.id}
                              value={dept.id.toString()}
                            >
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
                          filterLeaveRequests.workShiftId !== null
                            ? filterLeaveRequests.workShiftId.toString()
                            : "all"
                        }
                        onValueChange={(value) =>
                          setFilterLeaveRequests((prev) => ({
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
                            <SelectItem
                              key={shift.id}
                              value={shift.id.toString()}
                            >
                              {shift.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">
                        Loại nghỉ phép
                      </Label>
                      <Select
                        value={filterLeaveRequests.leaveTypeId}
                        onValueChange={(value) =>
                          setFilterLeaveRequests((prev) => ({
                            ...prev,
                            leaveTypeId: value,
                          }))
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Lọc theo loại nghỉ phép" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            Tất cả loại nghỉ phép
                          </SelectItem>
                          {leaveTypes?.map((type) => (
                            <SelectItem
                              key={type.id}
                              value={
                                typeof type.id === "string"
                                  ? type.id
                                  : type.id.toString()
                              }
                            >
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Trạng thái</Label>
                      <Select
                        value={filterLeaveRequests.status}
                        onValueChange={(value) =>
                          setFilterLeaveRequests((prev) => ({
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
                          {Object.values(LeaveRequestStatus).map((status) => (
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
                        onClick={() => handleFilterLeaveRequests()}
                      >
                        Lọc
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
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
                          Loại nghỉ phép
                        </TableHead>
                        <TableHead className="p-2 text-left font-medium">
                          Ngày tạo
                        </TableHead>
                        <TableHead className="p-2 text-left font-medium">
                          Từ ngày
                        </TableHead>
                        <TableHead className="p-2 text-left font-medium">
                          Đến ngày
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
                              <TableCell
                                colSpan={9}
                                className="p-4 text-center"
                              >
                                <div className="flex items-center justify-center">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        } else if (
                          leaveRequests &&
                          leaveRequests.length === 0
                        ) {
                          tableContent = (
                            <TableRow>
                              <TableCell
                                colSpan={10}
                                className="p-4 text-center text-muted-foreground"
                              >
                                Không có đơn xin nghỉ phép nào đang chờ duyệt
                              </TableCell>
                            </TableRow>
                          );
                        } else {
                          tableContent = leaveRequests?.map((request) => (
                            <TableRow key={request.id}>
                              <TableCell className="p-2 text-left font-medium">
                                {leaveRequests.findIndex(
                                  (req) => req.id === request.id
                                ) + 1}
                              </TableCell>
                              <TableCell className="p-2 text-left font-medium">
                                {request.employeeName}
                              </TableCell>
                              <TableCell className="p-2 text-left font-medium">
                                {request.departmentName}
                              </TableCell>
                              <TableCell className="p-2 text-left font-medium">
                                {request.leaveType.name}
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
                                {request.startDate ? format(parseISO(request.startDate), "dd/MM/yyyy") : "N/A"}
                              </TableCell>
                              <TableCell className="p-2 text-left font-medium">
                                {request.endDate ? format(parseISO(request.endDate), "dd/MM/yyyy") : "N/A"}
                              </TableCell>
                              <TableCell className="p-2 text-left font-medium">
                                {request.reason}
                              </TableCell>
                              <TableCell className="p-3">
                                {getStatusBadge(
                                  request.status as LeaveRequestStatus
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
                    currentPage={leaveRequestPage}
                    totalPage={leaveRequestTotalPage}
                    onPageChange={handleLeaveRequestPageChange}
                  />
                </div>
              </>
            </TabsContent>

            <TabsContent value="complaints" className="space-y-4">
              <>
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
                      <Label className="text-sm font-medium">Từ ngày</Label>
                      <Input
                        type="date"
                        value={filterComplaints.startDate}
                        onChange={(e) =>
                          setFilterComplaints((prev) => ({
                            ...prev,
                            startDate: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Đến ngày</Label>
                      <Input
                        type="date"
                        value={filterComplaints.endDate}
                        onChange={(e) =>
                          setFilterComplaints((prev) => ({
                            ...prev,
                            endDate: e.target.value,
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
                            <SelectItem
                              key={dept.id}
                              value={dept.id.toString()}
                            >
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">
                        Loại khiếu nại
                      </Label>
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
                          <SelectItem value="all">
                            Tất cả loại khiếu nại
                          </SelectItem>
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
                      <TableRow>
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
                        if (loading) {
                          tableContent = (
                            <TableRow>
                              <TableCell
                                colSpan={9}
                                className="p-4 text-center"
                              >
                                <div className="flex items-center justify-center">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        } else if (
                          complaints &&
                          complaints.length === 0
                        ) {
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
                          tableContent = complaints.map((complaint) => (
                            <TableRow key={complaint.id}>
                              <TableCell className="p-2">
                                {complaints.findIndex(
                                  (c) => c.id === complaint.id
                                ) + 1}
                              </TableCell>
                              <TableCell className="p-2">
                                {complaint.employeeFullName}
                              </TableCell>
                              <TableCell className="p-2">
                                {complaint.departmentName}
                              </TableCell>
                              <TableCell className="p-2">
                                {complaint.date ? format(parseISO(complaint.date), "dd/MM/yyyy") : "N/A"}
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
                </div>
              </>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

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
                    <User className="w-4 h-4 text-muted-foreground" />
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

                {/* Thông tin phản hồi */}
                {(selectedDetail.status === "APPROVED" || selectedDetail.status === "REJECTED") && (
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm text-muted-foreground font-medium">Thông tin phản hồi:</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
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
                    <div className="mt-3">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm text-muted-foreground font-medium">
                          Lý do {selectedDetail.status === "APPROVED" ? "duyệt" : "từ chối"}:
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
                      Lý do {showReasonForm === "approve" ? "duyệt" : "từ chối"}:
                    </Label>
                    <Textarea
                      id="reason"
                      placeholder={`Nhập lý do ${showReasonForm === "approve" ? "duyệt" : "từ chối"}...`}
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
                          handleApproveLeaveRequest(selectedDetail.id, reasonText);
                        }}
                      >
                        Xác nhận duyệt
                      </Button>
                    ) : (
                      <Button
                        variant="destructive"
                        onClick={() => {
                          handleRejectLeaveRequest(selectedDetail.id, reasonText);
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
