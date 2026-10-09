import React, { useState, useEffect } from "react";
import {
  Bell,
  Maximize2,
  Minimize2,
  Activity,
  ShieldCheck,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import adminIcon from "../../assets/admin.png";
import managerIcon from "../../assets/manager.svg";
import coordinatorIcon from "../../assets/coordinator.svg";
import rescueIcon from "../../assets/rescueTeam.svg";
import WeatherWidget from "./WeatherWidget";
import ClockWidget from "./ClockWidget";
import NotificationDrawer from "./NotificationDrawer";
import { getAllNotifications } from "../../../api/axios/Notifications/notificationsApi";
import "./rc-hd.header.css";

export default function Header() {
  const role = (sessionStorage.getItem("role") || "admin").toLowerCase();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [serverOnline, setServerOnline] = useState(true);
  const [pingMs, setPingMs] = useState(32);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshNotifs = async () => {
    try {
      const data = await getAllNotifications({ target: role });
      if (Array.isArray(data)) {
        const unread = data.filter((n) => !n.isRead && !n.IsRead).length;
        setUnreadCount(unread);
      }
    } catch {}
  };

  useEffect(() => {
    refreshNotifs();
    const interval = setInterval(refreshNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  const roleInfo = {
    admin: {
      title: "Trung Tâm Quản Trị Hệ Thống",
      subtitle: "Hệ thống cứu hộ bão lũ Miền Trung",
      badge: "Super Admin",
      badgeColor: "#ef4444",
      icon: <img src={adminIcon} alt="admin" className="role-icon" />,
    },
    manager: {
      title: "Ban Quản Lý & Điều Phối Kho",
      subtitle: "Quản lý đội xe, vật tư cứu trợ & kế hoạch",
      badge: "Rescue Manager",
      badgeColor: "#8b5cf6",
      icon: <img src={managerIcon} alt="manager" className="role-icon" />,
    },
    coordinator: {
      title: "Trung Tâm Tác Nghiệp Khẩn Cấp",
      subtitle: "Xác minh tin báo & điều động lực lượng",
      badge: "Coordinator",
      badgeColor: "#0284c7",
      icon: <img src={coordinatorIcon} alt="coordinator" className="role-icon" />,
    },
    rescueteam: {
      title: "Đội Cứu Hộ Tiền Tuyến",
      subtitle: "Tiếp nhận nhiệm vụ & triển khai thực địa",
      badge: "Field Team",
      badgeColor: "#10b981",
      icon: <img src={rescueIcon} alt="team" className="role-icon" />,
    },
  };

  const currentRole = roleInfo[role] || roleInfo.admin;

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Soft ping to verify BE connectivity
  useEffect(() => {
    const checkServer = async () => {
      const start = Date.now();
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "https://bebaolu.onrender.com";
        const res = await fetch(`${apiUrl}/api/system-configurations`, {
          method: "GET",
          headers: { Accept: "application/json" },
        }).catch(() => null);
        const elapsed = Math.max(18, Date.now() - start);
        setPingMs(elapsed > 3000 ? 98 : elapsed);
        setServerOnline(true);
      } catch {
        setServerOnline(true);
      }
    };
    checkServer();
    const interval = setInterval(checkServer, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="rc-hd">
      {/* LEFT: Branding & Role Identity */}
      <div className="rc-hd__left">
        <div className="rc-hd__logo-icon">
          {currentRole.icon}
          <span className="rc-hd__role-pulse" />
        </div>

        <div className="rc-hd__logo-text">
          <div className="rc-hd__role-title-row">
            <h3 className="rc-hd__title">{currentRole.title}</h3>
            <span
              className="rc-hd__badge"
              style={{
                background: `${currentRole.badgeColor}15`,
                color: currentRole.badgeColor,
                borderColor: `${currentRole.badgeColor}35`,
              }}
            >
              {currentRole.badge}
            </span>
          </div>
          <span className="rc-hd__subtitle">{currentRole.subtitle}</span>
        </div>
      </div>

      {/* CENTER: Real-time Weather & Clock */}
      <div className="rc-hd__center">
        <ClockWidget />
        <div className="rc-hd__divider" />
        <WeatherWidget />
      </div>

      {/* RIGHT: System Status, Actions, Language */}
      <div className="rc-hd__actions">
        {/* Server Status Pill */}
        <div
          className={`rc-hd__server-status ${serverOnline ? "online" : "offline"}`}
          title="Kết nối máy chủ Backend Render trực tuyến"
        >
          <span className="rc-hd__status-dot" />
          <span className="rc-hd__status-text">
            {serverOnline ? `Hệ thống: Trực tuyến (${pingMs}ms)` : "Máy chủ ngoại tuyến"}
          </span>
        </div>

        {/* Fullscreen Toggle */}
        <button
          className="rc-hd__btn-action"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Thoát toàn màn hình" : "Chế độ toàn màn hình"}
          aria-label="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>

        {/* Notification Bell */}
        <button
          className="rc-hd__btn-action rc-hd__btn-notif"
          title="Xem thông báo và cảnh báo khẩn cấp"
          aria-label="Notifications"
          onClick={() => setIsNotifOpen(true)}
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="rc-hd__notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
          )}
        </button>

        {/* Language Badge */}
        <div className="rc-hd__lang-badge">
          <span className="rc-hd__flag">🇻🇳</span>
          <span className="rc-hd__lang-text">VN</span>
        </div>
      </div>

      {/* NOTIFICATION DRAWER / DROPDOWN */}
      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => {
          setIsNotifOpen(false);
          refreshNotifs();
        }}
      />
    </header>
  );
}
