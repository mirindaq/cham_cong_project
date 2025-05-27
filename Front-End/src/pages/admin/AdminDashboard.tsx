import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminLayout } from "@/components/admin-layout"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

function AdminDashboard() {
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [selectedDepartment, setSelectedDepartment] = useState("all")

  // Mock data for charts
  const attendanceData = [
    { name: "T2", present: 45, absent: 5, late: 3 },
    { name: "T3", present: 48, absent: 2, late: 3 },
    { name: "T4", present: 47, absent: 3, late: 3 },
    { name: "T5", present: 44, absent: 6, late: 3 },
    { name: "T6", present: 46, absent: 4, late: 3 },
  ]

  const leaveDistributionData = [
    { name: "Nghỉ phép năm", value: 45 },
    { name: "Nghỉ ốm", value: 25 },
    { name: "Nghỉ cá nhân", value: 15 },
    { name: "Nghỉ không lương", value: 10 },
    { name: "Khác", value: 5 },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  // Mock data for pending approvals
  const pendingApprovals = [
    { id: 1, employee: "Jane Smith", type: "Yêu cầu nghỉ phép", date: "2025-05-18", details: "Nghỉ phép năm (3 ngày)" },
    {
      id: 2,
      employee: "Mike Johnson",
      type: "Khiếu nại chấm công",
      date: "2025-05-17",
      details: "Không check-out vào 2025-05-16",
    },
    { id: 3, employee: "Sarah Williams", type: "Yêu cầu nghỉ phép", date: "2025-05-16", details: "Nghỉ ốm (1 ngày)" },
    {
      id: 4,
      employee: "Robert Brown",
      type: "Khiếu nại chấm công",
      date: "2025-05-15",
      details: "Lỗi hệ thống vào 2025-05-14",
    },
  ]

  // Mock data for recent activities
  const recentActivities = [
    { id: 1, employee: "John Doe", action: "Check-in", time: "08:45", location: "Trụ sở chính" },
    { id: 2, employee: "Jane Smith", action: "Yêu cầu nghỉ phép", time: "09:15", location: "N/A" },
    { id: 3, employee: "Mike Johnson", action: "Check-in", time: "08:30", location: "Chi nhánh" },
    { id: 4, employee: "Sarah Williams", action: "Check-out", time: "17:30", location: "Trụ sở chính" },
    { id: 5, employee: "Robert Brown", action: "Gửi khiếu nại", time: "16:45", location: "N/A" },
  ]

  return (
    <AdminLayout>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng nhân viên</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">53</div>
            <p className="text-xs text-muted-foreground">+2 so với tháng trước</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang nghỉ phép</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">5.7% lực lượng lao động</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">4 yêu cầu nghỉ phép, 3 khiếu nại</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <Card className="col-span-full lg:col-span-5">
          <CardHeader>
            <CardTitle>Tổng quan chấm công tuần</CardTitle>
            <CardDescription>Thống kê chấm công tuần hiện tại</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={attendanceData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" stackId="a" fill="#4ade80" />
                  <Bar dataKey="late" stackId="a" fill="#facc15" />
                  <Bar dataKey="absent" stackId="a" fill="#f87171" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-full lg:col-span-2">
          <CardHeader>
            <CardTitle>Phân bố nghỉ phép</CardTitle>
            <CardDescription>Các loại nghỉ phép</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leaveDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {leaveDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Chờ duyệt</CardTitle>
            <CardDescription>Các yêu cầu cần xử lý</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingApprovals.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">{item.employee}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{item.type}</Badge>
                      <span className="text-sm text-muted-foreground">{item.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{item.details}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Từ chối
                    </Button>
                    <Button size="sm">Duyệt</Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                Xem tất cả
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
            <CardDescription>Hoạt động mới nhất của nhân viên</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">{activity.employee}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{activity.action}</span>
                      <span className="text-sm text-muted-foreground">{activity.time}</span>
                    </div>
                    {activity.location !== "N/A" && (
                      <p className="text-sm text-muted-foreground mt-1">Vị trí: {activity.location}</p>
                    )}
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                Xem tất cả
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
