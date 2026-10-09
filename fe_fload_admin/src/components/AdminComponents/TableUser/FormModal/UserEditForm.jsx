import "./UserForm.css";
import { Form, Input, Select } from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  LockOutlined
} from "@ant-design/icons";

import { useEffect, useState } from "react";
import { getProvinces } from "../../../../../api/axios/Auth/authApi";

export default function UserEditForm({ form }) {

  const [provinces, setProvinces] = useState([]);
  const [loadingProvince, setLoadingProvince] = useState(false);

  useEffect(() => {
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {

    try {

      setLoadingProvince(true);

      const res = await getProvinces();

      const data = res?.data || res;

      if (!Array.isArray(data)) return;

      setProvinces(
        data.map(p => ({
          label: p.name,
          value: p.id
        }))
      );

    } finally {

      setLoadingProvince(false);

    }

  };

  return (

    <Form layout="vertical" form={form} className="userForm">

      <div className="userForm__header">
        <h3>Chỉnh sửa người dùng</h3>
        <p>Cập nhật thông tin tài khoản</p>
      </div>

      <div className="userForm__card">

        <div className="userForm__grid">

          <Form.Item
            name="name"
            label="Họ và tên"
            rules={[{ required: true }]}
          >
            <Input prefix={<UserOutlined />} size="large" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true }]}
          >
            <Input prefix={<PhoneOutlined />} size="large" />
          </Form.Item>

        </div>

        <Form.Item
          name="password"
          label="Mật khẩu mới"
        >
          <Input.Password prefix={<LockOutlined />} size="large" />
        </Form.Item>

        <Form.Item
          name="areaId"
          label="Khu vực"
          rules={[{ required: true }]}
        >
          <Select
            options={provinces}
            loading={loadingProvince}
            showSearch
            size="large"
          />
        </Form.Item>

      </div>

    </Form>

  );

}