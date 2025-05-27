import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminLayout } from "@/components/admin-layout"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Download } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Label } from "@/components/ui/label"

export default function ReportsPage() {
  const [reportType, setReportType] = useState("attendance")
  const [dateRange, setDateRange] = useState("month")
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  const [department, setDepartment] = useState("all")
  const [location, setLocation] = useState("all")

  // Mock data for charts
  const attendanceData = [
    { name: "Tuần 1", present: 95, absent: 5, late: 3, total: 100 },
    { name: "Tuần 2", present: 92, absent: 8, late: 5, total: 100 },
    { name: "Tuần 3", present: 90, absent: 10, late: 7, total: 100 },
    { name: "Tuần 4", present: 93, absent: 7, late: 4, total: 100 },
  ]

  const leaveData = [
    { name: "Tháng 1", annual: 10, sick: 5, personal: 2, total: 17 },
    { name: "Tháng 2", annual: 8, sick: 7, personal: 3, total: 18 },
    { name: "Tháng 3", annual: 12, sick: 4, personal: 1, total: 17 },
    { name: "Tháng 4", annual: 15, sick: 3, personal: 2, total: 20 },
    { name: "Tháng 5", annual: 9, sick: 6, personal: 4, total: 19 },
  ]

  const overtimeData = [
    { name: "Kỹ thuật", value: 45 },
    { name: "Marketing", value: 20 },
    { name: "Kinh doanh", value: 30 },
    { name: "Nhân sự", value: 5 },
  ]

  // Mock data for top employees
  const topEmployees = [
    { name: "Nguyễn Văn A", department: "Kỹ thuật", present: 22, late: 0, absent: 0, score: 100 },
    { name: "Trần Thị B", department: "Kinh doanh", present: 21, late: 1, absent: 0, score: 98 },
    { name: "Lê Văn C", department: "Marketing", present: 20, late: 1, absent: 1, score: 95 },
    { name: "Phạm Thị D", department: "Nhân sự", present: 19, late: 2, absent: 1, score: 92 },
    { name: "Hoàng Văn E", department: "Kỹ thuật", present: 19, late: 1, absent: 2, score: 90 },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  // Xử lý khi xuất báo cáo
  const handleExportReport = () => {
    alert("Đã xuất báo cáo thành công!")
  }

  // Xử lý khi in báo cáo
  const handlePrintReport = () => {
    window.print()
  }

  // Định dạng ngày tháng
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <CardTitle>Báo cáo</CardTitle>
          <CardDescription>Tạo và xem các báo cáo chấm công và nghỉ phép</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Loại báo cáo</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại báo cáo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attendance">Báo cáo chấm công</SelectItem>
                  <SelectItem value="leave">Báo cáo nghỉ phép</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Kỳ báo cáo</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn kỳ báo cáo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Tuần này</SelectItem>
                  <SelectItem value="month">Tháng này</SelectItem>
                  <SelectItem value="quarter">Quý này</SelectItem>
                  <SelectItem value="year">Năm nay</SelectItem>
                  <SelectItem value="custom">Tùy chỉnh</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Bộ phận</label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn bộ phận" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả bộ phận</SelectItem>
                  <SelectItem value="engineering">Kỹ thuật</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="sales">Kinh doanh</SelectItem>
                  <SelectItem value="hr">Nhân sự</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end space-x-2">
              <Button className="flex-1" onClick={handleExportReport}>
                Xuất Excel
              </Button>
              <Button className="flex-1" variant="outline" onClick={handlePrintReport}>
                In báo cáo
              </Button>
            </div>
          </div>

          {dateRange === "custom" && (
            <div className="grid gap-6 md:grid-cols-2 mb-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Từ ngày</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar 
                      required 
                      mode="single" 
                      selected={startDate} 
                      onSelect={(date) => date && setStartDate(date)} 
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Đến ngày</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar 
                      required 
                      mode="single" 
                      selected={endDate} 
                      onSelect={(date) => date && setEndDate(date)} 
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-6">
              {reportType === "attendance" ? "Báo cáo chấm công" : "Báo cáo nghỉ phép"} - 
              {dateRange === "custom"
                ? ` Từ ${formatDate(startDate)} đến ${formatDate(endDate)}`
                : dateRange === "week"
                ? " Tuần này"
                : dateRange === "month"
                ? " Tháng này"
                : dateRange === "quarter"
                ? " Quý này"
                : " Năm nay"}
              {department !== "all" && " - Bộ phận " + department}
            </h3>

            {reportType === "attendance" && (
              <div className="space-y-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Biểu đồ tổng quan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-5 gap-6">
                      <div className="md:col-span-3">
                        <ResponsiveContainer width="100%" height={300}>
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
                            <Bar dataKey="present" stackId="a" name="Đi làm đúng giờ" fill="#22c55e" />
                            <Bar dataKey="late" stackId="a" name="Đi muộn" fill="#f59e0b" />
                            <Bar dataKey="absent" stackId="a" name="Vắng mặt" fill="#ef4444" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="md:col-span-2">
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={overtimeData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {overtimeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Tổng hợp chấm công</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="p-2 text-left font-medium">Bộ phận</th>
                            <th className="p-2 text-left font-medium">Đi làm đúng giờ</th>
                            <th className="p-2 text-left font-medium">Đi muộn</th>
                            <th className="p-2 text-left font-medium">Vắng mặt</th>
                            <th className="p-2 text-left font-medium">Tỷ lệ chuyên cần</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendanceData.map((item, index) => (
                            <tr key={index} className="border-b">
                              <td className="p-2 font-medium">{item.name}</td>
                              <td className="p-2">{item.present} ngày</td>
                              <td className="p-2">{item.late} ngày</td>
                              <td className="p-2">{item.absent} ngày</td>
                              <td className="p-2">{Math.round(((item.present + item.late) / item.total) * 100)}%</td>
                            </tr>
                          ))}
                          <tr className="bg-muted/50 font-medium">
                            <td className="p-2">Tổng cộng</td>
                            <td className="p-2">
                              {attendanceData.reduce((acc, item) => acc + item.present, 0)} ngày
                            </td>
                            <td className="p-2">
                              {attendanceData.reduce((acc, item) => acc + item.late, 0)} ngày
                            </td>
                            <td className="p-2">
                              {attendanceData.reduce((acc, item) => acc + item.absent, 0)} ngày
                            </td>
                            <td className="p-2">
                              {Math.round(
                                (attendanceData.reduce((acc, item) => acc + item.present + item.late, 0) /
                                  attendanceData.reduce((acc, item) => acc + item.total, 0)) *
                                  100
                              )}%
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Top 5 nhân viên chuyên cần nhất</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="p-2 text-left font-medium">Nhân viên</th>
                            <th className="p-2 text-left font-medium">Bộ phận</th>
                            <th className="p-2 text-left font-medium">Đi làm đúng giờ</th>
                            <th className="p-2 text-left font-medium">Đi muộn</th>
                            <th className="p-2 text-left font-medium">Vắng mặt</th>
                            <th className="p-2 text-left font-medium">Điểm chuyên cần</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topEmployees.map((employee, index) => (
                            <tr key={index} className="border-b">
                              <td className="p-2">{employee.name}</td>
                              <td className="p-2">{employee.department}</td>
                              <td className="p-2">{employee.present} ngày</td>
                              <td className="p-2">{employee.late} ngày</td>
                              <td className="p-2">{employee.absent} ngày</td>
                              <td className="p-2">{employee.score}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {reportType === "leave" && (
              <div className="space-y-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Biểu đồ nghỉ phép theo bộ phận</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={leaveData}
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
                        <Bar dataKey="annual" stackId="a" name="Nghỉ phép năm" fill="#3b82f6" />
                        <Bar dataKey="sick" stackId="a" name="Nghỉ ốm" fill="#f59e0b" />
                        <Bar dataKey="personal" stackId="a" name="Nghỉ việc riêng" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Tổng hợp nghỉ phép</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="p-2 text-left font-medium">Bộ phận</th>
                            <th className="p-2 text-left font-medium">Nghỉ phép năm</th>
                            <th className="p-2 text-left font-medium">Nghỉ ốm</th>
                            <th className="p-2 text-left font-medium">Nghỉ việc riêng</th>
                            <th className="p-2 text-left font-medium">Tổng cộng</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leaveData.map((item, index) => (
                            <tr key={index} className="border-b">
                              <td className="p-2 font-medium">{item.name}</td>
                              <td className="p-2">{item.annual} ngày</td>
                              <td className="p-2">{item.sick} ngày</td>
                              <td className="p-2">{item.personal} ngày</td>
                              <td className="p-2">{item.total} ngày</td>
                            </tr>
                          ))}
                          <tr className="bg-muted/50 font-medium">
                            <td className="p-2">Tổng cộng</td>
                            <td className="p-2">
                              {leaveData.reduce((acc, item) => acc + item.annual, 0)} ngày
                            </td>
                            <td className="p-2">
                              {leaveData.reduce((acc, item) => acc + item.sick, 0)} ngày
                            </td>
                            <td className="p-2">
                              {leaveData.reduce((acc, item) => acc + item.personal, 0)} ngày
                            </td>
                            <td className="p-2">
                              {leaveData.reduce((acc, item) => acc + item.total, 0)} ngày
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  )
}

