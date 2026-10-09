import { Modal, Form, Select, Input } from "antd";
import { useEffect } from "react";
import { updateDistributionDetail } from "../../../../../api/axios/ManagerApi/periodicAidApi";
import AuthNotify from "../../../../utils/Common/AuthNotify";

export default function EditDistributionDetail({
  open,
  onClose,
  data,
  onSuccess
}) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        status: data.status?.toLowerCase(),
        note: data.note,
      });
    }
  }, [data]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      await updateDistributionDetail(data.detailId, {
        status: values.status,
        note: values.note || "",
      });

      AuthNotify.success("Cập nhật thành công");

      onClose();
      onSuccess();

    } catch (err) {
      console.error(err);
      AuthNotify.error("Cập nhật thất bại");
    }
  };

  return (
    <Modal
      title="Sửa phân phối"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Cập nhật"
      cancelText="Hủy"
      destroyOnHidden
    >
      <Form form={form} layout="vertical">

        <Form.Item
          name="status"
          label="Trạng thái"
          rules={[{ required: true, message: "Chọn trạng thái" }]}
        >
          <Select
            options={[
              { value: "accepted", label: "Đã nhận" },
              { value: "in progress", label: "Đang phát" },
              { value: "completed", label: "Hoàn thành" },
              { value: "rejected", label: "Từ chối" },
            ]}
          />
        </Form.Item>

        <Form.Item name="note" label="Ghi chú">
          <Input.TextArea rows={3} />
        </Form.Item>

      </Form>
    </Modal>
  );
}