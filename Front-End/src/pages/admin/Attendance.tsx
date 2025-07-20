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
import type {
  Attendance,
  AttendanceUpdateRequest,
  AttendanceWorkShiftResponse,
} from "@/types/attendance.type";
import { attendanceApi } from "@/services/attendance.service";
import Spinner from "@/components/Spinner";
import PaginationComponent from "@/components/PaginationComponent";
import { locationApi } from "@/services/location.service";
import type { Location } from "@/types/location.type";
import { uploadApi } from "@/services/upload.service";

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
    useState<AttendanceWorkShiftResponse | null>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const response = await await locationApi.getAllLocations();
        setLocations(response);
      } catch (error) {
        toast.error("Không thể tải vị trí");
      }
    };
    loadLocations();
  }, []);

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

  const onPageChange = (page: number) => {
    setCurrentPage(page);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("page", page.toString());
    setSearchParams(newParams);
  };

  const loadAttendances = async () => {
    setLoading(true);
    try {
      const response = await attendanceApi.getAllAttendances(searchParams);
      setAttendances(response.data.data);
      setTotalPage(response.data.totalPage);
      setTotalItems(response.data.totalItem);
    } catch (error) {
      toast.error("Không thể tải dữ liệu chấm công");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  const handleOpenEditDialog = (attendance: any) => {
    console.log("Opening edit dialog for attendance:", attendance);
    setSelectedAttendance(attendance);
    setShowEditDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; className: string } } = {
      PRESENT: { label: "Có mặt", className: "bg-green-500" },
      LATE: { label: "Đi muộn", className: "bg-yellow-500" },
      LEAVE: { label: "Nghỉ phép", className: "bg-blue-500" },
      ABSENT: { label: "Vắng mặt", className: "bg-red-500" },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      className: "bg-gray-500",
    };

    if (status === null) {
      return <Badge className="bg-gray-500">Chưa tới ca</Badge>;
    }

    return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>;

  };

  const formatTimeInput = (timeStr: string) => {
    if (!timeStr) return "";

    // Nếu là datetime string, extract time
    if (timeStr.includes("T") || timeStr.includes(" ")) {
      const date = new Date(timeStr);
      return date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // Nếu đã là time string (HH:MM), return as is
    if (timeStr.match(/^\d{2}:\d{2}$/)) {
      return timeStr;
    }

    // Fallback: try to parse as date
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const handleUpdateAttendance = async (
    attendance: AttendanceWorkShiftResponse
  ) => {
    if (!selectedAttendance) {
      toast.error("Không có chấm công nào được chọn");
      return;
    }
    if (!attendance.checkIn || !attendance.checkOut) {
      toast.error("Vui lòng nhập giờ vào và giờ ra");
      return;
    }

    if (!attendance.locationName) {
      toast.error("Vui lòng chọn vị trí");
      return;
    }

    setLoadingUpdate(true);

    try {
      if (selectedAttendance.locked) {
        toast.error("Chấm công đã bị khóa, không thể chỉnh sửa");
        return;
      }

      let imageUrl = selectedAttendance?.image || "";

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadResponse = await uploadApi.upload(formData);

        if (uploadResponse.status !== 200 || !uploadResponse.data.data) {
          throw new Error("Lỗi khi upload ảnh");
        }

        imageUrl = uploadResponse.data.data;
      }

      const editAttendance: AttendanceUpdateRequest = {
        locationName: attendance.locationName,
        checkInTime: attendance.checkIn,
        checkOutTime: attendance.checkOut,
        file: imageUrl,
      };
      const response = await attendanceApi.updateAttendance(
        selectedAttendance.workShifts.id,
        editAttendance
      );

      console.log("Update response:", response);
      toast.success("Cập nhật chấm công thành công");
      setShowEditDialog(false);
      setSelectedAttendance(null);
      setSelectedFile(null);

      loadAttendances();
    } catch (error: any) {
      if (error.message === "Cannot edit attendance record for dates older than 5 days.") {
        toast.error("Không thể chỉnh sửa chấm công vì ngày chấm công đã quá 5 ngày!");
      }
      else {
        toast.error("Cập nhật chấm công thất bại");
      }
      console.error(error);
    } finally {
      setLoadingUpdate(false);
    }
  };

  if (loading) {
    return <Spinner layout="admin" />;
  }

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
                    <SelectItem value="ABSENT">Vắng mặt</SelectItem>
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
                {attendances?.length > 0 ? (
                  attendances.map((attendance, index) => (
                    <TableRow
                      key={attendance.attendanceId}
                      className="border-b"
                    >
                      <TableCell className="p-2">
                        {(currentPage - 1) * 10 + index + 1}
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
                      {(() => {
                        let checkInDisplay = "-";
                        if (attendance.checkIn) {
                          checkInDisplay = format(
                            new Date(attendance.checkIn),
                            "HH:mm",
                            {
                              locale: vi,
                            }
                          );
                        }
                        return (
                          <TableCell className="p-2">
                            {checkInDisplay}
                          </TableCell>
                        );
                      })()}
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
                        <td className="p-2">
                          {attendance.checkIn && attendance.checkOut && !attendance.locationName
                            ? "Làm việc từ xa"
                            : (attendance.locationName || "-")}
                        </td>
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
          <PaginationComponent
            currentPage={currentPage}
            totalPage={totalPage}
            onPageChange={onPageChange}
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Tổng số: {totalItems} bản ghi
          </div>
        </CardFooter>
      </Card>

      {/* Dialog chỉnh sửa chấm công */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="min-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Chỉnh sửa chấm công
            </DialogTitle>
            <DialogDescription>
              Cập nhật thông tin chấm công của nhân viên
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Thông tin nhân viên */}
            {selectedAttendance && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-sm text-gray-700 mb-2">
                  Thông tin nhân viên
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Họ tên:</span>
                    <span className="ml-2 font-medium">
                      {selectedAttendance.workShifts?.employeeName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Phòng ban:</span>
                    <span className="ml-2 font-medium">
                      {selectedAttendance.workShifts?.employeeDepartmentName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Ngày:</span>
                    <span className="ml-2 font-medium">
                      {format(new Date(selectedAttendance.date), "dd/MM/yyyy", {
                        locale: vi,
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Ca làm:</span>
                    <span className="ml-2 font-medium">
                      {selectedAttendance.workShifts?.workShift?.name} (
                      {selectedAttendance.workShifts?.workShift?.startTime} -{" "}
                      {selectedAttendance.workShifts?.workShift?.endTime})
                    </span>
                  </div>
                  {selectedAttendance.edited && (
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-blue-500 text-white">
                        Bị chỉnh sửa
                      </Badge>
                      <span className="text-xs text-gray-500">
                        bởi {selectedAttendance.editedBy} lúc{" "}
                        {format(
                          new Date(selectedAttendance.editedTime),
                          "dd/MM/yyyy HH:mm ",
                          { locale: vi }
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* Ảnh chấm công */}
            <div className="flex justify-center">
              <div className="border rounded-lg p-4 bg-white shadow max-w-xs w-full flex flex-col items-center">
                {selectedFile || selectedAttendance?.image ? (
                  <div
                    className="cursor-pointer"
                    onClick={() => document.getElementById("file")?.click()}
                  >
                    <img
                      src={
                        selectedFile
                          ? URL.createObjectURL(selectedFile)
                          : selectedAttendance?.image
                      }
                      alt="Ảnh chấm công"
                      className="max-h-60 rounded object-contain"
                    />
                  </div>
                ) : (
                  <div
                    className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                    onClick={() => document.getElementById("file")?.click()}
                  >
                    <div className="text-center text-gray-500">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="mt-2 text-sm">Nhấp để chọn ảnh</p>
                    </div>
                  </div>
                )}
                <input
                  id="file"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.length) {
                      const file = e.target.files[0];
                      setSelectedFile(file);
                    }
                  }}
                />
              </div>
            </div>
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                if (selectedAttendance) {
                  handleUpdateAttendance(selectedAttendance);
                } else {
                  toast.error("Không có chấm công nào được chọn");
                }
              }}
            >
              {/* Vị trí */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">
                  Vị trí làm việc
                </Label>
                <Select
                  value={selectedAttendance?.locationName || ""}
                  onValueChange={(value) => {
                    if (selectedAttendance) {
                      setSelectedAttendance({
                        ...selectedAttendance,
                        locationName: value,
                      });
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn vị trí làm việc" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.name}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Thời gian vào và ra */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="checkInTime" className="text-sm font-medium">
                    Giờ vào
                  </Label>
                  <Input
                    id="checkInTime"
                    type="time"
                    className="w-full"
                    value={
                      selectedAttendance?.checkIn
                        ? formatTimeInput(selectedAttendance.checkIn)
                        : ""
                    }
                    onChange={(e) => {
                      if (selectedAttendance) {
                        setSelectedAttendance({
                          ...selectedAttendance,
                          checkIn: e.target.value,
                        });
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkOutTime" className="text-sm font-medium">
                    Giờ ra
                  </Label>
                  <Input
                    id="checkOutTime"
                    type="time"
                    className="w-full"
                    value={
                      selectedAttendance?.checkOut
                        ? formatTimeInput(selectedAttendance.checkOut)
                        : ""
                    }
                    onChange={(e) => {
                      if (selectedAttendance) {
                        setSelectedAttendance({
                          ...selectedAttendance,
                          checkOut: e.target.value,
                        });
                      }
                    }}
                  />
                </div>
              </div>
              <div className="text-right pt-2">
                <Button type="submit" disabled={loadingUpdate}>
                  {loadingUpdate && (
                    <svg
                      className="animate-spin h-4 w-4 mr-2 inline-block text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      ></path>
                    </svg>
                  )}
                  Cập nhật
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

export default AttendancePage;
