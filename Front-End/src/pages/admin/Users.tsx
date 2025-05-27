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
import { Plus, MoreHorizontal, Lock, Unlock, Edit, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Department } from "@/types/department.type";
import { toast } from "sonner";
import { userApi } from "@/services/user.service";
import { departmentApi } from "@/services/department.service";
import type { User, UserRequest } from "@/types/user.type";
import { useSearchParams } from "react-router";
import { isAfter, isBefore, startOfDay } from "date-fns";
import PaginationComponent from "@/components/PaginationComponent";

function UsersPage() {
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({
    name: "",
    email: "",
    phone: "",
    role: "all",
    status: "all",
    departmentName: "all",
  });

  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUserData, setNewUserData] = useState<UserRequest>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    departmentId: 0,
    position: "",
    role: "EMPLOYEE",
    dob: "",
    joinDate: "",
    employeeType: "FULL_TIME",
    active: true,
  });

  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);

  useEffect(() => {
    const name = searchParams.get("name") || "";
    const email = searchParams.get("email") || "";
    const phone = searchParams.get("phone") || "";
    const role = searchParams.get("role") || "all";
    const status = searchParams.get("status") || "all";
    const departmentName = searchParams.get("departmentName") || "all";

    setFilter({
      name,
      email,
      phone,
      role,
      status,
      departmentName,
    });
  }, [searchParams]);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const response = await userApi.getAllUsers(searchParams);
        setTotalPage(response.totalPage);
        setUsers(response.data);
      } catch (error) {
        console.error(error);
        toast.error("Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [searchParams]);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const departments = await departmentApi.getAllDepartments();
        setDepartments(departments);
      } catch (error) {
        console.error(error);
      }
    };
    loadDepartments();
  }, []);

  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await userApi.addUser(newUserData);
      toast.success("Thêm nhân viên thành công");

      setShowAddUserDialog(false);
      setNewUserData({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        departmentId: 0,
        position: "",
        role: "EMPLOYEE",
        dob: "",
        joinDate: "",
        employeeType: "FULL_TIME",
        active: true,
      });
      window.location.reload();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Lỗi khi thêm người dùng";
      toast.error(message);
    }
  };

  const handleFilter = () => {
    const newParams = new URLSearchParams();

    if (filter.name) newParams.set("name", filter.name);
    if (filter.email) newParams.set("email", filter.email);
    if (filter.phone) newParams.set("phone", filter.phone);
    if (filter.role !== "all") newParams.set("role", filter.role);
    if (filter.status !== "all") newParams.set("status", filter.status);
    if (filter.departmentName !== "all")
      newParams.set("departmentName", filter.departmentName);

    setSearchParams(newParams);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      await userApi.updateUser(selectedUser.id, newUserData);
      toast.success("Cập nhật nhân viên thành công");
      setShowEditUserDialog(false);
      window.location.reload();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Lỗi khi cập nhật người dùng";
      toast.error(message);
    }
  };

  const handleOpenEditDialog = (user: User) => {
    setSelectedUser(user);
    setNewUserData({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      address: user.address,
      departmentId:
        departments.find((dept) => dept.name === user.departmentName)?.id || 0,
      position: user.position,
      role: user.role,
      dob: user.dob,
      joinDate: user.joinDate,
      employeeType: user.employeeType,
      active: user.active,
    });
    setShowEditUserDialog(true);
  };

  const getStatusBadge = (active: boolean) => {
    return active ? (
      <Badge className="bg-green-500">Hoạt động</Badge>
    ) : (
      <Badge variant="secondary">Vô hiệu hóa</Badge>
    );
  };

  const canEditUser = (user: User) => {
    const today = startOfDay(new Date());
    const joinDate = new Date(user.joinDate);
    return isBefore(joinDate, today);
  };

  const onPageChange = (page: number) => {
    setCurrentPage(page);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("page", page.toString());
    setSearchParams(newParams);
  };

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Quản lý người dùng</CardTitle>
              <CardDescription>
                Quản lý tài khoản và quyền hạn người dùng
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddUserDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm người dùng
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6">
            <Input
              placeholder="Tìm theo tên..."
              className="w-full sm:w-[220px]"
              value={filter.name}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, name: e.target.value }))
              }
            />

            <Input
              placeholder="Tìm theo email..."
              className="w-full sm:w-[220px]"
              value={filter.email}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, email: e.target.value }))
              }
            />

            <Input
              placeholder="Tìm theo số điện thoại..."
              className="w-full sm:w-[220px]"
              value={filter.phone}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, phone: e.target.value }))
              }
            />

            <Select
              value={filter.departmentName}
              onValueChange={(value) =>
                setFilter((prev) => ({ ...prev, departmentName: value }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tất cả phòng ban" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả phòng ban</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filter.role}
              onValueChange={(value) =>
                setFilter((prev) => ({ ...prev, role: value }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Lọc theo vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                <SelectItem value="EMPLOYEE">Nhân viên</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filter.status}
              onValueChange={(value) =>
                setFilter((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="inactive">Không hoạt động</SelectItem>
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
                  <th className="p-2 text-left font-medium">Tên</th>
                  <th className="p-2 text-left font-medium">Email</th>
                  <th className="p-2 text-left font-medium">Số điện thoại</th>
                  <th className="p-2 text-left font-medium">Vai trò</th>
                  <th className="p-2 text-left font-medium">Phòng ban</th>
                  <th className="p-2 text-left font-medium">Trạng thái</th>
                  <th className="p-2 text-left font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      </div>
                    </td>
                  </tr>
                ) : users?.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="p-2">{user.fullName}</td>
                      <td className="p-2">{user.email}</td>
                      <td className="p-2">{user.phone}</td>
                      <td className="p-2">
                        <Badge variant="outline" className="capitalize">
                          {user.role}
                        </Badge>
                      </td>
                      <td className="p-2">{user.departmentName}</td>
                      <td className="p-2">{getStatusBadge(user.active)}</td>
                      <td className="p-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {canEditUser(user) ? (
                              <DropdownMenuItem>
                                <button
                                  className="flex"
                                  onClick={() => handleOpenEditDialog(user)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Chỉnh sửa
                                </button>
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem disabled>
                                <span className="text-muted-foreground">
                                  Không thể chỉnh sửa người dùng chưa vào làm
                                </span>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-4 text-center text-muted-foreground"
                    >
                      Không có người dùng nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <PaginationComponent
              currentPage={currentPage}
              totalPage={totalPage}
              onPageChange={onPageChange}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Tổng số: {users?.length || 0} người dùng
          </div>
        </CardFooter>
      </Card>

      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="!max-w-5xl">
          <DialogHeader>
            <DialogTitle>Thêm người dùng mới</DialogTitle>
            <DialogDescription>
              Tạo tài khoản người dùng mới và thiết lập quyền hạn.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleAddUser}
            className="grid grid-cols-8 gap-4 py-4"
          >
            {/* Cột 1 */}
            <div className="col-span-4 grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fullName" className="text-right">
                Họ và tên
              </Label>
              <Input
                id="fullName"
                name="fullName"
                className="col-span-3"
                value={newUserData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="col-span-4 grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                className="col-span-3"
                value={newUserData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="col-span-4 grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Số điện thoại
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                className="col-span-3"
                value={newUserData.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="col-span-4 grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Địa chỉ
              </Label>
              <Input
                id="address"
                name="address"
                className="col-span-3"
                value={newUserData.address}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Cột 2 */}
            <div className="col-span-4 grid grid-cols-4 items-center gap-4">
              <Label htmlFor="departmentId" className="text-right">
                Phòng ban
              </Label>
              <Select
                name="departmentId"
                onValueChange={(value) =>
                  setNewUserData((prev) => ({
                    ...prev,
                    departmentId: Number(value),
                  }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-4 grid grid-cols-4 items-center gap-4">
              <Label htmlFor="position" className="text-right">
                Chức vụ
              </Label>
              <Input
                id="position"
                name="position"
                className="col-span-3"
                value={newUserData.position}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="col-span-4 grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Vai trò
              </Label>
              <Select
                name="role"
                value={newUserData.role}
                onValueChange={(value) =>
                  setNewUserData((prev) => ({
                    ...prev,
                    role: value.toUpperCase(),
                  }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMPLOYEE">Nhân viên</SelectItem>
                  <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-4 grid grid-cols-4 items-center gap-4">
              <Label htmlFor="employeeType" className="text-right">
                Loại nhân viên
              </Label>
              <Select
                name="employeeType"
                value={newUserData.employeeType}
                onValueChange={(value) =>
                  setNewUserData((prev) => ({ ...prev, employeeType: value }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn loại nhân viên" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL_TIME">Toàn thời gian</SelectItem>
                  <SelectItem value="PART_TIME">Bán thời gian</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ngày sinh */}
            <div className="col-span-4 grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dob" className="text-right">
                Ngày sinh
              </Label>
              <Input
                id="dob"
                name="dob"
                type="date"
                className="col-span-3"
                value={newUserData.dob}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Ngày vào làm */}
            <div className="col-span-4 grid grid-cols-4 items-center gap-4">
              <Label htmlFor="joinDate" className="text-right">
                Ngày vào làm
              </Label>
              <Input
                id="joinDate"
                name="joinDate"
                type="date"
                className="col-span-3"
                value={newUserData.joinDate}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Trạng thái active */}
            <div className="col-span-4 grid grid-cols-4 items-center gap-4">
              <Label htmlFor="active" className="text-right">
                Kích hoạt
              </Label>
              <input
                id="active"
                name="active"
                type="checkbox"
                checked={newUserData.active}
                onChange={(e) =>
                  setNewUserData((prev) => ({
                    ...prev,
                    active: e.target.checked,
                  }))
                }
              />
            </div>

            {/* Nút submit */}
            <div className="col-span-8 text-right mt-4">
              <Button type="submit">Thêm người dùng</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog chỉnh sửa */}
      <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
        <DialogContent className="!max-w-5xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
            <DialogDescription>Cập nhật thông tin người dùng</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleEditUser}
            className="grid grid-cols-8 gap-4 py-4"
          >
            {/* Các trường form giống như form thêm mới */}
            <div className="col-span-4 grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fullName" className="text-right">
                Họ và tên
              </Label>
              <Input
                id="fullName"
                name="fullName"
                className="col-span-3"
                value={newUserData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="col-span-4 grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                className="col-span-3"
                value={newUserData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="col-span-4 grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Số điện thoại
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                className="col-span-3"
                value={newUserData.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="col-span-4 grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Địa chỉ
              </Label>
              <Input
                id="address"
                name="address"
                className="col-span-3"
                value={newUserData.address}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="col-span-4 grid grid-cols-4 items-center gap-4">
              <Label htmlFor="departmentId" className="text-right">
                Phòng ban
              </Label>
              <Select
                name="departmentId"
                value={newUserData.departmentId.toString()}
                onValueChange={(value) =>
                  setNewUserData((prev) => ({
                    ...prev,
                    departmentId: Number(value),
                  }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-4 grid grid-cols-4 items-center gap-4">
              <Label htmlFor="position" className="text-right">
                Chức vụ
              </Label>
              <Input
                id="position"
                name="position"
                className="col-span-3"
                value={newUserData.position}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="col-span-4 grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Vai trò
              </Label>
              <Select
                name="role"
                value={newUserData.role}
                onValueChange={(value) =>
                  setNewUserData((prev) => ({
                    ...prev,
                    role: value.toUpperCase(),
                  }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMPLOYEE">Nhân viên</SelectItem>
                  <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-4 grid grid-cols-4 items-center gap-4">
              <Label htmlFor="employeeType" className="text-right">
                Loại nhân viên
              </Label>
              <Select
                name="employeeType"
                value={newUserData.employeeType}
                onValueChange={(value) =>
                  setNewUserData((prev) => ({ ...prev, employeeType: value }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn loại nhân viên" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL_TIME">Toàn thời gian</SelectItem>
                  <SelectItem value="PART_TIME">Bán thời gian</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-4 grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dob" className="text-right">
                Ngày sinh
              </Label>
              <Input
                id="dob"
                name="dob"
                type="date"
                className="col-span-3"
                value={newUserData.dob}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="col-span-4 grid grid-cols-4 items-center gap-4">
              <Label htmlFor="joinDate" className="text-right">
                Ngày vào làm
              </Label>
              <Input
                id="joinDate"
                name="joinDate"
                type="date"
                className="col-span-3"
                value={newUserData.joinDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="col-span-4 grid grid-cols-4 items-center gap-4">
              <Label htmlFor="active" className="text-right">
                Kích hoạt
              </Label>
              <input
                id="active"
                name="active"
                type="checkbox"
                checked={newUserData.active}
                onChange={(e) =>
                  setNewUserData((prev) => ({
                    ...prev,
                    active: e.target.checked,
                  }))
                }
              />
            </div>

            <div className="col-span-8 text-right mt-4">
              <Button type="submit">Cập nhật</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

export default UsersPage;
