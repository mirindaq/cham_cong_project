import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminLayout } from "@/components/admin-layout"

export default function SettingsPage() {
  const [generalSettings, setGeneralSettings] = useState({
    companyName: "ACME Corporation",
    adminEmail: "admin@company.com",
    workHoursStart: "09:00",
    workHoursEnd: "17:00",
    workDays: "monday-friday",
    timezone: "UTC+7",
    lockAttendanceDay: "5",
  })

  const [locationSettings, setLocationSettings] = useState({
    locations: [
      { id: "1", name: "Trụ sở chính", address: "123 Đường Chính, Quận 1, TP.HCM" },
      { id: "2", name: "Chi nhánh Hà Nội", address: "456 Đường Phụ, Quận Ba Đình, Hà Nội" },
    ],
    allowLocationChange: true,
    defaultLocationId: "1",
  })

  const [leaveSettings, setLeaveSettings] = useState({
    annualLeaveDefault: "12",
    sickLeaveDefault: "10",
    personalLeaveDefault: "3",
    maxConsecutiveLeave: "15",
    advanceRequestDays: "7",
    approvalRequired: true,
    allowNegativeBalance: false,
    autoApproveAfterDays: "3",
    leaveTypes: [
      { id: "1", name: "Nghỉ phép năm", isPaid: true, requiresApproval: true },
      { id: "2", name: "Nghỉ ốm", isPaid: true, requiresApproval: true },
      { id: "3", name: "Nghỉ việc riêng có lương", isPaid: true, requiresApproval: true },
      { id: "4", name: "Nghỉ không lương", isPaid: false, requiresApproval: true },
    ]
  })

  const [attendanceSettings, setAttendanceSettings] = useState({
    allowLateCheckin: true,
    lateThresholdMinutes: "15",
    earlyCheckoutThresholdMinutes: "15",
    overtimeEnabled: true,
    overtimeThresholdMinutes: "30",
    geolocationRequired: true,
    ipRestriction: false,
    allowDisputeDays: "2",
    adminDisputeDays: "5",
    lockAttendanceReports: true,
    employeeTypes: [
      { id: "1", name: "Nhân viên toàn thời gian", workHoursPerWeek: "40" },
      { id: "2", name: "Nhân viên bán thời gian", workHoursPerWeek: "20" },
    ]
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    leaveRequestNotifications: true,
    leaveApprovalNotifications: true,
    attendanceReminderNotifications: true,
    attendanceDisputeNotifications: true,
    monthlyReportNotifications: true,
  })

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setGeneralSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleLeaveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setLeaveSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleLeaveSwitchChange = (name: string, checked: boolean) => {
    setLeaveSettings((prev) => ({ ...prev, [name]: checked }))
  }

  const handleAttendanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setAttendanceSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleAttendanceSwitchChange = (name: string, checked: boolean) => {
    setAttendanceSettings((prev) => ({ ...prev, [name]: checked }))
  }

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLocationSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleLocationSwitchChange = (name: string, checked: boolean) => {
    setLocationSettings((prev) => ({ ...prev, [name]: checked }))
  }

  const handleNotificationSwitchChange = (name: string, checked: boolean) => {
    setNotificationSettings((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSaveSettings = (type: string) => {
    // In a real app, this would send the data to an API
    alert(`Đã lưu cài đặt ${type} thành công!`)
  }

  const handleAddLocation = () => {
    // In a real app, this would open a modal to add a new location
    alert("Chức năng thêm địa điểm sẽ được triển khai sau!")
  }

  const handleEditLocation = (id: string) => {
    // In a real app, this would open a modal to edit a location
    alert(`Chức năng chỉnh sửa địa điểm ID: ${id} sẽ được triển khai sau!`)
  }

  const handleDeleteLocation = (id: string) => {
    // In a real app, this would confirm and delete a location
    alert(`Chức năng xóa địa điểm ID: ${id} sẽ được triển khai sau!`)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Cài Đặt Hệ Thống</h1>
          <p className="text-muted-foreground">Cấu hình hệ thống chấm công và theo dõi nghỉ phép</p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">Chung</TabsTrigger>
            <TabsTrigger value="locations">Địa Điểm</TabsTrigger>
            <TabsTrigger value="leave">Nghỉ Phép</TabsTrigger>
            <TabsTrigger value="attendance">Chấm Công</TabsTrigger>
            <TabsTrigger value="notifications">Thông Báo</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Cài Đặt Chung</CardTitle>
                <CardDescription>Cấu hình các cài đặt cơ bản của hệ thống</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Tên Công Ty</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      value={generalSettings.companyName}
                      onChange={handleGeneralChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Email Quản Trị</Label>
                    <Input
                      id="adminEmail"
                      name="adminEmail"
                      type="email"
                      value={generalSettings.adminEmail}
                      onChange={handleGeneralChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workHoursStart">Giờ Bắt Đầu Làm Việc</Label>
                    <Input
                      id="workHoursStart"
                      name="workHoursStart"
                      type="time"
                      value={generalSettings.workHoursStart}
                      onChange={handleGeneralChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workHoursEnd">Giờ Kết Thúc Làm Việc</Label>
                    <Input
                      id="workHoursEnd"
                      name="workHoursEnd"
                      type="time"
                      value={generalSettings.workHoursEnd}
                      onChange={handleGeneralChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workDays">Ngày Làm Việc</Label>
                    <Select name="workDays" value={generalSettings.workDays} onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, workDays: value }))}>
                      <SelectTrigger id="workDays">
                        <SelectValue placeholder="Chọn ngày làm việc" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monday-friday">Thứ Hai đến Thứ Sáu</SelectItem>
                        <SelectItem value="monday-saturday">Thứ Hai đến Thứ Bảy</SelectItem>
                        <SelectItem value="all">Tất cả các ngày</SelectItem>
                        <SelectItem value="custom">Tùy chỉnh</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Múi Giờ</Label>
                    <Select name="timezone" value={generalSettings.timezone} onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, timezone: value }))}>
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Chọn múi giờ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC+7">UTC+7 (Việt Nam)</SelectItem>
                        <SelectItem value="UTC+8">UTC+8</SelectItem>
                        <SelectItem value="UTC+0">UTC+0</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lockAttendanceDay">Ngày Khóa Báo Cáo Chấm Công Hàng Tháng</Label>
                    <Input
                      id="lockAttendanceDay"
                      name="lockAttendanceDay"
                      type="number"
                      min="1"
                      max="28"
                      value={generalSettings.lockAttendanceDay}
                      onChange={handleGeneralChange}
                    />
                    <p className="text-xs text-muted-foreground">Ngày trong tháng mà hệ thống sẽ khóa báo cáo chấm công của tháng trước</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleSaveSettings("Chung")}>Lưu Cài Đặt</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="locations" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Cài Đặt Địa Điểm</CardTitle>
                <CardDescription>Cấu hình các địa điểm làm việc</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="allowLocationChange">Cho Phép Thay Đổi Địa Điểm</Label>
                      <p className="text-sm text-muted-foreground">
                        Cho phép nhân viên thay đổi địa điểm làm việc mặc định
                      </p>
                    </div>
                    <Switch
                      id="allowLocationChange"
                      checked={locationSettings.allowLocationChange}
                      onCheckedChange={(checked) => handleLocationSwitchChange("allowLocationChange", checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultLocation">Địa Điểm Mặc Định</Label>
                    <Select 
                      value={locationSettings.defaultLocationId} 
                      onValueChange={(value) => setLocationSettings(prev => ({ ...prev, defaultLocationId: value }))}
                    >
                      <SelectTrigger id="defaultLocation">
                        <SelectValue placeholder="Chọn địa điểm mặc định" />
                      </SelectTrigger>
                      <SelectContent>
                        {locationSettings.locations.map(location => (
                          <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Danh Sách Địa Điểm</h3>
                    <Button onClick={handleAddLocation} variant="outline">Thêm Địa Điểm</Button>
                  </div>
                  
                  <div className="border rounded-md">
                    <div className="grid grid-cols-12 gap-4 p-4 border-b font-medium">
                      <div className="col-span-1">ID</div>
                      <div className="col-span-3">Tên</div>
                      <div className="col-span-6">Địa Chỉ</div>
                      <div className="col-span-2 text-right">Thao Tác</div>
                    </div>
                    
                    {locationSettings.locations.map((location) => (
                      <div key={location.id} className="grid grid-cols-12 gap-4 p-4 border-b last:border-b-0">
                        <div className="col-span-1">{location.id}</div>
                        <div className="col-span-3">{location.name}</div>
                        <div className="col-span-6">{location.address}</div>
                        <div className="col-span-2 flex justify-end gap-2">
                          <Button onClick={() => handleEditLocation(location.id)} variant="ghost" size="sm">Sửa</Button>
                          <Button onClick={() => handleDeleteLocation(location.id)} variant="ghost" size="sm" className="text-red-500 hover:text-red-700">Xóa</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleSaveSettings("Địa Điểm")}>Lưu Cài Đặt</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="leave" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Cài Đặt Nghỉ Phép</CardTitle>
                <CardDescription>Cấu hình chính sách nghỉ phép</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="annualLeaveDefault">Nghỉ Phép Năm Mặc Định (ngày/năm)</Label>
                    <Input
                      id="annualLeaveDefault"
                      name="annualLeaveDefault"
                      type="number"
                      value={leaveSettings.annualLeaveDefault}
                      onChange={handleLeaveChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sickLeaveDefault">Nghỉ Ốm Mặc Định (ngày/năm)</Label>
                    <Input
                      id="sickLeaveDefault"
                      name="sickLeaveDefault"
                      type="number"
                      value={leaveSettings.sickLeaveDefault}
                      onChange={handleLeaveChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="personalLeaveDefault">Nghỉ Việc Riêng Mặc Định (ngày/năm)</Label>
                    <Input
                      id="personalLeaveDefault"
                      name="personalLeaveDefault"
                      type="number"
                      value={leaveSettings.personalLeaveDefault}
                      onChange={handleLeaveChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxConsecutiveLeave">Số Ngày Nghỉ Liên Tục Tối Đa</Label>
                    <Input
                      id="maxConsecutiveLeave"
                      name="maxConsecutiveLeave"
                      type="number"
                      value={leaveSettings.maxConsecutiveLeave}
                      onChange={handleLeaveChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="advanceRequestDays">Số Ngày Yêu Cầu Trước</Label>
                    <Input
                      id="advanceRequestDays"
                      name="advanceRequestDays"
                      type="number"
                      value={leaveSettings.advanceRequestDays}
                      onChange={handleLeaveChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="autoApproveAfterDays">Tự Động Phê Duyệt Sau (ngày)</Label>
                    <Input
                      id="autoApproveAfterDays"
                      name="autoApproveAfterDays"
                      type="number"
                      value={leaveSettings.autoApproveAfterDays}
                      onChange={handleLeaveChange}
                    />
                  </div>
                </div>

                <div className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="approvalRequired">Yêu Cầu Phê Duyệt Nghỉ Phép</Label>
                      <p className="text-sm text-muted-foreground">
                        Yêu cầu quản lý phê duyệt tất cả các đơn xin nghỉ phép
                      </p>
                    </div>
                    <Switch
                      id="approvalRequired"
                      checked={leaveSettings.approvalRequired}
                      onCheckedChange={(checked) => handleLeaveSwitchChange("approvalRequired", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="allowNegativeBalance">Cho Phép Âm Số Ngày Nghỉ</Label>
                      <p className="text-sm text-muted-foreground">
                        Cho phép nhân viên nghỉ phép kể cả khi không đủ số ngày nghỉ
                      </p>
                    </div>
                    <Switch
                      id="allowNegativeBalance"
                      checked={leaveSettings.allowNegativeBalance}
                      onCheckedChange={(checked) => handleLeaveSwitchChange("allowNegativeBalance", checked)}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Loại Nghỉ Phép</h3>
                    <Button variant="outline">Thêm Loại Phép</Button>
                  </div>
                  
                  <div className="border rounded-md">
                    <div className="grid grid-cols-12 gap-4 p-4 border-b font-medium">
                      <div className="col-span-1">ID</div>
                      <div className="col-span-5">Tên Loại Phép</div>
                      <div className="col-span-2">Có Lương</div>
                      <div className="col-span-2">Yêu Cầu Duyệt</div>
                      <div className="col-span-2 text-right">Thao Tác</div>
                    </div>
                    
                    {leaveSettings.leaveTypes.map((type) => (
                      <div key={type.id} className="grid grid-cols-12 gap-4 p-4 border-b last:border-b-0">
                        <div className="col-span-1">{type.id}</div>
                        <div className="col-span-5">{type.name}</div>
                        <div className="col-span-2">{type.isPaid ? "Có" : "Không"}</div>
                        <div className="col-span-2">{type.requiresApproval ? "Có" : "Không"}</div>
                        <div className="col-span-2 flex justify-end gap-2">
                          <Button variant="ghost" size="sm">Sửa</Button>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">Xóa</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleSaveSettings("Nghỉ Phép")}>Lưu Cài Đặt</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Cài Đặt Chấm Công</CardTitle>
                <CardDescription>Cấu hình theo dõi chấm công</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lateThresholdMinutes">Ngưỡng Đi Muộn (phút)</Label>
                    <Input
                      id="lateThresholdMinutes"
                      name="lateThresholdMinutes"
                      type="number"
                      value={attendanceSettings.lateThresholdMinutes}
                      onChange={handleAttendanceChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="earlyCheckoutThresholdMinutes">Ngưỡng Về Sớm (phút)</Label>
                    <Input
                      id="earlyCheckoutThresholdMinutes"
                      name="earlyCheckoutThresholdMinutes"
                      type="number"
                      value={attendanceSettings.earlyCheckoutThresholdMinutes}
                      onChange={handleAttendanceChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="overtimeThresholdMinutes">Ngưỡng Làm Thêm Giờ (phút)</Label>
                    <Input
                      id="overtimeThresholdMinutes"
                      name="overtimeThresholdMinutes"
                      type="number"
                      value={attendanceSettings.overtimeThresholdMinutes}
                      onChange={handleAttendanceChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="allowDisputeDays">Thời Gian Khiếu Nại Nhân Viên (ngày)</Label>
                    <Input
                      id="allowDisputeDays"
                      name="allowDisputeDays"
                      type="number"
                      value={attendanceSettings.allowDisputeDays}
                      onChange={handleAttendanceChange}
                    />
                    <p className="text-xs text-muted-foreground">Số ngày cho phép nhân viên khiếu nại kết quả chấm công</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminDisputeDays">Thời Gian Điều Chỉnh Quản Trị (ngày)</Label>
                    <Input
                      id="adminDisputeDays"
                      name="adminDisputeDays"
                      type="number"
                      value={attendanceSettings.adminDisputeDays}
                      onChange={handleAttendanceChange}
                    />
                    <p className="text-xs text-muted-foreground">Số ngày cho phép quản trị viên điều chỉnh kết quả chấm công</p>
                  </div>
                </div>

                <div className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="allowLateCheckin">Cho Phép Đăng Nhập Muộn</Label>
                      <p className="text-sm text-muted-foreground">
                        Cho phép nhân viên đăng nhập sau giờ bắt đầu đã lên lịch
                      </p>
                    </div>
                    <Switch
                      id="allowLateCheckin"
                      checked={attendanceSettings.allowLateCheckin}
                      onCheckedChange={(checked) => handleAttendanceSwitchChange("allowLateCheckin", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="overtimeEnabled">Bật Theo Dõi Làm Thêm Giờ</Label>
                      <p className="text-sm text-muted-foreground">
                        Theo dõi và tính toán giờ làm thêm
                      </p>
                    </div>
                    <Switch
                      id="overtimeEnabled"
                      checked={attendanceSettings.overtimeEnabled}
                      onCheckedChange={(checked) => handleAttendanceSwitchChange("overtimeEnabled", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="geolocationRequired">Yêu Cầu Vị Trí Địa Lý</Label>
                      <p className="text-sm text-muted-foreground">
                        Yêu cầu nhân viên chia sẻ vị trí khi đăng nhập/đăng xuất
                      </p>
                    </div>
                    <Switch
                      id="geolocationRequired"
                      checked={attendanceSettings.geolocationRequired}
                      onCheckedChange={(checked) => handleAttendanceSwitchChange("geolocationRequired", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="ipRestriction">Bật Giới Hạn IP</Label>
                      <p className="text-sm text-muted-foreground">
                        Chỉ cho phép đăng nhập/đăng xuất từ các địa chỉ IP được phê duyệt
                      </p>
                    </div>
                    <Switch
                      id="ipRestriction"
                      checked={attendanceSettings.ipRestriction}
                      onCheckedChange={(checked) => handleAttendanceSwitchChange("ipRestriction", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="lockAttendanceReports">Khóa Báo Cáo Chấm Công</Label>
                      <p className="text-sm text-muted-foreground">
                        Tự động khóa báo cáo chấm công vào ngày đã cấu hình hàng tháng
                      </p>
                    </div>
                    <Switch
                      id="lockAttendanceReports"
                      checked={attendanceSettings.lockAttendanceReports}
                      onCheckedChange={(checked) => handleAttendanceSwitchChange("lockAttendanceReports", checked)}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Loại Nhân Viên</h3>
                    <Button variant="outline">Thêm Loại Nhân Viên</Button>
                  </div>
                  
                  <div className="border rounded-md">
                    <div className="grid grid-cols-12 gap-4 p-4 border-b font-medium">
                      <div className="col-span-1">ID</div>
                      <div className="col-span-7">Tên Loại</div>
                      <div className="col-span-2">Giờ/Tuần</div>
                      <div className="col-span-2 text-right">Thao Tác</div>
                    </div>
                    
                    {attendanceSettings.employeeTypes.map((type) => (
                      <div key={type.id} className="grid grid-cols-12 gap-4 p-4 border-b last:border-b-0">
                        <div className="col-span-1">{type.id}</div>
                        <div className="col-span-7">{type.name}</div>
                        <div className="col-span-2">{type.workHoursPerWeek}</div>
                        <div className="col-span-2 flex justify-end gap-2">
                          <Button variant="ghost" size="sm">Sửa</Button>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">Xóa</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleSaveSettings("Chấm Công")}>Lưu Cài Đặt</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Cài Đặt Thông Báo</CardTitle>
                <CardDescription>Cấu hình thông báo hệ thống</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailNotifications">Thông Báo Qua Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Bật thông báo email cho các sự kiện hệ thống
                      </p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => handleNotificationSwitchChange("emailNotifications", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="leaveRequestNotifications">Thông Báo Yêu Cầu Nghỉ Phép</Label>
                      <p className="text-sm text-muted-foreground">
                        Thông báo cho quản lý khi nhân viên yêu cầu nghỉ phép
                      </p>
                    </div>
                    <Switch
                      id="leaveRequestNotifications"
                      checked={notificationSettings.leaveRequestNotifications}
                      onCheckedChange={(checked) => handleNotificationSwitchChange("leaveRequestNotifications", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="leaveApprovalNotifications">Thông Báo Phê Duyệt Nghỉ Phép</Label>
                      <p className="text-sm text-muted-foreground">
                        Thông báo cho nhân viên khi đơn nghỉ phép được phê duyệt hoặc từ chối
                      </p>
                    </div>
                    <Switch
                      id="leaveApprovalNotifications"
                      checked={notificationSettings.leaveApprovalNotifications}
                      onCheckedChange={(checked) => handleNotificationSwitchChange("leaveApprovalNotifications", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="attendanceReminderNotifications">Thông Báo Nhắc Nhở Chấm Công</Label>
                      <p className="text-sm text-muted-foreground">
                        Gửi lời nhắc cho nhân viên để đăng nhập/đăng xuất
                      </p>
                    </div>
                    <Switch
                      id="attendanceReminderNotifications"
                      checked={notificationSettings.attendanceReminderNotifications}
                      onCheckedChange={(checked) => handleNotificationSwitchChange("attendanceReminderNotifications", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="attendanceDisputeNotifications">Thông Báo Khiếu Nại Chấm Công</Label>
                      <p className="text-sm text-muted-foreground">
                        Thông báo cho quản lý khi nhân viên khiếu nại về bản ghi chấm công
                      </p>
                    </div>
                    <Switch
                      id="attendanceDisputeNotifications"
                      checked={notificationSettings.attendanceDisputeNotifications}
                      onCheckedChange={(checked) => handleNotificationSwitchChange("attendanceDisputeNotifications", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="monthlyReportNotifications">Thông Báo Báo Cáo Hàng Tháng</Label>
                      <p className="text-sm text-muted-foreground">
                        Gửi báo cáo chấm công và nghỉ phép hàng tháng cho quản lý
                      </p>
                    </div>
                    <Switch
                      id="monthlyReportNotifications"
                      checked={notificationSettings.monthlyReportNotifications}
                      onCheckedChange={(checked) => handleNotificationSwitchChange("monthlyReportNotifications", checked)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleSaveSettings("Thông Báo")}>Lưu Cài Đặt</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
