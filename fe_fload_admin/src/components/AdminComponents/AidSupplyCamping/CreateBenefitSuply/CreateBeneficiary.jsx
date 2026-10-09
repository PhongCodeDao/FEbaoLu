import { Modal, Form, Input, InputNumber } from "antd";
import { useState } from "react";
import { createBeneficiary } from "../../../../../api/axios/AdminApi/suplyingApi";
import AuthNotify from "../../../../utils/Common/AuthNotify";

export default function CreateBeneficiary({ open, onClose, onSuccess, campaignId }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  /* ================= GET ADMIN ================= */
  const getAdminId = () => {
    try {
      const user =
        JSON.parse(localStorage.getItem("user")) ||
        JSON.parse(sessionStorage.getItem("user"));

      return user?.userId || user?.id || null;
    } catch {
      return null;
    }
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // 🔥 validate campaignId
      if (!campaignId || Number(campaignId) <= 0) {
        AuthNotify.error("Campaign không hợp lệ");
        return;
      }

      // 🔥 validate admin
      const adminId = getAdminId();
      if (!adminId) {
        AuthNotify.error("Không xác định được admin");
        return;
      }

      const payload = {
        campaignId: Number(campaignId),

        fullName: values.fullName?.trim(),
        phone: values.phone?.trim(),
        address: values.address?.trim(),

        householdSize: Number(values.householdSize || 1),
        targetGroup: values.targetGroup?.trim() || "Khác",
        priorityLevel: Number(values.priorityLevel || 1),

        // 🔥 FIX: luôn là accepted
        status: "Pending",

        selectedByAdminId: Number(adminId),
        selectedAt: new Date().toISOString(),
      };

      console.log("🚀 PAYLOAD:", payload);

      const res = await createBeneficiary(payload);

      AuthNotify.success("Tạo thành công");

      form.resetFields();
      onClose();

      // Nếu API trả về object beneficiary thì đẩy lên cha để cập nhật list ngay
      const created =
        res?.data ||
        res?.item ||
        res ||
        null;

      onSuccess?.(created);

    } catch (err) {
      console.error("❌ CREATE ERROR:", err);

      AuthNotify.error(
        err?.response?.data?.message ||
        "Tạo thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <Modal
      title="Thêm người nhận"
      open={open}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={handleSubmit}
      okText="Tạo"
      cancelText="Hủy"
      confirmLoading={loading}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">

        {/* NAME */}
        <Form.Item
          name="fullName"
          label="Tên"
          rules={[{ required: true, message: "Nhập tên" }]}
        >
          <Input placeholder="Nhập tên người nhận" />
        </Form.Item>

        {/* PHONE */}
        <Form.Item
  name="phone"
  label="SĐT"
  rules={[
    { required: true, message: "Nhập SĐT" },
    {
      pattern: /^[0-9]{10}$/,
      message: "SĐT phải đúng 10 số",
    },
  ]}
>
  <Input placeholder="Nhập số điện thoại" maxLength={10} />
</Form.Item>

        {/* ADDRESS */}
        <Form.Item
          name="address"
          label="Địa chỉ"
          rules={[{ required: true, message: "Nhập địa chỉ" }]}
        >
          <Input placeholder="Nhập địa chỉ" />
        </Form.Item>

        {/* HOUSEHOLD */}
        <Form.Item
          name="householdSize"
          label="Số người trong hộ"
          rules={[{ required: true, message: "Nhập số người " }]}
        >
          <InputNumber placeholder="Ví dụ: 10"
            style={{ width: "100%" }}
            min={1}
          />
        </Form.Item>

        {/* GROUP */}
        <Form.Item
          name="targetGroup"
          label="Nhóm đối tượng (Hộ nghèo, người già, trẻ em, khuyết tật)"
         
        >
          <Input placeholder="Ví dụ: Hộ nghèo, Người già..." />
        </Form.Item>

        {/* PRIORITY */}
        <Form.Item
          name="priorityLevel"
          label="Ưu tiên (1: Rất khẩn cấp, 2: Trunng bình, 3: Thấp )"
      
        >
          <InputNumber placeholder="Ví dụ: nhập 1 là rất khẩn cấp"
            style={{ width: "100%" }}
            min={1}
            max={5}
          />
        </Form.Item>

      </Form>
    </Modal>
  );
}