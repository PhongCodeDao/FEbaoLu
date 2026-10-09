'use client';

import {
  Modal,
  Form,
  Input,
  Button,
  Select
} from 'antd';

import {
  UserOutlined,
  PhoneOutlined
} from '@ant-design/icons';

import { useState, useEffect } from 'react';

import {
  createTeamMember
} from '../../../../../../api/axios/ManagerApi/rescueTeamApi';

import { getAllUser } from '../../../../../../api/axios/AdminApi/userApi';

import AuthNotify from '../../../../../utils/Common/AuthNotify';

import "./CreateMemberModal.css";

const { Option } = Select;

export default function CreateMemberModal({
  open,
  onClose,
  teamId,
  onSuccess,
  memberCount,
  members
}) {

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  /* ================= LOAD USERS ================= */

  useEffect(() => {

    if (open) {
      fetchData();
    }

  }, [open, members]);


  const fetchData = async () => {

    try {

      setLoadingUsers(true);

      const allUsersRes = await getAllUser();

      let allUsers = [];

      /* normalize API */

      if (Array.isArray(allUsersRes)) {
        allUsers = allUsersRes;
      }
      else if (Array.isArray(allUsersRes?.data)) {
        allUsers = allUsersRes.data;
      }
      else if (Array.isArray(allUsersRes?.items)) {
        allUsers = allUsersRes.items;
      }

      /* user đã trong team */

      const existingUserIds = new Set(
        (members || []).map(m => String(m.userId))
      );

      /* chỉ lấy role RescueTeam */

      const filteredUsers = allUsers.filter(user => {

        const userId = String(user.userId);

        if (user.roleName !== "RescueTeam") return false;

        if (existingUserIds.has(userId)) return false;

        return true;

      });

      setUsers(filteredUsers);

    }
    catch (err) {

      console.log(err);

      AuthNotify.error(
        "Không thể tải dữ liệu",
        "Vui lòng thử lại sau"
      );

    }
    finally {

      setLoadingUsers(false);

    }

  };


  /* ================= AUTO FILL ================= */

  const handleUserChange = (userId) => {

    const selectedUser = users.find(
      u => Number(u.userId) === Number(userId)
    );

    if (!selectedUser) return;

    form.setFieldsValue({

      fullName: selectedUser.fullName || selectedUser.name || "",
      phone: selectedUser.phone || "",
      roleInTeam: selectedUser.roleName || "RescueTeam"

    });

  };


  /* ================= CREATE ================= */

  const handleCreate = async () => {

    if (memberCount >= 5) {

      AuthNotify.error(
        "Không thể thêm thành viên",
        "Mỗi đội chỉ được tối đa 5 thành viên"
      );

      return;

    }

    if (users.length === 0) {

      AuthNotify.error(
        "Không có user khả dụng",
        "Không còn RescueTeam nào chưa thuộc đội"
      );

      return;

    }

    try {

      const values = await form.validateFields();

      setLoading(true);

      const payload = {

        rescueTeamId: teamId,
        userId: Number(values.userId),
        fullName: String(values.fullName),
        phone: String(values.phone),
        roleInTeam: String(values.roleInTeam || "RescueTeam")

      };

      await createTeamMember(teamId, payload);

      AuthNotify.success(
        "Tạo thành viên thành công",
        "Thành viên đã được thêm vào đội"
      );

      await fetchData();

      form.resetFields();

      onClose();

      onSuccess?.();

    }
    catch (error) {

      console.log(error);

      AuthNotify.error(
        "Tạo thành viên thất bại",
        "Thành viên này đã có trong đội cứu hộ"
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
      title="➕ Tạo thành viên đội cứu hộ"
      onCancel={onClose}
      footer={null}
      width={500}
      className="create-member-modal"
      centered
    >

      <Form
        form={form}
        layout="vertical"
        className="create-member-form"
      >

        {/* USER */}

        <Form.Item
          name="userId"
          label="Chọn User"
          rules={[
            { required: true, message: "Chọn user" }
          ]}
        >

          <Select
            size="large"
            placeholder={
              users.length === 0
                ? "Không có RescueTeam khả dụng"
                : "Chọn RescueTeam"
            }
            loading={loadingUsers}
            showSearch
            onChange={handleUserChange}
            optionFilterProp="children"
          >

            {users.map(user => (

              <Option
                key={user.userId}
                value={user.userId}
              >
                {user.userId} - {user.fullName || user.name} ({user.roleName})
              </Option>

            ))}

          </Select>

        </Form.Item>


        {/* NAME */}

        <Form.Item
          name="fullName"
          label="Họ và tên"
        >

          <Input
            prefix={<UserOutlined />}
            size="large"
            disabled
          />

        </Form.Item>


        {/* PHONE */}

        <Form.Item
          name="phone"
          label="Số điện thoại"
        >

          <Input
            prefix={<PhoneOutlined />}
            size="large"
            disabled
          />

        </Form.Item>


        {/* ROLE */}

        <Form.Item
          name="roleInTeam"
          label="Vai trò trong đội"
        >

          <Input
            prefix={<UserOutlined />}
            size="large"
            disabled
          />

        </Form.Item>


        {memberCount >= 5 && (
          <p style={{color:"#ef4444", marginBottom:10}}>
            Đội đã đạt tối đa 5 thành viên
          </p>
        )}


        <Button
          type="primary"
          block
          size="large"
          loading={loading}
          onClick={handleCreate}
          disabled={memberCount >= 5}
          className="create-member-btn"
        >
          Tạo thành viên
        </Button>

      </Form>

    </Modal>

  );

}