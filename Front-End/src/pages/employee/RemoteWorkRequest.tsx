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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { EmployeeLayout } from "@/components/employee-layout";
import { toast } from "sonner";
import PaginationComponent from "@/components/PaginationComponent";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import Spinner from "@/components/Spinner";
import {
  Building,
  Calendar,
  ClipboardPaste,
  Clock,
  Eye,
  FileText,
  MoreHorizontal,
  UserIcon,
  Briefcase,
  Home,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { remoteWorkRequestApi } from "@/services/remoteWorkRequest.service";
import type {
  RemoteWorkRequestAddRequest,
  RemoteWorkRequestResponse,
} from "@/types/remoteWorkRequest.type";
import { RemoteWorkRequestStatus } from "@/types/remoteWorkRequest.type";
import type { WorkShiftResponse } from "@/types/workShift.type";
import { workShiftApi } from "@/services/workShift.service";

function RemoteWorkRequest() {
  const [workDate, setWorkDate] = useState<Date | undefined>(undefined);
  const [selectedShift, setSelectedShift] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [remoteWorkRequests, setRemoteWorkRequests] = useState<
    RemoteWorkRequestResponse[]
  >([]);
  const [shifts, setShifts] = useState<WorkShiftResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingShifts, setLoadingShifts] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [, setTotalItem] = useState<number>(0);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetail, setSelectedDetail] =
    useState<RemoteWorkRequestResponse | null>(null);
  const { accessToken } = useAuth();

  const loadRemoteWorkRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await remoteWorkRequestApi.getAllRemoteWorkRequestsByEmployee(
        currentPage,
        10
      );
      console.log("Remote work requests:", response.data);
      setRemoteWorkRequests(response.data);
      setTotalPage(response.totalPage);
      setTotalItem(response.totalItem);
    } catch (error: any) {
      toast.error("Lỗi khi tải danh sách yêu cầu làm việc từ xa");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  const loadShiftsByDate = useCallback(async (date: string) => {
    setLoadingShifts(true);
    try {
      const response = await workShiftApi.getWorkShiftsByEmployeeIdBetweenDate(
        date,
        date
      );
      console.log("Shifts loaded for date:", date, response);
      setShifts(response);
    } catch (error: any) {
      toast.error("Lỗi khi tải danh sách ca làm việc");
      setShifts([]);
    } finally {
      setLoadingShifts(false);
    }
  }, []);

  useEffect(() => {
    if (accessToken) {
      loadRemoteWorkRequests();
    }
  }, [accessToken, loadRemoteWorkRequests]);

  // Load shifts when date changes
  useEffect(() => {
    if (workDate) {
      const dateString = format(workDate, "yyyy-MM-dd");
      loadShiftsByDate(dateString);
      setSelectedShift(""); // Reset selected shift when date changes
    } else {
      setShifts([]);
      setSelectedShift("");
    }
  }, [workDate, loadShiftsByDate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!accessToken) {
      return;
    }

    if (!workDate || !selectedShift || !reason.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      const newRequest: RemoteWorkRequestAddRequest = {
        date: format(workDate, "yyyy-MM-dd"),
        workShiftId: Number(selectedShift),
        reason: reason.trim(),
      };

      const response = await remoteWorkRequestApi.createRemoteWorkRequest(newRequest);
      if (response.status === 201) {
        toast.success("Đã gửi yêu cầu làm việc từ xa thành công!");
      }
      loadRemoteWorkRequests();

      // Reset form
      setWorkDate(undefined);
      setSelectedShift("");
      setReason("");
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi gửi yêu cầu");
    }
  };

  const handleCancel = async (id: number) => {
    if (
      window.confirm("Bạn có chắc chắn muốn thu hồi yêu cầu làm việc từ xa này?")
    ) {
      try {
        const response = await remoteWorkRequestApi.recallRemoteWorkRequest(id);
        if (response.status === 200) {
          toast.success("Đã thu hồi yêu cầu làm việc từ xa thành công!");
          loadRemoteWorkRequests();
        }
      } catch (error) {
        toast.error("Lỗi khi thu hồi yêu cầu");
      }
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
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return <Spinner layout="employee" />;
  }

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Đăng Ký Làm Việc Từ Xa</CardTitle>
              <CardDescription>
                Đăng ký làm việc từ xa cho ngày và ca làm việc cụ thể
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workDate">Ngày Làm Việc</Label>
                <Input
                  id="workDate"
                  type="date"
                  value={workDate ? format(workDate, "yyyy-MM-dd") : ""}
                  onChange={(e) =>
                    setWorkDate(
                      e.target.value ? new Date(e.target.value) : undefined
                    )
                  }
                  required
                  min={format(new Date(), "yyyy-MM-dd")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="selectedShift">Ca Làm Việc</Label>
                <Select
                  value={selectedShift}
                  onValueChange={setSelectedShift}
                  required
                  disabled={loadingShifts || shifts.length === 0}
                >
                  <SelectTrigger id="selectedShift">
                    <SelectValue 
                      placeholder={
                        loadingShifts 
                          ? "Đang tải ca làm việc..." 
                          : shifts.length === 0 
                            ? "Vui lòng chọn ngày trước" 
                            : "Chọn ca làm việc"
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {shifts.length > 0 ? (
                      shifts.map((shift) => (
                        <SelectItem key={shift.id} value={shift.id.toString()}>
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
                        {loadingShifts ? "Đang tải..." : "Không có ca làm việc nào"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Lý Do</Label>
                <Textarea
                  id="reason"
                  placeholder="Nhập lý do làm việc từ xa..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loadingShifts || shifts.length === 0}>
                Gửi Yêu Cầu
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lịch Sử Yêu Cầu Làm Việc Từ Xa</CardTitle>
            <CardDescription>
              Xem lịch sử yêu cầu làm việc từ xa của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>STT</TableHead>
                    <TableHead>Ngày làm việc</TableHead>
                    <TableHead>Ca làm việc</TableHead>
                    <TableHead>Lý do</TableHead>
                    <TableHead>Ngày đăng ký</TableHead>
                    <TableHead>Ngày phản hồi</TableHead>
                    <TableHead>Người phản hồi</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {remoteWorkRequests?.map((request, index) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        {(currentPage - 1) * 10 + index + 1}
                      </TableCell>
                      <TableCell>
                        {request.date
                          ? format(parseISO(request.date), "dd/MM/yyyy")
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {request.workShift.name}({request.workShift.startTime} -{" "}
                        {request.workShift.endTime})
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={request.reason}>
                          {request.reason}
                        </div>
                      </TableCell>
                      <TableCell>
                        {request.createdAt
                          ? format(
                              parseISO(request.createdAt),
                              "dd/MM/yyyy HH:mm"
                            )
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {request.responseDate
                          ? format(
                              parseISO(request.responseDate),
                              "dd/MM/yyyy HH:mm"
                            )
                          : "Chưa phản hồi"}
                      </TableCell>
                      <TableCell>
                        {request.responseBy || "Chưa phản hồi"}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
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
                                onClick={() => handleCancel(request.id)}
                              >
                                <ClipboardPaste width={20} className="mr-2" />
                                Thu hồi
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {remoteWorkRequests.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center">
                        Không có yêu cầu làm việc từ xa nào
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
              <DialogTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                <span className="text-base font-semibold">
                  Chi tiết yêu cầu làm việc từ xa
                </span>
              </DialogTitle>
              {selectedDetail && getStatusBadge(selectedDetail.status)}
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

                {/* Thông tin làm việc từ xa */}
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
                      Ca đăng ký:
                    </span>
                    {selectedDetail.workShift ? (
                      <span className="text-sm font-medium">
                        {selectedDetail.workShift.name} (
                        {selectedDetail.workShift.startTime} -{" "}
                        {selectedDetail.workShift.endTime})
                      </span>
                    ) : (
                      <span className="text-sm font-medium"></span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Ngày đăng ký:
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

                {/* Lý do */}
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

                {/* Thông tin duyệt */}
                {(selectedDetail.status === "APPROVED" ||
                  selectedDetail.status === "REJECTED") && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
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
                          {selectedDetail.responseBy || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Ngày phản hồi:
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
                    {selectedDetail.responseNote && (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground font-medium">
                            Ghi chú phản hồi:
                          </span>
                        </div>
                        <div className="bg-gray-50 border rounded p-3 text-sm text-gray-700 whitespace-pre-line">
                          {selectedDetail.responseNote}
                        </div>
                      </div>
                    )}
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

export default RemoteWorkRequest;
