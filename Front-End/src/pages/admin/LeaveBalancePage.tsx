import { use, useEffect, useState } from "react";
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
import { Plus, Edit, Trash, Calendar, Users, Search, X, Check } from "lucide-react";
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
import type { LeaveType } from "@/types/leaveType";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { leaveBalanceApi } from "@/services/leaveBalance.service";
import { useSearchParams } from "react-router";
import { departmentApi } from "@/services/department.service";
import type { Department } from "@/types/department.type";
import type { LeaveBalancePerEmployeeResponse } from "@/types/leaveBalance.type";
import PaginationComponent from "@/components/PaginationComponent";
import Spinner from "@/components/Spinner";
import { getYearOptions } from "@/utils/helper";
import { Badge } from "@/components/ui/badge";

export default function LeaveBalancePage() {
  const [showAddLeaveTypeDialog, setShowAddLeaveTypeDialog] = useState(false);
  const [showEditLeaveTypeDialog, setShowEditLeaveTypeDialog] = useState(false);
  const [editLeaveTypeId, setEditLeaveTypeId] = useState<number | null>(null);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<
    LeaveBalancePerEmployeeResponse[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [params, setParams] = useSearchParams();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filterLeaveBalances, setFilterLeaveBalances] = useState({
    employeeName: "",
    departmentId: 0,
    year: 2025,
    leaveBalanceType: "all",
  });

  const [newLeaveType, setNewLeaveType] = useState({
    name: "",
    maxDayPerYear: 0,
    active: false
  });

  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    leaveTypeId: null as number | null,
    leaveTypeName: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [leaveBalanceTypes, setLeaveBalanceTypes] = useState<LeaveType[]>([]);

  useEffect(() => {
    const departmentId = params.get("departmentId");
    const employeeName = params.get("employeeName") || "";
    const year = params.get("year") ? parseInt(params.get("year")!) : 2025;
    const leaveBalanceType = params.get("leaveBalanceType") || "all";
    setFilterLeaveBalances({
      employeeName,
      departmentId: departmentId ? parseInt(departmentId) : 0,
      year,
      leaveBalanceType,
    });
  }, [params]);

  const loadLeaveBalanceTypes = async () => {
    setLoading(true);
    const response = await leaveTypeApi.getAllLeaveTypes();
    setLeaveBalanceTypes(response);
    setLoading(false);
  };
  
  const loadLeaveBalances = async () => {
    setLoading(true);
    try {
      const response = await leaveBalanceApi.getAllLeaveBalance(params);
      setTotalPage(response.data.totalPage);
      setLeaveBalances(response.data.data);
      setTotalItems(response.data.totalItem);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadLeaveBalanceTypes();
  }, []);

  useEffect(() => {
    const loadLeaveTypes = async () => {
      setLoading(true);
      try {
        const response = await leaveTypeApi.getAllLeaveTypes();
        setLeaveTypes(response);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    loadLeaveTypes();
  }, []);

  useEffect(() => {
    const loadDepartments = async () => {
      setLoading(true);
      try {
        const response = await departmentApi.getAllDepartments();
        setDepartments(response);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    loadDepartments();
  }, []);

  useEffect(() => {

    loadLeaveBalances();
  }, [params]);

  const handleFilterLeaveBalances = async () => {
    const newParams = new URLSearchParams();

    if (filterLeaveBalances.employeeName) {
      newParams.set("employeeName", filterLeaveBalances.employeeName);
    }

    if (filterLeaveBalances.departmentId !== 0) {
      newParams.set(
        "departmentId",
        filterLeaveBalances.departmentId.toString()
      );
    }

    if (filterLeaveBalances.year) {
      newParams.set("year", filterLeaveBalances.year.toString());
    }
    if (filterLeaveBalances.leaveBalanceType !== "all") {
      newParams.set("leaveBalanceType", filterLeaveBalances.leaveBalanceType);
    }

    if (currentPage > 1) {
      newParams.set("page", "1");
    }

    setParams(newParams);
    setCurrentPage(1);
  };

  const handleAddLeaveType = async () => {
    const newType: LeaveType = {
      id: leaveTypes.length + 1,
      name: newLeaveType.name,
      maxDayPerYear: newLeaveType.maxDayPerYear,
      active: true
    };

    try {
      await leaveTypeApi.addLeaveType({
        name: newLeaveType.name,
        maxDayPerYear: newLeaveType.maxDayPerYear,
      });
      toast.success("Thêm loại nghỉ phép thành công");
      setLeaveTypes([...leaveTypes, newType]);
      setNewLeaveType({ name: "", maxDayPerYear: 0, active: true });
      loadLeaveBalanceTypes();
      loadLeaveBalances();
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
        active: typeToEdit.active
      });
      setEditLeaveTypeId(id);
      setShowEditLeaveTypeDialog(true);
    }
  };

  const handleUpdateLeaveType = async () => {
    if (!editLeaveTypeId) return;
    try {
      await leaveTypeApi.updateLeaveType(editLeaveTypeId, {
        name: newLeaveType.name
      });
      const updatedTypes = leaveTypes.map((type) =>
        type.id === editLeaveTypeId
          ? {
              ...type,
              name: newLeaveType.name,
            }
          : type
      );
      setLeaveTypes(updatedTypes);
      setShowEditLeaveTypeDialog(false);
      loadLeaveBalanceTypes();
      loadLeaveBalances();
      resetLeaveTypeForm();
      toast.success("Cập nhật tên loại nghỉ phép thành công");
    } catch (error) {
      console.error("Lỗi khi cập nhật loại nghỉ phép:", error);
      toast.error("Đã xảy ra lỗi khi cập nhật loại nghỉ phép");
    }
  };


  // 4. Thêm các hàm xử lý cancel và confirm
  const handleDeleteCancel = () => {
    setDeleteDialog({
      isOpen: false,
      leaveTypeId: null,
      leaveTypeName: "",
    });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.leaveTypeId === null) return;

    try {
      // Gọi API xóa loại nghỉ phép

      // Cập nhật state sau khi xóa thành công
      setLeaveTypes((prev) =>
        prev.filter((type) => type.id !== deleteDialog.leaveTypeId)
      );
      toast.success("Xóa loại nghỉ phép thành công");
    } catch (error) {
      console.error("Lỗi khi xóa loại nghỉ phép:", error);
      toast.error("Đã xảy ra lỗi khi xóa loại nghỉ phép");
    } finally {
      handleDeleteCancel();
    }
  };

  const resetLeaveTypeForm = () => {
    setNewLeaveType({ name: "", maxDayPerYear: 0, active: false });
    setEditLeaveTypeId(null);
  };

  const onPageChange = (page: number) => {
    setCurrentPage(page);
    const newParams = new URLSearchParams(params);
    newParams.set("page", page.toString());
    setParams(newParams);
  };

  const handleToggleApply = async (id: number) => {
    const typeToToggle = leaveTypes.find((type) => type.id === id);
    if (typeToToggle) {
      try {
        await leaveTypeApi.toggleApply(id);
        toast.success("Trạng thái áp dụng đã được thay đổi thành công");
        const updatedTypes = leaveTypes.map((type) =>
          type.id === id ? { ...type, active: !type.active } : type
        );
        setLeaveTypes(updatedTypes);
      } catch (error) {
        console.error("Lỗi khi thay đổi trạng thái áp dụng:", error);
        toast.error("Đã xảy ra lỗi khi thay đổi trạng thái áp dụng");
      }
    }
  };
  const getStatusBadge = (active: boolean) => {
    return active ? (
      <Badge className="bg-green-500">Hoạt động</Badge>
    ) : (
      <Badge variant="secondary">Vô hiệu hóa</Badge>
    );
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
                <div className="bg-muted/50 py-2 rounded-lg mb-6 px-2">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-1">
                        Tìm kiếm nhân viên
                      </Label>
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Tìm kiếm nhân viên..."
                          value={filterLeaveBalances.employeeName}
                          onChange={(e) =>
                            setFilterLeaveBalances((prev) => ({
                              ...prev,
                              employeeName: e.target.value,
                            }))
                          }
                          className="pl-8 w-full sm:w-[220px]"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-1">Năm</Label>
                      <Select
                        value={filterLeaveBalances.year.toString()}
                        onValueChange={(value) =>
                          setFilterLeaveBalances((prev) => ({
                            ...prev,
                            year: parseInt(value),
                          }))
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Chọn năm" />
                        </SelectTrigger>
                        <SelectContent>
                          {getYearOptions().map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-1">
                        Phòng ban
                      </Label>
                      <Select
                        value={
                          filterLeaveBalances.departmentId === 0
                            ? "all"
                            : filterLeaveBalances.departmentId.toString()
                        }
                        onValueChange={(value) =>
                          setFilterLeaveBalances((prev) => ({
                            ...prev,
                            departmentId: value === "all" ? 0 : parseInt(value),
                          }))
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Phòng ban" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả phòng ban</SelectItem>
                          {departments?.map((dept) => (
                            <SelectItem
                              key={dept.id}
                              value={dept.id.toString()}
                            >
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-1">
                        Loại nghỉ phép
                      </Label>
                      <Select
                        value={filterLeaveBalances.leaveBalanceType}
                        onValueChange={(value) =>
                          setFilterLeaveBalances((prev) => ({
                            ...prev,
                            leaveBalanceType: value,
                          }))
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Chọn loại nghỉ phép" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả</SelectItem>
                          {leaveBalanceTypes.map((type) => (
                            <SelectItem key={type.id} value={type.name}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      className="w-full sm:w-auto self-end"
                      onClick={() => handleFilterLeaveBalances()}
                    >
                      Lọc
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b bg-muted/50">
                        <TableHead>STT</TableHead>
                        <TableHead>Nhân viên</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phòng ban</TableHead>
                        <TableHead>Năm</TableHead>
                        <TableHead>Số ngày nghỉ đã dùng</TableHead>
                        <TableHead>Số ngày nghỉ còn lại</TableHead>
                        <TableHead>Loại nghỉ phép</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaveBalances.length > 0 ? (
                        leaveBalances?.map((balance, index) => (
                          <TableRow key={balance.id}>
                            <TableCell className="p-2">
                              {(currentPage - 1) * 10 + index + 1}
                            </TableCell>
                            <TableCell>{balance.employeeName}</TableCell>
                            <TableCell>{balance.employeeEmail}</TableCell>
                            <TableCell>{balance.departmentName}</TableCell>
                            <TableCell>{balance.year}</TableCell>
                            <TableCell>{balance.usedDay} ngày</TableCell>
                            <TableCell>{balance.remainingDay} ngày</TableCell>
                            <TableCell>{balance.leaveType.name}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="p-4 text-center text-muted-foreground"
                          >
                            Không có dữ liệu nghỉ phép nào
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
                <div className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    Tổng số: {totalItems} bản ghi
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="leave-types">
              <div className="space-y-4">
                <div className="flex justify-end items-center">
                  <Button onClick={() => setShowAddLeaveTypeDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm loại nghỉ phép
                  </Button>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b bg-muted/50">
                        <TableHead>STT</TableHead>
                        <TableHead>Tên loại nghỉ phép</TableHead>
                        <TableHead>Số ngày tối đa mỗi năm</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaveTypes.map((type, index) => (
                        <TableRow key={type.id} className="border-b">
                          <TableCell className="p-2">
                            {(currentPage - 1) * 10 + index + 1}
                          </TableCell>
                          <TableCell>{type.name}</TableCell>
                          <TableCell>{type.maxDayPerYear} ngày</TableCell>
                          <TableCell>
                            {getStatusBadge(type.active)}
                          </TableCell>
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
                              className={type.active ? "text-yellow-600" : "text-green-600"}
                              onClick={() => handleToggleApply(type.id)}
                            >
                              {type.active ? (
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
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    Tổng số: {leaveTypes?.length || 0}
                  </div>
                </div>
              </div>
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
            <Button onClick={handleUpdateLeaveType}>
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemName={deleteDialog.leaveTypeName}
        description="Bạn có chắc chắn muốn xóa loại nghỉ phép"
      />
    </AdminLayout>
  );
}
