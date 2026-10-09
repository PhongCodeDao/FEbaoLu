import axiosInstance from "../../axiosInstance";

const DEFAULT_NOTIFICATIONS = [
  {
    id: "notif-001",
    title: "Cảnh báo xả lũ khẩn cấp đập thủy điện",
    message: "Hồ thủy điện Sông Tranh dự kiến xả lũ với lưu lượng 1.200m³/s lúc 06:00. Vùng hạ du khẩn trương di dời tài sản và người dân lên vị trí an toàn.",
    type: "danger",
    target: "all",
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    isRead: false,
    link: "/coordinator",
  },
  {
    id: "notif-002",
    title: "Yêu cầu cứu hộ khẩn cấp tại Hòa Tiến",
    message: "Hộ dân gồm 4 người (có 2 trẻ em) đang bị nước cô lập tại thôn Cẩm Lệ, xã Hòa Tiến. Cần điều động ca nô gấp.",
    type: "warning",
    target: "coordinator",
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    isRead: false,
    link: "/coordinator/dang",
  },
  {
    id: "notif-003",
    title: "Kho trung tâm tiếp nhận 50 ca nô & 1.000 áo phao",
    message: "Hàng viện trợ khẩn cấp từ Hội Chữ Thập Đỏ đã nhập kho an toàn. Ban điều phối có thể tiến hành phân bổ ngay.",
    type: "info",
    target: "manager",
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    isRead: false,
    link: "/manager/inventory",
  },
  {
    id: "notif-004",
    title: "Mở điểm phát nhu yếu phẩm khẩn cấp",
    message: "Điểm cứu trợ miễn phí tại Nhà Văn Hóa Huyện Hòa Vang và Đại Lộc đã bắt đầu cấp phát lương khô, nước sạch và thuốc men.",
    type: "success",
    target: "client",
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    isRead: false,
    link: "/admin/chien-dich-cuu-tro",
  },
];

const LOCAL_STORAGE_KEY = "rescue_system_notifications";

const getStoredNotifications = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_NOTIFICATIONS;
};

const saveStoredNotifications = (items) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch {}
};

/**
 * Lấy danh sách thông báo
 */
export const getAllNotifications = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/api/notifications", { params });
    if (Array.isArray(response.data) && response.data.length > 0) {
      saveStoredNotifications(response.data);
      return response.data;
    }
  } catch (error) {
    console.warn("Notifications API fallback to cached alerts:", error?.message);
  }

  // Fallback to local cache
  const stored = getStoredNotifications();
  if (params.target && params.target !== "all") {
    return stored.filter((n) => n.target === "all" || n.target === params.target);
  }
  return stored;
};

/**
 * Tạo mới thông báo
 */
export const createNotification = async (payload) => {
  try {
    const response = await axiosInstance.post("/api/notifications", payload);
    return response.data;
  } catch (error) {
    console.warn("Using offline createNotification fallback:", error?.message);
    const stored = getStoredNotifications();
    const newNotif = {
      id: "notif-" + Date.now(),
      title: payload.title,
      message: payload.message,
      type: payload.type || "info",
      target: payload.target || "all",
      createdAt: new Date().toISOString(),
      isRead: false,
      link: payload.link || "",
    };
    stored.unshift(newNotif);
    saveStoredNotifications(stored);
    return newNotif;
  }
};

/**
 * Đánh dấu một thông báo đã đọc
 */
export const markNotificationAsRead = async (id) => {
  try {
    const response = await axiosInstance.put(`/api/notifications/${id}/read`);
    return response.data;
  } catch (error) {
    const stored = getStoredNotifications();
    const updated = stored.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    saveStoredNotifications(updated);
    return { success: true };
  }
};

/**
 * Đánh dấu đọc tất cả
 */
export const markAllNotificationsAsRead = async (target) => {
  try {
    const response = await axiosInstance.put("/api/notifications/read-all", null, {
      params: { target },
    });
    return response.data;
  } catch (error) {
    const stored = getStoredNotifications();
    const updated = stored.map((n) => ({ ...n, isRead: true }));
    saveStoredNotifications(updated);
    return { success: true };
  }
};

/**
 * Xóa thông báo
 */
export const deleteNotification = async (id) => {
  try {
    const response = await axiosInstance.delete(`/api/notifications/${id}`);
    return response.data;
  } catch (error) {
    const stored = getStoredNotifications();
    const updated = stored.filter((n) => n.id !== id);
    saveStoredNotifications(updated);
    return { success: true };
  }
};
