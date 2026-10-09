import { Modal, Form, Input } from "antd";
import { createAidCampaign } from "../../../../../api/axios/AdminApi/suplyingApi";
import AuthNotify from "../../../../utils/Common/AuthNotify";

export default function CreateCampaign({ open, onClose, onSuccess }) {
  const [form] = Form.useForm();

  /* ================= GET ADMIN ================= */
  const getAdmin = () => {
    try {
      return (
        JSON.parse(localStorage.getItem("user")) ||
        JSON.parse(sessionStorage.getItem("user"))
      );
    } catch {
      return null;
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const admin = getAdmin();

      if (!admin) {
        return AuthNotify.error("Không xác định được admin");
      }

      const payload = {
        campaignName: values.campaignName?.trim(),
        month: Number(values.month),
        year: Number(values.year),

        // 🔥 FIX QUAN TRỌNG
        status: "active",

        createdByAdminId: Number(admin.userId || admin.id),
      };

      console.log("🚀 PAYLOAD:", payload);

      const res = await createAidCampaign(payload);

      console.log("📥 RESPONSE:", res);

      AuthNotify.success("Tạo thành công");

      form.resetFields();
      onClose();

      const newItem = {
        ...(res?.data || res),

        campaignName: payload.campaignName,
        month: payload.month,
        year: payload.year,
        status: payload.status,

        createdByAdminId: payload.createdByAdminId,

        adminName:
          admin.fullName ||
          admin.name ||
          admin.username ||
          "Admin",

        createdAt: new Date().toISOString(),
      };

      onSuccess?.(newItem);

    } catch (err) {
      console.error("❌ ERROR FULL:", err);

      // 🔥 HIỂN THỊ LỖI THẬT
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err.message ||
        "Tạo thất bại";

      AuthNotify.error(msg);
    }
  };

  /* ================= UI ================= */
  return (
    <Modal
      title="Tạo chiến dịch"
      open={open}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={handleSubmit}
      okText="Tạo"
      cancelText="Hủy"
      destroyOnClose
    >
      <Form form={form} layout="vertical">

        <Form.Item
          name="campaignName"
          label="Tên chiến dịch"
          rules={[{ required: true, message: "Nhập tên chiến dịch" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="month"
          label="Tháng"
          rules={[{ required: true, message: "Nhập tháng" }]}
        >
          <Input type="number" min={1} max={12} />
        </Form.Item>

        <Form.Item
          name="year"
          label="Năm"
          rules={[{ required: true, message: "Nhập năm" }]}
        >
          <Input type="number" />
        </Form.Item>

      </Form>
    </Modal>
  );
}