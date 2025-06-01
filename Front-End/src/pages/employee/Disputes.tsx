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
import {
  ComplaintStatus,
  ComplaintType,
  type ComplaintAddRequest,
  type ComplaintResponse,
} from "@/types/complaint.type";
import { localStorageUtil } from "@/utils/localStorageUtil";
import type { User } from "@/types/user.type";
import { toast } from "sonner";
import { complaintApi } from "@/services/complaint.service";
import PaginationComponent from "@/components/PaginationComponent";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function DisputesPage() {
  const [disputeDate, setDisputeDate] = useState<Date | undefined>(undefined);
  const [disputeType, setDisputeType] = useState<string>("");

  const [requestedChange, setRequestedChange] = useState("");
  const [reason, setReason] = useState("");
  const [complaints, setComplaints] = useState<ComplaintResponse[]>([]);
  const [user, setUser] = useState<User>(
    localStorageUtil.getUserFromLocalStorage()
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);

  const loadComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const response = await complaintApi.getAllComplaintsByEmployee(
        user.id,
        currentPage,
        3
      );
      setComplaints(response.data);
      setTotalPage(response.totalPage);
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi tải dữ liệu khiếu nại");
    } finally {
      setLoading(false);
    }
  }, [user, currentPage]);

  useEffect(() => {
    if (user && user.id) {
      loadComplaints();
    }
  }, [user, loadComplaints]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const newComplaint: ComplaintAddRequest = {
        employeeId: user.id,
        reason,
        date: disputeDate ? disputeDate : new Date(),
        complaintType: disputeType,
        requestChange: requestedChange,
      };
      await complaintApi.createComplaint(newComplaint);
      toast.success("Đã gửi yêu cầu khiếu nại thành công!");
      loadComplaints();
      // Reset form
      setDisputeDate(undefined);
      setDisputeType("");
      setRequestedChange("");
      setReason("");
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Lỗi khi yêu cầu khiếu nại";
      toast.error(message);
    }
  };

  const handleRecall = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn thu hồi đơn khiếu nại này?")) {
      try {
        await complaintApi.recallComplaint(id);
        toast.success("Đã thu hồi đơn thành công!");
        loadComplaints();
      } catch (error) {
        console.error("Lỗi khi thu hồi đơn:", error);
        toast.error("Thu hồi đơn không thành công. Vui lòng thử lại.");
      }
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
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) return <>Đang tải</>;

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Gửi Khiếu Nại Chấm Công</CardTitle>
              <CardDescription>
                Yêu cầu chỉnh sửa thông tin chấm công của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="disputeDate">Ngày Cần Khiếu Nại</Label>
                <Input
                  id="disputeDate"
                  type="date"
                  value={disputeDate ? format(disputeDate, "yyyy-MM-dd") : ""}
                  onChange={(e) =>
                    setDisputeDate(
                      e.target.value ? new Date(e.target.value) : undefined
                    )
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="disputeType">Loại Vấn Đề</Label>
                <Select
                  value={disputeType}
                  onValueChange={setDisputeType}
                  required
                >
                  <SelectTrigger id="disputeType">
                    <SelectValue placeholder="Chọn loại vấn đề" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ComplaintType).map(([key, displayName]) => (
                      <SelectItem key={key} value={key}>
                        {displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requestedChange">Yêu Cầu Thay Đổi</Label>
                <Input
                  id="requestedChange"
                  placeholder="Ví dụ: Thêm giờ checkout: 17:30"
                  value={requestedChange}
                  onChange={(e) => setRequestedChange(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Lý Do Khiếu Nại</Label>
                <Textarea
                  id="reason"
                  placeholder="Vui lòng giải thích lý do cần chỉnh sửa"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit">Gửi Khiếu Nại</Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lịch Sử Khiếu Nại</CardTitle>
            <CardDescription>
              Xem lịch sử khiếu nại chấm công của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>STT</TableHead>
                    <TableHead>Ngày cần khiếu nại</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Loại khiếu nại</TableHead>
                    <TableHead>Lý Do</TableHead>
                    <TableHead>Ngày phản hồi</TableHead>
                    <TableHead>Người phản hồi</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaints.map((complaint) => (
                    <TableRow key={complaint.id}>
                      <TableCell>
                        {complaints.findIndex((c) => c.id === complaint.id) + 1}
                      </TableCell>
                      <TableCell>
                        {complaint.date
                          ? format(parseISO(complaint.date), "dd/MM/yyyy")
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {complaint.createdAt
                          ? format(
                              parseISO(complaint.createdAt),
                              "dd/MM/yyyy HH:mm:ss"
                            )
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {ComplaintType[
                          complaint.complaintType as keyof typeof ComplaintType
                        ] ?? complaint.complaintType}
                      </TableCell>
                      <TableCell>{complaint.reason}</TableCell>
                      <TableCell>{complaint.responseDate}</TableCell>
                      <TableCell>{complaint.responseByFullName}</TableCell>
                      <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                      <TableCell>
                        {complaint.status === ComplaintStatus.PENDING && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRecall(complaint.id)}
                          >
                            Thu hồi
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {complaints.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center">
                        Không có khiếu nại nào
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
    </EmployeeLayout>
  );
}

export default DisputesPage;
