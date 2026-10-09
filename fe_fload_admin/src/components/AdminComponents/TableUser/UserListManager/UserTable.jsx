import "./UserTable.css";
import { Tag, Spin, Pagination, Tooltip } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { useEffect, useState, useMemo } from "react";
import { getProvinces } from "../../../../../api/axios/Auth/authApi";

export default function UserTable({
  onRowClick,
  onEdit,
  onDelete,
  loading,
  users = [],
}) {
  const [provinces, setProvinces] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  async function fetchProvinces() {
    try {
      const res = await getProvinces();
      const data = res?.data || res || [];
      setProvinces(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("FETCH PROVINCES ERROR:", error);
      setProvinces([]);
    }
  }

  useEffect(() => {
    fetchProvinces();
  }, []);

  const provinceMap = useMemo(() => {
    const map = {};
    provinces.forEach((p) => {
      map[Number(p.id)] = p.name;
    });
    return map;
  }, [provinces]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return users.slice(start, end);
  }, [users, currentPage]);

  const getRoleBadge = (role) => {
    if (!role) return <Tag className="role-tag default">N/A</Tag>;
    const lower = role.toLowerCase();
    if (lower.includes("admin")) {
      return (
        <Tag className="role-tag admin" icon={<SafetyCertificateOutlined />}>
          Admin
        </Tag>
      );
    }
    if (lower.includes("manager")) {
      return <Tag className="role-tag manager">Quản Lý</Tag>;
    }
    if (lower.includes("coordinator")) {
      return <Tag className="role-tag coordinator">Điều Phối</Tag>;
    }
    if (lower.includes("rescue")) {
      return <Tag className="role-tag rescue">Đội Cứu Hộ</Tag>;
    }
    return <Tag className="role-tag default">{role}</Tag>;
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getAvatarGradient = (id) => {
    const gradients = [
      "linear-gradient(135deg, #60a5fa, #2563eb)",
      "linear-gradient(135deg, #f472b6, #db2777)",
      "linear-gradient(135deg, #34d399, #059669)",
      "linear-gradient(135deg, #fbbf24, #d97706)",
      "linear-gradient(135deg, #a78bfa, #7c3aed)",
      "linear-gradient(135deg, #38bdf8, #0284c7)",
    ];
    return gradients[(id || 0) % gradients.length];
  };

  return (
    <div className="userTable-card">
      <div className="userTable-card__header">
        <div className="userTable-card__header-info">
          <span className="userTable-card__header-title">Danh Sách Tài Khoản</span>
          <span className="userTable-card__header-count">{users.length} người dùng</span>
        </div>
      </div>

      {loading ? (
        <div className="userTable__loading">
          <Spin size="large" tip="Đang tải danh sách..." />
        </div>
      ) : (
        <div className="userTable-wrapper">
          <table className="userTable-table">
            <thead>
              <tr>
                <th style={{ width: "64px", textAlign: "center" }}>STT</th>
                <th>Người dùng</th>
                <th>Số điện thoại</th>
                <th>Vai trò</th>
                <th>Khu vực phụ trách</th>
                <th>Trạng thái</th>
                <th style={{ width: "120px", textAlign: "center" }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="userTable__empty">
                    <div className="empty-box">
                      <span className="empty-icon">👥</span>
                      <p className="empty-title">Không tìm thấy người dùng nào</p>
                      <span className="empty-desc">Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user, index) => {
                  const provinceName = provinceMap[Number(user.areaId)] || "Toàn quốc";
                  return (
                    <tr
                      key={user.id}
                      onClick={() => onRowClick?.(user)}
                      className="userTable__row"
                    >
                      <td className="userTable__stt">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>

                      <td>
                        <div className="user-profile-cell">
                          <div
                            className="user-avatar"
                            style={{ background: getAvatarGradient(user.id) }}
                          >
                            {getInitials(user.name)}
                          </div>
                          <div className="user-profile-meta">
                            <span className="user-name">{user.name || "Chưa đặt tên"}</span>
                            <span className="user-id-code">ID: #{user.id}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="user-phone-cell">
                          <PhoneOutlined className="cell-icon" />
                          <span>{user.phone || "Chưa có SĐT"}</span>
                        </div>
                      </td>

                      <td>{getRoleBadge(user.role)}</td>

                      <td>
                        <div className="user-area-cell">
                          <EnvironmentOutlined className="cell-icon" />
                          <span>{provinceName}</span>
                        </div>
                      </td>

                      <td>
                        <span className="user-status-chip active">
                          <span className="pulse-dot" />
                          {user.status || "Hoạt động"}
                        </span>
                      </td>

                      <td>
                        <div className="user-actions-cell" onClick={(e) => e.stopPropagation()}>
                          <Tooltip title="Chỉnh sửa thông tin">
                            <button
                              className="action-btn edit-btn"
                              onClick={() => onEdit?.(user)}
                              disabled={user.role === "Admin"}
                            >
                              <EditOutlined />
                            </button>
                          </Tooltip>

                          <Tooltip title="Xóa tài khoản">
                            <button
                              className="action-btn delete-btn"
                              onClick={() => onDelete?.(user)}
                              disabled={user.role === "Admin"}
                            >
                              <DeleteOutlined />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {users.length > pageSize && (
            <div className="userTable__pagination">
              <span className="page-summary">
                Hiển thị {(currentPage - 1) * pageSize + 1} -{" "}
                {Math.min(currentPage * pageSize, users.length)} / {users.length} tài khoản
              </span>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={users.length}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}