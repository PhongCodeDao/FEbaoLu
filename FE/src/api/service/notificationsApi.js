import axiosInstance from "./axiosInstance";

const DEFAULT_CLIENT_NOTIFICATIONS = [
  {
    id: "c-notif-001",
    title: "Cảnh báo xả lũ khẩn cấp đập thủy điện",
    message: "Hồ thủy điện Sông Tranh dự kiến xả lũ với lưu lượng 1.200m³/s lúc 06:00. Vùng hạ du khẩn trương di dời tài sản và người dân lên vị trí an toàn.",
    type: "danger",
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: "c-notif-002",
    title: "Mở điểm phát nhu yếu phẩm khẩn cấp",
    message: "Điểm cứu trợ miễn phí tại Nhà Văn Hóa Huyện Hòa Vang và Đại Lộc đã bắt đầu cấp phát lương khô, nước sạch và thuốc men miễn phí cho bà con.",
    type: "success",
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: "c-notif-003",
    title: "Đường dây nóng cứu hộ trực chiến 24/7",
    message: "Nếu gặp tình huống nước dâng nhanh, cô lập hoặc nguy hiểm đến tính mạng, xin vui lòng bấm GỌI NGAY 1900 8888 hoặc gửi yêu cầu cứu trợ qua trang chủ.",
    type: "info",
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    isRead: true,
  },
];

const LOCAL_KEY = "client_flood_notifications";

export const getClientNotifications = async () => {
  try {
    const res = await axiosInstance.get("/api/notifications", {
      params: { target: "client" },
    });
    if (Array.isArray(res.data) && res.data.length > 0) {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(res.data));
      return res.data;
    }
  } catch (err) {
    console.warn("Client notifications fallback to local:", err?.message);
  }

  try {
    const cached = localStorage.getItem(LOCAL_KEY);
    if (cached) return JSON.parse(cached);
  } catch {}

  return DEFAULT_CLIENT_NOTIFICATIONS;
};

export const markClientNotificationRead = (id) => {
  try {
    const cached = localStorage.getItem(LOCAL_KEY);
    const list = cached ? JSON.parse(cached) : DEFAULT_CLIENT_NOTIFICATIONS;
    const updated = list.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
  } catch {}
};
