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
import { MapPin, AlertCircle, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmployeeLayout } from "@/components/employee-layout";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  startOfWeek,
  endOfWeek,
  isSameMonth,
} from "date-fns";
import { attendanceApi } from "@/services/attendance.service";
import { localStorageUtil } from "@/utils/localStorageUtil";
import type { User } from "@/types/user.type";
import type { Location } from "@/types/location.type";
import { locationApi } from "@/services/location.service";
import type { WorkShift } from "@/types/workShiftAssignment.type";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router";
import { leaveBalanceApi } from "@/services/leaveBalance.service";

interface AttendanceWorkShiftResponse {
  workShifts: {
    id: number;
    dateAssign: string;
    workShift: WorkShift;
    employeeId: number;
    employeeName: string;
    employeeDepartmentName: string;
  };
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  attendanceId: number | null;
  locationName: string | null;
  status: "PRESENT" | "LEAVE" | "LATE" | "ABSENT" | null;
}

interface LeaveBalanceResponse {
  id: number;
  leaveTypeName: string;
  remainingDay: number;
}

function EmployeeDashboard() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [employee, setEmployee] = useState<User | null>(
    localStorageUtil.getUserFromLocalStorage()
  );
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [, setCurrentPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [monthlyAttendance, setMonthlyAttendance] = useState<
    {
      date: Date;
      checkIn: string | null;
      checkOut: string | null;
      status: "PRESENT" | "LEAVE" | "LATE" | "ABSENT" | null;
      workShift: WorkShift[];
    }[]
  >([]);
  const [attendanceData, setAttendanceData] = useState<
    AttendanceWorkShiftResponse[]
  >([]);
  const [selectedWorkShiftId, setSelectedWorkShiftId] = useState<number | null>(
    null
  );
  const [todayShifts, setTodayShifts] = useState<AttendanceWorkShiftResponse[]>(
    []
  );
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] =
    useState<AttendanceWorkShiftResponse | null>(null);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalanceResponse[]>([]);
  const navigate = useNavigate();

  const checkCurrentShift = () => {
    const now = new Date();
    const currentDate = format(now, "yyyy-MM-dd");

    const todayShifts = attendanceData.filter((a) => a.date === currentDate);
    setTodayShifts(todayShifts);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      checkCurrentShift();
    }, 60000);

    checkCurrentShift();

    return () => clearInterval(timer);
  }, [attendanceData]);

  useEffect(() => {
    const fetchLocation = async () => {
      const response = await locationApi.getAllLocationsActive();
      setLocations(response);
      setIsLoading(false);
    };

    fetchLocation();
  }, []);

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Trình duyệt không hỗ trợ định vị"));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      });
    });
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    console.log(lat1, lon1, lat2, lon2);
    const R = 6371;
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

    const deltaLat = toRadians(lat2 - lat1);
    const deltaLon = toRadians(lon2 - lon1);

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(deltaLon / 2) *
        Math.sin(deltaLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c * 1000;
  };

  const handleCheckIn = async () => {
    setLocationError(null);

    if (!employee?.id || !selectedWorkShiftId) {
      setLocationError("Không tìm thấy thông tin nhân viên hoặc ca làm việc");
      return;
    }

    try {
      const selectedLocation = locations.find(
        (loc) => loc.id === parseInt(selectedLocationId)
      );
      if (!selectedLocation) {
        setLocationError("Không tìm thấy thông tin địa điểm");
        return;
      }

      try {
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        setCurrentPosition({ latitude, longitude });

        const distance = calculateDistance(
          latitude,
          longitude,
          selectedLocation.latitude,
          selectedLocation.longitude
        );

        if (distance > selectedLocation.radius) {
          setLocationError(
            `Bạn đang ở ngoài phạm vi cho phép (${selectedLocation.radius}m) của địa điểm "${selectedLocation.name}". Vui lòng di chuyển đến gần hơn để check-in.`
          );
          return;
        }

        const response = await attendanceApi.checkIn({
          employeeId: employee.id,
          locationId: parseInt(selectedLocationId),
          latitude,
          longitude,
          workShiftId: selectedWorkShiftId,
        });

        if (response.status === 200) {
          const month = currentMonth.getMonth() + 1;
          const year = currentMonth.getFullYear();
          const attendanceResponse =
            await attendanceApi.getAttendanceByEmployeeId(
              employee.id,
              month,
              year
            );
          if (attendanceResponse.status === 200) {
            setAttendanceData(attendanceResponse.data);
          }
        }
      } catch (err: any) {
        setLocationError(
          err.response?.data?.message ||
            "Có lỗi xảy ra khi check-in. Vui lòng thử lại sau."
        );
      }
    } catch (error) {
      console.error("Lỗi khi check-in:", error);
      setLocationError("Có lỗi xảy ra khi check-in. Vui lòng thử lại sau.");
    }
  };

  const handleCheckOut = async (attendanceId: number) => {
    setLocationError(null);

    if (!employee?.id) {
      setLocationError("Không tìm thấy thông tin nhân viên");
      return;
    }

    try {
      const response = await attendanceApi.checkOut({
        employeeId: employee.id,
        attendanceId: attendanceId,
      });

      if (response.status === 200) {
        const month = currentMonth.getMonth() + 1;
        const year = currentMonth.getFullYear();
        const attendanceResponse =
          await attendanceApi.getAttendanceByEmployeeId(
            employee.id,
            month,
            year
          );
        if (attendanceResponse.status === 200) {
          setAttendanceData(attendanceResponse.data);
          const updatedAttendance = attendanceResponse.data.find(
            (a: AttendanceWorkShiftResponse) => a.attendanceId === attendanceId
          );
          if (updatedAttendance) {
            setSelectedAttendance(updatedAttendance);
            setShowCheckoutModal(true);
          }
        }
      }
    } catch (error: any) {
      console.error("Lỗi khi check-out:", error);
      setLocationError(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi check-out. Vui lòng thử lại sau."
      );
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Fetch attendance data from API
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        if (!employee) {
          setError("Không tìm thấy thông tin nhân viên");
          return;
        }
        const month = currentMonth.getMonth() + 1;
        const year = currentMonth.getFullYear();
        const response = await attendanceApi.getAttendanceByEmployeeId(
          employee.id,
          month,
          year
        );
        console.log(response);
        if (response.status === 200) {
          setAttendanceData(response.data);
        } else {
          setError("Không thể tải dữ liệu chấm công");
        }
      } catch (err) {
        setError("Có lỗi xảy ra khi tải dữ liệu chấm công");
      }
    };

    fetchAttendanceData();
  }, [currentMonth, employee, locations]);

  // Update calendar data when attendance data changes
  useEffect(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const calendarData = days.map((day) => {
      const formattedDate = format(day, "yyyy-MM-dd");
      const dayRecords = attendanceData.filter((a) => a.date === formattedDate);

      if (dayRecords.length > 0) {
        const firstRecord = dayRecords[0];
        return {
          date: day,
          checkIn: firstRecord.checkIn,
          checkOut: firstRecord.checkOut,
          status: firstRecord.status,
          workShift: [firstRecord.workShifts.workShift],
        };
      }

      return {
        date: day,
        checkIn: null,
        checkOut: null,
        status: null,
        workShift: [],
      };
    });

    setMonthlyAttendance(calendarData);
  }, [attendanceData, currentMonth]);

  // Thêm hàm kiểm tra ca đã quá giờ chưa
  const isShiftExpired = (shift: AttendanceWorkShiftResponse) => {
    const now = new Date();
    const currentTimeStr = format(now, "HH:mm:ss");
    const [currentHour, currentMin] = currentTimeStr.split(":").map(Number);
    const currentTime = currentHour * 60 + currentMin;

    const [endHour, endMin] = shift.workShifts.workShift.endTime
      .split(":")
      .map(Number);
    const endTime = endHour * 60 + endMin;

    return currentTime > endTime;
  };

  // Thêm hàm kiểm tra ca có thể chấm công không
  const canCheckIn = (shift: AttendanceWorkShiftResponse) => {
    // Nếu đã chấm công thì không thể chấm nữa
    if (shift.checkIn !== null) {
      console.log("Đã chấm công");
      return false;
    }

    const now = new Date();
    const currentTimeStr = format(now, "HH:mm:ss");
    const [currentHour, currentMin] = currentTimeStr.split(":").map(Number);
    const currentTime = currentHour * 60 + currentMin;

    const [startHour, startMin] = shift.workShifts.workShift.startTime
      .split(":")
      .map(Number);
    const [endHour, endMin] = shift.workShifts.workShift.endTime
      .split(":")
      .map(Number);
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    const canCheck = currentTime >= startTime && currentTime <= endTime;
    return canCheck;
  };

  useEffect(() => {
    const fetchLeaveBalance = async () => {
      if (!employee?.id) return;
      try {
        const response = await leaveBalanceApi.getLeaveBalanceByEmployeeId(employee.id);
        if (response.status === 200) {
          setLeaveBalances(response.data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy số ngày nghỉ phép:", error);
      }
    };

    fetchLeaveBalance();
  }, [employee]);

  if (isLoading) {
    return (
      <EmployeeLayout>
        <div className="flex items-center justify-center h-64">
          <p>Đang tải...</p>
        </div>
      </EmployeeLayout>
    );
  }

  if (error) {
    return (
      <EmployeeLayout>
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </EmployeeLayout>
    );
  }

  return (
    <EmployeeLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{employee?.fullName}</h1>
          <p className="text-muted-foreground">
            Checkin {format(currentMonth, "MM/yyyy")}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Lịch làm việc và chấm công</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentMonth(
                  (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                )
              }
            >
              Tháng trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date())}
            >
              Tháng hiện tại
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentMonth(
                  (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                )
              }
            >
              Tháng sau
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {/* Header ngày trong tuần */}
          {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day, index) => (
            <div
              key={index}
              className="text-center font-medium p-2 bg-muted rounded-md"
            >
              {day}
            </div>
          ))}

          {/* Các ngày trong calendar */}
          {monthlyAttendance.map((item, index) => {
            const isCurrentDay = isToday(item.date);
            const isCurrentMonth = isSameMonth(item.date, currentMonth);
            const dayShifts = attendanceData.filter(
              (a) => a.date === format(item.date, "yyyy-MM-dd")
            );

            const dayStyles = `
              ${isCurrentDay ? "border-2 border-primary" : "border"}
              ${!isCurrentMonth ? "bg-gray-100 opacity-60" : ""}
              ${
                isCurrentMonth && dayShifts.some((s) => s.status === "PRESENT")
                  ? "bg-green-50"
                  : ""
              }
              ${
                isCurrentMonth && dayShifts.some((s) => s.status === "LATE")
                  ? "bg-yellow-50"
                  : ""
              }
              ${
                isCurrentMonth && dayShifts.some((s) => s.status === "ABSENT")
                  ? "bg-red-50"
                  : ""
              }
              ${
                isCurrentMonth && dayShifts.some((s) => s.status === "LEAVE")
                  ? "bg-blue-50"
                  : ""
              }
              rounded-md p-2 min-h-[100px] relative
            `;

            return (
              <div key={index} className={dayStyles}>
                <div className="flex justify-between items-center mb-2">
                  <div
                    className={`text-right text-sm ${
                      !isCurrentMonth ? "text-gray-400" : ""
                    }`}
                  >
                    {format(item.date, "dd/MM")}
                  </div>
                </div>

                {/* Nội dung gộp thông tin ca làm việc và chấm công */}
                {isCurrentMonth && (
                  <div className="space-y-2">
                    {/* Hiển thị các ca làm việc */}
                    {dayShifts.length > 0 && (
                      <div className="space-y-1">
                        {dayShifts.map((shift, idx) => (
                          <div
                            key={idx}
                            className={`text-xs p-1 rounded border-l-2 ${
                              shift.status === "PRESENT"
                                ? "bg-green-50 border-green-500"
                                : shift.status === "LATE"
                                ? "bg-yellow-50 border-yellow-500"
                                : shift.status === "ABSENT"
                                ? "bg-red-50 border-red-500"
                                : shift.status === "LEAVE"
                                ? "bg-blue-50 border-blue-500"
                                : "bg-gray-50 border-gray-500"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">
                                {shift.workShifts.workShift.name}
                              </span>
                              <Badge
                                className={
                                  shift.status === "PRESENT"
                                    ? "bg-green-500"
                                    : shift.status === "LATE"
                                    ? "bg-yellow-500 text-black"
                                    : shift.status === "ABSENT"
                                    ? "bg-red-500"
                                    : shift.status === "LEAVE"
                                    ? "bg-blue-500"
                                    : "bg-gray-500"
                                }
                              >
                                {shift.status === "PRESENT"
                                  ? "Có mặt"
                                  : shift.status === "LATE"
                                  ? "Đi muộn"
                                  : shift.status === "ABSENT"
                                  ? "Vắng mặt"
                                  : shift.status === "LEAVE"
                                  ? "Nghỉ phép"
                                  : "Chưa chấm công"}
                              </Badge>
                            </div>
                            <div className="text-muted-foreground">
                              {shift.workShifts.workShift.startTime}-
                              {shift.workShifts.workShift.endTime}
                            </div>
                            {shift.checkIn && (
                              <div className="text-xs bg-gray-50 p-1 rounded flex justify-between mt-1">
                                <span>
                                  IN:{" "}
                                  {shift.checkIn.split("T")[1].substring(0, 5)}
                                </span>
                                {shift.checkOut && (
                                  <span>
                                    OUT:{" "}
                                    {shift.checkOut
                                      .split("T")[1]
                                      .substring(0, 5)}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Chấm công</CardTitle>
            <CardDescription>Thực hiện chấm công ngày hôm nay</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold">
                {formatTime(currentTime)}
              </div>
              <div className="text-muted-foreground">
                {formatDate(currentTime)}
              </div>
            </div>

            {locationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{locationError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Địa điểm làm việc</Label>
              <Select
                value={selectedLocationId}
                onValueChange={setSelectedLocationId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn địa điểm làm việc" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem
                      key={location.id}
                      value={location.id.toString()}
                    >
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ca làm việc</Label>
              <Select
                value={selectedWorkShiftId?.toString() || ""}
                onValueChange={(value) => {
                  setSelectedWorkShiftId(parseInt(value));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn ca làm việc" />
                </SelectTrigger>
                <SelectContent>
                  {todayShifts.map((shift) => {
                    const isDisabled =
                      shift.checkIn !== null || 
                      isShiftExpired(shift) || 
                      shift.status === "LEAVE";
                    const isExpired = isShiftExpired(shift);
                    const isCheckedIn = shift.checkIn !== null;
                    const isOnLeave = shift.status === "LEAVE";

                    return (
                      <SelectItem
                        key={shift.workShifts.id}
                        value={shift.workShifts.id.toString()}
                        disabled={isDisabled}
                      >
                        <div className="flex items-center justify-between">
                          <span>
                            {shift.workShifts.workShift.name} (
                            {shift.workShifts.workShift.startTime}-
                            {shift.workShifts.workShift.endTime})
                          </span>
                          {isDisabled && (
                            <span className="text-xs text-muted-foreground ml-2">
                              {isCheckedIn
                                ? "(Đã chấm công)"
                                : isExpired
                                ? "(Đã quá giờ)"
                                : isOnLeave
                                ? "(Đã nghỉ phép)"
                                : ""}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {(() => {
              const selectedShift = todayShifts.find(
                (s) => s.workShifts.id === selectedWorkShiftId
              );
              const hasUncheckedOutShift = todayShifts.some(
                (s) => s.checkIn && !s.checkOut
              );
              const uncheckedOutShift = todayShifts.find(
                (s) => s.checkIn && !s.checkOut
              );

              if (hasUncheckedOutShift && uncheckedOutShift) {
                return (
                  <div className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Bạn có ca chưa checkout!</AlertTitle>
                      <AlertDescription>
                        <div className="mt-2">
                          <p>
                            Ca: {uncheckedOutShift.workShifts.workShift.name}
                          </p>
                          <p>
                            Thời gian:{" "}
                            {uncheckedOutShift.workShifts.workShift.startTime} -{" "}
                            {uncheckedOutShift.workShifts.workShift.endTime}
                          </p>
                          <p>
                            Check in:{" "}
                            {uncheckedOutShift.checkIn
                              ?.split("T")[1]
                              .substring(0, 5)}
                          </p>
                        </div>
                      </AlertDescription>
                    </Alert>
                    <Button
                      onClick={() =>
                        uncheckedOutShift?.attendanceId &&
                        handleCheckOut(uncheckedOutShift.attendanceId)
                      }
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      Check Out
                    </Button>
                  </div>
                );
              } else {
                const canCheckInNow = selectedShift
                  ? canCheckIn(selectedShift)
                  : false;
                return (
                  <Button
                    onClick={handleCheckIn}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={!selectedWorkShiftId || !canCheckInNow}
                  >
                    Check In
                  </Button>
                );
              }
            })()}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Ngày phép còn lại</CardTitle>
            <CardDescription>Số ngày nghỉ phép còn lại của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaveBalances.map((leave) => (
                <div
                  key={leave.id}
                  className="flex items-center justify-between"
                >
                  <div className="font-medium">{leave.leaveTypeName}</div>
                  <Badge>Còn {leave.remainingDay} ngày</Badge>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full hover:cursor-pointer"
                onClick={() => navigate("/employee/leave-requests")}
              >
                Đăng ký nghỉ phép
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showCheckoutModal} onOpenChange={setShowCheckoutModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thông tin chấm công</DialogTitle>
            <DialogDescription>
              Chi tiết bản chấm công của bạn
            </DialogDescription>
          </DialogHeader>
          {selectedAttendance && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Ca làm việc
                  </div>
                  <div className="mt-1">
                    {selectedAttendance.workShifts.workShift.name}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Địa điểm
                  </div>
                  <div className="mt-1">{selectedAttendance.locationName}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Giờ vào
                  </div>
                  <div className="mt-1">
                    {selectedAttendance.checkIn?.split("T")[1].substring(0, 5)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Giờ ra
                  </div>
                  <div className="mt-1">
                    {selectedAttendance.checkOut?.split("T")[1].substring(0, 5)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Trạng thái
                  </div>
                  <div className="mt-1">
                    <Badge
                      className={
                        selectedAttendance.status === "PRESENT"
                          ? "bg-green-500"
                          : selectedAttendance.status === "LATE"
                          ? "bg-yellow-500 text-black"
                          : selectedAttendance.status === "ABSENT"
                          ? "bg-red-500"
                          : "bg-blue-500"
                      }
                    >
                      {selectedAttendance.status === "PRESENT"
                        ? "Có mặt"
                        : selectedAttendance.status === "LATE"
                        ? "Đi muộn"
                        : selectedAttendance.status === "ABSENT"
                        ? "Vắng mặt"
                        : "Nghỉ phép"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </EmployeeLayout>
  );
}

export default EmployeeDashboard;
