import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil } from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";
import { departmentApi } from "@/services/department.service";

interface Department {
  id: number;
  name: string;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null
  );
  const [editDepartmentName, setEditDepartmentName] = useState("");

  useEffect(() => {
    const fetchDepartments = async () => {
      const data = await departmentApi.getAllDepartments();
      if (data) setDepartments(data);
    };
    fetchDepartments();
  }, []);

  const handleAddDepartment = async () => {
    if (!newDepartmentName.trim()) return;

    const newDept = await departmentApi.addDepartment({
      name: newDepartmentName.trim(),
    });
    if (newDept) {
      setDepartments((prev) => [...prev, newDept]);
      setNewDepartmentName("");
      setOpen(false);
    }
  };

  const handleEditDepartment = async () => {
    if (!editingDepartment || !editDepartmentName.trim()) return;

    const updatedDept = await departmentApi.updateDepartment(
      editingDepartment.id,
      {
        id: editingDepartment.id,
        name: editDepartmentName.trim(),
      }
    );

    if (updatedDept) {
      setDepartments((prev) =>
        prev.map((dept) =>
          dept.id === editingDepartment.id ? updatedDept : dept
        )
      );
      setEditOpen(false);
      setEditingDepartment(null);
      setEditDepartmentName("");
    }
  };

  const openEditModal = (department: Department) => {
    setEditingDepartment(department);
    setEditDepartmentName(department.name);
    setEditOpen(true);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quản lý phòng ban</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Thêm phòng ban
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm phòng ban mới</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Tên phòng ban</Label>
                  <Input
                    id="name"
                    value={newDepartmentName}
                    onChange={(e) => setNewDepartmentName(e.target.value)}
                    placeholder="Nhập tên phòng ban"
                  />
                </div>
                <Button onClick={handleAddDepartment}>Thêm phòng ban</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">STT</TableHead>
                <TableHead>Tên phòng ban</TableHead>
                <TableHead className="w-[100px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((department) => (
                <TableRow key={department.id}>
                  <TableCell>
                    {departments.findIndex(
                      (dept) => dept.id === department.id
                    ) + 1}
                  </TableCell>
                  <TableCell>{department.name}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(department)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sửa phòng ban</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Tên phòng ban</Label>
                <Input
                  id="edit-name"
                  value={editDepartmentName}
                  onChange={(e) => setEditDepartmentName(e.target.value)}
                  placeholder="Nhập tên phòng ban"
                />
              </div>
              <Button onClick={handleEditDepartment}>Lưu thay đổi</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
