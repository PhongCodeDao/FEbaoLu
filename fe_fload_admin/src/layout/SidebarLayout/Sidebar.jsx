"use client";

import { NavLink, useNavigate } from "react-router-dom";
import {
  LogoutOutlined,

  /* ADMIN */
  TeamOutlined,
  SettingOutlined,
  SafetyOutlined,
  FileTextOutlined,
  DeploymentUnitOutlined,

  /* MANAGER */
  AppstoreOutlined,
  InboxOutlined,
  CheckSquareOutlined,
  UsergroupAddOutlined,
  CarOutlined,
  GiftOutlined,

  /* RESCUE */
  CarryOutOutlined,
  HistoryOutlined,
  AlertOutlined,
  UserOutlined,

  /* COORDINATOR */
  CheckCircleOutlined,
  GlobalOutlined,
  AimOutlined,
  BarChartOutlined,

} from "@ant-design/icons";

import { useState, useEffect } from "react";
import { getUserProfile } from "../../../api/axios/Auth/authApi";
import UserProfileModal from "../../components/UserComponents/UserProfileModal";
import "./Sidebar.css";
import { useLocation } from "react-router-dom";

/* ================= MENU BY ROLE ================= */

const menuByRole = {
  admin: [
    {
      label: "Quản lý người dùng",
      icon: <TeamOutlined />,
      path: "/admin/user",
      end: true,
    },
    {
      label: "Cấu hình tham số",
      icon: <SettingOutlined />,
      path: "/admin/settings",
    },
    {
      label: "Logs hệ thống",
      icon: <FileTextOutlined />,
      path: "/admin/logs",
    },
   
    {
      label: "Chiến dịch cứu trợ",
      icon: <DeploymentUnitOutlined />,
      path: "/admin/chien-dich-cuu-tro",
    },
  ],

  manager: [
    {
      label: "Tổng quan",
      icon: <AppstoreOutlined />,
      path: "/manager",
      end: true,
    },
    {
      label: "Phương tiện",
      icon: <CarOutlined />,
      path: "/manager/vehicles",
    },
    {
      label: "Kho hàng",
      icon: <InboxOutlined />,
      path: "/manager/inventory",
    },
    {
      label: "Phê duyệt",
      icon: <CheckSquareOutlined />,
      path: "/manager/approve",
    },
    {
      label: "Kế hoạch cứu trợ",
      icon: <DeploymentUnitOutlined />,
      path: "/manager/ke-hoach-cuu-tro",
    },
    {
      label: "Phân đội cứu trợ",
      icon: <UsergroupAddOutlined />,
      path: "/manager/team-cuu-tro",
    },
    {
      label: "Đội cứu hộ",
      icon: <UsergroupAddOutlined />,
      path: "/manager/rescue-team",
    },
  ],

  coordinator: [
    {
      label: "Xác minh yêu cầu",
      icon: <CheckCircleOutlined />,
      path: "/coordinator",
      end: true,
    },
    {
      label: "Đang điều phối",
      icon: <GlobalOutlined />,
      path: "/coordinator/dang",
    },
    {
      label: "Đang cứu hộ",
      icon: <AimOutlined />,
      path: "/coordinator/mina",
    },
    {
      label: "Báo cáo nhiệm vụ",
      icon: <BarChartOutlined />,
      path: "/coordinator/reports",
    },
 
  ],

  rescueteam: [

   
    {
      label: "Thống kê nhiệm vụ ",
      icon: <BarChartOutlined />,
      path: "/rescueTeam/dashboard-task",
    },
   
    {
      label: "Nhiệm vụ ",
      icon: <CarryOutOutlined />,
      path: "/rescueTeam",
      end: true,
    },
    {
      label: "Đang cứu hộ",
      icon: <GlobalOutlined />,
      path: "/rescueTeam/dangcuho/:id",
      isDynamic: true,
    },
    {
      label: "Lịch sử nhiêm vụ ",
      icon: <HistoryOutlined />,
      path: "/rescueTeam/history",
    },
  
    {
      label: "Thành Viên Trong Đội",
      icon: <UserOutlined />,
      path: "/rescueTeam/list-member",
    },
 
  ],
};

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);

  /* USER LOCAL STORAGE */

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const role = (sessionStorage.getItem("role") || "admin").toLowerCase();

  const roleName = user.roleName || role;

  const menus = menuByRole[role] || [];

  /* PROFILE STATE */

  const [userProfile, setUserProfile] = useState({
    fullName: "Loading...",
    roleName: "",
  });

  /* LOAD PROFILE */

  const loadProfile = async () => {
    try {
      const data = await getUserProfile();
      setUserProfile(data);
    } catch {
      console.error("Load profile failed");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProfile();
  }, []);

  /* AVATAR TEXT */

  const avatarText =
    userProfile.fullName
      ?.split(" ")
      ?.map((w) => w[0])
      ?.slice(0, 2)
      ?.join("")
      ?.toUpperCase() || "U";

  /* LOGOUT */

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="sidebar">
      {/* MENU */}

      <nav className="sidebar-menu">
        {menus.map((item, index) => (
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
            <span className="menu-icon">{item.icon}</span>

            <span className="menu-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* FOOTER */}

      <div className="sidebar-footer">
        <div
          className="user-info"
          onClick={() => setProfileOpen(true)}
          style={{ cursor: "pointer" }}
        >
          <div className="avatar">{avatarText}</div>

          <div>
            <strong>{userProfile.fullName}</strong>

            <p>{roleName}</p>
          </div>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          <LogoutOutlined />
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
