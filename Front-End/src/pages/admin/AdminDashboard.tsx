import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminLayout } from "@/components/admin-layout"
import { attendanceApi } from "@/services/attendance.service"
import { leaveRequestApi } from "@/services/leaveRequest.service"
import { complaintApi } from "@/services/complaint.service"
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
import { userApi } from "@/services/user.service"
import { useNavigate } from "react-router"

interface WorkShift {
  id: number
  name: string
  startTime: string
  endTime: string
}

interface WorkShiftAssignment {
  id: number
  dateAssign: string
  workShift: WorkShift
  employeeId: number
  employeeName: string
  employeeDepartmentName: string
}

interface RecentActivity {
  workShifts: WorkShiftAssignment
  date: string
  checkIn: string
  checkOut: string
  attendanceId: number
  locationName: string
  status: string
}

interface LeaveRequest {
  id: number
  startDate: string
  endDate: string
  reason: string
  responseNote: string | null
  responseDate: string | null
  responseBy: number | null
  employeeName: string
  departmentName: string
  leaveType: {
    id: number
    name: string
    maxDayPerYear: number
  }
  status: string
}

interface Complaint {
  id: number
  reason: string
  responseDate: string | null
  date: string
  responseNote: string | null
  responseByFullName: string | null
  employeeFullName: string
  complaintType: string
  departmentName: string
  createdAt: string
  status: string
}

function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [pendingLeaveRequests, setPendingLeaveRequests] = useState<LeaveRequest[]>([])
  const [pendingComplaints, setPendingComplaints] = useState<Complaint[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [activitiesData, usersData, leaveRequestsData, complaintsData] = await Promise.all([
          attendanceApi.getRecentAttendances(),
          userApi.countAllUsers(),
          leaveRequestApi.getPendingLeaveRequests(),
          complaintApi.getPendingComplaints()
        ])

        setRecentActivities(activitiesData.data)
        setTotalUsers(usersData.data)
        setPendingLeaveRequests(leaveRequestsData.data)
        setPendingComplaints(complaintsData.data)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

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

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng nhân viên</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Đang có trong hệ thống</p>
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
            <div className="text-2xl font-bold">{pendingLeaveRequests.length + pendingComplaints.length}</div>
            <p className="text-xs text-muted-foreground">{pendingLeaveRequests.length} yêu cầu nghỉ phép, {pendingComplaints.length} khiếu nại</p>
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
            <Tabs defaultValue="leave" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="leave">Nghỉ phép</TabsTrigger>
                <TabsTrigger value="complaints">Khiếu nại</TabsTrigger>
              </TabsList>
              <TabsContent value="leave">
                <div className="space-y-4">
                  {pendingLeaveRequests.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-4">
                      <div>
                        <p className="font-medium">{item.employeeName}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Yêu cầu nghỉ phép</Badge>
                          <span className="text-sm text-muted-foreground">{item.startDate}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.leaveType.name} ({new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()})
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Từ chối
                        </Button>
                        <Button size="sm">Duyệt</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="complaints">
                <div className="space-y-4">
                  {pendingComplaints.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-4">
                      <div>
                        <p className="font-medium">{item.employeeFullName}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Khiếu nại chấm công</Badge>
                          <span className="text-sm text-muted-foreground">{item.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.complaintType}: {item.reason}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Từ chối
                        </Button>
                        <Button size="sm">Duyệt</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
            <Button variant="outline" className="w-full mt-4 hover:cursor-pointer" onClick={() => navigate("/admin/approvals")}>
              Xem tất cả
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
            <CardDescription>Hoạt động mới nhất của nhân viên</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities?.map((activity) => (
                <div key={activity.attendanceId} className="flex items-center justify-between border-b pb-4">
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-base font-medium">{activity.workShifts.employeeName}</p>
                      {activity.checkOut ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">Đã kết thúc ca</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">Đang làm việc</Badge>
                      )}
                    </div>
                    <div className="space-y-2">
                      {activity.checkOut ? (
                        <div className="bg-gray-50 p-2 rounded-md">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-muted-foreground">Check-out:</span>
                            <span className="text-xs">{new Date(activity.checkOut).toLocaleTimeString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Thời gian làm việc:</span>
                            <span className="text-xs">
                              {new Date(activity.checkIn).toLocaleTimeString()} - {new Date(activity.checkOut).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-2 rounded-md">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Check-in:</span>
                            <span className="text-xs">{new Date(activity.checkIn).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Ca: {activity.workShifts.workShift.name}</span>
                        <span>•</span>
                        <span>{activity.workShifts.workShift.startTime} - {activity.workShifts.workShift.endTime}</span>
                        <span>•</span>
                        <span>Vị trí: {activity.locationName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full hover:cursor-pointer" onClick={() => navigate("/admin/attendances")}>
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
