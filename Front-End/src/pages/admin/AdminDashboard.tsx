import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminLayout } from "@/components/admin-layout";
import { attendanceApi } from "@/services/attendance.service";
import { leaveRequestApi } from "@/services/leaveRequest.service";
import { complaintApi } from "@/services/complaint.service";
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  YAxis,
} from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { userApi } from "@/services/user.service";
import { useNavigate } from "react-router";
import { statisticApi } from "@/services/statistic.service";
import type { WeeklyAttendanceStatistics } from "@/types/statistic.type";
import {
  AlertCircle,
  Building,
  Calendar,
  Clock,
  FileText,
  MoreHorizontal,
  User,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { format, parseISO } from "date-fns";
import type { ComplaintStatus } from "@/types/complaint.type";
import { LeaveRequestStatus } from "@/types/leaveRequest.type";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WorkShift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
}

interface WorkShiftAssignment {
  id: number;
  dateAssign: string;
  workShift: WorkShift;
  employeeId: number;
  employeeName: string;
  employeeDepartmentName: string;
}

interface RecentActivity {
  workShifts: WorkShiftAssignment;
  date: string;
  checkIn: string;
  checkOut: string;
  attendanceId: number;
  locationName: string;
  status: string;
}

interface LeaveRequest {
  id: number;
  startDate: string;
  endDate: string;
  reason: string;
  responseNote: string | null;
  responseDate: string | null;
  responseBy: number | null;
  employeeName: string;
  departmentName: string;
  leaveType: {
    id: number;
    name: string;
    maxDayPerYear: number;
  };
  status: string;
}

interface Complaint {
  id: number;
  reason: string;
  responseDate: string | null;
  date: string;
  responseNote: string | null;
  responseByFullName: string | null;
  employeeFullName: string;
  complaintType: string;
  departmentName: string;
  createdAt: string;
  status: string;
}

function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalLeaveInDay, setTotalLeaveInDay] = useState(0);
  const [leaveOverallStatistics, setLeaveOverallStatistics] = useState<any>([]);
  const [pendingLeaveRequests, setPendingLeaveRequests] = useState<
    LeaveRequest[]
  >([]);
  const [pendingComplaints, setPendingComplaints] = useState<Complaint[]>([]);
  const [weeklyAttendanceStatistics, setWeeklyAttendanceStatistics] =
    useState<WeeklyAttendanceStatistics>({
      currentDate: "",
      attendanceOfWeek: [],
    });
  const navigate = useNavigate();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<any>(null);
  const [showReasonForm, setShowReasonForm] = useState<
    "approve" | "reject" | null
  >(null);
  const [reasonText, setReasonText] = useState("");
  const { accessToken } = useAuth();

  const handleApproveLeaveRequest = async (
    id: number,
    responseNote: string
  ) => {
    if (!accessToken) {
      toast.error("Vui lòng đăng nhập lại để tiếp tục thao tác");
      return;
    }
    try {
      await leaveRequestApi.approveLeaveRequest(id, responseNote);
      toast.success("Phê duyệt đơn nghỉ phép thành công");
      setShowDetailModal(false);
      setReasonText("");
      setShowReasonForm(null);
      await loadLeaveRequests();
    } catch (error) {

    }
  };

  const handleRejectLeaveRequest = async (id: number, responseNote: string) => {
    try {
      if (!accessToken) {
        toast.error("Vui lòng đăng nhập lại để tiếp tục thao tác");
        return;
      }
      await leaveRequestApi.rejectLeaveRequest(id, responseNote);
      toast.success("Từ chối đơn nghỉ phép thành công");
      setShowDetailModal(false);
      setReasonText("");
      setShowReasonForm(null);
      await loadLeaveRequests();
    } catch (error) {
    }
  };

  const handleApproveComplaint = async (id: number, responseNote: string) => {
    if (!accessToken) {
      toast.error("Vui lòng đăng nhập lại để tiếp tục thao tác");
      return;
    }
    try {
      await complaintApi.approveComplaint(id, responseNote);
      toast.success("Phê duyệt đơn khiếu nại thành công");
      setShowDetailModal(false);
      setReasonText("");
      setShowReasonForm(null);
      await loadComplaints();
    } catch (error) {

    }
  };

  const handleRejectComplaint = async (id: number, responseNote: string) => {
    try {
      if (!accessToken) {
        toast.error("Vui lòng đăng nhập lại để tiếp tục thao tác");
        return;
      }
      await complaintApi.rejectComplaint(id, responseNote);
      toast.success("Từ chối đơn khiếu nại thành công");
      setShowDetailModal(false);
      setReasonText("");
      setShowReasonForm(null);
      await loadComplaints();
    } catch (error) {

    }
  };

  const loadComplaints = async () => {
    try {
      const complaintsData = await complaintApi.getPendingComplaints();
      setPendingComplaints(complaintsData.data);
    } catch (error) {

    }
  };

  const loadLeaveRequests = async () => {
    try {
      const leaveRequestsData = await leaveRequestApi.getPendingLeaveRequests();
      setPendingLeaveRequests(leaveRequestsData.data);
    } catch (error) {

    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [
          activitiesData,
          usersData,
          weeklyAttendanceStatistics,
          totalLeaveInDay,
          leaveOverallStatistics,
        ] = await Promise.all([
          attendanceApi.getRecentAttendances(),
          userApi.countAllUsers(),
          statisticApi.getWeeklyAttendanceStatistics(),
          statisticApi.getTotalLeaveInDay(),
          statisticApi.getLeaveOverallStatistics(),
        ]);

        setRecentActivities(activitiesData.data);
        setTotalUsers(usersData.data);
        setWeeklyAttendanceStatistics(weeklyAttendanceStatistics.data);
        setTotalLeaveInDay(totalLeaveInDay.data);
        setLeaveOverallStatistics(leaveOverallStatistics.data);
        await loadLeaveRequests();
        await loadComplaints();
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const currentDate = new Date(weeklyAttendanceStatistics.currentDate);
      const itemDate = new Date(label);
      const isFuture = itemDate > currentDate;

      return (
        <div className="bg-white/95 p-3 rounded-lg border border-gray-200 shadow-lg">
          <p className="font-medium mb-2">
            {new Date(label).toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          {isFuture ? (
            <p className="text-gray-500 italic">Chưa tới</p>
          ) : (
            <div className="space-y-1">
              <p className="text-green-600">Có mặt: {data.present}</p>
              <p className="text-yellow-600">Đi muộn: {data.late}</p>
              <p className="text-red-600">Vắng mặt: {data.absent}</p>
              <p className="text-blue-600">Nghỉ phép: {data.leave}</p>
              <p className="font-medium border-t pt-1">Tổng số: {data.total}</p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomBar = (props: any) => {
    const { payload, x, y, width, height } = props;

    const currentDate = new Date(weeklyAttendanceStatistics.currentDate);
    const itemDate = new Date(payload.date);
    const isFuture = itemDate > currentDate;
    const isToday = itemDate.toDateString() === currentDate.toDateString();

    const segments = [
      { value: payload.present, color: "#22c55e", name: "present" },
      { value: payload.late, color: "#f59e0b", name: "late" },
      { value: payload.absent, color: "#ef4444", name: "absent" },
      { value: payload.leave, color: "#60a5fa", name: "leave" },
    ];

    // If the bar represents a future date, render a dashed outline.
    if (isFuture) {
      return (
        <g>
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill="#f3f4f6"
            rx={4}
            ry={4}
            stroke="#d1d5db"
            strokeWidth={1}
            strokeDasharray="4 4"
            fillOpacity={1}
          />
        </g>
      );
    }

    // If there's no attendance data for the day (total is 0 or undefined/null)
    if (!payload.total || payload.total === 0) {
      return (
        <g>
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill="#f3f4f6"
            rx={4}
            ry={4}
            stroke={isToday ? "#000" : "#e5e7eb"} // Black border for today, light gray for other days
            strokeWidth={isToday ? 2 : 1}
          />
        </g>
      );
    }

    // Calculate segment heights based on the current day's total
    let currentY = y + height; // Start drawing from the bottom of the bar

    return (
      <g>
        {/* Background rectangle for the bar, indicating the full height */}
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill="#f3f4f6" // Light gray background
          rx={4}
          ry={4}
          stroke={isToday ? "#000" : "#e5e7eb"} // Border for the whole bar
          strokeWidth={isToday ? 2 : 1}
        />
        {/* Render each segment */}
        {segments.map((segment, index) => {
          if (segment.value === 0) return null; // Don't render segments with 0 value

          // Calculate the percentage of this segment relative to the day's total
          const percent = segment.value / payload.total;
          // Calculate the actual height of this segment
          const segmentHeight = percent * height;
          // Adjust the Y position for the next segment (stacking from bottom up)
          currentY -= segmentHeight;

          return (
            <rect
              key={index}
              x={x}
              y={currentY}
              width={width}
              height={segmentHeight}
              fill={segment.color}
              // Apply border radius only to the top segment (which will be the first one rendered, as we subtract from currentY)
              // If you want the bottom segment to have border radius, you'd need to reverse the order of rendering segments or adjust rx/ry logic.
              rx={index === segments.length - 1 ? 4 : 0} // Apply top border radius to the last rendered segment
              ry={index === segments.length - 1 ? 4 : 0}
            />
          );
        })}
      </g>
    );
  };
  const renderBarChart = () => {
    const chartData = weeklyAttendanceStatistics.attendanceOfWeek.map(
      (item) => ({
        ...item,
        fullHeightIndicator: 1,
      })
    );

    const legendItems = [
      { color: "#22c55e", label: "Có mặt" },
      { color: "#f59e0b", label: "Đi muộn" },
      { color: "#ef4444", label: "Vắng mặt" },
      { color: "#60a5fa", label: "Nghỉ phép" },
    ];

    return (
      <div className="w-full">
        <ChartContainer
          config={{
            value: {
              label: "Tổng số",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="max-h-[300px] w-full"
        >
          <BarChart
            width={671}
            height={300}
            data={chartData}
            margin={{
              top: 30,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) =>
                new Date(date).toLocaleDateString("vi-VN", { weekday: "short" })
              }
              tick={{ fontSize: 12, fontFamily: "Arial, sans-serif" }}
            />
            <YAxis domain={[0, 1]} hide={true} />
            <ChartTooltip content={<CustomTooltip />} />
            <Bar dataKey="fullHeightIndicator" shape={<CustomBar />} />
          </BarChart>
        </ChartContainer>
        <div className="flex justify-center gap-6 mt-4">
          {legendItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-600">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];
  const getStatusBadge = (status: ComplaintStatus | LeaveRequestStatus) => {
    switch (status) {
      case LeaveRequestStatus.APPROVED:
        return <Badge className="bg-green-600 text-white">Đã duyệt</Badge>;
      case LeaveRequestStatus.REJECTED:
        return <Badge variant="destructive">Từ chối</Badge>;
      case LeaveRequestStatus.PENDING:
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            Đang xử lý
          </Badge>
        );
      case LeaveRequestStatus.RECALLED:
        return (
          <Badge
            variant="outline"
            className="text-yellow-600 border-yellow-600"
          >
            Đã thu hồi
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng nhân viên
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Đang có trong hệ thống
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Đang nghỉ phép
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeaveInDay}</div>
            <p className="text-xs text-muted-foreground">Trong ngày</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingLeaveRequests.length + pendingComplaints.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {pendingLeaveRequests.length} yêu cầu nghỉ phép,{" "}
              {pendingComplaints.length} khiếu nại
            </p>
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
            <div className="h-[330px]">{renderBarChart()}</div>
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
                    data={leaveOverallStatistics}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={110}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {leaveOverallStatistics.map((entry: any, index: any) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4">
                {leaveOverallStatistics.map((item: any, index: any) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                ))}
              </div>
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
                    <div
                      key={item.id}
                      className="flex items-center justify-between border-b pb-4"
                    >
                      <div>
                        <p className="font-medium">{item.employeeName}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Yêu cầu nghỉ phép</Badge>
                          <span className="text-sm text-muted-foreground">
                            {item.startDate}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.leaveType.name} (
                          {new Date(item.startDate).toLocaleDateString()} -{" "}
                          {new Date(item.endDate).toLocaleDateString()})
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedDetail(item);
                                setShowDetailModal(true);
                              }}
                            >
                              Xem chi tiết
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="complaints">
                <div className="space-y-4">
                  {pendingComplaints.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between border-b pb-4"
                    >
                      <div>
                        <p className="font-medium">{item.employeeFullName}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Khiếu nại chấm công</Badge>
                          <span className="text-sm text-muted-foreground">
                            {item.date}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.complaintType}: {item.reason}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedDetail(item);
                                setShowDetailModal(true);
                              }}
                            >
                              Xem chi tiết
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>{" "}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
            <Button
              variant="outline"
              className="w-full mt-4 hover:cursor-pointer"
              onClick={() => navigate("/admin/approvals")}
            >
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
                <div
                  key={activity.attendanceId}
                  className="flex items-center justify-between border-b pb-4"
                >
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-base font-medium">
                        {activity.workShifts.employeeName}
                      </p>
                      {activity.checkOut ? (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800 text-xs"
                        >
                          Đã kết thúc ca
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800 text-xs"
                        >
                          Đang làm việc
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2">
                      {activity.checkOut ? (
                        <div className="bg-gray-50 p-2 rounded-md">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-muted-foreground">
                              Check-out:
                            </span>
                            <span className="text-xs">
                              {new Date(activity.checkOut).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              Thời gian làm việc:
                            </span>
                            <span className="text-xs">
                              {new Date(activity.checkIn).toLocaleTimeString()}{" "}
                              -{" "}
                              {new Date(activity.checkOut).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-2 rounded-md">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              Check-in:
                            </span>
                            <span className="text-xs">
                              {new Date(activity.checkIn).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Ca: {activity.workShifts.workShift.name}</span>
                        <span>•</span>
                        <span>
                          {activity.workShifts.workShift.startTime} -{" "}
                          {activity.workShifts.workShift.endTime}
                        </span>
                        <span>•</span>
                        <span>Vị trí: {activity.locationName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full hover:cursor-pointer"
                onClick={() => navigate("/admin/attendances")}
              >
                Xem tất cả
              </Button>
            </div>
          </CardContent>
        </Card>
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="min-w-[800px] max-h-[90vh] overflow-y-auto p-0">
            <div className="bg-white rounded-lg shadow-lg">
              <DialogHeader className="px-6 pt-6 pb-2 border-b">
                <div className="flex items-center justify-between">
                  <DialogTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    <span>
                      {selectedDetail?.leaveType
                        ? "Chi tiết phiếu nghỉ phép"
                        : "Chi tiết phiếu khiếu nại"}
                    </span>
                  </DialogTitle>
                  {getStatusBadge(selectedDetail?.status)}
                </div>
              </DialogHeader>

              {selectedDetail && (
                <div className="px-6 py-4 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Họ tên:
                      </span>
                      <span className="text-sm font-medium">
                        {selectedDetail.employeeName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Bộ phận:
                      </span>
                      <span className="text-sm font-medium">
                        {selectedDetail.departmentName}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Loại nghỉ phép:
                      </span>
                      <span className="text-sm font-medium">
                        {selectedDetail.leaveType?.name ||
                          selectedDetail.complaintType}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Ngày tạo:
                      </span>
                      <span className="text-sm font-medium">
                        {selectedDetail.createdAt
                          ? format(
                              parseISO(selectedDetail.createdAt),
                              "dd/MM/yyyy HH:mm:ss"
                            )
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  {selectedDetail.leaveType ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Từ ngày:
                        </span>
                        <span className="text-sm font-medium">
                          {selectedDetail.startDate
                            ? format(
                                parseISO(selectedDetail.startDate),
                                "dd/MM/yyyy"
                              )
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Đến ngày:
                        </span>
                        <span className="text-sm font-medium">
                          {selectedDetail.endDate
                            ? format(
                                parseISO(selectedDetail.endDate),
                                "dd/MM/yyyy"
                              )
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Ngày khiếu nại:
                      </span>
                      <span className="text-sm font-medium">
                        {selectedDetail.date
                          ? format(parseISO(selectedDetail.date), "dd/MM/yyyy")
                          : "N/A"}
                      </span>
                    </div>
                  )}

                  {/* Lý do */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm text-muted-foreground font-medium">
                        Lý do xin nghỉ:
                      </span>
                    </div>
                    <div className="bg-gray-50 border rounded p-3 text-sm text-gray-700 whitespace-pre-line">
                      {selectedDetail.reason}
                    </div>
                  </div>

                  {/* Thông tin phản hồi */}
                  {(selectedDetail.status === "APPROVED" ||
                    selectedDetail.status === "REJECTED") && (
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm text-muted-foreground font-medium">
                          Thông tin phản hồi:
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Người duyệt:
                          </span>
                          <span className="text-sm font-medium">
                            {selectedDetail.responseBy || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Ngày duyệt:
                          </span>
                          <span className="text-sm font-medium">
                            {selectedDetail.responseDate
                              ? format(
                                  parseISO(selectedDetail.responseDate),
                                  "dd/MM/yyyy HH:mm:ss"
                                )
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm text-muted-foreground font-medium">
                            Lý do{" "}
                            {selectedDetail.status === "APPROVED"
                              ? "duyệt"
                              : "từ chối"}
                            :
                          </span>
                        </div>
                        <div className="bg-gray-50 border rounded p-3 text-sm text-gray-700 whitespace-pre-line">
                          {selectedDetail.responseNote || "Không có"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <DialogFooter className="flex flex-col sm:flex-row gap-2 px-6 pb-6 pt-2 border-t mt-2">
                {selectedDetail?.status === "PENDING" &&
                (showReasonForm === "approve" ||
                  showReasonForm === "reject") ? (
                  <div className="w-full space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reason" className="font-medium">
                        Lý do{" "}
                        {showReasonForm === "approve" ? "duyệt" : "từ chối"}:
                      </Label>
                      <Textarea
                        id="reason"
                        placeholder={`Nhập lý do ${
                          showReasonForm === "approve" ? "duyệt" : "từ chối"
                        }...`}
                        value={reasonText}
                        onChange={(e) => setReasonText(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowReasonForm(null)}
                      >
                        Hủy
                      </Button>
                      {showReasonForm === "approve" ? (
                        <Button
                          variant="default"
                          onClick={() => {
                            if (selectedDetail?.leaveType) {
                              handleApproveLeaveRequest(
                                selectedDetail.id,
                                reasonText
                              );
                            } else {
                              handleApproveComplaint(
                                selectedDetail.id,
                                reasonText
                              );
                            }
                          }}
                        >
                          Xác nhận duyệt
                        </Button>
                      ) : (
                        <Button
                          variant="destructive"
                          onClick={() => {
                            if (selectedDetail?.leaveType) {
                              handleRejectLeaveRequest(
                                selectedDetail.id,
                                reasonText
                              );
                            } else {
                              handleRejectComplaint(
                                selectedDetail.id,
                                reasonText
                              );
                            }
                          }}
                        >
                          Xác nhận từ chối
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        onClick={() => setShowDetailModal(false)}
                        className="flex-1 sm:flex-none"
                      >
                        Đóng
                      </Button>
                    </div>
                    {selectedDetail?.status === "PENDING" && (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          variant="destructive"
                          onClick={() => {
                            setShowReasonForm("reject");
                          }}
                          className="flex-1 sm:flex-none"
                        >
                          Từ chối
                        </Button>
                        <Button
                          onClick={() => {
                            setShowReasonForm("approve");
                          }}
                          className="flex-1 sm:flex-none"
                        >
                          Duyệt
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
