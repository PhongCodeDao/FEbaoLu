"use client";

import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  Settings,
  FileText,
  Flame,
  LayoutDashboard,
  Truck,
  Package,
  ClipboardCheck,
  MapPin,
  Users2,
  Shield,
  CheckCircle2,
  Radio,
  Navigation,
  BarChart3,
  History,
  UserCheck,
  LogOut,
  LifeBuoy,
  ChevronRight,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import { getUserProfile } from "../../../api/axios/Auth/authApi";
import UserProfileModal from "../../components/UserComponents/UserProfileModal";
import "./Sidebar.css";

/* ================= MENU CONFIGURATION BY ROLE ================= */

const menuByRole = {
  admin: [
    {
      label: "Quản lý người dùng",
      icon: <Users size={18} />,
      path: "/admin/user",
      end: true,
      badge: "User",
    },
    {
      label: "Cấu hình tham số",
      icon: <Settings size={18} />,
      path: "/admin/settings",
    },
    {
      label: "Logs hệ thống",
      icon: <FileText size={18} />,
      path: "/admin/logs",
      badge: "Audit",
    },
    {
      label: "Chiến dịch cứu trợ",
      icon: <Flame size={18} />,
      path: "/admin/chien-dich-cuu-tro",
      badge: "Hot",
    },
  ],

  manager: [
    {
      label: "Tổng quan vận hành",
      icon: <LayoutDashboard size={18} />,
      path: "/manager",
      end: true,
    },
    {
      label: "Phương tiện cứu trợ",
      icon: <Truck size={18} />,
      path: "/manager/vehicles",
    },
    {
      label: "Kho hàng cứu trợ",
      icon: <Package size={18} />,
      path: "/manager/inventory",
    },
    {
      label: "Phê duyệt điều phối",
      icon: <ClipboardCheck size={18} />,
      path: "/manager/approve",
      badge: "Ưu tiên",
    },
    {
      label: "Kế hoạch cứu trợ",
      icon: <MapPin size={18} />,
      path: "/manager/ke-hoach-cuu-tro",
    },
    {
      label: "Phân đội cứu trợ",
      icon: <Users2 size={18} />,
      path: "/manager/team-cuu-tro",
    },
    {
      label: "Đội cứu hộ trực chiến",
      icon: <Shield size={18} />,
      path: "/manager/rescue-team",
    },
  ],

  coordinator: [
    {
      label: "Xác minh yêu cầu",
      icon: <CheckCircle2 size={18} />,
      path: "/coordinator",
      end: true,
      badge: "Khẩn cấp",
    },
    {
      label: "Đang điều phối",
      icon: <Radio size={18} />,
      path: "/coordinator/dang",
      badge: "Live",
    },
    {
      label: "Đang cứu hộ",
      icon: <Navigation size={18} />,
      path: "/coordinator/mina",
    },
    {
      label: "Báo cáo nhiệm vụ",
      icon: <BarChart3 size={18} />,
      path: "/coordinator/reports",
    },
  ],

  rescueteam: [
    {
      label: "Thống kê nhiệm vụ",
      icon: <BarChart3 size={18} />,
      path: "/rescueTeam/dashboard-task",
    },
    {
      label: "Nhiệm vụ trực tiếp",
      icon: <ClipboardCheck size={18} />,
      path: "/rescueTeam",
      end: true,
      badge: "Mới",
    },
    {
      label: "Đang cứu hộ",
      icon: <Navigation size={18} />,
      path: "/rescueTeam/dangcuho/:id",
      isDynamic: true,
    },
    {
      label: "Lịch sử nhiệm vụ",
      icon: <History size={18} />,
      path: "/rescueTeam/history",
    },
    {
      label: "Thành viên trong đội",
      icon: <UserCheck size={18} />,
      path: "/rescueTeam/list-member",
    },
  ],
};

const roleMeta = {
  admin: { name: "Quản trị viên", color: "#ef4444" },
  manager: { name: "Điều hành kho & đội", color: "#8b5cf6" },
  coordinator: { name: "Điều phối viên", color: "#0284c7" },
  rescueteam: { name: "Đội viên cứu nạn", color: "#10b981" },
};

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const role = (sessionStorage.getItem("role") || "admin").toLowerCase();
  const currentRoleMeta = roleMeta[role] || { name: role, color: "#3b82f6" };
  const menus = menuByRole[role] || [];

  const [userProfile, setUserProfile] = useState({
    fullName: user.fullName || "Tài khoản",
    roleName: user.roleName || currentRoleMeta.name,
  });

  const loadProfile = async () => {
    try {
      const data = await getUserProfile();
      if (data) {
        setUserProfile(data);
      }
    } catch {
      // Use existing user from storage if available
      if (user.fullName) {
        setUserProfile({
          fullName: user.fullName,
          roleName: user.roleName || currentRoleMeta.name,
        });
      }
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const avatarText =
    userProfile.fullName
      ?.split(" ")
      ?.map((w) => w[0])
      ?.slice(0, 2)
      ?.join("")
      ?.toUpperCase() || "CH";

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="sidebar">
      {/* BRAND / HUB HEADER */}
      <div className="sidebar-brand">
        <div className="sidebar-brand__logo-wrap">
          <div className="sidebar-brand__glow-ring" />
          <LifeBuoy className="sidebar-brand__icon" size={22} />
        </div>
        <div className="sidebar-brand__text">
          <div className="sidebar-brand__title">
            <span>RESCUE HUB</span>
            <span className="sidebar-brand__live-tag">LIVE</span>
          </div>
          <p className="sidebar-brand__subtitle">Cứu Trợ & Ứng Cứu Bão Lũ</p>
        </div>
      </div>

      {/* SECTION LABEL */}
      <div className="sidebar-section-title">
        <span>MENU ĐIỀU HÀNH</span>
        <div className="sidebar-section-line" />
      </div>

      {/* NAVIGATION ITEMS */}
      <nav className="sidebar-menu">
        {menus.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) => {
              const isDangCuuHo =
                item.isDynamic &&
                location.pathname.includes("/rescueTeam/dangcuho");

              return `menu-item ${isActive || isDangCuuHo ? "active" : ""}`;
            }}
          >
            <div className="menu-item__left">
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
            </div>

            <div className="menu-item__right">
              {item.badge && (
                <span className={`menu-badge ${item.badge === "Hot" || item.badge === "Khẩn cấp" ? "badge-danger" : "badge-info"}`}>
                  {item.badge}
                </span>
              )}
              <ChevronRight size={14} className="menu-arrow" />
            </div>
          </NavLink>
        ))}
      </nav>

      {/* FOOTER USER CARD */}
      <div className="sidebar-footer">
        <div
          className="user-card"
          onClick={() => setProfileOpen(true)}
          title="Nhấn để xem và chỉnh sửa thông tin cá nhân"
        >
          <div className="avatar-wrap">
            <div className="avatar">{avatarText}</div>
            <span
              className="avatar-status-dot"
              style={{ background: currentRoleMeta.color }}
            />
          </div>

          <div className="user-details">
            <span className="user-name">{userProfile.fullName}</span>
            <div className="user-role-pill">
              <span
                className="role-color-dot"
                style={{ background: currentRoleMeta.color }}
              />
              <span className="role-text">
                {userProfile.roleName || currentRoleMeta.name}
              </span>
            </div>
          </div>
        </div>

        <button className="logout-btn" onClick={handleLogout} title="Đăng xuất khỏi hệ thống">
          <LogOut size={16} />
          <span>Đăng xuất</span>
        </button>
      </div>

      {/* PROFILE MODAL */}
      <UserProfileModal
        open={profileOpen}
        onClose={() => {
          setProfileOpen(false);
          loadProfile();
        }}
      />
    </aside>
  );
}
