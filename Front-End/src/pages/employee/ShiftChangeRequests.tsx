import type React from "react";
import { useEffect, useState, useCallback } from "react";
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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MoreHorizontal,
  Calendar,
  UserIcon,
  Building,
  FileText,
  Clock,
  AlertCircle,
  ClipboardPaste,
  Eye,
  Users,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeeLayout } from "@/components/employee-layout";
import { workShiftApi } from "@/services/workShift.service";
import type { WorkShiftResponse } from "@/types/workShift.type";
import { useAuth } from "@/contexts/AuthContext";
import type {
  ShiftChangeAddRequest,
  ShiftChangeRequestResponse,
} from "@/types/shiftChangeRequest.type";
import { ShiftChangeRequestStatus } from "@/types/shiftChangeRequest.type";
import { shiftChangeRequestApi } from "@/services/shiftChangeRequest.service";
import PaginationComponent from "@/components/PaginationComponent";

export default function ShiftChangeRequest() {
  const [workShiftId, setWorkShiftId] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [targetEmployeeEmail, setTargetEmployeeEmail] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [, setLoadingShifts] = useState<boolean>(false);
  const [shifts, setShifts] = useState<WorkShiftResponse[]>([]);

  const [sentRequests, setSentRequests] = useState<
    ShiftChangeRequestResponse[]
  >([]);
  const [receivedRequests, setReceivedRequests] = useState<
    ShiftChangeRequestResponse[]
  >([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentPageReceived, setCurrentPageReceived] = useState<number>(1);
  const [totalPageSent, setTotalPageSent] = useState<number>(1);
  const [totalPageReceived, setTotalPageReceived] = useState<number>(1);
  const [totalItemSent, setTotalItemSent] = useState<number>(0);
  const [totalItemReceived, setTotalItemReceived] = useState<number>(0);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedDetail, setSelectedDetail] =
    useState<ShiftChangeRequestResponse | null>(null);

  const [tab, setTab] = useState<string>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get("tab") || "sent-requests";
  });
  const { accessToken } = useAuth();

  useEffect(() => {
    const loadShifts = async () => {
      setLoadingShifts(true);
      try {
        const response = await workShiftApi.getAllWorkShiftsActive();
        setShifts(response);
      } catch (error: any) {
      } finally {
        setLoadingShifts(false);
      }
    };
    loadShifts();
  }, [accessToken]);

  const loadSentRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await shiftChangeRequestApi.getSentShiftChangeRequests(
        currentPage,
        10
      );
      setSentRequests(response.data);
      setTotalPageSent(response.totalPage);
      setTotalItemSent(response.totalItem);
    } catch (error: any) {
      toast.error("Không thể tải đơn đã gửi. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  const loadReceivedRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response =
        await shiftChangeRequestApi.getReceivedShiftChangeRequests(
          currentPageReceived,
          10
        );
      setReceivedRequests(response.data);
      setTotalPageReceived(response.totalPage);
      setTotalItemReceived(response.totalItem);
    } catch (error: any) {
      toast.error("Không thể tải đơn đã nhận. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [currentPageReceived]);

  useEffect(() => {
    if (!accessToken) return;
    const loadData = async () => {
      if (tab === "sent-requests") {
        await loadSentRequests();
      } else if (tab === "received-requests") {
        await loadReceivedRequests();
      }
    };
    loadData();
  }, [accessToken, tab, loadSentRequests, loadReceivedRequests]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("tab", tab);
    window.history.pushState({}, "", `?${searchParams.toString()}`);
  }, [tab]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!date || !workShiftId || !targetEmployeeEmail) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setLoading(true);
    try {
      const newRequest: ShiftChangeAddRequest = {
        date: format(date, "yyyy-MM-dd"),
        targetEmployeeEmail,
        reason,
        workShiftId: parseInt(workShiftId),
      };

      const response = await shiftChangeRequestApi.createShiftChangeRequest(
        newRequest
      );
      if (response.status === 200) {
        toast.success("Gửi yêu cầu đổi ca thành công!");

        setWorkShiftId("");
        setDate(undefined);
        setTargetEmployeeEmail("");
        setReason("");
        if (tab === "sent-requests") {
          await loadSentRequests();
        }
      }
    } catch (error: any) {
      if (error.message === "Target employee not found") {
        toast.error("Email đồng nghiệp không tồn tại!");
      } else if (error.message === "Cannot create a shift change request for yourself") {
        toast.error("Không thể tạo yêu cầu đổi ca cho chính mình!");
      } else {
        toast.error("Có lỗi xảy ra. Vui lòng thử lại!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRecall = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn thu hồi đơn này?")) {
      await shiftChangeRequestApi.recallShiftChangeRequest(id);
      toast.success("Đã thu hồi đơn thành công!");
      loadSentRequests();
    }
  };

  const handleApprove = async (id: number) => {
    if (!selectedDetail) return;
    try {
      await shiftChangeRequestApi.employeeApproveShiftChangeRequest(id);
      setShowApprovalModal(false);
      toast.success("Đã duyệt yêu cầu đổi ca!");
      if (tab === "received-requests") {
        await loadReceivedRequests();
      }
    } catch (error: any) {
      if (error.message === "You cannot have work shift required for this shift change request") {
        toast.error("Không thể duyệt yêu cầu đổi ca vì bạn không sở hữu ca làm việc này!");
      } else {
        toast.error("Có lỗi xảy ra. Vui lòng thử lại!");
      }
    }

  };

  const handleReject = async (id: number) => {
    if (!selectedDetail) return;
    await shiftChangeRequestApi.employeeRejectShiftChangeRequest(id);
    setShowApprovalModal(false);
    toast.success("Đã từ chối yêu cầu đổi ca!");
    if (tab === "received-requests") {
      await loadReceivedRequests();
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

  return (
    <EmployeeLayout>
      <div className="">
        <Tabs value={tab} className="w-full" onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sent-requests">Đơn đã gửi</TabsTrigger>
            <TabsTrigger value="received-requests">Đơn đã nhận</TabsTrigger>
          </TabsList>

          <TabsContent value="sent-requests" className="space-y-6">
            <Card>
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Gửi yêu cầu đổi ca</CardTitle>
                  <CardDescription>
                    Tạo yêu cầu đổi ca làm việc với đồng nghiệp
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="workShiftId">Ca làm việc muốn đổi</Label>
                    <Select
                      value={workShiftId}
                      onValueChange={setWorkShiftId}
                      required
                    >
                      <SelectTrigger id="workshiftId">
                        <SelectValue placeholder="Chọn ca làm việc" />
                      </SelectTrigger>
                      <SelectContent>
                        {shifts.map((shift) => (
                          <SelectItem
                            key={shift.id}
                            value={shift.id.toString()}
                          >
                            {shift.name} ({shift.startTime} - {shift.endTime})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Ngày muốn đổi ca</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      className="w-full"
                      value={date ? format(date, "yyyy-MM-dd") : ""}
                      onChange={(e) =>
                        setDate(
                          e.target.value ? new Date(e.target.value) : undefined
                        )
                      }
                      min={format(new Date(), "yyyy-MM-dd")}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetEmployeeEmail">
                      Email đồng nghiệp
                    </Label>
                    <Input
                      id="targetEmployeeEmail"
                      type="email"
                      placeholder="Nhập email đồng nghiệp muốn đổi ca"
                      value={targetEmployeeEmail}
                      onChange={(e) => setTargetEmployeeEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">Lý do đổi ca</Label>
                    <Textarea
                      id="reason"
                      placeholder="Vui lòng cung cấp lý do muốn đổi ca"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Đang gửi..." : "Gửi yêu cầu"}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Danh sách đơn đã gửi</CardTitle>
                <CardDescription>
                  Xem các yêu cầu đổi ca bạn đã gửi
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
                          Ngày tạo
                        </TableHead>
                        <TableHead className="p-3 text-left font-medium">
                          Ngày yêu cầu
                        </TableHead>
                        <TableHead className="p-3 text-left font-medium">
                          Người nhận
                        </TableHead>
                        <TableHead className="p-3 text-left font-medium">
                          Ca làm
                        </TableHead>
                        <TableHead className="p-3 text-left font-medium">
                          Lý do
                        </TableHead>
                        <TableHead className="p-3 text-left font-medium">
                          Người phản hồi
                        </TableHead>
                        <TableHead className="p-3 text-left font-medium">
                          Ngày phản hồi
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
                      {sentRequests?.length > 0 ? (
                        sentRequests.map((request, index) => (
                          <TableRow
                            key={request.id}
                            className="border-b hover:bg-muted/50"
                          >
                            <TableCell>
                              {(currentPage - 1) * 10 + index + 1}
                            </TableCell>

                            <TableCell>
                              {request.createdAt
                                ? format(
                                  parseISO(request.createdAt),
                                  "dd/MM/yyyy HH:mm:ss"
                                )
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              {request.date
                                ? format(parseISO(request.date), "dd/MM/yyyy")
                                : "N/A"}
                            </TableCell>
                            <TableCell>{request.targetEmployeeName}</TableCell>
                            <TableCell>
                              {request.workShift.name}
                              <br />
                              <span className="text-xs text-muted-foreground">
                                {request.workShift.startTime} -{" "}
                                {request.workShift.endTime}
                              </span>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {request.reason}
                            </TableCell>
                            <TableCell>
                              {request.responseBy || "Chưa phản hồi"}
                            </TableCell>
                            <TableCell>
                              {request.responseDate
                                ? format(
                                  parseISO(request.createdAt),
                                  "dd/MM/yyyy HH:mm:ss"
                                )
                                : "Chưa phản hồi"}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(
                                request.status as ShiftChangeRequestStatus
                              )}
                            </TableCell>
                            <TableCell>
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
                                    <Eye width={20} className="mr-2" />
                                    Xem chi tiết
                                  </DropdownMenuItem>
                                  {request.status === "PENDING" && (
                                    <DropdownMenuItem
                                      onClick={() => handleRecall(request.id)}
                                    >
                                      <ClipboardPaste
                                        width={20}
                                        className="mr-2"
                                      />
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
                    totalPage={totalPageSent}
                    onPageChange={(page) => setCurrentPage(page)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Tổng số: {totalItemSent} bản ghi
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="received-requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Danh sách đơn đã nhận</CardTitle>
                <CardDescription>
                  Các yêu cầu đổi ca từ đồng nghiệp gửi đến bạn
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
                          Ngày tạo
                        </TableHead>
                        <TableHead className="p-3 text-left font-medium">
                          Người gửi
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
                      {receivedRequests?.length > 0 ? (
                        receivedRequests.map((request, index) => (
                          <TableRow
                            key={request.id}
                            className="border-b hover:bg-muted/50"
                          >
                            <TableCell>
                              {(currentPage - 1) * 10 + index + 1}
                            </TableCell>

                            <TableCell>
                              {request.createdAt
                                ? format(
                                  parseISO(request.createdAt),
                                  "dd/MM/yyyy HH:mm:ss"
                                )
                                : "N/A"}
                            </TableCell>
                            <TableCell>{request.employeeName}</TableCell>

                            <TableCell>
                              {request.date
                                ? format(parseISO(request.date), "dd/MM/yyyy")
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              {request.workShift.name}
                              <br />
                              <span className="text-xs text-muted-foreground">
                                {request.workShift.startTime} -{" "}
                                {request.workShift.endTime}
                              </span>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {request.reason}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(
                                request.status as ShiftChangeRequestStatus
                              )}
                            </TableCell>
                            <TableCell>
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
                                      setShowApprovalModal(true);
                                    }}
                                  >
                                    <Eye width={20} className="mr-2" />
                                    Xem chi tiết
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="p-4 text-center text-muted-foreground"
                          >
                            Không có yêu cầu đổi ca nào.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  <PaginationComponent
                    currentPage={currentPageReceived}
                    totalPage={totalPageReceived}
                    onPageChange={(page) => setCurrentPageReceived(page)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Tổng số: {totalItemReceived} bản ghi
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

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
                {selectedDetail &&
                  getStatusBadge(
                    selectedDetail.status as ShiftChangeRequestStatus
                  )}
              </div>

              {selectedDetail && (
                <div className="px-6 py-4 space-y-6">
                  {/* Thông tin người yêu cầu */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Người yêu cầu:
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

                  {/* Thông tin người nhận */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Người nhận yêu cầu:
                      </span>
                      <span className="text-sm font-medium">
                        {selectedDetail.targetEmployeeName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Bộ phận:
                      </span>
                      <span className="text-sm font-medium">
                        {selectedDetail.targetDepartmentName}
                      </span>
                    </div>
                  </div>

                  {/* Thông tin ca làm */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Ngày yêu cầu:
                      </span>
                      <span className="text-sm font-medium">
                        {format(parseISO(selectedDetail.date), "dd/MM/yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Ca làm:
                      </span>
                      <span className="text-sm font-medium">
                        {selectedDetail.workShift.name} (
                        {selectedDetail.workShift.startTime} -{" "}
                        {selectedDetail.workShift.endTime})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Ngày gửi:
                    </span>
                    <span className="text-sm font-medium">
                      {format(
                        parseISO(selectedDetail.createdAt),
                        "dd/MM/yyyy HH:mm:ss"
                      )}
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
                      {selectedDetail.reason}
                    </div>
                  </div>

                  {/* Thông tin duyệt */}
                  {(selectedDetail.status === "APPROVED" ||
                    selectedDetail.status === "REJECTED") && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground font-medium">
                            Thông tin duyệt:
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Người:
                            </span>
                            <span className="text-sm font-medium">
                              {selectedDetail.responseBy || "Chưa phản hồi"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Ngày:
                            </span>
                            <span className="text-sm font-medium">
                              {selectedDetail.responseDate
                                ? format(
                                  parseISO(selectedDetail.responseDate),
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

        {/* Approval Modal */}
        <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
          <DialogContent className="min-w-[600px] max-h-[90vh] overflow-y-auto p-0">
            <div className="bg-white rounded-lg shadow-lg">
              <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b">
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  <span className="text-base font-semibold">
                    Chi tiết phiếu yêu cầu đổi ca
                  </span>
                </DialogTitle>
                {getStatusBadge(
                  selectedDetail?.status as ShiftChangeRequestStatus
                )}
              </div>

              {selectedDetail && (
                <div className="px-6 py-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-muted-foreground" />
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
                        Ngày yêu cầu đổi ca:
                      </span>
                      <span className="text-sm font-medium">
                        {format(parseISO(selectedDetail.date), "dd/MM/yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Ngày tạo:
                      </span>
                      <span className="text-sm font-medium">
                        {format(
                          parseISO(selectedDetail.createdAt),
                          "dd/MM/yyyy HH:mm:ss"
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="grid gap-4">
                    <div className="flex gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Ca làm:
                      </span>
                      <span className="text-sm font-medium">
                        {selectedDetail.workShift.name} (
                        {selectedDetail.workShift.startTime} -{" "}
                        {selectedDetail.workShift.endTime})
                      </span>
                    </div>

                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm text-muted-foreground font-medium">
                        Lý do yêu cầu đổi ca:
                      </span>
                    </div>
                    <div className="bg-gray-50 border rounded p-3 text-sm text-gray-700 whitespace-pre-line">
                      {selectedDetail.reason}
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter className="flex flex-col sm:flex-row gap-2 px-6 pb-6 pt-2 border-t mt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowApprovalModal(false)}
                  className="flex-1 sm:flex-none"
                >
                  Đóng
                </Button>
                {(selectedDetail?.status as ShiftChangeRequestStatus) ===
                  ShiftChangeRequestStatus.PENDING && (
                    <>
                      <Button
                        variant="destructive"
                        onClick={() =>
                          selectedDetail && handleReject(selectedDetail.id)
                        }
                        className="flex-1 sm:flex-none"
                      >
                        Từ chối
                      </Button>
                      <Button
                        onClick={() =>
                          selectedDetail && handleApprove(selectedDetail.id)
                        }
                        className="flex-1 sm:flex-none"
                      >
                        Duyệt
                      </Button>
                    </>
                  )}
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </EmployeeLayout>
  );
}
