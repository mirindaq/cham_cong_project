import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminLayout } from "@/components/admin-layout";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  isAfter,
} from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Plus, Trash, Trash2, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UserResponse } from "@/types/user.type";
import type { WorkShiftAssignment } from "@/types/workShiftAssignment.type";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { shiftAssignmentApi } from "@/services/shiftAssignment.service";
import { userApi } from "@/services/user.service";
import { departmentApi } from "@/services/department.service";
import type { Department } from "@/types/department.type";
import { useSearchParams } from "react-router";
import { workShiftApi } from "@/services/workShift.service";
import Spinner from "@/components/Spinner";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import type {
  WorkShiftAddRequest,
  WorkShiftResponse,
} from "@/types/workShift.type";
import { Badge } from "@/components/ui/badge";

export default function ShiffAssignment() {
  const [shifts, setShifts] = useState<WorkShiftResponse[]>([]);
  const [activeShifts, setActiveShifts] = useState<WorkShiftResponse[]>([]);
  const [showAddShift, setShowAddShift] = useState(false);
  const [newShift, setNewShift] = useState<WorkShiftAddRequest>({
    name: "",
    startTime: "",
    endTime: "",
    partTime: false,
    active: true,
  });
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [_, setIsCalendarLoading] = useState(false);
  // State cho phân công
  const [selectedShiftIds, setSelectedShiftIds] = useState<number[]>([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  // Thêm state cho tìm kiếm
  const [shiftSearch, setShiftSearch] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [assignments, setAssignments] = useState<WorkShiftAssignment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: {
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    },
    employee: null as number | null,
    department: null as number | null,
    shift: null as number | null,
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tempMonth, setTempMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<"table" | "calendar">("calendar");
  const [searchParams, setSearchParams] = useSearchParams();
  const [deleteShiftDialog, setDeleteShiftDialog] = useState({
    isOpen: false,
    shiftId: null as number | null,
    shiftName: "",
  });

  const getStatusBadge = (active: boolean) => {
    return active ? (
      <Badge className="bg-green-500">Hoạt động</Badge>
    ) : (
      <Badge variant="secondary">Vô hiệu hóa</Badge>
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [activeShifts, shiftsData, usersData, departmentsData] =
        await Promise.all([
          workShiftApi.getAllWorkShiftsActive(),
          workShiftApi.getAllShifts(),
          userApi.getEmployeeToAssignment(),
          departmentApi.getAllDepartments(),
        ]);

      if (shiftsData) setShifts(shiftsData);
      if (activeShifts) setActiveShifts(activeShifts);
      if (usersData) setUsers(usersData);
      if (departmentsData) setDepartments(departmentsData);
      setIsLoading(false);
    };

    fetchData();
  }, []);


  useEffect(() => {
    const fetchAssignments = async () => {
      setIsCalendarLoading(true);
      const assignments = await shiftAssignmentApi.getAllAssignments(
        searchParams
      );
      if (assignments) {
        setAssignments(assignments);
      } else {
        setAssignments([]);
        toast.error("Không tìm thấy phân ca phù hợp.");
      }
      setIsCalendarLoading(false);
    };
    fetchAssignments();
  }, [searchParams]);

  const handleAddShift = async () => {
    if (!newShift.name || !newShift.startTime || !newShift.endTime) return;

    const start = new Date(`1970-01-01T${newShift.startTime}:00`);
    const end = new Date(`1970-01-01T${newShift.endTime}:00`);

    if (end <= start) {
      toast.error("Giờ kết thúc phải lớn hơn giờ bắt đầu!");
      return;
    }

    const addedShift = await workShiftApi.addShift(newShift);
    setShifts((prev) => [...prev, addedShift]);
    setShowAddShift(false);
    setNewShift({
      name: "",
      startTime: "",
      endTime: "",
      partTime: false,
      active: true,
    });
    toast.success("Thêm ca làm việc thành công!");
  };

  const handleAssign = async () => {
    if (
      !selectedDateRange.from ||
      selectedShiftIds.length === 0 ||
      selectedEmployeeIds.length === 0
    )
      return;

    const daysToAssign = eachDayOfInterval({
      start: selectedDateRange.from,
      end: selectedDateRange.to || selectedDateRange.from,
    });

    const assignments = [];

    for (const date of daysToAssign) {
      for (const employeeId of selectedEmployeeIds) {
        for (const shiftId of selectedShiftIds) {
          assignments.push({
            dateAssign: format(date, "yyyy-MM-dd"),
            workShiftId: shiftId,
            employeeId: employeeId,
          });
        }
      }
    }

    try {
      const assigned = await shiftAssignmentApi.assignShifts(assignments);
      if (assigned) {
        setAssignments((prev) => [...prev, ...assigned]);
        toast.success("Phân công ca làm việc thành công!");
      }
    } catch (error: any) {
      if (error.message === "Cannot assign work shift in the past") {
        toast.error("Không thể phân công ca làm việc trong quá khứ!");
      } else {
        toast.error("Không thể phân công ca làm việc. Vui lòng thử lại sau.");
      }
    } finally {
      setShowAssignDialog(false);
      setSelectedDateRange({ from: undefined, to: undefined });
      setSelectedShiftIds([]);
      setSelectedEmployeeIds([]);
    }

  };

  const handleDeleteAssignment = async (
    assignmentId: number,
    employeeId: number
  ) => {
    try {
      await shiftAssignmentApi.deleteAssignment(assignmentId, employeeId);
      setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
      toast.success("Xóa phân công thành công!");
    } catch (error: any) {
      if (error.message === "Cannot delete past assignments") {
        toast.error("Không thể xóa phân công trong quá khứ!");
      } else {
        toast.error("Không thể xóa phân công. Vui lòng thử lại sau.");
      }
    }
  };

  const handleDeleteShift = (shiftId: number) => {
    const shiftToDelete = shifts.find((shift) => shift.id === shiftId);
    if (shiftToDelete) {
      setDeleteShiftDialog({
        isOpen: true,
        shiftId: shiftId,
        shiftName: shiftToDelete.name,
      });
    }
  };

  const handleDeleteShiftCancel = () => {
    setDeleteShiftDialog({
      isOpen: false,
      shiftId: null,
      shiftName: "",
    });
  };

  const handleDeleteShiftConfirm = async () => {
    if (deleteShiftDialog.shiftId === null) return;

    try {
      await workShiftApi.deleteShift(deleteShiftDialog.shiftId);
      setShifts((prev) =>
        prev.filter((shift) => shift.id !== deleteShiftDialog.shiftId)
      );
      toast.success("Xóa ca làm thành công!");
    } catch (error) {
      toast.error("Không thể xóa ca làm. Vui lòng thử lại sau.");
    } finally {
      handleDeleteShiftCancel();
    }
  };

  const handleUpdateStatus = async (shiftId: number) => {
    try {
      const response = await workShiftApi.updateWorkShift(shiftId);
      if (response) {
        setShifts((prev) =>
          prev.map((shift) =>
            shift.id === shiftId ? { ...shift, active: !shift.active } : shift
          )
        );

        setActiveShifts((prev) => {
          if (response.active) {
            const shiftToAdd = shifts.find((shift) => shift.id === shiftId);
            return shiftToAdd ? [...prev, shiftToAdd] : prev;
          } else {
            return prev.filter((shift) => shift.id !== shiftId);
          }
        });

        toast.success(
          `Đã ${response.active ? "kích hoạt" : "vô hiệu hóa"
          } ca làm việc thành công!`
        );
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi cập nhật trạng thái ca làm việc");
    }
  };

  const handleFilter = async () => {
    const newParams = new URLSearchParams();

    setCurrentMonth(tempMonth);

    if (tempMonth) {
      newParams.set("month", (tempMonth.getMonth() + 1).toString());
      newParams.set("year", tempMonth.getFullYear().toString());
    }

    if (filters.employee) {
      newParams.set("employeeId", filters.employee.toString());
    }

    if (filters.department) {
      newParams.set("departmentId", filters.department.toString());
    }

    if (filters.shift) {
      newParams.set("workShiftId", filters.shift.toString());
    }

    setSearchParams(newParams);
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const getAssignmentsForDay = (date: Date) => {
      return assignments.filter((assignment) =>
        isSameDay(new Date(assignment.dateAssign), date)
      );
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center">
          <h2 className="text-xl font-semibold">
            Tháng {format(currentMonth, "MM yyyy", { locale: vi })}
          </h2>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {[
            "Chủ nhật",
            "Thứ 2",
            "Thứ 3",
            "Thứ 4",
            "Thứ 5",
            "Thứ 6",
            "Thứ 7",
          ].map((day) => (
            <div
              key={day}
              className="text-center py-2 font-medium text-sm text-muted-foreground"
            >
              {day}
            </div>
          ))}
          {days.map((day) => {
            const dayAssignments = getAssignmentsForDay(day);
            return (
              <div
                key={day.toString()}
                className={`min-h-[100px] p-2 border rounded-lg ${isToday(day) ? "bg-primary/5" : ""
                  } ${!isSameMonth(day, currentMonth)
                    ? "text-muted-foreground opacity-50"
                    : ""
                  }`}
              >
                <div className="font-medium mb-1">{format(day, "d")}</div>
                <div className="space-y-1">
                  {dayAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="text-xs p-1 rounded bg-primary/10 text-primary"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">
                            {assignment.workShift.name}
                          </div>
                          <div className="text-muted-foreground">
                            {assignment.employeeName}
                          </div>
                          <div className="text-muted-foreground">
                            {assignment.workShift.startTime} -{" "}
                            {assignment.workShift.endTime}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleDeleteAssignment(
                              assignment.id,
                              assignment.employeeId
                            )
                          }
                          className="h-4 w-4 hover:bg-destructive/10"
                        >
                          {(isAfter(
                            new Date(assignment.dateAssign),
                            new Date()
                          ) ||
                            (isSameDay(
                              new Date(assignment.dateAssign),
                              new Date()
                            ) &&
                              isAfter(
                                new Date(
                                  `${format(new Date(), "yyyy-MM-dd")}T${assignment.workShift.startTime}`
                                ),
                                new Date()
                              ))) &&
                            !assignment.attendanceId && (
                              <Trash2 className="h-3 w-3 text-destructive" />
                            )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <Spinner layout="admin" />;
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <Tabs defaultValue="assignments" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="assignments">Phân công ca</TabsTrigger>
            <TabsTrigger value="shifts">Quản lý ca làm</TabsTrigger>
          </TabsList>

          <TabsContent value="shifts">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Quản lý ca làm</CardTitle>
                  <CardDescription>
                    Thêm, sửa, xóa các ca làm việc
                  </CardDescription>
                </div>
                <Button onClick={() => setShowAddShift(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Thêm ca làm
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="p-2 text-left">STT</TableHead>
                        <TableHead className="p-2 text-left">Tên ca</TableHead>
                        <TableHead className="p-2 text-left">Bắt đầu</TableHead>
                        <TableHead className="p-2 text-left">
                          Kết thúc
                        </TableHead>
                        <TableHead className="p-2 text-left">
                          Loại hình làm việc
                        </TableHead>
                        <TableHead className="p-2 text-left">
                          Trạng thái
                        </TableHead>
                        <TableHead className="p-2 text-left">
                          Thao tác
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {shifts.map((shift, idx) => (
                        <TableRow key={shift.id} className="border-b">
                          <TableCell className="p-2">{idx + 1}</TableCell>
                          <TableCell className="p-2">
                            <span
                              className="inline-block w-2 h-2 rounded-full mr-2 align-middle"
                              style={{
                                backgroundColor: [
                                  "#3b82f6",
                                  "#10b981",
                                  "#f59e42",
                                  "#ef4444",
                                  "#a855f7",
                                ][shift.id % 5],
                              }}
                              title="Màu ca làm"
                            ></span>
                            {shift.name}
                          </TableCell>
                          <TableCell className="p-2">
                            {shift.startTime}
                          </TableCell>
                          <TableCell className="p-2">{shift.endTime}</TableCell>
                          <TableCell className="p-2">
                            <Badge
                              className={
                                shift.partTime
                                  ? "bg-blue-500  text-white"
                                  : "bg-green-500  text-white"
                              }
                            >
                              {shift.partTime ? "Part Time" : "Full Time"}
                            </Badge>
                          </TableCell>
                          <TableCell className="p-2">
                            {getStatusBadge(shift.active)}
                          </TableCell>
                          <TableCell className="p-2 flex items-center gap-2">
                            <div className="w-[160px]">
                              <Button
                                variant="ghost"
                                size="sm"
                                className={
                                  shift.active
                                    ? "text-yellow-600"
                                    : "text-green-600"
                                }
                                onClick={() => handleUpdateStatus(shift.id)}
                              >
                                {shift.active ? (
                                  <>
                                    <X className="mr-2 h-4 w-4" />
                                    Hủy áp dụng
                                  </>
                                ) : (
                                  <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Áp dụng
                                  </>
                                )}
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
                              onClick={() => handleDeleteShift(shift.id)}
                            >
                              <Trash className="mr-2 h-4 w-4 text-red-600 " />
                              Xoá
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {shifts.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-8 text-muted-foreground"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-8 h-8"
                              >
                                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                                <path d="M12 8v4" />
                                <path d="M12 16h.01" />
                              </svg>
                              <p>Không có ca làm nào</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Phân công ca cho nhân viên</CardTitle>
                    <CardDescription>
                      Quản lý và phân công ca làm việc cho nhân viên
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === "table" ? "default" : "outline"}
                      onClick={() => setViewMode("table")}
                    >
                      Xem dạng bảng
                    </Button>
                    <Button
                      variant={viewMode === "calendar" ? "default" : "outline"}
                      onClick={() => setViewMode("calendar")}
                    >
                      Xem dạng lịch
                    </Button>
                    <Button
                      onClick={() => setShowAssignDialog(true)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Phân công mới
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Bộ lọc và tìm kiếm */}
                <div className="bg-muted/50 py-2 rounded-lg mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Tháng</Label>
                      <Select
                        value={format(tempMonth, "MM")}
                        onValueChange={(value) => {
                          const newDate = new Date(tempMonth);
                          newDate.setMonth(parseInt(value) - 1);
                          setTempMonth(newDate);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn tháng" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => (
                            <SelectItem
                              key={i + 1}
                              value={(i + 1).toString().padStart(2, "0")}
                            >
                              Tháng {i + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Năm</Label>
                      <Select
                        value={format(tempMonth, "yyyy")}
                        onValueChange={(value) => {
                          const newDate = new Date(tempMonth);
                          newDate.setFullYear(parseInt(value));
                          setTempMonth(newDate);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn năm" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 5 }, (_, i) => {
                            const year = new Date().getFullYear() - 2 + i;
                            return (
                              <SelectItem key={year} value={year.toString()}>
                                Năm {year}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Nhân viên</Label>
                      <Select
                        value={
                          filters.employee !== null
                            ? filters.employee.toString()
                            : "all"
                        }
                        onValueChange={(value) =>
                          setFilters((prev) => ({
                            ...prev,
                            employee: value === "all" ? null : Number(value),
                          }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Tất cả nhân viên" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả nhân viên</SelectItem>
                          {users?.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id.toString()}>
                              {emp.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Phòng ban</Label>
                      <Select
                        value={
                          filters.department !== null
                            ? filters.department.toString()
                            : "all"
                        }
                        onValueChange={(value) =>
                          setFilters((prev) => ({
                            ...prev,
                            department: value === "all" ? null : Number(value),
                          }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Tất cả phòng ban" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả phòng ban</SelectItem>
                          {departments.map((dep) => (
                            <SelectItem key={dep.id} value={dep.id.toString()}>
                              {dep.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Ca làm</Label>
                      <Select
                        value={
                          filters.shift !== null
                            ? filters.shift.toString()
                            : "all"
                        }
                        onValueChange={(value) =>
                          setFilters((prev) => ({
                            ...prev,
                            shift: value === "all" ? null : Number(value),
                          }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Tất cả ca" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả ca</SelectItem>
                          {shifts.map((shift) => (
                            <SelectItem
                              key={shift.id}
                              value={shift.id.toString()}
                            >
                              {shift.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end">
                      <Button
                        className="w-full sm:w-auto hover:cursor-pointer"
                        onClick={() => handleFilter()}
                      >
                        Lọc
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Hiển thị theo chế độ */}
                {viewMode === "table" ? (
                  <div className="rounded-lg border bg-card">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-medium">STT</TableHead>
                          <TableHead className="font-medium">Ngày</TableHead>
                          <TableHead className="font-medium">Ca làm</TableHead>
                          <TableHead className="font-medium">
                            Nhân viên
                          </TableHead>
                          <TableHead className="font-medium">
                            Giờ bắt đầu
                          </TableHead>
                          <TableHead className="font-medium">
                            Giờ kết thúc
                          </TableHead>
                          <TableHead className="text-right font-medium">
                            Thao tác
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assignments.map((assignment) => (
                          <TableRow
                            key={assignment.id}
                            className="hover:bg-muted/50"
                          >
                            <TableCell className="font-medium">
                              {assignments.findIndex(
                                (a) => a.id === assignment.id
                              ) + 1}
                            </TableCell>
                            <TableCell className="font-medium">
                              {format(
                                new Date(assignment.dateAssign),
                                "dd/MM/yyyy"
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-2 h-2 rounded-full`}
                                  style={{
                                    backgroundColor: [
                                      "#3b82f6",
                                      "#10b981",
                                      "#f59e42",
                                      "#ef4444",
                                      "#a855f7",
                                    ][assignment.workShift.id % 5],
                                  }}
                                ></div>
                                {assignment.workShift.name}
                              </div>
                            </TableCell>
                            <TableCell>{assignment.employeeName}</TableCell>
                            <TableCell>
                              {assignment.workShift.startTime}
                            </TableCell>
                            <TableCell>
                              {assignment.workShift.endTime}
                            </TableCell>
                            <TableCell className="text-right">
                              {(isAfter(
                                new Date(assignment.dateAssign),
                                new Date()
                              ) ||
                                (isSameDay(
                                  new Date(assignment.dateAssign),
                                  new Date()
                                ) &&
                                  isAfter(
                                    new Date(
                                      `${format(new Date(), "yyyy-MM-dd")}T${assignment.workShift.startTime}`
                                    ),
                                    new Date()
                                  ))) &&
                                !assignment.attendanceId && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleDeleteAssignment(
                                        assignment.id,
                                        assignment.employeeId
                                      )
                                    }
                                    className="hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                )}
                            </TableCell>
                          </TableRow>
                        ))}
                        {assignments.length === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="text-center py-8 text-muted-foreground"
                            >
                              <div className="flex flex-col items-center gap-2">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="w-8 h-8"
                                >
                                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                                  <path d="M12 8v4" />
                                  <path d="M12 16h.01" />
                                </svg>
                                <p>Không có phân công nào</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  renderCalendar()
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog phân công ca */}
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent className="min-w-[1000px]">
            <DialogHeader>
              <DialogTitle>Phân công ca mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Chọn khoảng thời gian */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-sm text-muted-foreground">
                      Từ ngày
                    </Label>
                    <Input
                      type="date"
                      value={
                        selectedDateRange.from
                          ? format(selectedDateRange.from, "yyyy-MM-dd")
                          : ""
                      }
                      onChange={(e) => {
                        const date = e.target.value
                          ? new Date(e.target.value)
                          : undefined;
                        setSelectedDateRange((prev) => ({
                          ...prev,
                          from: date,
                        }));
                      }}
                      min={format(new Date(), "yyyy-MM-dd")}
                      className="w-full"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm text-muted-foreground">
                      Đến ngày
                    </Label>
                    <Input
                      type="date"
                      value={
                        selectedDateRange.to
                          ? format(selectedDateRange.to, "yyyy-MM-dd")
                          : ""
                      }
                      onChange={(e) => {
                        const date = e.target.value
                          ? new Date(e.target.value)
                          : undefined;
                        setSelectedDateRange((prev) => ({ ...prev, to: date }));
                      }}
                      min={
                        selectedDateRange.from
                          ? format(selectedDateRange.from, "yyyy-MM-dd")
                          : format(new Date(), "yyyy-MM-dd")
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Chọn ca làm */}
              <div className="space-y-2">
                <Label>Chọn ca làm</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      {selectedShiftIds.length === 0
                        ? "Chọn ca làm"
                        : `${selectedShiftIds.length} ca đã chọn`}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[500px] p-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border rounded-md px-3 py-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-muted-foreground"
                        >
                          <circle cx="11" cy="11" r="8" />
                          <path d="m21 21-4.3-4.3" />
                        </svg>
                        <input
                          type="text"
                          placeholder="Tìm kiếm ca làm..."
                          className="flex-1 bg-transparent outline-none text-sm"
                          value={shiftSearch}
                          onChange={(e) => setShiftSearch(e.target.value)}
                        />
                      </div>
                      <div className="max-h-[300px] overflow-y-auto space-y-2">
                        {activeShifts
                          .filter(
                            (shift) =>
                              shift.name
                                .toLowerCase()
                                .includes(shiftSearch.toLowerCase()) ||
                              shift.startTime
                                .toLowerCase()
                                .includes(shiftSearch.toLowerCase()) ||
                              shift.endTime
                                .toLowerCase()
                                .includes(shiftSearch.toLowerCase())
                          )
                          .map((shift) => (
                            <label
                              key={shift.id}
                              className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                            >
                              <Checkbox
                                checked={selectedShiftIds.includes(shift.id)}
                                onCheckedChange={(checked) => {
                                  setSelectedShiftIds((prev) =>
                                    checked
                                      ? [...prev, shift.id]
                                      : prev.filter((id) => id !== shift.id)
                                  );
                                }}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="font-medium">{shift.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {shift.startTime} - {shift.endTime}
                                </div>
                              </div>
                            </label>
                          ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Chọn nhân viên */}
              <div className="space-y-2">
                <Label>Chọn nhân viên</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      {selectedEmployeeIds.length === 0
                        ? "Chọn nhân viên"
                        : `${selectedEmployeeIds.length} nhân viên đã chọn`}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[500px] p-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border rounded-md px-3 py-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-muted-foreground"
                        >
                          <circle cx="11" cy="11" r="8" />
                          <path d="m21 21-4.3-4.3" />
                        </svg>
                        <input
                          type="text"
                          placeholder="Tìm kiếm nhân viên..."
                          className="flex-1 bg-transparent outline-none text-sm"
                          value={employeeSearch}
                          onChange={(e) => setEmployeeSearch(e.target.value)}
                        />
                      </div>
                      <div className="max-h-[300px] overflow-y-auto space-y-2">
                        {users
                          ?.filter(
                            (emp) =>
                              emp.fullName
                                .toLowerCase()
                                .includes(employeeSearch.toLowerCase()) ||
                              emp.email
                                .toLowerCase()
                                .includes(employeeSearch.toLowerCase())
                          )
                          .map((emp) => (
                            <label
                              key={emp.id}
                              className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                            >
                              <Checkbox
                                checked={selectedEmployeeIds.includes(emp.id)}
                                onCheckedChange={(checked) => {
                                  setSelectedEmployeeIds((prev) =>
                                    checked
                                      ? [...prev, emp.id]
                                      : prev.filter((id) => id !== emp.id)
                                  );
                                }}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="font-medium">
                                  {emp.fullName}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {emp.email}
                                </div>
                              </div>
                            </label>
                          ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Kiểm tra xung đột */}
              {selectedDateRange.from &&
                selectedEmployeeIds.length > 0 &&
                selectedShiftIds.length > 0 && (
                  <Alert variant="destructive" className="hidden">
                    <AlertDescription>
                      Nhân viên đã được phân công ca khác trong khoảng thời gian
                      này
                    </AlertDescription>
                  </Alert>
                )}
            </div>
            <DialogFooter>
              <Button onClick={handleAssign}>Phân công</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog thêm ca làm */}
        <Dialog open={showAddShift} onOpenChange={setShowAddShift}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm ca làm mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="shift-name">Tên ca</Label>
                <Input
                  id="shift-name"
                  value={newShift.name}
                  onChange={(e) =>
                    setNewShift((s) => ({
                      ...s,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Nhập tên ca"
                  required
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="start-time">Giờ bắt đầu</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={newShift.startTime}
                    onChange={(e) =>
                      setNewShift((s) => ({ ...s, startTime: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="end-time">Giờ kết thúc</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={newShift.endTime}
                    onChange={(e) =>
                      setNewShift((s) => ({ ...s, endTime: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="shift-type">Loại ca làm việc</Label>
                <Select
                  value={newShift.partTime ? "parttime" : "fulltime"}
                  onValueChange={(value) =>
                    setNewShift((s) => ({
                      ...s,
                      partTime: value === "parttime",
                    }))
                  }
                >
                  <SelectTrigger id="shift-type">
                    <SelectValue placeholder="Chọn loại ca làm việc" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fulltime">
                      Toàn thời gian (Full-time)
                    </SelectItem>
                    <SelectItem value="parttime">
                      Bán thời gian (Part-time)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <div className="space-y-0.5">
                  <Label htmlFor="is-active">Áp dụng ca làm việc</Label>
                </div>
                <input
                  id="is-active"
                  type="checkbox"
                  checked={newShift.active}
                  onChange={(e) =>
                    setNewShift((s) => ({
                      ...s,
                      active: e.target.checked,
                    }))
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleAddShift}>Thêm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <DeleteConfirmationDialog
        isOpen={deleteShiftDialog.isOpen}
        onClose={handleDeleteShiftCancel}
        onConfirm={handleDeleteShiftConfirm}
        itemName={deleteShiftDialog.shiftName}
        description="Bạn có chắc chắn muốn xóa ca làm"
      />
    </AdminLayout>
  );
}
