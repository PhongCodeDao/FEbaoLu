"use client";

import {
  Modal,
  Form,
  Input,
  Button,
  Spin,
  Row,
  Col,
  Avatar,
  Select,
} from "antd";

import {
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  SaveOutlined,
} from "@ant-design/icons";

import { useEffect, useState } from "react";

import {
  getUserProfile,
  updateUserProfile,
  getProvinces,
} from "../../../api/axios/Auth/authApi";

import "./UserProfileModal.css";

import AuthNotify from "../../utils/Common/AuthNotify";

export default function UserProfileModal({ open, onClose }) {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);

  const [fetching, setFetching] = useState(false);

  const [userId, setUserId] = useState(null);

  const [userName, setUserName] = useState("");

  const [provinces, setProvinces] = useState([]);

  const [role, setRole] = useState("");

  /* ================= LOAD PROFILE ================= */

  const fetchProfile = async () => {
    try {
      setFetching(true);

      const res = await getUserProfile();

      const data = res.data || res;

      setUserId(data.userId);

      setUserName(data.fullName);

      form.setFieldsValue({
        fullName: data.fullName || "",
        phone: data.phone || "",
        areaId: data.areaId || null,
      });
    } catch (error) {
      console.error(error);

      AuthNotify.error("Không tải được thông tin cá nhân", "Vui lòng thử lại");
    } finally {
      setFetching(false);
    }
  };

  /* ================= LOAD PROVINCES ================= */

  const fetchProvinces = async () => {
    try {
      const res = await getProvinces();

      const data = res.data || res;

      setProvinces(data);
    } catch (error) {
      console.error(error);

      AuthNotify.error("Không tải được khu vực", "Vui lòng thử lại");
    }
  };

  /* ================= INIT ================= */

  useEffect(() => {
    if (open) {
      fetchProfile();

      fetchProvinces();

      const userRole =
        sessionStorage.getItem("role") || localStorage.getItem("role");

      setRole(userRole);
    }
  }, [open]);

  /* ================= UPDATE PROFILE ================= */

  const handleUpdate = async () => {
    try {
      if (role === "admin") {
        AuthNotify.error(
          "Không được phép",
          "Tài khoản admin không thể cập nhật thông tin"
        );

        return;
      }

      if (!userId) {
        AuthNotify.error("Lỗi người dùng", "Không xác định được người dùng");

        return;
      }

      const values = await form.validateFields();

      setLoading(true);

      const payload = {
        userId: Number(userId),

        fullName: String(values.fullName),

        areaId: Number(values.areaId),
      };

      await updateUserProfile(payload);

      AuthNotify.success(
        "Cập nhật thành công",
        "Thông tin cá nhân đã được cập nhật"
      );

      onClose();
    } catch (error) {
      console.error(error);

      AuthNotify.error("Cập nhật thất bại", "Không thể cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  /* ================= AVATAR TEXT ================= */

  const avatarText =
    userName
      ?.split(" ")
      ?.map((word) => word[0])
      ?.slice(0, 2)
      ?.join("")
      ?.toUpperCase() || "U";

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={520}
      className="profile-modal"
      centered
    >
      {fetching ? (
        <div className="profile-loading">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* HEADER */}

          <div className="profile-header">
            <Avatar size={64} className="profile-avatar">
              {avatarText}
            </Avatar>

            <div>
              <h2>{userName}</h2>

              <p>Cập nhật thông tin cá nhân</p>
            </div>
          </div>

          {/* FORM */}

          <Form form={form} layout="vertical" className="profile-form">
            <Row gutter={16}>
              {/* NAME */}

              <Col span={24}>
                <Form.Item
                  name="fullName"
                  label="Họ và tên"
                  rules={[
                    {
                      required: true,
                      message: "Nhập họ tên",
                    },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    size="large"
                    placeholder="Nhập họ tên"
                  />
                </Form.Item>
              </Col>

              {/* PHONE (READ ONLY) */}

              <Col span={24}>
                <Form.Item name="phone" label="Số điện thoại">
                  <Input prefix={<PhoneOutlined />} size="large" disabled />
                </Form.Item>
              </Col>

              {/* AREA */}

              <Col span={24}>
                <Form.Item
                  name="areaId"
                  label="Khu vực"
                  rules={[
                    {
                      required: true,
                      message: "Chọn khu vực",
                    },
                  ]}
                >
                  <Select
                    size="large"
                    placeholder="Chọn tỉnh/thành"
                    suffixIcon={<EnvironmentOutlined />}
                    options={provinces.map((item) => ({
                      label: item.name,
                      value: item.id,
                    }))}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* BUTTON */}

            <Button
              type="primary"
              block
              size="large"
              icon={<SaveOutlined />}
              loading={loading}
              onClick={handleUpdate}
              disabled={role === "admin"}
              className="profile-save-btn"
            >
              {role === "admin"
                ? "Admin không được cập nhật"
                : "Cập nhật thông tin"}
            </Button>
          </Form>
        </>
      )}
    </Modal>
  );
}
