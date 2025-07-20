import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/admin-layout";

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
} from "recharts";
import type {
  LeaveOverallResponse,
  OverallStatisticMonthResponse,
  TopFiveStaffAttendanceResponse,
} from "@/types/statistic.type";
import { statisticApi } from "@/services/statistic.service";
import { useSearchParams } from "react-router";
import { Download } from "lucide-react";

export default function ReportsPage() {
  const [topFiveEmployees, setTopFiveEmployees] = useState<
    TopFiveStaffAttendanceResponse[]
  >([]);
  const [overtimeData, setOvertimeData] = useState<LeaveOverallResponse[]>([]);
  const [attendanceData, setAttendanceData] = useState<
    OverallStatisticMonthResponse[]
  >([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const [month, setMonth] = useState(
    parseInt(searchParams.get("month") || String(currentMonth))
  );
  const [year, setYear] = useState(
    parseInt(searchParams.get("year") || String(currentYear))
  );

  useEffect(() => {
    setSearchParams({ month: month.toString(), year: year.toString() });
  }, [month, year, setSearchParams]);
  const [, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setLoading(true);
    const loadTopFiveEmployees = async () => {
      const [topFive, attendanceData, overtimeData] = await Promise.all([
        statisticApi.getTopFiveStaffAttendanceByMonth(month, year),
        statisticApi.getOverallByMonth(month, year),
        statisticApi.getLeaveOverallStatisticsByMonth(month, year),
      ]);
      console.log(overtimeData);
      setTopFiveEmployees(topFive.data);
      setAttendanceData(attendanceData.data);
      setOvertimeData(overtimeData.data);
      setLoading(false);
    };
    loadTopFiveEmployees();
  }, [month, year]);

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const blob = await statisticApi.exportOverallByMonth(month, year);
      
      // Tạo URL cho blob
      const url = window.URL.createObjectURL(blob);
      
      // Tạo link tạm thời để download
      const link = document.createElement('a');
      link.href = url;
      link.download = `bao-cao-cham-cong-thang-${month}-nam-${year}.xlsx`;
      
      // Click vào link để download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Lỗi khi export Excel:', error);
      alert('Có lỗi xảy ra khi export file Excel');
    } finally {
      setExporting(false);
    }
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  // if (loading) {
  //   return <Spinner layout="admin" />;
  // }

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <CardTitle>Báo cáo</CardTitle>
          <CardDescription>
            Tạo và xem các báo cáo chấm công và nghỉ phép
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className=" pt-6 ">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold mb-6">
                Báo cáo chấm công - Tháng {month} / {year}
              </h3>
              <div className="flex space-x-4 justify-end">
                <div className="flex flex-col">
                  <Select
                    value={month.toString()}
                    onValueChange={(value) => setMonth(parseInt(value))}
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
                    value={year.toString()}
                    onValueChange={(value) => setYear(parseInt(value))}
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
                <div className="flex flex-col">
                  <Button 
                    onClick={handleExportExcel} 
                    disabled={exporting}
                    className="flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    {exporting ? "Đang export..." : "Export Excel"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Biểu đồ tổng quan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-5 gap-6">
                    <div className="md:col-span-3">
                      {attendanceData.length === 0 && (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-gray-500">
                            Không có dữ liệu chấm công
                          </p>
                        </div>
                      )}
                      {attendanceData.length > 0 && (
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
                            <Bar
                              dataKey="present"
                              stackId="a"
                              name="Đi làm đúng giờ"
                              fill="#22c55e"
                            />
                            <Bar
                              dataKey="late"
                              stackId="a"
                              name="Đi muộn"
                              fill="#f59e0b"
                            />
                            <Bar
                              dataKey="absent"
                              stackId="a"
                              name="Vắng mặt"
                              fill="#ef4444"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      {overtimeData.length === 0 && (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-gray-500">
                            Không có dữ liệu nghỉ phép
                          </p>
                        </div>
                      )}
                      {overtimeData.length > 0 && (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={overtimeData}
                              dataKey="value"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              fill="#8884d8"
                              label={({ name, percent }) =>
                                `${name}: ${(percent * 100).toFixed(0)}%`
                              }
                            >
                              {overtimeData.map((_, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
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
                          <th className="p-2 text-left font-medium">Tuần</th>
                          <th className="p-2 text-left font-medium">
                            Đi làm đúng giờ
                          </th>
                          <th className="p-2 text-left font-medium">Đi muộn</th>
                          <th className="p-2 text-left font-medium">
                            Vắng mặt
                          </th>
                          <th className="p-2 text-left font-medium">
                            Nghỉ phép
                          </th>
                          <th className="p-2 text-left font-medium">
                            Tỷ lệ chuyên cần
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceData.length === 0 && (
                          <tr>
                            <td
                              colSpan={6}
                              className="p-4 text-center text-gray-500"
                            >
                              Không có dữ liệu
                            </td>
                          </tr>
                        )}
                        {attendanceData.length > 0 &&
                          attendanceData.map((item, index) => (
                            <tr key={index} className="border-b">
                              <td className="p-2 font-medium">{item.name}</td>
                              <td className="p-2">{item.present} ca</td>
                              <td className="p-2">{item.late} ca</td>
                              <td className="p-2">{item.absent} ca</td>
                              <td className="p-2">{item.leave || 0} ca</td>
                              <td className="p-2">
                                {Math.round(
                                  ((item.present + item.late) / item.total) *
                                    100
                                )}
                                %
                              </td>
                            </tr>
                          ))}
                        <tr className="bg-muted/50 font-medium">
                          <td className="p-2">Tổng cộng</td>
                          <td className="p-2">
                            {attendanceData.reduce(
                              (acc, item) => acc + item.present,
                              0
                            )}{" "}
                            ca
                          </td>
                          <td className="p-2">
                            {attendanceData.reduce(
                              (acc, item) => acc + item.late,
                              0
                            )}{" "}
                            ca
                          </td>
                          <td className="p-2">
                            {attendanceData.reduce(
                              (acc, item) => acc + item.absent,
                              0
                            )}{" "}
                            ca
                          </td>
                          <td className="p-2">
                            {attendanceData.reduce(
                              (acc, item) => acc + (item.leave || 0),
                              0
                            )}{" "}
                            ca
                          </td>
                          <td className="p-2">
                            {(() => {
                              const totalWorking = attendanceData.reduce(
                                (acc, item) => acc + item.present + item.late,
                                0
                              );
                              const totalAssigned = attendanceData.reduce(
                                (acc, item) => acc + item.total,
                                0
                              );
                              return totalAssigned === 0
                                ? 0
                                : Math.round(
                                    (totalWorking / totalAssigned) * 100
                                  );
                            })()}
                            %
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    Top 5 nhân viên chuyên cần nhất
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="p-2 text-left font-medium">
                            Nhân viên
                          </th>
                          <th className="p-2 text-left font-medium">Bộ phận</th>
                          <th className="p-2 text-left font-medium">
                            Số ca làm việc
                          </th>
                          <th className="p-2 text-left font-medium">
                            Số ca đi làm
                          </th>
                          <th className="p-2 text-left font-medium">
                            Số ca đi muộn
                          </th>
                          <th className="p-2 text-left font-medium">
                            Số ca vắng mặt
                          </th>
                          <th className="p-2 text-left font-medium">
                            Số ca nghỉ phép
                          </th>
                          <th className="p-2 text-left font-medium">
                            Tổng số giờ làm
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {topFiveEmployees.length > 0 &&
                          topFiveEmployees.map((employee, index) => (
                            <tr key={index} className="border-b">
                              <td className="p-2">{employee.employeeName}</td>
                              <td className="p-2">{employee.departmentName}</td>
                              <td className="p-2">
                                {employee.totalWorkShiftAssignment}
                              </td>
                              <td className="p-2">
                                {employee.totalAttendanceWorkShift}
                              </td>
                              <td className="p-2">
                                {employee.totalLateWorkShift}
                              </td>
                              <td className="p-2">
                                {employee.totalAbsentWorkShift}
                              </td>
                              <td className="p-2">
                                {employee.totalLeaveWorkShift}
                              </td>
                              <td className="p-2">
                                {employee.totalWorkingHours.toFixed(2)} giờ
                              </td>
                            </tr>
                          ))}
                        {topFiveEmployees.length === 0 && (
                          <tr>
                            <td
                              colSpan={8}
                              className="p-4 text-center text-gray-500"
                            >
                              Không có dữ liệu
                            </td>
                          </tr>
                        )}
                        <tr className="bg-muted/50 font-medium">
                          <td className="p-2">Tổng cộng</td>
                          <td className="p-2"></td>
                          <td className="p-2">
                            {topFiveEmployees.reduce(
                              (acc, employee) =>
                                acc + employee.totalWorkShiftAssignment,
                              0
                            )}
                          </td>
                          <td className="p-2">
                            {topFiveEmployees.reduce(
                              (acc, employee) =>
                                acc + employee.totalAttendanceWorkShift,
                              0
                            )}
                          </td>
                          <td className="p-2">
                            {topFiveEmployees.reduce(
                              (acc, employee) =>
                                acc + employee.totalLateWorkShift,
                              0
                            )}
                          </td>
                          <td className="p-2">
                            {topFiveEmployees.reduce(
                              (acc, employee) =>
                                acc + employee.totalAbsentWorkShift,
                              0
                            )}
                          </td>
                          <td className="p-2">
                            {topFiveEmployees.reduce(
                              (acc, employee) =>
                                acc + employee.totalLeaveWorkShift,
                              0
                            )}
                          </td>
                          <td className="p-2">
                            {topFiveEmployees
                              .reduce(
                                (acc, employee) =>
                                  acc + employee.totalWorkingHours,
                                0
                              )
                              .toFixed(2)}{" "}
                            giờ
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
