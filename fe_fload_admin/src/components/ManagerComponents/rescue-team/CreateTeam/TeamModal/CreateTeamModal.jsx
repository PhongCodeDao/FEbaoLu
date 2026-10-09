'use client';

import {
  Modal,
  Form,
  Input,
  Select,
  Button
} from 'antd';

import {
  SafetyOutlined,
  PhoneOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';

import {
  createRescueTeam
} from '../../../../../../api/axios/ManagerApi/rescueTeamApi';

import { getProvinces } from '../../../../../../api/axios/Auth/authApi';

import { useState, useEffect } from 'react';

import AuthNotify from "../../../../../utils/Common/AuthNotify";

import './CreateTeamModal.css';

const { Option } = Select;

/* ================= PHONE VALIDATOR ================= */

const validateVietnamPhone = (_, value) => {

  if (!value) {
    return Promise.reject("Vui lòng nhập số điện thoại");
  }

  const phoneRegex = /^0\d{9}$/;

  if (!phoneRegex.test(value)) {
    return Promise.reject(
      "Số điện thoại phải gồm 10 số và bắt đầu bằng 0 (VD: 0901234567)"
    );
  }

  return Promise.resolve();

};

export default function CreateTeamModal({
  open,
  onClose,
  onSuccess
}) {

  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);

  const [provinces, setProvinces] = useState([]);

  /* ================= LOAD PROVINCES ================= */

  useEffect(() => {

    if (open) {
      fetchProvinces();

      form.setFieldsValue({
        rcStatus: "on duty"
      });

    }

  }, [open]);

  const fetchProvinces = async () => {

    try {

      const res = await getProvinces();

      const data = res?.data || res || [];

      setProvinces(
        Array.isArray(data) ? data : []
      );

    }
    catch (error) {

      console.error(error);

      AuthNotify.error(
        "Không tải được khu vực",
        "Vui lòng thử lại"
      );

    }

  };

  /* ================= CREATE TEAM ================= */

  const handleCreate = async () => {

    try {

      const values = await form.validateFields();

      setLoading(true);

      await createRescueTeam({

        rcName: values.rcName,
        rcPhone: values.rcPhone,
        areaId: Number(values.areaId),

        /* STATUS MẶC ĐỊNH */

        rcStatus: "onduty"

      });

      AuthNotify.success(
        "Tạo đội cứu hộ thành công",
        "Đội cứu hộ mới đã được tạo"
      );

      form.resetFields();

      onClose?.();

      onSuccess?.();

    }
    catch (error) {

      console.error(error);

      AuthNotify.error(
        "Tạo đội thất bại",
        "Không thể tạo đội cứu hộ"
      );

    }
    finally {

      setLoading(false);

    }

  };

  /* ================= UI ================= */

  return (

    <Modal
      open={open}
      title="🚑 Tạo đội cứu hộ mới"
      onCancel={onClose}
      footer={null}
      width={520}
      className="createTeamModal"
    >

      <Form
        form={form}
        layout="vertical"
      >

        {/* TEAM NAME */}

        <Form.Item
          name="rcName"
          label="Tên đội cứu hộ"
          rules={[
            {
              required: true,
              message: "Nhập tên đội"
            }
          ]}
        >

          <Input
            prefix={<SafetyOutlined />}
            placeholder="VD: Đội cứu hộ Quận 1"
            size="large"
          />

        </Form.Item>


        {/* PHONE */}

        <Form.Item
          name="rcPhone"
          label="Số điện thoại"
          validateTrigger="onChange"
          rules={[
            { validator: validateVietnamPhone }
          ]}
        >

          <Input
            prefix={<PhoneOutlined />}
            placeholder="0901234567"
            size="large"
            maxLength={10}
            onChange={(e) => {

              const onlyNumber =
                e.target.value.replace(/\D/g, "");

              form.setFieldsValue({
                rcPhone: onlyNumber
              });

            }}
          />

        </Form.Item>


        {/* AREA */}

        <Form.Item
          name="areaId"
          label="Khu vực"
          rules={[
            {
              required: true,
              message: "Chọn khu vực"
            }
          ]}
        >

          <Select
            size="large"
            placeholder="Chọn khu vực"
            suffixIcon={<EnvironmentOutlined />}
            options={provinces.map((item) => ({
              label: item.name,
              value: item.id
            }))}
          />

        </Form.Item>


        {/* BUTTON */}

        <Button
          type="primary"
          block
          size="large"
          loading={loading}
          onClick={handleCreate}
          className="createTeamModal__btn"
        >

          🚑 Tạo đội cứu hộ

        </Button>

      </Form>

    </Modal>

  );

}