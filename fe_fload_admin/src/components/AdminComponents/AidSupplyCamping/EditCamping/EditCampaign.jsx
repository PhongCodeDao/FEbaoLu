import { Modal, Form, Input, Select, message } from "antd";
import { useEffect } from "react";
import { updateAidCampaign } from "../../../../../api/axios/AdminApi/suplyingApi";
import AuthNotify from "../../../../utils/Common/AuthNotify";
import "./EditCampaign.css";
export default function EditCampaign({ open, onClose, data, onSuccess }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (data) {
      form.setFieldsValue(data);
    }
  }, [data]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      await updateAidCampaign(data.campaignID, values);

      AuthNotify.success("Cập nhật thành công");

      onClose();
      onSuccess();

    } catch {
      AuthNotify.error("Cập nhật thất bại");
    }
  };

  return (
    <Modal
  className="edit-campaign-modal"
  title="Sửa chiến dịch"
  open={open}
  onCancel={onClose}
  onOk={handleSubmit}
>
      <Form form={form} layout="vertical">

        <Form.Item name="campaignName" label="Tên" >
          <Input />
        </Form.Item>

        <Form.Item name="month" label="Tháng" >
          <Input type="number" />
        </Form.Item>

        <Form.Item name="year" label="Năm" >
          <Input type="number" />
        </Form.Item>

        <Form.Item name="status" label="Trạng thái">
  <Select
    options={[
      { value: "accepted", label: "🔵 Đã nhận" },
      { value: "rejected", label: "🔴 Từ chối" },
      { value: "in progress", label: "🟡 Đang thực hiện" },
      { value: "completed", label: "🟢 Hoàn thành" },
    ]}
  />
</Form.Item>

      </Form>
    </Modal>
  );
}