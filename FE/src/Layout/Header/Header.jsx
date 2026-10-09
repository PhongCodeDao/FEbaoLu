import React, { useState, useEffect } from "react";
import "./Header.css";
import { useNavigate } from "react-router-dom";
import { FaBell, FaExclamationTriangle, FaCheckCircle, FaTimes, FaInfoCircle } from "react-icons/fa";
import { getClientNotifications, markClientNotificationRead } from "../../api/service/notificationsApi";

const Header = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);

  const fetchNotifs = async () => {
    try {
      const data = await getClientNotifications();
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch {}
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 40000);
    return () => clearInterval(interval);
  }, []);

  const handleCall = () => {
    window.location.href = "tel:19008888";
  };

  const handleRead = (id) => {
    markClientNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const unreadCount = notifications.filter((n) => !n.isRead && !n.IsRead).length;

  return (
    <header className="header">
      <div className="header-container">
        {/* LEFT - LOGO */}
        <div className="header-logo" onClick={() => navigate("/")}>
          <img
            src="https://intriphat.com/wp-content/uploads/2023/09/logo-chu-thap-do.png"
            alt="Cứu hộ Việt Nam"
          />
        </div>

        {/* CENTER - MENU */}
        <nav className="header-menu">
          <button onClick={() => navigate("/")}>TRANG CHỦ</button>
          <button onClick={() => navigate("/map")}>TRA CỨU</button>
          <button onClick={() => navigate("/newpage")}>TIN TỨC</button>
          <button onClick={() => navigate("/map")}>BẢN ĐỒ CỨU HỘ</button>
        </nav>

        {/* RIGHT */}
        <div className="header-actions">
          {/* NOTIFICATION BELL */}
          <div className="client-notif-wrap">
            <button
              className="client-notif-btn"
              onClick={() => setShowNotifs(!showNotifs)}
              title="Thông báo khẩn cấp cho người dân"
            >
              <FaBell size={18} />
              {unreadCount > 0 && (
                <span className="client-notif-badge">{unreadCount}</span>
              )}
            </button>

            {/* NOTIFICATION POPUP */}
            {showNotifs && (
              <div className="client-notif-popup">
                <div className="client-notif-header">
                  <strong>Thông Báo Khẩn Cấp</strong>
                  <button
                    className="client-notif-close"
                    onClick={() => setShowNotifs(false)}
                  >
                    <FaTimes size={14} />
                  </button>
                </div>

                <div className="client-notif-list">
                  {notifications.length === 0 ? (
                    <div className="client-notif-empty">Chưa có thông báo mới</div>
                  ) : (
                    notifications.map((item) => {
                      const isRead = item.isRead || item.IsRead;
                      const type = item.type || item.Type || "info";

                      return (
                        <div
                          key={item.id || item.Id}
                          className={`client-notif-item ${isRead ? "read" : "unread"} type-${type}`}
                          onClick={() => handleRead(item.id || item.Id)}
                        >
                          <div className="client-notif-item__icon">
                            {type === "danger" && <FaExclamationTriangle color="#ef4444" />}
                            {type === "warning" && <FaExclamationTriangle color="#f59e0b" />}
                            {type === "success" && <FaCheckCircle color="#10b981" />}
                            {type === "info" && <FaInfoCircle color="#3b82f6" />}
                          </div>
                          <div className="client-notif-item__content">
                            <h6>{item.title || item.Title}</h6>
                            <p>{item.message || item.Message}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="hotline">
            <span>HOTLINE 24/7</span>
            <strong>
              <a href="tel:19008888">1900 8888</a>
            </strong>
          </div>

          <button className="call-btn" onClick={handleCall}>
            📞 GỌI NGAY
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;