'use client';

import React, { useEffect, useState } from "react";

import {
  Modal,
  Form,
  Input,
  Select,
  Button
} from "antd";

import {
  updateRescueTeam
} from "../../../../../api/axios/ManagerApi/rescueTeamApi";

import {
  getProvinces
} from "../../../../../api/axios/Auth/authApi";

import AuthNotify from "../../../../utils/Common/AuthNotify";

import "./EditTeamModal.css";

const { Option } = Select;

export default function EditTeamModal({
  open,
  onClose,
  team,
  onSuccess
}) {

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);

  /* ================= LOAD PROVINCES ================= */

  useEffect(() => {

    if (open) {
      fetchProvinces();
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

      console.log("Load provinces error:", error);

      AuthNotify.error(
        "Không tải được khu vực",
        "Vui lòng thử lại"
      );

    }

  };


  /* ================= LOAD TEAM DATA ================= */

  useEffect(() => {

    if (!team) return;

    form.setFieldsValue({
      rcName: team.name,
      rcPhone: team.phone,
      areaId: team.areaId,
      rcStatus: team.status
    });

  }, [team]);


  /* ================= UPDATE TEAM ================= */

  const handleUpdate = async () => {

    try {

      const values = await form.validateFields();

      setLoading(true);

      await updateRescueTeam(team.id, {
        rcName: values.rcName,
        rcPhone: values.rcPhone,
        areaId: Number(values.areaId),
        rcStatus: "onduty" // 👈 luôn luôn gán cứng
      });

      AuthNotify.success(
        "Cập nhật thành công",
        "Thông tin đội cứu hộ đã được cập nhật"
      );

      form.resetFields();

      onClose?.();

      onSuccess?.();

    }
    catch (error) {

      console.log(error);

      AuthNotify.error(
        "Cập nhật thất bại",
        "Không thể cập nhật đội cứu hộ"
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
      title="✏️ Chỉnh sửa đội cứu hộ"
      onCancel={onClose}
      footer={null}
      width={520}
      centered
      destroyOnClose
      className="editTeamModal"
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
            placeholder="VD: Đội cứu hộ Quận 1"
            size="large"
          />

        </Form.Item>


        {/* PHONE */}

        <Form.Item
          name="rcPhone"
          label="Số điện thoại"
          rules={[
            {
              required: true,
              message: "Nhập số điện thoại"
            }
          ]}
        >

          <Input
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
          >

            {provinces.map((item) => (

              <Option
                key={item.id}
                value={item.id}
              >
                {item.name}
              </Option>

            ))}

          </Select>

        </Form.Item>


        {/* BUTTON */}

        <div className="editTeamModal__actions">

          <Button
            size="large"
            onClick={onClose}
          >
            Hủy
          </Button>

          <Button
            type="primary"
            size="large"
            loading={loading}
            onClick={handleUpdate}
            className="editTeamModal__submit"
          >
            Cập nhật
          </Button>

        </div>

      </Form>

    </Modal>

  );

}