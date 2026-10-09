import "./UserForm.css";
import { Form, Input, Select } from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  LockOutlined
} from "@ant-design/icons";

import { useEffect, useState } from "react";
import { getProvinces } from "../../../../../api/axios/Auth/authApi";

const ROLE_OPTIONS = [
  { label: "Rescue Team", value: 3 },
  { label: "Rescue Coordinator", value: 4 },
  { label: "Manager", value: 2 },
];

/* ================= PROVINCE HOOK ================= */

function useProvinces() {

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

      const options = data.map((p) => ({
        label: p.name,
        value: p.id
      }));

      setProvinces(options);

    } catch (error) {

      console.error("Load provinces error:", error);

    } finally {

      setLoadingProvince(false);

    }

  };

  return { provinces, loadingProvince };

}

/* ================= PHONE VALIDATION ================= */

const phoneRules = [
  {
    required: true,
    message: "Vui lòng nhập số điện thoại"
  },
  {
    pattern: /^0[0-9]{9}$/,
    message: "Số điện thoại VN phải 10 số và bắt đầu bằng 0 (VD: 0901234567)"
  }
];

/* ================= CREATE FORM ================= */

function CreateForm({ form }) {

  const { provinces, loadingProvince } = useProvinces();

  return (

    <Form
      layout="vertical"
      form={form}
      className="userForm"
      autoComplete="off"
    >

      {/* chống autofill browser */}
      <input type="text" name="fake-user" autoComplete="username" hidden />
      <input type="password" name="fake-pass" autoComplete="new-password" hidden />

      <div className="userForm__header">
        <h3>Tạo người dùng mới</h3>
        <p>Nhập thông tin để tạo tài khoản hệ thống</p>
      </div>

      <div className="userForm__card">

        <div className="userForm__grid">

          <Form.Item
            name="name"
            label="Họ và tên"
            rules={[
              { required: true, message: "Vui lòng nhập tên" }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Nguyễn Văn A"
              size="large"
              autoComplete="off"
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={phoneRules}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="0901234567"
              size="large"
              maxLength={10}
              autoComplete="off"
            />
          </Form.Item>

        </div>

        <div className="userForm__grid">

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: "Nhập mật khẩu" },
              { min: 6, message: "Tối thiểu 6 ký tự" }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mật khẩu"
              size="large"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="roleId"
            label="Vai trò"
            rules={[
              { required: true, message: "Chọn vai trò" }
            ]}
          >
            <Select
              placeholder="Chọn vai trò"
              options={ROLE_OPTIONS}
              size="large"
            />
          </Form.Item>

        </div>

        <Form.Item
          name="areaId"
          label="Khu vực"
          rules={[
            { required: true, message: "Chọn khu vực" }
          ]}
        >
          <Select
            placeholder="Chọn tỉnh"
            options={provinces}
            loading={loadingProvince}
            size="large"
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>

      </div>

    </Form>

  );

}

/* ================= EDIT FORM ================= */

function EditForm({ form }) {

  const { provinces, loadingProvince } = useProvinces();

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
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
          >
            <Input prefix={<UserOutlined />} size="large" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={phoneRules}
          >
            <Input
              prefix={<PhoneOutlined />}
              size="large"
              placeholder="0901234567"
              maxLength={10}
            />
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
          rules={[{ required: true, message: "Chọn khu vực" }]}
        >
          <Select
            options={provinces}
            loading={loadingProvince}
            size="large"
            showSearch
          />
        </Form.Item>

      </div>

    </Form>

  );

}

/* ================= MAIN EXPORT ================= */

export default function UserForm({ form, isEdit }) {

  if (isEdit) {
    return <EditForm form={form} />;
  }

  return <CreateForm form={form} />;

}