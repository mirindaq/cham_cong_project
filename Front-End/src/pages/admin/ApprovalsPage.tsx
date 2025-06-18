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
import Spinner from "@/components/Spinner";
import {
  RevertLeaveRequestStatus,
  type RevertLeaveRequestResponse,
} from "@/types/revertLeaveRequest.type";
import { revertLeaveRequestApi } from "@/services/revertLeaveRequest.service";
import {
  PartTimeRequestStatus,
  type PartTimeRequestResponse,
} from "@/types/partTime.type";
import { partTimeApi } from "@/services/partTime.service";

export default function ApprovalsPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestResponse[]>();
  const [complaints, setComplaints] = useState<ComplaintResponse[]>([]);
  const [reverts, setReverts] = useState<RevertLeaveRequestResponse[]>([]);
  const [partTimeRequests, setPartTimeRequests] = useState<
    PartTimeRequestResponse[]
  >([]);
  const [partTimeSearchParams, setPartTimeSearchParams] = useSearchParams();
  const [departments, setDepartments] = useState<Department[]>();
  const [shifts, setShifts] = useState<WorkShift[]>();
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>();
  const [tab, setTab] = useState<string>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get("tab") || "leaveRequests";
  });
  const [leaveRequestSearchParams, setLeaveRequestSearchParams] =
    useSearchParams();
  const [complaintSearchParams, setComplaintSearchParams] = useSearchParams();
  const [revertSearchParams, setRevertSearchParams] = useSearchParams();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<any>(null);
  const [showReasonForm, setShowReasonForm] = useState<
    "approve" | "reject" | null
  >(null);
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

  const [filterReverts, setFilterReverts] = useState({
    employeeName: "",
    departmentId: "all",
    workShiftId: null as number | null,
    status: "all",
    createdDate: format(new Date(), "dd/MM/yyyy"),
    date: format(new Date(), "dd/MM/yyyy"),
  });

  const [filterPartTime, setFilterPartTime] = useState({
    employeeName: "",
    departmentId: "all",
    workShiftId: null as number | null,
    status: "all",
    createdDate: format(new Date(), "dd/MM/yyyy"),
    date: format(new Date(), "dd/MM/yyyy"),
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
  const [leaveRequestTotalItems, setLeaveRequestTotalItems] = useState(0);
  const [complaintTotalItems, setComplaintTotalItems] = useState(0);

  const [revertPage, setRevertPage] = useState(
    Number(searchParams.get("revertPage")) || 1
  );
  const [revertTotalPage, setRevertTotalPage] = useState(1);
  const [revertTotalItem, setRevertTotalItem] = useState(0);

  const [partTimePage, setPartTimePage] = useState(
    Number(searchParams.get("partTimePage")) || 1
  );
  const [partTimeTotalPage, setPartTimeTotalPage] = useState(1);
  const [partTimeTotalItem, setPartTimeTotalItem] = useState(0);

  const [typeDialog, setTypeDialog] = useState<
    "leaveRequest" | "complaint" | "revert" | "partTime"
  >("leaveRequest");

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [departmentsData, shiftsData, leaveTypesData] = await Promise.all(
          [
            departmentApi.getAllDepartments(),
            workShiftApi.getAllShifts(),
            leaveTypeApi.getAllLeaveTypes(),
          ]
        );

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
      } else if (tab === "reverts") {
        await loadReverts();
      } else if (tab === "partTime") {
        await loadPartTime();
      }
    };

    loadData();
  }, [
    tab,
    leaveRequestPage,
    complaintPage,
    leaveRequestSearchParams,
    complaintSearchParams,
    revertPage,
    revertSearchParams,
    partTimePage,
    partTimeSearchParams,
  ]);

  useEffect(() => {
    if (tab === "leaveRequests") {
      const params = {
        employeeName: leaveRequestSearchParams.get("employeeName") || "",
        departmentId: leaveRequestSearchParams.get("departmentId") || "all",
        workShiftId: leaveRequestSearchParams.get("workShiftId")
          ? Number(leaveRequestSearchParams.get("workShiftId"))
          : null,
        leaveTypeId: leaveRequestSearchParams.get("leaveTypeId") || "all",
        status: leaveRequestSearchParams.get("status")
          ? leaveRequestSearchParams.get("status")!.toUpperCase()
          : "all",
        startDate: leaveRequestSearchParams.get("startDate") || "",
        endDate: leaveRequestSearchParams.get("endDate") || "",
      };
      setFilterLeaveRequests((prev) => ({ ...prev, ...params }));
    } else if (tab === "complaints") {
      const params = {
        employeeName: complaintSearchParams.get("employeeName") || "",
        departmentId: complaintSearchParams.get("departmentId") || "all",
        workShiftId: complaintSearchParams.get("workShiftId")
          ? Number(complaintSearchParams.get("workShiftId"))
          : null,
        complaintType: complaintSearchParams.get("complaintType") || "all",
        status: complaintSearchParams.get("status")
          ? complaintSearchParams.get("status")!.toUpperCase()
          : "all",
        startDate:
          complaintSearchParams.get("startDate") || filterComplaints.startDate,
        endDate:
          complaintSearchParams.get("endDate") || filterComplaints.endDate,
      };
      setFilterComplaints((prev) => ({ ...prev, ...params }));
    } else if (tab === "reverts") {
      const params = {
        employeeName: revertSearchParams.get("employeeName") || "",
        departmentId: revertSearchParams.get("departmentId") || "all",
        workShiftId: revertSearchParams.get("workShiftId")
          ? Number(revertSearchParams.get("workShiftId"))
          : null,
        status: revertSearchParams.get("status")
          ? revertSearchParams.get("status")!.toUpperCase()
          : "all",
        createdDate: revertSearchParams.get("createdDate") || "",
        date: revertSearchParams.get("date") || "",
      };
      setFilterReverts((prev) => ({ ...prev, ...params }));
    } else if (tab === "partTime") {
      const params = {
        employeeName: partTimeSearchParams.get("employeeName") || "",
        departmentId: partTimeSearchParams.get("departmentId") || "all",
        workShiftId: partTimeSearchParams.get("workShiftId")
          ? Number(partTimeSearchParams.get("workShiftId"))
          : null,
        status: partTimeSearchParams.get("status")
          ? partTimeSearchParams.get("status")!.toUpperCase()
          : "all",
        createdDate: partTimeSearchParams.get("createdDate") || "",
        date: partTimeSearchParams.get("date") || "",
      };
      setFilterPartTime((prev) => ({ ...prev, ...params }));
    }
  }, [
    tab,
    leaveRequestSearchParams,
    complaintSearchParams,
    revertSearchParams,
    partTimeSearchParams,
  ]);

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
      setLeaveRequestTotalItems(response.totalItem);
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
      setComplaintTotalItems(response.totalItem);
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi tải dữ liệu khiếu nại");
    } finally {
      setLoading(false);
    }
  };

  const loadReverts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(revertSearchParams);
      params.set("page", revertPage.toString());
      const response = await revertLeaveRequestApi.getAllRevertLeaveRequests(
        params
      );
      console.log(response);
      setReverts(response.data.data);
      setRevertTotalPage(response.data.totalPage);
      setRevertTotalItem(response.data.totalItem);
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi tải dữ liệu đơn xin đi làm lại");
    } finally {
      setLoading(false);
    }
  };

  const loadPartTime = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(partTimeSearchParams);
      params.set("page", partTimePage.toString());
      const response = await partTimeApi.getAllPartTimeRequests(params);

      setPartTimeRequests(response.data);
      setPartTimeTotalPage(response.totalPage);
      setPartTimeTotalItem(response.totalItem);
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi tải dữ liệu đăng ký part-time");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (
    status:
      | ComplaintStatus
      | LeaveRequestStatus
      | RevertLeaveRequestStatus
      | PartTimeRequestStatus
  ) => {
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
    }
  };

  const getStatusLabel = (
    status:
      | LeaveRequestStatus
      | ComplaintStatus
      | RevertLeaveRequestStatus
      | PartTimeRequestStatus
      | string
  ) => {
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

    if (
      filterComplaints.startDate &&
      filterComplaints.startDate !== format(new Date(), "dd/MM/yyyy")
    )
      newParams.set("startDate", filterComplaints.startDate);

    if (
      filterComplaints.endDate &&
      filterComplaints.endDate !== format(new Date(), "dd/MM/yyyy")
    )
      newParams.set("endDate", filterComplaints.endDate);

    setComplaintSearchParams(newParams);
    setComplaintPage(1);
  };

  const handleFilterReverts = () => {
    const newParams = new URLSearchParams();
    newParams.set("tab", "reverts");

    if (filterReverts.employeeName)
      newParams.set("employeeName", filterReverts.employeeName);

    if (filterReverts.departmentId !== "all")
      newParams.set("departmentId", filterReverts.departmentId);

    if (
      filterReverts.workShiftId !== null &&
      filterReverts.workShiftId !== undefined
    )
      newParams.set("workShiftId", filterReverts.workShiftId.toString());

    if (filterReverts.status !== "all")
      newParams.set("status", filterReverts.status);

    if (filterReverts.createdDate)
      newParams.set("createdDate", filterReverts.createdDate);

    if (filterReverts.date) newParams.set("date", filterReverts.date);

    setRevertSearchParams(newParams);
    setRevertPage(1);
  };

  const handleFilterPartTime = () => {
    const newParams = new URLSearchParams();
    newParams.set("tab", "partTime");

    if (filterPartTime.employeeName)
      newParams.set("employeeName", filterPartTime.employeeName);

    if (filterPartTime.departmentId !== "all")
      newParams.set("departmentId", filterPartTime.departmentId);

    if (
      filterPartTime.workShiftId !== null &&
      filterPartTime.workShiftId !== undefined
    )
      newParams.set("workShiftId", filterPartTime.workShiftId.toString());

    if (filterPartTime.status !== "all")
      newParams.set("status", filterPartTime.status);

    if (filterPartTime.createdDate)
      newParams.set("createdDate", filterPartTime.createdDate);

    if (filterPartTime.date) newParams.set("date", filterPartTime.date);

    setPartTimeSearchParams(newParams);
    setPartTimePage(1);
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

  const handleRevertPageChange = (page: number) => {
    setRevertPage(page);
    const params = new URLSearchParams(searchParams);
    params.set("revertPage", page.toString());
    setSearchParams(params);
  };

  const handlePartTimePageChange = (page: number) => {
    setPartTimePage(page);
    const params = new URLSearchParams(searchParams);
    params.set("partTimePage", page.toString());
    setSearchParams(params);
  };

  const handleApproveLeaveRequest = async (
    id: number,
    responseNote: string
  ) => {
    try {
      const response = await leaveRequestApi.approveLeaveRequest(
        id,
        responseNote
      );
      if (response.status === 200) {
        toast.success("Phê duyệt đơn nghỉ phép thành công");
      }
      setShowDetailModal(false);
      setReasonText("");
      setShowReasonForm(null);
      // Reload data
      if (tab === "leaveRequests") {
        await loadLeaveRequests();
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi phê duyệt đơn nghỉ phép");
    }
  };

  const handleRejectLeaveRequest = async (id: number, responseNote: string) => {
    try {
      const response = await leaveRequestApi.rejectLeaveRequest(
        id,
        responseNote
      );
      if (response.status === 200) {
        toast.success("Từ chối đơn nghỉ phép thành công");
      }
      setShowDetailModal(false);
      setReasonText("");
      setShowReasonForm(null);
      if (tab === "leaveRequests") {
        await loadLeaveRequests();
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi từ chối đơn nghỉ phép");
    }
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
      if (tab === "complaints") {
        await loadComplaints();
      }
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
      // Reload data
      if (tab === "complaints") {
        await loadComplaints();
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi từ chối đơn khiếu nại");
    }
  };

  const handleApproveRevert = async (id: number, responseNote: string) => {
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
      // Reload data
      if (tab === "reverts") {
        await loadReverts();
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi phê duyệt đơn xin đi làm lại");
    }
  };

  const handleRejectRevert = async (id: number, responseNote: string) => {
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
      // Reload data
      if (tab === "reverts") {
        await loadReverts();
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi từ chối đơn xin đi làm lại");
    }
  };

  const handleApprovePartTime = async (id: number, responseNote: string) => {
    try {
      const response = await partTimeApi.approvePartTimeRequest(
        id,
        responseNote
      );
      if (response.status === 200) {
        toast.success("Phê duyệt đơn đăng ký part-time thành công");
      }
      setShowDetailModal(false);
      setReasonText("");
      setShowReasonForm(null);
      // Reload data
      if (tab === "partTime") {
        await loadPartTime();
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi phê duyệt đơn đăng ký part-time");
    }
  };

  const handleRejectPartTime = async (id: number, responseNote: string) => {
    try {
      const response = await partTimeApi.rejectPartTimeRequest(
        id,
        responseNote
      );
      if (response.status === 200) {
        toast.success("Từ chối đơn đăng ký part-time thành công");
      }
      setShowDetailModal(false);
      setReasonText("");
      setShowReasonForm(null);
      // Reload data
      if (tab === "partTime") {
        await loadPartTime();
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi từ chối đơn đăng ký part-time");
    }
  };

  if (loading) {
    return <Spinner layout="admin" />;
  }

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <CardTitle>Phê duyệt yêu cầu</CardTitle>
          <CardDescription>
            Phê duyệt các yêu cầu nghỉ phép, khiếu nại chấm công, đơn xin đi làm
            lại, đơn đăng ký part time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs className="space-y-4" value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="leaveRequests">Đơn nghỉ phép</TabsTrigger>
              <TabsTrigger value="complaints">Khiếu nại chấm công</TabsTrigger>
              <TabsTrigger value="reverts">Đơn xin đi làm lại</TabsTrigger>
              <TabsTrigger value="partTime">Đơn đăng ký parttime</TabsTrigger>
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
                          tableContent = leaveRequests?.map(
                            (request, index) => (
                              <TableRow key={request.id}>
                                <TableCell className="p-2 text-left font-medium">
                                  {(leaveRequestPage - 1) * 10 + index + 1}
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
                                  {request.startDate
                                    ? format(
                                        parseISO(request.startDate),
                                        "dd/MM/yyyy"
                                      )
                                    : "N/A"}
                                </TableCell>
                                <TableCell className="p-2 text-left font-medium">
                                  {request.endDate
                                    ? format(
                                        parseISO(request.endDate),
                                        "dd/MM/yyyy"
                                      )
                                    : "N/A"}
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
                                          setTypeDialog("leaveRequest");
                                        }}
                                      >
                                        Xem chi tiết
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            )
                          );
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
                  <CardFooter className="flex justify-between">
                    <div className="text-sm text-muted-foreground">
                      Tổng số: {leaveRequestTotalItems} bản ghi
                    </div>
                  </CardFooter>
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
                                  ? format(
                                      parseISO(complaint.date),
                                      "dd/MM/yyyy"
                                    )
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
                                        setTypeDialog("complaint");
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
              </>
            </TabsContent>

            <TabsContent value="reverts" className="space-y-4">
              <>
                <div className="bg-muted/50 py-2 rounded-lg mb-6 px-2">
                  <div className="flex items-center gap-4">
                    <div>
                      <Label className="text-sm font-medium">Nhân viên</Label>
                      <Input
                        placeholder="Tìm theo tên..."
                        className="w-full sm:w-[220px]"
                        value={filterReverts.employeeName}
                        onChange={(e) =>
                          setFilterReverts((prev) => ({
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
                        value={filterReverts.createdDate}
                        onChange={(e) =>
                          setFilterReverts((prev) => ({
                            ...prev,
                            createdDate: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">
                        Ngày làm việc
                      </Label>
                      <Input
                        type="date"
                        value={filterReverts.date}
                        onChange={(e) =>
                          setFilterReverts((prev) => ({
                            ...prev,
                            date: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Phòng ban</Label>
                      <Select
                        value={filterReverts.departmentId}
                        onValueChange={(value) =>
                          setFilterReverts((prev) => ({
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
                          filterReverts.workShiftId !== null
                            ? filterReverts.workShiftId.toString()
                            : "all"
                        }
                        onValueChange={(value) =>
                          setFilterReverts((prev) => ({
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
                      <Label className="text-sm font-medium">Trạng thái</Label>
                      <Select
                        value={filterReverts.status}
                        onValueChange={(value) =>
                          setFilterReverts((prev) => ({
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
                          {Object.values(RevertLeaveRequestStatus).map(
                            (status) => (
                              <SelectItem key={status} value={status}>
                                {getStatusLabel(status)}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end mt-5">
                      <Button
                        className="w-full sm:w-auto hover:cursor-pointer"
                        onClick={() => handleFilterReverts()}
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
                          Ngày làm việc
                        </TableHead>
                        <TableHead className="p-2 text-left font-medium">
                          Ngày tạo
                        </TableHead>
                        <TableHead className="p-2 text-left font-medium">
                          Ca làm
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
                      {reverts.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={10}
                            className="p-4 text-center text-muted-foreground"
                          >
                            Không có đơn xin nghỉ phép nào đang chờ duyệt
                          </TableCell>
                        </TableRow>
                      ) : (
                        reverts.map((revert, index) => (
                          <TableRow key={revert.id}>
                            <TableCell className="p-2 text-left font-medium">
                              {(revertPage - 1) * 10 + index + 1}
                            </TableCell>
                            <TableCell className="p-2 text-left font-medium">
                              {revert.employeeName}
                            </TableCell>
                            <TableCell className="p-2 text-left font-medium">
                              {revert.departmentName}
                            </TableCell>

                            <TableCell className="p-2 text-left font-medium">
                              {revert.date
                                ? format(parseISO(revert.date), "dd/MM/yyyy")
                                : "N/A"}
                            </TableCell>
                            <TableCell className="p-2 text-left font-medium">
                              {revert.createdAt
                                ? format(
                                    parseISO(revert.createdAt),
                                    "dd/MM/yyyy HH:mm:ss"
                                  )
                                : "N/A"}
                            </TableCell>

                            <TableCell className="p-2 text-left font-medium">
                              {revert.workShift.name}
                            </TableCell>

                            <TableCell className="p-2 text-left font-medium">
                              {revert.reason}
                            </TableCell>
                            <TableCell className="p-3">
                              {getStatusBadge(
                                revert.status as RevertLeaveRequestStatus
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
                                      setSelectedDetail(revert);
                                      setShowDetailModal(true);
                                      setTypeDialog("revert");
                                    }}
                                  >
                                    Xem chi tiết
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  <PaginationComponent
                    currentPage={revertPage}
                    totalPage={revertTotalPage}
                    onPageChange={handleRevertPageChange}
                  />
                  <CardFooter className="flex justify-between">
                    <div className="text-sm text-muted-foreground">
                      Tổng số: {revertTotalItem} bản ghi
                    </div>
                  </CardFooter>
                </div>
              </>
            </TabsContent>

            <TabsContent value="partTime" className="space-y-4">
              <>
                <div className="bg-muted/50 py-2 rounded-lg mb-6 px-2">
                  <div className="flex items-center gap-4">
                    <div>
                      <Label className="text-sm font-medium">Nhân viên</Label>
                      <Input
                        placeholder="Tìm theo tên..."
                        className="w-full sm:w-[220px]"
                        value={filterPartTime.employeeName}
                        onChange={(e) =>
                          setFilterPartTime((prev) => ({
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
                        value={filterPartTime.createdDate}
                        onChange={(e) =>
                          setFilterPartTime((prev) => ({
                            ...prev,
                            createdDate: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">
                        Ngày làm việc
                      </Label>
                      <Input
                        type="date"
                        value={filterPartTime.date}
                        onChange={(e) =>
                          setFilterPartTime((prev) => ({
                            ...prev,
                            date: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Phòng ban</Label>
                      <Select
                        value={filterPartTime.departmentId}
                        onValueChange={(value) =>
                          setFilterPartTime((prev) => ({
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
                          filterPartTime.workShiftId !== null
                            ? filterPartTime.workShiftId.toString()
                            : "all"
                        }
                        onValueChange={(value) =>
                          setFilterPartTime((prev) => ({
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
                      <Label className="text-sm font-medium">Trạng thái</Label>
                      <Select
                        value={filterPartTime.status}
                        onValueChange={(value) =>
                          setFilterPartTime((prev) => ({
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
                          {Object.values(PartTimeRequestStatus).map(
                            (status) => (
                              <SelectItem key={status} value={status}>
                                {getStatusLabel(status)}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end mt-5">
                      <Button
                        className="w-full sm:w-auto hover:cursor-pointer"
                        onClick={() => handleFilterPartTime()}
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
                          Ngày làm việc
                        </TableHead>
                        <TableHead className="p-2 text-left font-medium">
                          Ca làm việc
                        </TableHead>
                        <TableHead className="p-2 text-left font-medium">
                          Ngày tạo
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
                      {partTimeRequests.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={9}
                            className="p-4 text-center text-muted-foreground"
                          >
                            Không có đơn đăng ký part-time nào đang chờ duyệt
                          </TableCell>
                        </TableRow>
                      ) : (
                        partTimeRequests.map((request, index) => (
                          <TableRow key={request.id}>
                            <TableCell className="p-2 text-left font-medium">
                              {(partTimePage - 1) * 10 + index + 1}
                            </TableCell>
                            <TableCell className="p-2 text-left font-medium">
                              {request.employeeName}
                            </TableCell>
                            <TableCell className="p-2 text-left font-medium">
                              {request.departmentName}
                            </TableCell>
                            <TableCell className="p-2 text-left font-medium">
                              {request.date
                                ? format(parseISO(request.date), "dd/MM/yyyy")
                                : "N/A"}
                            </TableCell>
                            <TableCell className="p-2 text-left font-medium">
                              {request.workShift.name} (
                              {request.workShift.startTime} -{" "}
                              {request.workShift.endTime})
                            </TableCell>
                            <TableCell className="p-2 text-left font-medium">
                              {request.createdAt
                                ? format(
                                    parseISO(request.createdAt),
                                    "dd/MM/yyyy HH:mm:ss"
                                  )
                                : "N/A"}
                            </TableCell>

                            <TableCell className="p-3">
                              {getStatusBadge(request.status)}
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
                                      setTypeDialog("partTime");
                                    }}
                                  >
                                    Xem chi tiết
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  <PaginationComponent
                    currentPage={partTimePage}
                    totalPage={partTimeTotalPage}
                    onPageChange={handlePartTimePageChange}
                  />
                  <CardFooter className="flex justify-between">
                    <div className="text-sm text-muted-foreground">
                      Tổng số: {partTimeTotalItem} bản ghi
                    </div>
                  </CardFooter>
                </div>
              </>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="min-w-[800px] max-h-[90vh] overflow-y-auto p-0">
          <div className="bg-white rounded-lg shadow-lg">
            <DialogHeader className="px-6 pt-6 pb-2 border-b">
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  <span>
                    {typeDialog === "leaveRequest"
                      ? "Chi tiết phiếu nghỉ phép"
                      : typeDialog === "complaint"
                      ? "Chi tiết phiếu khiếu nại"
                      : typeDialog === "revert"
                      ? "Chi tiết phiếu xin đi làm lại"
                      : "Chi tiết phiếu đăng ký part-time"}
                  </span>
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
                  {typeDialog !== "revert" && typeDialog !== "partTime" && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {typeDialog === "leaveRequest"
                          ? "Loại nghỉ phép:"
                          : "Loại khiếu nại:"}
                      </span>
                      <span className="text-sm font-medium">
                        {selectedDetail.leaveType?.name ||
                          selectedDetail.complaintType}
                      </span>
                    </div>
                  )}
                  {typeDialog === "revert" ||
                    (typeDialog === "partTime" && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Ca làm:
                        </span>
                        <span className="text-sm font-medium">
                          {selectedDetail.workShift.name} (
                          {selectedDetail.workShift.startTime} -{" "}
                          {selectedDetail.workShift.endTime})
                        </span>
                      </div>
                    ))}
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

                {typeDialog === "leaveRequest" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Từ ngày:
                      </span>
                      <span className="text-sm font-medium">
                        {selectedDetail.startDate
                          ? format(
                              parseISO(selectedDetail.startDate),
                              "dd/MM/yyyy"
                            )
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Đến ngày:
                      </span>
                      <span className="text-sm font-medium">
                        {selectedDetail.endDate
                          ? format(
                              parseISO(selectedDetail.endDate),
                              "dd/MM/yyyy"
                            )
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                )}

                {typeDialog !== "leaveRequest" && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {typeDialog === "complaint"
                        ? "Ngày cần khiếu nại:"
                        : typeDialog === "revert"
                        ? "Ngày đi làm lại:"
                        : "Ngày làm việc:"}
                    </span>
                    <span className="text-sm font-medium">
                      {selectedDetail.date
                        ? format(parseISO(selectedDetail.date), "dd/MM/yyyy")
                        : "N/A"}
                    </span>
                  </div>
                )}

                {/* Lý do */}
                {typeDialog !== "partTime" && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm text-muted-foreground font-medium">
                        {typeDialog === "leaveRequest"
                          ? "Lý do nghỉ phép:"
                          : typeDialog === "complaint"
                          ? "Lý do khiếu nại:"
                          : typeDialog === "revert"
                          ? "Lý do đi làm lại:"
                          : "Ghi chú:"}
                      </span>
                    </div>
                    <div className="bg-gray-50 border rounded p-3 text-sm text-gray-700 whitespace-pre-line">
                      {selectedDetail.reason || selectedDetail.notes}
                    </div>
                  </div>
                )}

                {/* Thông tin phản hồi */}
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
                          if (typeDialog === "leaveRequest") {
                            handleApproveLeaveRequest(
                              selectedDetail.id,
                              reasonText
                            );
                          } else if (typeDialog === "complaint") {
                            handleApproveComplaint(
                              selectedDetail.id,
                              reasonText
                            );
                          } else if (typeDialog === "revert") {
                            handleApproveRevert(selectedDetail.id, reasonText);
                          } else if (typeDialog === "partTime") {
                            handleApprovePartTime(
                              selectedDetail.id,
                              reasonText
                            );
                            setShowDetailModal(false);
                            setReasonText("");
                            setShowReasonForm(null);
                          }
                        }}
                      >
                        Xác nhận duyệt
                      </Button>
                    ) : (
                      <Button
                        variant="destructive"
                        onClick={() => {
                          if (typeDialog === "leaveRequest") {
                            handleRejectLeaveRequest(
                              selectedDetail.id,
                              reasonText
                            );
                          } else if (typeDialog === "complaint") {
                            handleRejectComplaint(
                              selectedDetail.id,
                              reasonText
                            );
                          } else if (typeDialog === "revert") {
                            handleRejectRevert(selectedDetail.id, reasonText);
                          } else if (typeDialog === "partTime") {
                            handleRejectPartTime(selectedDetail.id, reasonText);
                            setShowDetailModal(false);
                            setReasonText("");
                            setShowReasonForm(null);
                          }
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
