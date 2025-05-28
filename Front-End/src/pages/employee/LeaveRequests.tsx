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
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { EmployeeLayout } from "@/components/employee-layout";
import { Input } from "@/components/ui/input";
import { leaveTypeApi } from "@/services/leaveType.service";
import { toast } from "sonner";
import type { User } from "@/types/user.type";
import {
  LeaveRequestStatus,
  type LeaveRequestAdd,
  type LeaveRequestResponse,
  type LeaveType,
} from "@/types/leaveRequest.type";
import { leaveRequestApi } from "@/services/leaveRequest.service";
import { localStorageUtil } from "@/utils/localStorageUtil";
import PaginationComponent from "@/components/PaginationComponent";

function LeaveRequestsPage() {
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [user, setUser] = useState<User>(
    localStorageUtil.getUserFromLocalStorage()
  );
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestResponse[]>(
    []
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);

  useEffect(() => {
    // const savedUser = localStorage.getItem("user");
    // if (savedUser) {
    //   setUser(JSON.parse(savedUser));
    // }
    // setLoading(false);
  }, []);

  useEffect(() => {
    const loadLeaveTypes = async () => {
      setLoading(true);
      try {
        const response = await leaveTypeApi.getAllLeaveTypes();
        setLeaveTypes(response);
      } catch (error) {
        console.error(error);
        toast.error("Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    loadLeaveTypes();
  }, []);

  const loadLeaveRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await leaveRequestApi.getAllLeaveRequestsByEmployee(
        user.id,
        currentPage,
        3
      );
      console.log(response);
      setLeaveRequests(response.data);
      setTotalPage(response.totalPage);
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [user, currentPage]);

  useEffect(() => {
    if (!user) return;
    loadLeaveRequests();
  }, [user, loadLeaveRequests]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error("Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc!");
      return;
    }

    if (!user) {
      toast.error("User chưa đăng nhập!");
      return;
    }

    console.log(leaveType);

    const newLeaveRequest: LeaveRequestAdd = {
      employeeId: user.id,
      startDate,
      endDate,
      reason,
      leaveTypeId: Number.parseInt(leaveType),
    };

    try {
      await leaveRequestApi.createLeaveRequest(newLeaveRequest);
      toast.success("Đăng ký giấy nghỉ phép thành công");
      setLeaveType("");
      setStartDate(undefined);
      setEndDate(undefined);
      setReason("");
      loadLeaveRequests();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Lỗi khi thêm ngày nghỉ phép";
      toast.error(message);
    }
    // Reset form
  };

  const getStatusBadge = (status: LeaveRequestStatus) => {
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

  if (!loading) {
    <div>Đang tải </div>;
  }

  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRecall = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn thu hồi đơn này?")) {
      try {
        await leaveRequestApi.recallLeaveRequest(id);
        toast.success("Đã thu hồi đơn thành công!");
        loadLeaveRequests();
      } catch (error) {
        console.error("Lỗi khi thu hồi đơn:", error);
        toast.error("Thu hồi đơn không thành công. Vui lòng thử lại.");
      }
    }
  };

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Đăng ký nghỉ phép</CardTitle>
              <CardDescription>Gửi đơn xin nghỉ phép mới</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="leaveType">Loại nghỉ phép</Label>
                <Select value={leaveType} onValueChange={setLeaveType} required>
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
                        e.target.value ? new Date(e.target.value) : undefined
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
                        e.target.value ? new Date(e.target.value) : undefined
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
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left font-medium">
                      Loại nghỉ phép
                    </th>
                    <th className="p-4 text-left font-medium">
                      Ngày tạo phiếu
                    </th>
                    <th className="p-3 text-left font-medium">Nghỉ từ ngày</th>
                    <th className="p-3 text-left font-medium">Nghỉ đến ngày</th>
                    <th className="p-3 text-left font-medium">Trạng thái</th>
                    <th className="p-3 text-left font-medium">Lý do</th>
                    <th className="p-3 text-left font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                      </td>
                    </tr>
                  ) : leaveRequests?.length > 0 ? (
                    leaveRequests.map((request) => (
                      <tr
                        key={request.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="p-3">{request.leaveType.name}</td>
                        <td className="p-3">
                          {" "}
                          {request.createdAt
                            ? format(
                                parseISO(request.createdAt),
                                "dd/MM/yyyy HH:mm:ss"
                              )
                            : "N/A"}
                        </td>
                        <td className="p-3">{request.startDate}</td>
                        <td className="p-3">{request.endDate}</td>
                        <td className="p-3">
                          {getStatusBadge(request.status as LeaveRequestStatus)}
                        </td>
                        <td className="p-3">{request.reason}</td>
                        <td className="p-3">
                          {request.status === "PENDING" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRecall(request.id)}
                            >
                              Thu hồi
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-4 text-center text-muted-foreground"
                      >
                        Không có đơn xin nghỉ phép nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <PaginationComponent
                currentPage={currentPage}
                totalPage={totalPage}
                onPageChange={onPageChange}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </EmployeeLayout>
  );
}

export default LeaveRequestsPage;
