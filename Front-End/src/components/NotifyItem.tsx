
type NotifyItemProps = {
  id: number;
  content: string;
  time: string;
  isRead: boolean;
  readNotification: (notificationId: number) => void;
  handleDropdownVisibleChange: (visible: boolean) => void;
};

export default function NotifyItem(props: NotifyItemProps) {
  const {
    id,
    content,
    time,
    isRead,
    readNotification,
    handleDropdownVisibleChange,
  } = props;

  const handleReadNotification = () => {
    if (!isRead) {
      readNotification(id);
    }
    handleDropdownVisibleChange(false);
  };

  const formatTime = (dateString: string) => {
    const createdAt = new Date(dateString);
    const now = new Date();

    const diffInMilliseconds = now.getTime() - createdAt.getTime();
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMilliseconds < 0) {
      return "Vừa xong";
    }

    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes === 1) return "1 phút trước";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

    if (diffInHours === 1) return "1 giờ trước";
    if (diffInHours < 24) return `${diffInHours} giờ trước`;

    if (diffInDays === 1) return "1 ngày trước";
    if (diffInDays < 7) return `${diffInDays} ngày trước`;

    // Format ngày giờ: 17:59 18/06/2025
    const formattedDate = `${createdAt
      .getHours()
      .toString()
      .padStart(2, "0")}:${createdAt
      .getMinutes()
      .toString()
      .padStart(2, "0")} ${createdAt.getDate().toString().padStart(2, "0")}/${(
      createdAt.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${createdAt.getFullYear()}`;
    return formattedDate;
  };

  return (
    <div onClick={handleReadNotification} className="block">
      <div
        className={`flex items-start gap-3 p-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer transition-colors ${
          isRead ? "bg-gray-50" : "bg-white"
        }`}
      >
        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1"></div>

          {content && (
            <div className="text-sm text-gray-600 mt-1 line-clamp-2">
              {content}
            </div>
          )}

          <div className="text-xs text-gray-400 mt-2">{formatTime(time)}</div>
        </div>
      </div>
    </div>
  );
}
