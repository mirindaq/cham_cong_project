import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmployeeLayout } from "@/components/employee-layout";
import { statisticApi } from "@/services/statistic.service";
import { attendanceApi } from "@/services/attendance.service";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Calendar,
  Clock,
  TrendingUp,
  Activity
} from "lucide-react";

// Types cho response từ API
interface OverallStatisticEmployeeYearResponse {
  month: string;
  present: number;
  absent: number;
  late: number;
  leave: number;
  total: number;
}

interface StatisticOverallEmployeeResponse {
  totalWorkShiftAssigned: number;
  onTimeCount: number;
  totalWorkingHours: number;
}

interface LeaveOverallResponse {
  name: string;
  value: number;
}

// Type cho dữ liệu chấm công chi tiết
interface AttendanceDetail {
  workShifts: {
    id: number;
    dateAssign: string;
    workShift: {
      id: number;
      name: string;
      startTime: string;
      endTime: string;
      active: boolean;
      partTime: boolean;
    };
    employeeId: number;
    employeeName: string;
    employeeDepartmentName: string;
    attendanceId: number | null;
  };
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  attendanceId: number | null;
  locationName: string | null;
  status: string;
  image: string | null;
  editedBy: string | null;
  editedTime: string | null;
  edited: boolean;
  locked: boolean;
}

export default function StatisticPersonal() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  // State cho tháng và năm được chọn
  const today = new Date();
  const currentMonthNumber = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentMonthNumber);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // State cho dữ liệu từ API
  const [monthlyStats, setMonthlyStats] = useState<OverallStatisticEmployeeYearResponse[]>([]);
  const [overallStats, setOverallStats] = useState<StatisticOverallEmployeeResponse | null>(null);
  const [leaveStats, setLeaveStats] = useState<LeaveOverallResponse[]>([]);
  const [attendanceDetails, setAttendanceDetails] = useState<AttendanceDetail[]>([]);
  const [loading, setLoading] = useState(true);

  // Hàm gọi API
  const fetchData = async () => {
    try {
      setLoading(true);

      // Gọi 4 API song song với tháng/năm được chọn
      const [monthlyData, overallData, leaveData, attendanceData] = await Promise.all([
        statisticApi.getOverallAttendanceEmployeeByYear(selectedYear),
        statisticApi.getOverallEmployee(selectedMonth, selectedYear),
        statisticApi.getLeaveOverallEmployeeStatistics(selectedYear),
        attendanceApi.getAttendanceByEmployee(selectedMonth, selectedYear)
      ]);
      setMonthlyStats(monthlyData);
      setOverallStats(overallData);
      setLeaveStats(leaveData);
      setAttendanceDetails(attendanceData.data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu thống kê:", error);
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Gọi lại API khi thay đổi tháng/năm
  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  // Chuyển đổi dữ liệu cho biểu đồ
  const chartData = monthlyStats.map(item => ({
    month: item.month,
    present: item.present,
    late: item.late,
    absent: item.absent,
    leave: item.leave
  }));

  // Hàm tạo màu ngẫu nhiên cho pie chart
  const getRandomColor = () => {
    const colors = ["#3B82F6", "#EF4444", "#F59E0B", "#10B981", "#8B5CF6", "#EC4899"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Chuyển đổi dữ liệu nghỉ phép cho pie chart
  const pieChartData = leaveStats.map(item => ({
    name: item.name,
    value: item.value,
    color: getRandomColor()
  }));

  // Hàm format thời gian
  const formatTime = (timeString: string | null) => {
    if (!timeString) return "-";
    return new Date(timeString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Hàm format ngày
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Hàm lấy badge color theo status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <Badge className="bg-green-100 text-green-800">Có mặt</Badge>;
      case 'ABSENT':
        return <Badge className="bg-red-100 text-red-800">Vắng mặt</Badge>;
      case 'LATE':
        return <Badge className="bg-yellow-100 text-yellow-800">Đi muộn</Badge>;
      case 'LEAVE':
        return <Badge className="bg-blue-100 text-blue-800">Nghỉ phép</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Chưa tới ca</Badge>;
    }
  };

  if (loading) {
    return (
      <EmployeeLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Đang tải dữ liệu...</div>
        </div>
      </EmployeeLayout>
    );
  }

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Thống kê cá nhân</h1>
            <p className="text-muted-foreground">
              Thống kê chấm công và hiệu suất làm việc - Tháng {selectedMonth} / {selectedYear}
            </p>
          </div>
          <div className="flex space-x-4">
            <div className="flex flex-col">
              <Select
                value={selectedMonth.toString()}
                onValueChange={(value) => setSelectedMonth(parseInt(value))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Tháng" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      Tháng {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col">
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Năm" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 11 }, (_, i) => {
                    const y = 2020 + i;
                    return (
                      <SelectItem key={y} value={y.toString()}>
                        Năm {y}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Thống kê tổng quan */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng ca được phân công</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats?.totalWorkShiftAssigned}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Số ca đi làm đúng giờ</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats?.onTimeCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng giờ làm việc</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats?.totalWorkingHours.toFixed(1)}h</div>
            </CardContent>
          </Card>
        </div>

        {/* Chi tiết chấm công */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Thống kê theo tháng</CardTitle>
              <CardDescription>
                Tổng quan chấm công trong năm {selectedYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="present" fill="#10B981" name="Có mặt" />
                  <Bar dataKey="late" fill="#F59E0B" name="Đi muộn" />
                  <Bar dataKey="absent" fill="#EF4444" name="Vắng mặt" />
                  <Bar dataKey="leave" fill="#3B82F6" name="Nghỉ phép" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Phân bố nghỉ phép</CardTitle>
              <CardDescription>
                Tỷ lệ các loại nghỉ phép đã sử dụng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bảng chi tiết chấm công */}
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết chấm công theo từng ca</CardTitle>
            <CardDescription>
              Bảng chi tiết tình trạng chấm công từng ca làm việc
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Ngày</th>
                    <th className="text-left p-2">Ca làm việc</th>
                    <th className="text-left p-2">Giờ bắt đầu</th>
                    <th className="text-left p-2">Giờ kết thúc</th>
                    <th className="text-left p-2">Check-in</th>
                    <th className="text-left p-2">Check-out</th>
                    <th className="text-left p-2">Địa điểm</th>
                    <th className="text-left p-2">Trạng thái</th>
                    <th className="text-left p-2">Loại ca</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceDetails.map((record, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{formatDate(record.date)}</td>
                      <td className="p-2">{record.workShifts.workShift.name}</td>
                      <td className="p-2">{record.workShifts.workShift.startTime}</td>
                      <td className="p-2">{record.workShifts.workShift.endTime}</td>
                      <td className="p-2">{formatTime(record.checkIn)}</td>
                      <td className="p-2">{formatTime(record.checkOut)}</td>
                      <td className="p-2">
                        {record.checkIn && record.checkOut && !record.locationName
                          ? "Làm việc từ xa"
                          : (record.locationName || "-")}
                      </td>

                      <td className="p-2">{getStatusBadge(record.status)}</td>
                      <td className="p-2">
                        <Badge className={record.workShifts.workShift.partTime ? "bg-purple-100 text-purple-800" : "bg-orange-100 text-orange-800"}>
                          {record.workShifts.workShift.partTime ? "Bán thời gian" : "Toàn thời gian"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </EmployeeLayout>
  );
}
