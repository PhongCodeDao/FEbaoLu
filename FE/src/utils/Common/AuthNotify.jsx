import { notification } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import "./auth-notify.css";

const DURATION = 2;

const baseConfig = {
  placement: "topRight",
  duration: DURATION,
  className: "auth-notify",
};

/* ================= BASE ================= */

const open = (type, title, description) => {
  notification[type]({
    ...baseConfig,
    message: title,
    description,
    style: {
      borderRadius: 14,
    },
  });
};

/* ================= LOADING (QUAN TRỌNG) ================= */

const openLoading = (title, description) => {

  const key = `loading-${Date.now()}`;

  notification.open({
    message: title,
    description,
    duration: 0, // ❗ không tự tắt
    key,
    icon: <LoadingOutlined spin />,
    className: "auth-notify",
    style: {
      borderRadius: 14,
    },
  });

  // trả về hàm để tắt
  return () => notification.destroy(key);
};

/* ================= EXPORT ================= */

const AuthNotify = {

  success(title = "Thành công", desc = "") {
    open("success", title, desc);
  },

  error(title = "Lỗi", desc = "") {
    open("error", title, desc);
  },

  warning(title = "Cảnh báo", desc = "") {
    open("warning", title, desc);
  },

  info(title = "Thông báo", desc = "") {
    open("info", title, desc);
  },

  loading(title = "Đang xử lý", desc = "") {
    return openLoading(title, desc);
  }

};

export default AuthNotify;