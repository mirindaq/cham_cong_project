import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AdminLayout } from "@/components/admin-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash, Calendar, Users, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { leaveTypeApi } from "@/services/leaveType.service";
import { toast } from "sonner";
import type { LeaveType } from "@/types/leaveRequest.type";

interface LeaveBalance {
  id: number;
  usedDay: number;
  year: number;
  remainingDay: number;
  employee: {
    id: number;
    name: string;
    department?: string;
    position?: string;
  };
  leaveType: LeaveType;
}

export default function LeaveBalancePage() {
  const [showAddLeaveTypeDialog, setShowAddLeaveTypeDialog] = useState(false);
  const [showEditLeaveTypeDialog, setShowEditLeaveTypeDialog] = useState(false);
  const [editLeaveTypeId, setEditLeaveTypeId] = useState<number | null>(null);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("2024");
  const [selectedLeaveType, setSelectedLeaveType] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [loading, setLoading] = useState<boolean>(false);

  const [newLeaveType, setNewLeaveType] = useState({
    name: "",
    maxDayPerYear: 0,
  });

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

  // Get unique departments
  const departments = Array.from(
    new Set(leaveBalances.map((balance) => balance.employee.department))
  );

  // Group leave balances by employee
  const employeeBalances = leaveBalances.reduce((acc, balance) => {
    if (!acc[balance.employee.id]) {
      acc[balance.employee.id] = {
        employee: balance.employee,
        balances: [],
      };
    }
    acc[balance.employee.id].balances.push(balance);
    return acc;
  }, {} as Record<number, { employee: { id: number; name: string; department?: string; position?: string }; balances: LeaveBalance[] }>);

  const handleAddLeaveType = async () => {
    const newType: LeaveType = {
      id: leaveTypes.length + 1,
      name: newLeaveType.name,
      maxDayPerYear: newLeaveType.maxDayPerYear,
    };
    console.log(newType);

    try {
      await leaveTypeApi.addLeaveType(newLeaveType);
      toast.success("Thêm loại nghỉ phép thành công");
      setLeaveTypes([...leaveTypes, newType]);
      setNewLeaveType({ name: "", maxDayPerYear: 0 });
      setShowAddLeaveTypeDialog(false);
    } catch (error) {
      console.error("Lỗi khi thêm loại nghỉ phép:", error);
      toast.error("Đã xảy ra lỗi khi thêm loại nghỉ phép. Vui lòng thử lại.");
    }
  };

  const handleEditLeaveType = (id: number) => {
    const typeToEdit = leaveTypes.find((type) => type.id === id);
    if (typeToEdit) {
      setNewLeaveType({
        name: typeToEdit.name,
        maxDayPerYear: typeToEdit.maxDayPerYear,
      });
      setEditLeaveTypeId(id);
      setShowEditLeaveTypeDialog(true);
    }
  };

  const handleDeleteLeaveType = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa loại nghỉ phép này không?")) {
      setLeaveTypes(leaveTypes.filter((type) => type.id !== id));
    }
  };

  const resetLeaveTypeForm = () => {
    setNewLeaveType({ name: "", maxDayPerYear: 0 });
    setEditLeaveTypeId(null);
  };

  const filteredBalances = Object.values(employeeBalances).filter(
    ({ employee }) => {
      const matchesSearch = employee.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesDepartment =
        selectedDepartment === "all" ||
        employee.department === selectedDepartment;
      return matchesSearch && matchesDepartment;
    }
  );

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Quản lý nghỉ phép</CardTitle>
              <CardDescription>
                Quản lý các loại nghỉ phép và số ngày nghỉ của nhân viên
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="employees" className="space-y-4">
            <TabsList>
              <TabsTrigger
                value="employees"
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Danh sách nhân viên
              </TabsTrigger>
              <TabsTrigger
                value="leave-types"
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Quản lý loại nghỉ phép
              </TabsTrigger>
            </TabsList>

            <TabsContent value="employees">
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm nhân viên..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Chọn năm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedDepartment}
                    onValueChange={setSelectedDepartment}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Phòng ban" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả phòng ban</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept || ""}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border">
                  {loading && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nhân viên</TableHead>
                          <TableHead>Phòng ban</TableHead>
                          <TableHead>Chức vụ</TableHead>
                          {leaveTypes.map((type) => (
                            <TableHead key={type.id} className="text-center">
                              {type.name}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBalances.map(({ employee, balances }) => (
                          <TableRow key={employee.id}>
                            <TableCell className="font-medium">
                              {employee.name}
                            </TableCell>
                            <TableCell>{employee.department}</TableCell>
                            <TableCell>{employee.position}</TableCell>
                            {leaveTypes.map((type) => {
                              const balance = balances.find(
                                (b) => b.leaveType.id === type.id
                              );
                              return (
                                <TableCell
                                  key={type.id}
                                  className="text-center"
                                >
                                  {balance ? (
                                    <div className="flex flex-col items-center gap-1">
                                      <Badge
                                        variant={
                                          balance.remainingDay > 0
                                            ? "default"
                                            : "destructive"
                                        }
                                      >
                                        {balance.remainingDay}/
                                        {type.maxDayPerYear}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        Đã dùng: {balance.usedDay}
                                      </span>
                                    </div>
                                  ) : (
                                    <Badge variant="outline">
                                      {type.maxDayPerYear}/{type.maxDayPerYear}
                                    </Badge>
                                  )}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="leave-types">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Danh sách loại nghỉ phép</CardTitle>
                  <Button onClick={() => setShowAddLeaveTypeDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm loại nghỉ phép
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên loại nghỉ phép</TableHead>
                        <TableHead>Số ngày tối đa mỗi năm</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaveTypes.map((type) => (
                        <TableRow key={type.id}>
                          <TableCell>{type.name}</TableCell>
                          <TableCell>{type.maxDayPerYear} ngày</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditLeaveType(type.id)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Sửa
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => handleDeleteLeaveType(type.id)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Xóa
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog thêm loại nghỉ phép mới */}
      <Dialog
        open={showAddLeaveTypeDialog}
        onOpenChange={setShowAddLeaveTypeDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm loại nghỉ phép mới</DialogTitle>
            <DialogDescription>
              Thêm một loại nghỉ phép mới vào hệ thống.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Tên
              </Label>
              <Input
                id="name"
                className="col-span-3"
                value={newLeaveType.name}
                onChange={(e) =>
                  setNewLeaveType({ ...newLeaveType, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maxDayPerYear" className="text-right">
                Số ngày tối đa
              </Label>
              <Input
                id="maxDayPerYear"
                type="number"
                className="col-span-3"
                value={newLeaveType.maxDayPerYear}
                onChange={(e) =>
                  setNewLeaveType({
                    ...newLeaveType,
                    maxDayPerYear: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddLeaveTypeDialog(false);
                resetLeaveTypeForm();
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleAddLeaveType}>Thêm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog chỉnh sửa loại nghỉ phép */}
      <Dialog
        open={showEditLeaveTypeDialog}
        onOpenChange={setShowEditLeaveTypeDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa loại nghỉ phép</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin loại nghỉ phép.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Tên
              </Label>
              <Input
                id="edit-name"
                className="col-span-3"
                value={newLeaveType.name}
                onChange={(e) =>
                  setNewLeaveType({ ...newLeaveType, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-maxDayPerYear" className="text-right">
                Số ngày tối đa
              </Label>
              <Input
                id="edit-maxDayPerYear"
                type="number"
                className="col-span-3"
                value={newLeaveType.maxDayPerYear}
                onChange={(e) =>
                  setNewLeaveType({
                    ...newLeaveType,
                    maxDayPerYear: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowEditLeaveTypeDialog(false);
                resetLeaveTypeForm();
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={() => {
                if (editLeaveTypeId) {
                  const updatedTypes = leaveTypes.map((type) =>
                    type.id === editLeaveTypeId
                      ? {
                          ...type,
                          name: newLeaveType.name,
                          maxDayPerYear: newLeaveType.maxDayPerYear,
                        }
                      : type
                  );
                  setLeaveTypes(updatedTypes);
                  setShowEditLeaveTypeDialog(false);
                  resetLeaveTypeForm();
                }
              }}
            >
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
