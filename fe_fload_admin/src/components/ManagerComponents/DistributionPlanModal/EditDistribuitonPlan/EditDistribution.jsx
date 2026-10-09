import { Modal, Form, Input, Select } from "antd";
import { useEffect } from "react";
import { updateDistribution } from "../../../../../api/axios/ManagerApi/periodicAidApi";
import AuthNotify from "../../../../utils/Common/AuthNotify";

export default function EditDistribution({ open, onClose, data, onSuccess }) {
  const [form] = Form.useForm();

  // check completed
  const isCompleted = data?.status === "completed";

  useEffect(() => {
    if (open && data) {
      form.setFieldsValue(data);
    }
  }, [open, data, form]);

  const handleSubmit = async () => {
    // ❌ chặn submit nếu completed
    if (isCompleted) {
      AuthNotify.error("Phiếu đã hoàn thành, không thể chỉnh sửa");
      return;
    }

    try {
      const values = await form.validateFields();

      await updateDistribution(data.distributionId, {
        distributedAt: new Date().toISOString(),
        status: values.status,
        note: values.note,
      });

      AuthNotify.success("Cập nhật thành công");

      onClose();
      onSuccess();
    } catch (error) {
      AuthNotify.error("Cập nhật thất bại");
    }
  };

  return (
    <Modal
      title="Sửa phân phối"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okButtonProps={{ disabled: isCompleted }} // ❌ disable nút OK
      destroyOnHidden
    >
      {/* ⚠️ cảnh báo */}
      {isCompleted && (
        <p style={{ color: "red", marginBottom: 12 }}>
          Phiếu này đã hoàn thành, không thể chỉnh sửa
        </p>
      )}

      <Form form={form} layout="vertical">
        <Form.Item name="status" label="Trạng thái">
          <Select
            disabled={isCompleted} // ❌ disable select
            options={[
              { value: "pending", label: "Đang chờ" },
              { value: "accepted", label: "Đã nhận" },
              { value: "in progress", label: "Đang thực hiện" },
              { value: "completed", label: "Hoàn thành" },
            ]}
          />
        </Form.Item>

        <Form.Item name="note" label="Ghi chú">
          <Input disabled={isCompleted} /> {/* ❌ disable input */}
        </Form.Item>
      </Form>
    </Modal>
  );
}