import { useState } from "react";
import "./NotificationCard.css";

const NotificationCard = ({
  title,
  time,
  message,
  avatar,
  duration,
  period,
  isNew = false,
  isRejected = false,
}) => {
  const [isSlidingOut, setIsSlidingOut] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // تحسين إنشاء الصورة الافتراضية
  const getDefaultAvatar = (name) => {
    const colors = [
      "8b7ee6",
      "6d5eea",
      "5a4fcf",
      "1890ff",
      "52c41a",
      "ff4d4f",
      "fa8c16",
    ];
    const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;
    const backgroundColor = colors[colorIndex];

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name || "مستخدم"
    )}&background=${backgroundColor}&color=fff&size=128&font-size=0.6&bold=true&format=svg`;
  };

  const defaultAvatar = getDefaultAvatar(title);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleClick = () => {
    setIsSlidingOut(true);
    // حذف البطاقة من الواجهة بعد انتهاء الحركة
    setTimeout(() => {
      setIsVisible(false);
    }, 500); // تم تحديث المدة لتتناسب مع CSS الجديد
  };

  if (!isVisible) return null;

  // تحديد كلاسات البطاقة
  const cardClasses = [
    "notification-card",
    isSlidingOut && "slide-out",
    isNew && "slide-in new-notification",
    isLoading && "loading",
    isRejected && "rejected-notification",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={cardClasses}
      role="button"
      tabIndex="0"
      onClick={handleClick}
    >
      <div className="notification-avatar">
        <img
          src={imageError ? defaultAvatar : avatar || defaultAvatar}
          alt={title || "مستخدم"}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />
        {/* مؤشر الحالة الخضراء للإشعارات الجديدة */}
        {isNew && <div className="status-indicator"></div>}
      </div>
      <div className="notification-content">
        <div className="notification-title-row">
          <span className="notification-title">{title}</span>
          <span className="notification-time">{time}</span>
        </div>
        <div className="notification-message">
          {message}
          {"     "}
          {duration && (
            <span className="duration-inline">
              ({duration.type === "full-days" && duration.days}
              {duration.type === "partial-days" &&
                `${duration.days} ${duration.time}`}
              {duration.type === "full-day" && duration.days}
              {duration.type === "time-only" && duration.time})
            </span>
          )}
        </div>

        {/* الفترة الزمنية */}
        {period && (
          <div className="notification-period-simple">
            من : {period.from} إلى : {period.to}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCard;
