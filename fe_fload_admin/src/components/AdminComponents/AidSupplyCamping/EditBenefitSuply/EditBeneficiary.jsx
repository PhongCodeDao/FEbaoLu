import { Modal, Form, Input, InputNumber } from "antd";
import { useEffect } from "react";

import { updateBeneficiary } from "../../../../../api/axios/AdminApi/suplyingApi";
import AuthNotify from "../../../../utils/Common/AuthNotify";

export default function EditBeneficiary({ open, onClose, data, onSuccess }) {
  const [form] = Form.useForm();

  /* ================= SET DATA ================= */
  useEffect(() => {
    if (open && data) {
      form.setFieldsValue({
        fullName: data.fullName,
        phone: data.phone,
        address: data.address,
        householdSize: data.householdSize,
        targetGroup: data.targetGroup,
        priorityLevel: data.priorityLevel,
      });
    }
  }, [open, data]);

  /* ================= RESET ================= */
  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open]);

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const id = data?.id || data?.beneficiaryId;

      if (!id) {
        return AuthNotify.error("Thiếu ID");
      }

      const payload = {
        fullName: values.fullName?.trim(),
        phone: values.phone?.trim(),
        address: values.address?.trim(),
        householdSize: Number(values.householdSize),
        targetGroup: values.targetGroup?.trim(),
        priorityLevel: Number(values.priorityLevel),

        // 🔥 giữ nguyên status
        status: data?.status,
      };

      console.log("🚀 UPDATE PAYLOAD:", payload);

      await updateBeneficiary(id, payload);

      AuthNotify.success("Cập nhật thành công");

      // 🔥 TẠO ITEM MỚI ĐỂ PUSH LÊN ĐẦU
      const updatedItem = {
        ...data, // giữ id + status + field khác
        ...payload, // ghi đè field đã sửa
      };

      console.log("🆕 UPDATED ITEM:", updatedItem);

      onClose();

      // 🔥 TRUYỀN LÊN PARENT
      onSuccess?.(updatedItem);

    } catch (err) {
      console.error("❌ UPDATE ERROR:", err);

      AuthNotify.error(
        err?.response?.data?.message || "Cập nhật thất bại"
      );
    }
  };

  /* ================= UI ================= */
  return (
    <Modal
      title="Sửa người nhận"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Cập nhật"
      cancelText="Hủy"
      destroyOnClose
    >
      <Form form={form} layout="vertical">

        <Form.Item
          name="fullName"
          label="Tên"
          rules={[{ required: true, message: "Nhập tên" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="phone"
          label="SĐT"
          rules={[{ required: true, message: "Nhập SĐT" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="address"
          label="Địa chỉ"
          rules={[{ required: true, message: "Nhập địa chỉ" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="householdSize"
          label="Số người"
          rules={[{ required: true, message: "Nhập số người" }]}
        >
          <InputNumber style={{ width: "100%" }} min={1} />
        </Form.Item>

        <Form.Item name="targetGroup" label="Nhóm">
          <Input />
        </Form.Item>

        <Form.Item name="priorityLevel" label="Ưu tiên">
          <InputNumber style={{ width: "100%" }} min={1} />
        </Form.Item>

      </Form>
    </Modal>
  );
}