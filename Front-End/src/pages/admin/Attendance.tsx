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
import { Plus, MoreHorizontal, Edit, Lock, Unlock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const employeeName = searchParams.get('employeeName') || '';
    const date = searchParams.get('date') || '';
    const status = searchParams.get('status') || 'all';
    const location = searchParams.get('location') || 'all';

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

    if (filter.employeeName) newParams.set('employeeName', filter.employeeName);
    if (filter.date) newParams.set('date', filter.date);
    if (filter.status !== 'all') newParams.set('status', filter.status);
    if (filter.location !== 'all') newParams.set('location', filter.location);

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

    const statusInfo = statusMap[status] || { label: status, className: "bg-gray-500" };
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
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6">
            <Input
              placeholder="Tìm theo tên nhân viên..."
              className="w-full sm:w-[220px]"
              value={filter.employeeName}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, employeeName: e.target.value }))
              }
            />

            <Input
              type="date"
              className="w-full sm:w-[220px]"
              value={filter.date}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, date: e.target.value }))
              }
            />

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

            <Button className="w-full sm:w-auto" onClick={handleFilter}>
              Lọc
            </Button>
          </div>

          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-2 text-left font-medium">Nhân viên</th>
                  <th className="p-2 text-left font-medium">Phòng ban</th>
                  <th className="p-2 text-left font-medium">Ngày</th>
                  <th className="p-2 text-left font-medium">Giờ vào</th>
                  <th className="p-2 text-left font-medium">Giờ ra</th>
                  <th className="p-2 text-left font-medium">Ca làm</th>
                  <th className="p-2 text-left font-medium">Vị trí</th>
                  <th className="p-2 text-left font-medium">Trạng thái</th>
                  <th className="p-2 text-left font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="p-4 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      </div>
                    </td>
                  </tr>
                ) : attendances?.length > 0 ? (
                  attendances.map((attendance) => (
                    <tr key={attendance.attendanceId} className="border-b">
                      <td className="p-2">{attendance.workShifts.employeeName}</td>
                      <td className="p-2">{attendance.workShifts.employeeDepartmentName}</td>
                      <td className="p-2">
                        {format(new Date(attendance.date), "dd/MM/yyyy", {
                          locale: vi,
                        })}
                      </td>
                      <td className="p-2">
                        {format(new Date(attendance.checkIn), "HH:mm", {
                          locale: vi,
                        })}
                      </td>
                      <td className="p-2">
                        {attendance.checkOut
                          ? format(new Date(attendance.checkOut), "HH:mm", {
                            locale: vi,
                          })
                          : "-"}
                      </td>
                      <td className="p-2">{attendance.workShifts.workShift.name}</td>
                      <td className="p-2">{attendance.locationName}</td>
                      <td className="p-2">{getStatusBadge(attendance.status)}</td>
                      <td className="p-2">
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
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="p-4 text-center text-muted-foreground">
                      Không có dữ liệu chấm công.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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