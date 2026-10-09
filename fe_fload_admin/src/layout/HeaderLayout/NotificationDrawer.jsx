import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Trash2,
  CheckCheck,
  Plus,
  X,
  Send,
} from "lucide-react";
import {
  getAllNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  createNotification,
} from "../../../api/axios/Notifications/notificationsApi";

export default function NotificationDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const role = (sessionStorage.getItem("role") || "admin").toLowerCase();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // 'all' | 'unread' | 'danger'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNotif, setNewNotif] = useState({
    title: "",
    message: "",
    type: "danger",
    target: "all",
  });

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getAllNotifications({ target: role });
      setNotifications(data || []);
    } catch (err) {
      console.error("Load notifications error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const handleMarkAsRead = async (id, link) => {
    await markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    if (link) {
      onClose();
      navigate(link);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead(role);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newNotif.title || !newNotif.message) return;
    const created = await createNotification(newNotif);
    if (created) {
      setNotifications((prev) => [created, ...prev]);
      setShowCreateModal(false);
      setNewNotif({ title: "", message: "", type: "danger", target: "all" });
    }
  };

  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Vừa xong";
      if (diffMins < 60) return `${diffMins} phút trước`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} giờ trước`;
      return `${date.getDate()}/${date.getMonth() + 1} ${String(
        date.getHours()
      ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    } catch {
      return "Gần đây";
    }
  };

  if (!isOpen) return null;

  const filteredNotifs = notifications.filter((n) => {
    if (filter === "unread") return !n.IsRead && !n.isRead;
    if (filter === "danger") return n.Type === "danger" || n.type === "danger";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.IsRead && !n.isRead).length;

  const getIcon = (type) => {
    switch (type) {
      case "danger":
        return <AlertTriangle size={16} color="#ef4444" />;
      case "warning":
        return <AlertTriangle size={16} color="#f59e0b" />;
      case "success":
        return <CheckCircle size={16} color="#10b981" />;
      default:
        return <Info size={16} color="#3b82f6" />;
    }
  };

  return (
    <div className="notif-overlay" onClick={onClose}>
      <div className="notif-dropdown" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="notif-dropdown__header">
          <div className="notif-dropdown__title-wrap">
            <Bell size={18} className="text-blue-500" />
            <h4 className="notif-dropdown__title">Thông Báo & Cảnh Báo</h4>
            {unreadCount > 0 && (
              <span className="notif-dropdown__badge">{unreadCount} mới</span>
            )}
          </div>

          <div className="notif-dropdown__header-actions">
            {unreadCount > 0 && (
              <button
                className="notif-btn-ghost"
                onClick={handleMarkAllRead}
                title="Đánh dấu tất cả đã đọc"
              >
                <CheckCheck size={14} />
                <span>Đã đọc hết</span>
              </button>
            )}
            <button className="notif-btn-close" onClick={onClose} title="Đóng">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* TABS / FILTERS */}
        <div className="notif-dropdown__tabs">
          <button
            className={`notif-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            Tất cả ({notifications.length})
          </button>
          <button
            className={`notif-tab ${filter === "unread" ? "active" : ""}`}
            onClick={() => setFilter("unread")}
          >
            Chưa đọc ({unreadCount})
          </button>
          <button
            className={`notif-tab ${filter === "danger" ? "active" : ""}`}
            onClick={() => setFilter("danger")}
          >
            Khẩn cấp
          </button>
        </div>

        {/* LIST */}
        <div className="notif-dropdown__list">
          {loading ? (
            <div className="notif-empty">Đang tải thông báo...</div>
          ) : filteredNotifs.length === 0 ? (
            <div className="notif-empty">
              <Bell size={32} opacity={0.3} />
              <p>Hiện không có thông báo nào</p>
            </div>
          ) : (
            filteredNotifs.map((item) => {
              const isItemRead = item.isRead || item.IsRead;
              const itemType = item.type || item.Type || "info";

              return (
                <div
                  key={item.id || item.Id}
                  className={`notif-item notif-item--${itemType} ${
                    isItemRead ? "read" : "unread"
                  }`}
                  onClick={() =>
                    handleMarkAsRead(item.id || item.Id, item.link || item.Link)
                  }
                >
                  <div className={`notif-item__icon notif-item__icon--${itemType}`}>
                    {getIcon(itemType)}
                  </div>

                  <div className="notif-item__body">
                    <div className="notif-item__top">
                      <span className="notif-item__title">{item.title || item.Title}</span>
                      <span className="notif-item__time">
                        <Clock size={10} />
                        {formatTime(item.createdAt || item.CreatedAt)}
                      </span>
                    </div>

                    <p className="notif-item__msg">{item.message || item.Message}</p>

                    <div className="notif-item__bottom">
                      <span className="notif-item__target">
                        Đối tượng: {item.target || item.Target || "Tất cả"}
                      </span>
                      <button
                        className="notif-item__btn-del"
                        onClick={(e) => handleDelete(e, item.id || item.Id)}
                        title="Xóa thông báo này"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER */}
        <div className="notif-dropdown__footer">
          <button
            className="notif-dropdown__create-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={15} />
            <span>Phát thông báo khẩn</span>
          </button>
        </div>

        {/* CREATE MODAL */}
        {showCreateModal && (
          <div className="notif-create-modal" onClick={(e) => e.stopPropagation()}>
            <div className="notif-create-modal__header">
              <h5>Phát cảnh báo khẩn cấp hệ thống</h5>
              <button
                className="notif-btn-close"
                onClick={() => setShowCreateModal(false)}
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="notif-create-form">
              <div className="form-group">
                <label>Tiêu đề thông báo:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Cảnh báo xả lũ khẩn cấp..."
                  value={newNotif.title}
                  onChange={(e) =>
                    setNewNotif({ ...newNotif, title: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Nội dung chi tiết:</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Nội dung cảnh báo gửi đến các trạm cứu hộ hoặc người dân..."
                  value={newNotif.message}
                  onChange={(e) =>
                    setNewNotif({ ...newNotif, message: e.target.value })
                  }
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Mức độ:</label>
                  <select
                    value={newNotif.type}
                    onChange={(e) =>
                      setNewNotif({ ...newNotif, type: e.target.value })
                    }
                  >
                    <option value="danger">Khẩn cấp (Đỏ)</option>
                    <option value="warning">Cảnh báo (Vàng)</option>
                    <option value="info">Thông tin (Xanh lam)</option>
                    <option value="success">Thông báo tốt (Xanh lá)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Gửi đến:</label>
                  <select
                    value={newNotif.target}
                    onChange={(e) =>
                      setNewNotif({ ...newNotif, target: e.target.value })
                    }
                  >
                    <option value="all">Toàn bộ hệ thống</option>
                    <option value="coordinator">Điều phối viên</option>
                    <option value="manager">Ban quản lý kho</option>
                    <option value="rescueteam">Đội cứu hộ</option>
                    <option value="client">Cổng người dân</option>
                  </select>
                </div>
              </div>

              <div className="notif-create-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowCreateModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn-send">
                  <Send size={14} />
                  <span>Phát thông báo</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
