import { notification } from "antd";

const baseStyle = {
  width: 360,
  borderRadius: 8,
  padding: "14px 16px",
};

const EmergencyNotify = {
  success(title = "Thành công", description = "") {
    notification.success({
      placement: "topRight",
      message: title,
      description,
      duration: 2.5,
      style: {
        ...baseStyle,
        borderLeft: "6px solid #52c41a",
      },
    });
  },

  error(title = "Lỗi", description = "") {
    notification.error({
      placement: "topRight",
      message: title,
      description,
      duration: 3,
      style: {
        ...baseStyle,
        borderLeft: "6px solid #ff4d4f",
      },
    });
  },

  warning(title = "Cảnh báo", description = "") {
    notification.warning({
      placement: "topRight",
      message: title,
      description,
      duration: 3,
      style: {
        ...baseStyle,
        borderLeft: "6px solid #faad14",
      },
    });
  },
};

export default EmergencyNotify;
