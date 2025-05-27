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
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
  isSameDay,
  isAfter,
} from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
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
import type { User } from "@/types/user.type";
import type {
  WorkShift,
  WorkShiftAssignment,
} from "@/types/workShiftAssignment.type";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { shiftAssignmentApi } from "@/services/shiftAssignment.service";
import { userApi } from "@/services/user.service";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";

export default function ShiffAssignment() {
  const [shifts, setShifts] = useState<WorkShift[]>([]);
  const [showAddShift, setShowAddShift] = useState(false);
  const [newShift, setNewShift] = useState({
    name: "",
    startTime: "",
    endTime: "",
  });
  const [users, setUsers] = useState<User[]>([]);
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
  const [assignments, setAssignments] = useState<WorkShiftAssignment[]>([]);
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
  const [viewMode, setViewMode] = useState<"table" | "calendar">("calendar");

  useEffect(() => {
    const fetchShifts = async () => {
      const shifts = await shiftAssignmentApi.getAllShifts();
      if (shifts) setShifts(shifts);
    };
    fetchShifts();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const users = await userApi.getAllUsers({});
      if (users) setUsers(users.data);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchAssignments = async () => {
      const assignments = await shiftAssignmentApi.getAllAssignments();
      if (assignments) setAssignments(assignments);
    };
    fetchAssignments();
  }, []);

  const handleAddShift = async () => {
    if (!newShift.name || !newShift.startTime || !newShift.endTime) return;

    const start = new Date(`1970-01-01T${newShift.startTime}:00`);
    const end = new Date(`1970-01-01T${newShift.endTime}:00`);

    if (end <= start) {
      toast.error("Giờ kết thúc phải lớn hơn giờ bắt đầu!");
      return;
    }

    try {
      const addedShift = await shiftAssignmentApi.addShift(newShift);
      setShifts((prev) => [...prev, addedShift]);
      setShowAddShift(false);
      setNewShift({ name: "", startTime: "", endTime: "" });
      toast.success("Thêm ca làm việc thành công!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
    }
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
      toast.error(error.response?.data?.message || error.message);
    }

    setShowAssignDialog(false);
    setSelectedDateRange({ from: undefined, to: undefined });
    setSelectedShiftIds([]);
    setSelectedEmployeeIds([]);
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
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleDeleteShift = async (shiftId: number) => {
    try {
      await shiftAssignmentApi.deleteShift(shiftId);
      setShifts((prev) => prev.filter((s) => s.id !== shiftId));
      toast.success("Xóa ca làm thành công!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
    }
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
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            {format(currentMonth, "MMMM yyyy", { locale: vi })}
          </h2>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
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
                          {isAfter(new Date(assignment.dateAssign), new Date()) && (
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
                <div className="overflow-x-auto">
                  <table className="min-w-full border">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="p-2 text-left">Tên ca</th>
                        <th className="p-2 text-left">Bắt đầu</th>
                        <th className="p-2 text-left">Kết thúc</th>
                        <th className="p-2 text-left">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shifts.map((shift) => (
                        <tr key={shift.id} className="border-b">
                          <td className="p-2">{shift.name}</td>
                          <td className="p-2">{shift.startTime}</td>
                          <td className="p-2">{shift.endTime}</td>
                          <td className="p-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteShift(shift.id)}
                              className="hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Nhân viên</Label>
                      <Select
                        value={filters.employee?.toString()}
                        onValueChange={(value) =>
                          setFilters((prev) => ({
                            ...prev,
                            employee: value ? Number(value) : null,
                          }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Tất cả nhân viên" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả nhân viên</SelectItem>
                          {users.map((emp) => (
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
                        value={filters.department?.toString()}
                        onValueChange={(value) =>
                          setFilters((prev) => ({
                            ...prev,
                            department: value ? Number(value) : null,
                          }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Tất cả phòng ban" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả phòng ban</SelectItem>
                          {/* Thêm danh sách phòng ban ở đây */}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Ca làm</Label>
                      <Select
                        value={filters.shift?.toString()}
                        onValueChange={(value) =>
                          setFilters((prev) => ({
                            ...prev,
                            shift: value ? Number(value) : null,
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
                      <Button className="w-full sm:w-auto" >Lọc</Button>
                    </div>
                  </div>
                </div>

                {/* Hiển thị theo chế độ */}
                {viewMode === "table" ? (
                  <div className="rounded-lg border bg-card">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
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
                              {format(
                                new Date(assignment.dateAssign),
                                "dd/MM/yyyy"
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
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
                              {isAfter(new Date(assignment.dateAssign), new Date()) && (
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
                      value={selectedDateRange.from ? format(selectedDateRange.from, "yyyy-MM-dd") : ""}
                      onChange={(e) => {
                        const date = e.target.value ? new Date(e.target.value) : undefined;
                        setSelectedDateRange(prev => ({...prev, from: date}));
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
                      value={selectedDateRange.to ? format(selectedDateRange.to, "yyyy-MM-dd") : ""}
                      onChange={(e) => {
                        const date = e.target.value ? new Date(e.target.value) : undefined;
                        setSelectedDateRange(prev => ({...prev, to: date}));
                      }}
                      min={selectedDateRange.from ? format(selectedDateRange.from, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Chọn ca làm */}
              <div>
                <Label>Chọn ca làm</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      {selectedShiftIds.length === 0
                        ? "Chọn ca làm"
                        : shifts
                          .filter((s) => selectedShiftIds.includes(s.id))
                          .map((s) => s.name)
                          .join(", ")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[500px]">
                    <div className="flex flex-col gap-2">
                      {shifts.map((shift) => (
                        <label
                          key={shift.id}
                          className="flex items-center gap-2 cursor-pointer"
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
                          />
                          <span>
                            {shift.name} ({shift.startTime}-{shift.endTime})
                          </span>
                        </label>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Chọn nhân viên */}
              <div>
                <Label>Chọn nhân viên</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      {selectedEmployeeIds.length === 0
                        ? "Chọn nhân viên"
                        : users
                          .filter((e) => selectedEmployeeIds.includes(e.id))
                          .map((e) => e.fullName)
                          .join(", ")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[500px]">
                    <div className="flex flex-col gap-2">
                      {users?.map((emp) => (
                        <label
                          key={emp.id}
                          className="flex items-center gap-2 cursor-pointer"
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
                          />
                          <span>{emp.fullName}</span>
                        </label>
                      ))}
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
                <Label>Tên ca</Label>
                <Input
                  value={newShift.name}
                  onChange={(e) =>
                    setNewShift((s) => ({ ...s, name: e.target.value }))
                  }
                  placeholder="Nhập tên ca"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Giờ bắt đầu</Label>
                  <Input
                    type="time"
                    value={newShift.startTime}
                    onChange={(e) =>
                      setNewShift((s) => ({ ...s, startTime: e.target.value }))
                    }
                  />
                </div>
                <div className="flex-1">
                  <Label>Giờ kết thúc</Label>
                  <Input
                    type="time"
                    value={newShift.endTime}
                    onChange={(e) =>
                      setNewShift((s) => ({ ...s, endTime: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddShift}>Thêm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
