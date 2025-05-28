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
      console.log(currentPage);
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
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-4 text-left font-medium">
                      Ngày cần khiếu nại
                    </th>
                    <th className="p-4 text-left font-medium">Ngày tạo</th>
                    <th className="p-4 text-left font-medium">
                      Loại khiếu nại
                    </th>
                    <th className="p-4 text-left font-medium">Lý Do</th>
                    <th className="p-4 text-left font-medium">Ngày phản hồi</th>
                    <th className="p-4 text-left font-medium">
                      Người phản hồi
                    </th>

                    <th className="p-4 text-left font-medium">Trạng thái</th>
                    <th className="p-4 text-left font-medium">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((complaint) => (
                    <tr
                      key={complaint.id}
                      className="border-b hover:bg-muted/50"
                    >
                      <td className="p-4">{complaint.date}</td>
                      <td className="p-4">
                        {complaint.createdAt
                          ? format(
                              parseISO(complaint.createdAt),
                              "dd/MM/yyyy HH:mm:ss"
                            )
                          : "N/A"}
                      </td>

                      <td className="p-4">
                        {ComplaintType[
                          complaint.complaintType as keyof typeof ComplaintType
                        ] ?? complaint.complaintType}
                      </td>
                      <td className="p-4">{complaint.reason}</td>
                      <td className="p-4">{complaint.responseDate}</td>
                      <td className="p-4">{complaint.responseByFullName}</td>

                      <td className="p-4">
                        {getStatusBadge(complaint.status)}
                      </td>

                      <td className="p-4">
                        {complaint.status === ComplaintStatus.PENDING && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRecall(complaint.id)}
                          >
                            Thu hồi
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
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

export default DisputesPage;
