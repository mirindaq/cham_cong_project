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
import { partTimeApi } from "@/services/partTime.service";
import type {
  PartTimeRequestAddRequest,
  PartTimeRequestResponse,
} from "@/types/partTime.type";
import { PartTimeRequestStatus } from "@/types/partTime.type";
import type { WorkShiftResponse } from "@/types/workShift.type";
import { workShiftApi } from "@/services/workShift.service";

function PartTime() {
  const [workDate, setWorkDate] = useState<Date | undefined>(undefined);
  const [selectedShift, setSelectedShift] = useState<string>("");
  const [partTimeRequests, setPartTimeRequests] = useState<
    PartTimeRequestResponse[]
  >([]);
  const [shifts, setShifts] = useState<WorkShiftResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [totalItem, setTotalItem] = useState<number>(0);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetail, setSelectedDetail] =
    useState<PartTimeRequestResponse | null>(null);
  const { accessToken } = useAuth();

  const loadPartTimeRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await partTimeApi.getAllPartTimeRequestsByEmployee(
        currentPage,
        10
      );
      setPartTimeRequests(response.data);
      setTotalPage(response.totalPage);
      setTotalItem(response.totalItem);
    } catch (error: any) {
      toast.error("Lỗi khi tải danh sách đăng ký part-time");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  const loadShifts = useCallback(async () => {
    try {
      const response = await workShiftApi.getAllWorkShiftsPartTimeActive();
      console.log("Shifts loaded:", response);
      setShifts(response);
    } catch (error: any) {
      toast.error("Lỗi khi tải danh sách ca làm việc");
    }
  }, []);

  useEffect(() => {
    if (accessToken) {
      loadPartTimeRequests();
      loadShifts();
    }
  }, [accessToken, loadPartTimeRequests, loadShifts]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!accessToken) {
      return;
    }

    if (!workDate || !selectedShift) {
      toast.error("Vui lòng chọn ngày và ca làm việc");
      return;
    }

    try {
      const newRequest: PartTimeRequestAddRequest = {
        date: format(workDate, "yyyy-MM-dd"),
        workShiftId: Number(selectedShift),
      };

      const response = await partTimeApi.createPartTimeRequest(newRequest);
      if (response.status === 201) {
        toast.success("Đã gửi yêu cầu đăng ký part-time thành công!");
      }
      loadPartTimeRequests();

      // Reset form
      setWorkDate(undefined);
      setSelectedShift("");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleCancel = async (id: number) => {
    if (
      window.confirm("Bạn có chắc chắn muốn thu hồi đăng ký part-time này?")
    ) {
      try {
        // Simulate API call
        const response = await partTimeApi.recallPartTimeRequest(id);
        if (response.status === 200) {
          toast.success("Đã thu hồi đăng ký part-time thành công!");
          loadPartTimeRequests();
        }
      } catch (error) {
        toast.error("Lỗi khi thu hồi đăng ký");
      }
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
              <CardTitle>Đăng Ký Làm Part-time</CardTitle>
              <CardDescription>
                Đăng ký ca làm việc part-time theo nhu cầu
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
                >
                  <SelectTrigger id="selectedShift">
                    <SelectValue placeholder="Chọn ca làm việc" />
                  </SelectTrigger>
                  <SelectContent>
                    {shifts.length > 0 ? (
                      shifts.map((shift) => (
                        <SelectItem key={shift.id} value={shift.id.toString()}>
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
            </CardContent>
            <CardFooter>
              <Button type="submit">Gửi Đăng Ký</Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lịch Sử Đăng Ký Part-time</CardTitle>
            <CardDescription>
              Xem lịch sử đăng ký làm part-time của bạn
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
                    <TableHead>Ngày đăng ký</TableHead>
                    <TableHead>Ngày phản hồi</TableHead>
                    <TableHead>Người phản hồi</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partTimeRequests.map((request, index) => (
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
                  {partTimeRequests.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center">
                        Không có đăng ký part-time nào
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
                <Briefcase className="w-5 h-5" />
                <span className="text-base font-semibold">
                  Chi tiết đăng ký part-time
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

                {/* Thông tin part-time */}
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

export default PartTime;
