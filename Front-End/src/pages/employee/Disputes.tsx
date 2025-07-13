import {  useCallback, useEffect, useState } from "react";
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

import { format, parseISO, subDays } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { EmployeeLayout } from "@/components/employee-layout";
import {
  ComplaintStatus,
  ComplaintType,
  type ComplaintAddRequest,
  type ComplaintResponse,
} from "@/types/complaint.type";
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
import { useAuth } from "@/contexts/AuthContext";
import Spinner from "@/components/Spinner";
import {
  AlertCircle,
  Building,
  Calendar,
  ClipboardPaste,
  Clock,
  Eye,
  FileText,
  MoreHorizontal,
  UserIcon,
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

function DisputesPage() {
  const [disputeDate, setDisputeDate] = useState<Date | undefined>(undefined);
  const [disputeType, setDisputeType] = useState<string>("");

  const [requestedChange, setRequestedChange] = useState("");
  const [reason, setReason] = useState("");
  const [complaints, setComplaints] = useState<ComplaintResponse[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);
  const { accessToken } = useAuth();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<any>(null);

  const loadComplaints = useCallback(async () => {
    setLoading(true);

    try {
      const response = await complaintApi.getAllComplaintsByEmployee(
        currentPage,
        3
      );
      setComplaints(response.data);
      setTotalPage(response.totalPage);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [accessToken, currentPage]);

  useEffect(() => {
    if (accessToken) {
      loadComplaints();
    }
  }, [accessToken, loadComplaints]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!accessToken) {
      toast.error("Bạn cần đăng nhập để gửi khiếu nại");
      return;
    }
    try {
      const newComplaint: ComplaintAddRequest = {
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
      toast.error("Vui lòng nhập đầy đủ thông tin");
    }
  };

  const handleRecall = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn thu hồi đơn khiếu nại này?")) {
      await complaintApi.recallComplaint(id);
      toast.success("Đã thu hồi đơn thành công!");
      loadComplaints();
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

  if (loading) {
    return <Spinner layout="employee" />;
  }

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
                  min={format(subDays(new Date(), 2), "yyyy-MM-dd")}
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
                  {complaints.map((complaint, index) => (
                    <TableRow key={complaint.id}>
                      <TableCell>
                        {(currentPage - 1) * 10 + index + 1}
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
                      <TableCell>
                        {complaint.responseDate || "Chưa phản hồi"}
                      </TableCell>
                      <TableCell>
                        {complaint.responseBy || "Chưa phản hồi"}
                      </TableCell>
                      <TableCell>{getStatusBadge(complaint.status)}</TableCell>
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
                                setSelectedDetail(complaint);
                                setShowDetailModal(true);
                              }}
                            >
                              <Eye width={20} className="mr-2" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            {complaint.status === "PENDING" && (
                              <DropdownMenuItem
                                onClick={() => handleRecall(complaint.id)}
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
                  {complaints.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="p-4 text-center text-muted-foreground"
                      >
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

      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="min-w-[800px] max-h-[90vh] overflow-y-auto p-0">
          <div className="bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b">
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <span className="text-base font-semibold">
                  Chi tiết phiếu khiếu nại
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
                      {selectedDetail.complaintType}
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
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Ngày khiếu nại:
                    </span>
                    <span className="text-sm font-medium">
                      {selectedDetail.date
                        ? format(parseISO(selectedDetail.date), "dd/MM/yyyy")
                        : "N/A"}
                    </span>
                  </div>
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
                          {selectedDetail.responseBy || "Không có"}
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
                        {selectedDetail.responseNote || "N/A"}
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

export default DisputesPage;
