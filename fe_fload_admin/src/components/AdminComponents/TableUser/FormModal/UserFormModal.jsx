import "./UserFormModal.css";
import { Modal, Button } from "antd";
import { useState } from "react";
import UserForm from "./UserForm";

export default function UserFormModal({
  open,
  onCancel,
  onSubmit,
  isEdit,
  form
}) {

  const [loading, setLoading] = useState(false);

  const handleOk = async () => {

    try {

      setLoading(true);

      await onSubmit();

    } finally {

      setLoading(false);

    }

  };

  const handleCancel = () => {

    form.resetFields();   // reset form khi đóng
    onCancel();

  };

  return (

    <Modal
      open={open}
      onCancel={handleCancel}
      width={700}
      destroyOnHidden   
      title={isEdit ? "Chỉnh sửa người dùng" : "Tạo người dùng"}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleOk}
        >
          {isEdit ? "Cập nhật" : "Tạo người dùng"}
        </Button>,
      ]}
    >

   
      <UserForm
        form={form}
        isEdit={isEdit}
      />

    </Modal>

  );

}