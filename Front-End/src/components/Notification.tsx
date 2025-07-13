import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { notificationApi } from "@/services/notification.service";
import NotifyItem from "@/components/NotifyItem";
import type { NotificationResponse } from "@/types/notification.type";

export default function Notification() {
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPage, setTotalPage] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationResponse[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [, setIsLoadingUnread] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  // Fetch notifications
  const fetchNotifications = async (currentPage: number, reset = false) => {
    try {
      setIsLoading(true);
      const response = await notificationApi.getAllNotifications(
        currentPage - 1,
        limit
      );

      if (response.status === 200) {
        const newNotifications = response.data.data;
        setTotalPage(response.data.totalPage);

        if (reset) {
          setNotifications(newNotifications);
        } else {
          setNotifications((prev) => [...prev, ...newNotifications]);
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      setIsLoadingUnread(true);
      const response =
        await notificationApi.countUnreadNotificationsByEmployee();
      console.log("Unread count response:", response);
      setUnreadCount(response);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    } finally {
      setIsLoadingUnread(false);
    }
  };

  // Mark single notification as read
  const readNotification = async (notificationId: number) => {
    try {
      await notificationApi.updateNotificationToRead(notificationId);
      await fetchUnreadCount();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const readAllNotifications = async () => {
    try {
      setIsMarkingRead(true);
      await notificationApi.updateAllNotificationsToReadByEmployee();
      await fetchUnreadCount();
      // Refresh current notifications to update read status
      await fetchNotifications(1, true);
      setPage(1);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    } finally {
      setIsMarkingRead(false);
    }
  };

  // Initial load of unread count
  useEffect(() => {
    fetchUnreadCount();
  }, []);

  // Fetch notifications when page changes or dropdown opens
  useEffect(() => {
    if (dropdownOpen) {
      fetchNotifications(page, page === 1);
    }
  }, [page, dropdownOpen]);

  const handleLoadMore = () => {
    if (page < totalPage && !isLoading) {
      setPage((prev) => prev + 1);
    }
  };

  const handleDropdownOpenChange = (open: boolean) => {
    setDropdownOpen(open);
    if (open) {
      if (page !== 1) {
        setPage(1);
        setNotifications([]);
      }
    }
  };

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={handleDropdownOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96 p-0" align="end" sideOffset={8}>
        <div className="flex flex-col bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="px-4 py-3 flex justify-between items-center border-b bg-gray-50 rounded-t-lg">
            <span className="font-semibold text-lg text-gray-800">
              Thông báo
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={readAllNotifications}
              disabled={isMarkingRead}
              className="text-gray-500 hover:text-gray-700 h-8"
            >
              {isMarkingRead ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Đánh dấu đã đọc"
              )}
            </Button>
          </div>

          {/* Body */}
          <div
            className="flex-1 overflow-y-auto"
            style={{ maxHeight: "500px" }}
          >
            {isLoading && page === 1 ? (
              <div className="flex justify-center items-center h-20">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : notifications.length > 0 ? (
              <>
                {notifications.map((notification) => (
                  <NotifyItem
                    key={notification.id}
                    id={notification.id}
                    content={notification.content}
                    time={notification.createdAt}
                    // tag={notification.tag}
                    isRead={notification.isRead}
                    readNotification={readNotification}
                    handleDropdownVisibleChange={handleDropdownOpenChange}
                  />
                ))}
                {isLoading && page > 1 && (
                  <div className="flex justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Không có thông báo mới</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {page < totalPage && (
            <div className="text-center border-t py-2 bg-gray-50 rounded-b-lg">
              <Button
                variant="link"
                onClick={handleLoadMore}
                disabled={isLoading}
                className="text-blue-600 hover:text-blue-800"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Đang tải...
                  </>
                ) : (
                  "Xem thêm"
                )}
              </Button>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
