import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminLayout } from "@/components/admin-layout";
import { MoreHorizontal, Edit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { useSearchParams } from "react-router";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { Attendance } from "@/types/attendance.type";
import { attendanceApi } from "@/services/attendance.service";

function AttendancePage() {
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({
    employeeName: "",
    date: "",
    status: "all",
    location: "all",
  });

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedAttendance, setSelectedAttendance] =
    useState<Attendance | null>(null);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const employeeName = searchParams.get("employeeName") || "";
    const date = searchParams.get("date") || "";
    const status = searchParams.get("status") || "all";
    const location = searchParams.get("location") || "all";

    setFilter({
      employeeName,
      date,
      status,
      location,
    });
  }, []);

  useEffect(() => {
    const loadAttendances = async () => {
      setLoading(true);
      try {
        const response = await attendanceApi.getAllAttendances(searchParams);
        setAttendances(response.data);
      } catch (error) {
        console.error(error);
        toast.error("Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    loadAttendances();
  }, [searchParams]);

  const handleFilter = () => {
    const newParams = new URLSearchParams();

    if (filter.employeeName) newParams.set("employeeName", filter.employeeName);
    if (filter.date) newParams.set("date", filter.date);
    if (filter.status !== "all") newParams.set("status", filter.status);
    if (filter.location !== "all") newParams.set("location", filter.location);

    setSearchParams(newParams);
  };

  const handleOpenEditDialog = (attendance: Attendance) => {
    setSelectedAttendance(attendance);
    setShowEditDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; className: string } } = {
      PRESENT: { label: "Có mặt", className: "bg-green-500" },
      LATE: { label: "Đi muộn", className: "bg-yellow-500" },
      LEAVE: { label: "Nghỉ phép", className: "bg-blue-500" },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      className: "bg-gray-500",
    };
    return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>;
  };

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Quản lý chấm công</CardTitle>
              <CardDescription>
                Theo dõi và quản lý chấm công của nhân viên
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 py-2 rounded-lg mb-6 px-2">
            <div className="flex items-center gap-4">
              <div>
                <Label className="text-sm font-medium mb-1">
                  Tên nhân viên
                </Label>
                <Input
                  placeholder="Tìm theo tên nhân viên..."
                  className="w-full sm:w-[220px]"
                  value={filter.employeeName}
                  onChange={(e) =>
                    setFilter((prev) => ({
                      ...prev,
                      employeeName: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-1">Ngày</Label>
                <Input
                  type="date"
                  className="w-full sm:w-[220px]"
                  value={filter.date}
                  onChange={(e) =>
                    setFilter((prev) => ({ ...prev, date: e.target.value }))
                  }
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-1">Trạng thái</Label>
                <Select
                  value={filter.status}
                  onValueChange={(value) =>
                    setFilter((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="PRESENT">Có mặt</SelectItem>
                    <SelectItem value="LATE">Đi muộn</SelectItem>
                    <SelectItem value="LEAVE">Nghỉ phép</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full sm:w-auto self-end"
                onClick={handleFilter}
              >
                Lọc
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-b bg-muted/50">
                  <TableHead className="p-2 text-left font-medium">
                    STT
                  </TableHead>
                  <TableHead className="p-2 text-left font-medium">
                    Nhân viên
                  </TableHead>
                  <TableHead className="p-2 text-left font-medium">
                    Phòng ban
                  </TableHead>
                  <TableHead className="p-2 text-left font-medium">
                    Ngày
                  </TableHead>
                  <TableHead className="p-2 text-left font-medium">
                    Giờ vào
                  </TableHead>
                  <TableHead className="p-2 text-left font-medium">
                    Giờ ra
                  </TableHead>
                  <TableHead className="p-2 text-left font-medium">
                    Ca làm
                  </TableHead>
                  <TableHead className="p-2 text-left font-medium">
                    Vị trí
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
                {loading ? (
                  <TableRow className="border-b">
                    <TableCell colSpan={9} className="p-4 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : attendances?.length > 0 ? (
                  attendances.map((attendance) => (
                    <TableRow
                      key={attendance.attendanceId}
                      className="border-b"
                    >
                      <TableCell className="p-2">
                        {attendances.findIndex(
                          (a) => a.attendanceId === attendance.attendanceId
                        ) + 1}
                      </TableCell>
                      <TableCell className="p-2">
                        {attendance.workShifts.employeeName}
                      </TableCell>
                      <TableCell className="p-2">
                        {attendance.workShifts.employeeDepartmentName}
                      </TableCell>
                      <TableCell className="p-2">
                        {format(new Date(attendance.date), "dd/MM/yyyy", {
                          locale: vi,
                        })}
                      </TableCell>
                      <TableCell className="p-2">
                      {(() => {
                        let checkOutDisplay = "-";
                        if (attendance.checkIn) {
                          checkOutDisplay = format(
                            new Date(attendance.checkOut),
                            "HH:mm",
                            {
                              locale: vi,
                            }
                          );
                        }
                        return (
                          <TableCell className="p-2">
                            {checkOutDisplay}
                          </TableCell>
                        );
                      })()}
                      </TableCell>
                      {(() => {
                        let checkOutDisplay = "-";
                        if (attendance.checkOut) {
                          checkOutDisplay = format(
                            new Date(attendance.checkOut),
                            "HH:mm",
                            {
                              locale: vi,
                            }
                          );
                        }
                        return (
                          <TableCell className="p-2">
                            {checkOutDisplay}
                          </TableCell>
                        );
                      })()}
                      <TableCell className="p-2">
                        {attendance.workShifts.workShift.name}
                      </TableCell>
                      <TableCell className="p-2">
                        {attendance.locationName}
                      </TableCell>
                      <TableCell className="p-2">
                        {getStatusBadge(attendance.status)}
                      </TableCell>
                      <TableCell className="p-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <button
                                className="flex"
                                onClick={() => handleOpenEditDialog(attendance)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Chỉnh sửa
                              </button>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="p-4 text-center text-muted-foreground"
                    >
                      Không có dữ liệu chấm công.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Tổng số: {attendances?.length || 0} bản ghi
          </div>
        </CardFooter>
      </Card>

      {/* Dialog chỉnh sửa chấm công */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="!max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa chấm công</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin chấm công của nhân viên
            </DialogDescription>
          </DialogHeader>
          <form className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 grid grid-cols-4 items-center gap-4">
              <Label htmlFor="checkInTime" className="text-right">
                Giờ vào
              </Label>
              <Input
                id="checkInTime"
                type="datetime-local"
                className="col-span-3"
                defaultValue={selectedAttendance?.checkIn}
              />
            </div>

            <div className="col-span-2 grid grid-cols-4 items-center gap-4">
              <Label htmlFor="checkOutTime" className="text-right">
                Giờ ra
              </Label>
              <Input
                id="checkOutTime"
                type="datetime-local"
                className="col-span-3"
                defaultValue={selectedAttendance?.checkOut}
              />
            </div>

            <div className="col-span-2 grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Trạng thái
              </Label>
              <Select defaultValue={selectedAttendance?.status}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRESENT">Có mặt</SelectItem>
                  <SelectItem value="LATE">Đi muộn</SelectItem>
                  <SelectItem value="LEAVE">Nghỉ phép</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 text-right mt-4">
              <Button type="submit">Cập nhật</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

export default AttendancePage;
