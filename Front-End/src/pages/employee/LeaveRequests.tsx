import type React from "react";

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
import {
  LeaveRequestStatus,
  type LeaveRequestAdd,
  type LeaveRequestResponse,
} from "@/types/leaveRequest.type";
import { leaveRequestApi } from "@/services/leaveRequest.service";
import PaginationComponent from "@/components/PaginationComponent";
import type { WorkShift } from "@/types/workShiftAssignment.type";
import { workShiftApi } from "@/services/workShift.service";
import type { LeaveType } from "@/types/leaveType";
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  RevertLeaveRequestAddRequest,
  RevertLeaveRequestResponse,
  RevertLeaveRequestStatus,
} from "@/types/revertLeaveRequest.type";
import { revertLeaveRequestApi } from "@/services/revertLeaveRequest.service";

function LeaveRequestsPage() {
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);

  // States for "Đăng ký đi làm lại" tab
  const [revertDate, setRevertDate] = useState<Date | undefined>(undefined);
  const [revertReason, setRevertReason] = useState("");
  const [revertShift, setRevertShift] = useState("");
  const [revertShifts, setRevertShifts] = useState<WorkShift[]>([]);
  const [loadingRevertShifts, setLoadingRevertShifts] =
    useState<boolean>(false);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestResponse[]>(
    []
  );
  const [revertLeaveRequests, setRevertLeaveRequests] = useState<
    RevertLeaveRequestResponse[]
  >([]);
  const [loadingRevert, setLoadingRevert] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentPageRevert, setCurrentPageRevert] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [totalPagesRevert, setTotalPagesRevert] = useState<number>(1);
  const [totalLeaveRequests, setTotalLeaveRequests] = useState<number>(0);
  const [totalRevertLeaveRequests, setTotalRevertLeaveRequests] =
    useState<number>(0);
  const [shifts, setShifts] = useState<WorkShift[]>([]);
  const [selectedShift, setSelectedShift] = useState("");
  const [loadingShifts, setLoadingShifts] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<any>(null);
  const { accessToken } = useAuth();
  const [tab, setTab] = useState<string>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get("tab") || "leave-request";
  });

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
            format(startDate, "yyyy-MM-dd"),
            format(endDate, "yyyy-MM-dd")
          );
        setShifts(response);
      } catch (error: any) {
        toast.error("Không thể tải ca làm việc. Vui lòng thử lại sau.");
      } finally {
        setLoadingShifts(false);
      }
    };
    loadShifts();
  }, [accessToken, startDate, endDate]);

  useEffect(() => {
    const loadReturnShifts = async () => {
      setLoadingRevertShifts(true);
      if (!revertDate) {
        setRevertShifts([]);
        return;
      }
      const response =
        await workShiftApi.getWorkShiftsByEmployeeByDateHaveAttendanceLeave(
          format(revertDate, "yyyy-MM-dd")
        );
      setRevertShifts(response.data);
      setTotalRevertLeaveRequests(response.data.totalItem);
      setLoadingRevertShifts(false);
    };
    loadReturnShifts();
  }, [accessToken, revertDate]);

  useEffect(() => {
    const loadLeaveTypes = async () => {
      setLoading(true);
      try {
        const response = await leaveTypeApi.getLeaveTypeEnableInYear();
        setLeaveTypes(response);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    loadLeaveTypes();
  }, []);

  const loadLeaveRequests = useCallback(async () => {
    setLoading(true);
    const response = await leaveRequestApi.getAllLeaveRequestsByEmployee(
      currentPage,
      10
    );
    setLeaveRequests(response.data);
    setTotalPage(response.totalPage);
    setTotalLeaveRequests(response.totalItem);
    setLoading(false);
  }, [accessToken, currentPage]);

  const loadRevertLeaveRequests = useCallback(async () => {
    setLoading(true);
    const response =
      await revertLeaveRequestApi.getAllRevertLeaveRequestsByEmployee(
        currentPage,
        10
      );
    console.log(response);
    setTotalPagesRevert(response.data.totalPage);
    setRevertLeaveRequests(response.data.data);
    setTotalRevertLeaveRequests(response.data.totalItem);
  }, [accessToken, currentPage]);

  useEffect(() => {
    if (!accessToken) return;
    const loadData = async () => {
      if (tab === "leave-request") {
        await loadLeaveRequests();
      } else if (tab === "revert-leave-request") {
        await loadRevertLeaveRequests();
      }
    };
    loadData();
  }, [accessToken, tab, loadLeaveRequests, loadRevertLeaveRequests]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("tab", tab);
    window.history.pushState({}, "", `?${searchParams.toString()}`);
  }, [tab]);

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

    const newLeaveRequest: LeaveRequestAdd = {
      startDate,
      endDate,
      reason,
      leaveTypeId: Number.parseInt(leaveType),
      workShiftId: Number.parseInt(selectedShift),
    };

    await leaveRequestApi.createLeaveRequest(newLeaveRequest);
    toast.success("Đăng ký giấy nghỉ phép thành công");
    setLeaveType("");
    setStartDate(undefined);
    setEndDate(undefined);
    setReason("");
    setSelectedShift("");
    if (tab === "leave-request") {
      loadLeaveRequests();
    }
  };

  const handleReturnToWorkSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!revertDate) {
      toast.error("Vui lòng chọn ngày đi làm lại!");
      return;
    }

    if (!revertShift) {
      toast.error("Vui lòng chọn ca làm việc!");
      return;
    }
    const revertLeaveRequest: RevertLeaveRequestAddRequest = {
      date: format(revertDate, "yyyy-MM-dd"),
      reason: revertReason,
      workShiftId: Number.parseInt(revertShift),
    };

    const response = await revertLeaveRequestApi.createRevertLeaveRequest(
      revertLeaveRequest
    );
    console.log(response);
    if (response.status === 201) {
      toast.success("Đăng ký đi làm lại thành công");
    }
    if (tab === "revert-leave-request") {
      loadRevertLeaveRequests();
    }
    setRevertDate(undefined);
    setRevertReason("");
    setRevertShift("");
  };

  const getStatusBadge = (
    status: LeaveRequestStatus | RevertLeaveRequestStatus
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
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // if (loading || loadingRevert) {
  //   return <Spinner layout="employee" />;
  // }

  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

  const onPageChangeRevert = (page: number) => {
    setCurrentPageRevert(page);
  };

  const handleRecall = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn thu hồi đơn này?")) {
      await leaveRequestApi.recallLeaveRequest(id);
      toast.success("Đã thu hồi đơn thành công!");
      loadLeaveRequests();
    }
  };

  const handleRecallRevert = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn thu hồi đơn này?")) {
      await revertLeaveRequestApi.recallRevertLeaveRequest(id);
      toast.success("Đã thu hồi đơn thành công!");
      loadRevertLeaveRequests();
    }
  };

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        <Tabs value={tab} className="w-full" onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="leave-request">Nghỉ phép</TabsTrigger>
            <TabsTrigger value="revert-leave-request">Đi làm lại</TabsTrigger>
          </TabsList>

          <TabsContent value="leave-request" className="space-y-6">
            <Card>
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Đăng ký nghỉ phép</CardTitle>
                  <CardDescription>Gửi đơn xin nghỉ phép mới</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="leaveType">Loại nghỉ phép</Label>
                    <Select
                      value={leaveType}
                      onValueChange={setLeaveType}
                      required
                    >
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
                            e.target.value
                              ? new Date(e.target.value)
                              : undefined
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
                            e.target.value
                              ? new Date(e.target.value)
                              : undefined
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
                            <SelectItem
                              key={shift.id}
                              value={shift.id.toString()}
                            >
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
                      {leaveRequests?.length > 0 ? (
                        leaveRequests.map((request, index) => (
                          <TableRow
                            key={request.id}
                            className="border-b hover:bg-muted/50"
                          >
                            <TableCell>
                              {(currentPage - 1) * 10 + index + 1}
                            </TableCell>
                            <TableCell>{request.leaveType?.name}</TableCell>
                            <TableCell>
                              {request.createdAt
                                ? format(
                                    parseISO(request.createdAt),
                                    "dd/MM/yyyy HH:mm:ss"
                                  )
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              {request.startDate
                                ? format(
                                    parseISO(request.startDate),
                                    "dd/MM/yyyy"
                                  )
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              {request.endDate
                                ? format(
                                    parseISO(request.endDate),
                                    "dd/MM/yyyy"
                                  )
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(
                                request.status as LeaveRequestStatus
                              )}
                            </TableCell>
                            <TableCell>{request.reason}</TableCell>
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
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Tổng số: {totalLeaveRequests} bản ghi
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="revert-leave-request" className="space-y-6">
            <Card>
              <form onSubmit={handleReturnToWorkSubmit}>
                <CardHeader>
                  <CardTitle>Đăng ký đi làm lại</CardTitle>
                  <CardDescription>
                    Đăng ký làm việc các ngày nghỉ phép
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="revertDate">Ngày đi làm lại</Label>
                    <Input
                      id="revertDate"
                      name="revertDate"
                      type="date"
                      className="w-full"
                      value={revertDate ? format(revertDate, "yyyy-MM-dd") : ""}
                      onChange={(e) =>
                        setRevertDate(
                          e.target.value ? new Date(e.target.value) : undefined
                        )
                      }
                      min={format(new Date(), "yyyy-MM-dd")}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="revertShift">Ca làm việc</Label>
                    <Select
                      value={revertShift}
                      onValueChange={setRevertShift}
                      disabled={loadingRevertShifts}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn ca làm việc" />
                      </SelectTrigger>
                      <SelectContent>
                        {revertShifts.length > 0 && !loadingRevertShifts ? (
                          revertShifts.map((shift) => (
                            <SelectItem
                              key={shift.id}
                              value={shift.id.toString()}
                            >
                              {shift.name}
                              <br />
                              <span className="text-muted-foreground">
                                {(shift.startTime || "00:00") +
                                  " - " +
                                  (shift.endTime || "00:00")}
                              </span>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            {loadingRevertShifts
                              ? "Đang tải..."
                              : "Không có ca làm việc nào"}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="revertReason">Lý do đi làm lại</Label>
                    <Textarea
                      id="revertReason"
                      placeholder="Vui lòng cung cấp lý do đi làm lại (tùy chọn)"
                      value={revertReason}
                      onChange={(e) => setRevertReason(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit">Đăng ký đi làm lại</Button>
                </CardFooter>
              </form>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Lịch sử đăng ký đi làm lại</CardTitle>
                <CardDescription>
                  Xem lịch sử đơn đăng ký đi làm lại của bạn
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
                          Ngày đi làm lại
                        </TableHead>
                        <TableHead className="p-3 text-left font-medium">
                          Ca làm việc
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
                      {revertLeaveRequests?.length > 0 ? (
                        revertLeaveRequests.map((revert, index) => (
                          <TableRow
                            key={revert.id}
                            className="border-b hover:bg-muted/50"
                          >
                            <TableCell>
                              {(currentPageRevert - 1) * 10 + index + 1}
                            </TableCell>
                            <TableCell>
                              {revert.date
                                ? format(parseISO(revert.date), "dd/MM/yyyy")
                                : "N/A"}
                            </TableCell>
                            <TableCell>{revert.workShift.name}</TableCell>
                            <TableCell>
                              {getStatusBadge(
                                revert.status as RevertLeaveRequestStatus
                              )}
                            </TableCell>
                            <TableCell>{revert.reason}</TableCell>
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
                                      setSelectedDetail(revert);
                                      setShowDetailModal(true);
                                    }}
                                  >
                                    <Eye width={20} className="mr-2" />
                                    Xem chi tiết
                                  </DropdownMenuItem>
                                  {revert.status === "PENDING" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleRecallRevert(revert.id)
                                      }
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
                            colSpan={5}
                            className="p-4 text-center text-muted-foreground"
                          >
                            Không có đơn đăng ký đi làm lại nào.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  <PaginationComponent
                    currentPage={currentPage}
                    totalPage={totalPagesRevert}
                    onPageChange={onPageChangeRevert}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Tổng số: {totalRevertLeaveRequests} bản ghi
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="min-w-[800px] max-h-[90vh] overflow-y-auto p-0">
          <div className="bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b">
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <span className="text-base font-semibold">
                  Chi tiết phiếu nghỉ phép
                </span>
              </DialogTitle>
              {getStatusBadge(selectedDetail?.status)}
            </div>

            {selectedDetail && (
              <div className="px-6 py-4 space-y-6">
                {/* Thông tin nhân viên */}
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

                {/* Thông tin nghỉ phép */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Loại nghỉ phép:
                    </span>
                    <span className="text-sm font-medium">
                      {selectedDetail.leaveType?.name}
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
                  {selectedDetail.date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Ngày đi làm lại:
                      </span>
                      <span className="text-sm font-medium">
                        {selectedDetail.date
                          ? format(parseISO(selectedDetail.date), "dd/MM/yyyy")
                          : "N/A"}
                      </span>
                    </div>
                  )}
                  {selectedDetail.startDate && (
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
                  )}
                  {selectedDetail.endDate && (
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
                  )}
                </div>

                {/* Lý do */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm text-muted-foreground font-medium">
                      Lý do xin nghỉ:
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
                          Người duyệt:
                        </span>
                        <span className="text-sm font-medium">
                          {selectedDetail.responseBy || "Chưa phản hồi"}
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
    </EmployeeLayout>
  );
}

export default LeaveRequestsPage;
