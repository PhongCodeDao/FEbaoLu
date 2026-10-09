import { useState, useEffect } from "react";
import { Button, Form, message, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import "./UserManagement.css";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import UserTable from "../../../components/AdminComponents/TableUser/UserListManager/UserTable";
import UserFormModal from "../../../components/AdminComponents/TableUser/FormModal/UserFormModal";
import StatCard from "../../../components/AdminComponents/TableUser/FormModal/StatCard";
import AuthNotify from "../../../utils/Common/AuthNotify";
import {
  registerUser,
  getAllUser,
  deleteUser,
} from "../../../../api/axios/AdminApi/userApi";
import { updateUser } from "../../../../api/axios/Auth/authApi";

export default function UserManagement() {
  const [form] = Form.useForm();

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);

  const [isEdit, setIsEdit] = useState(false);

  const [roleFilter, setRoleFilter] = useState("ALL");

  const loadUsers = async () => {
    const res = await getAllUser(); // ✅ đúng

    const data = res?.data || res;

    if (!Array.isArray(data)) return;

    const validUsers = data.filter((u) => u.roleName);

    const mappedUsers = validUsers.map((user) => ({
      id: user.userId,
      name: user.fullName,
      phone: user.phone,
      role: user.roleName,
      areaId: user.areaId,
      status: user.status || "Hoạt động",
      raw: user,
    }));
    
    // 👇 THÊM SORT
    mappedUsers.sort((a, b) => b.id - a.id);
    
    setUsers(mappedUsers);
  };
 

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await getAllUser();

      const data = res?.data || res;

      if (!Array.isArray(data)) return;

      const validUsers = data.filter((u) => u.roleName);

      const mappedUsers = validUsers.map((user) => ({
        id: user.userId,
        name: user.fullName,
        phone: user.phone,
        role: user.roleName,
        areaId: user.areaId,
        status: user.status || "Hoạt động",
        raw: user,
      }));

      setUsers(mappedUsers);
    } catch {
      AuthNotify.error(
        "Không tải được danh sách người dùng",
        "Vui lòng thử lại sau"
      );
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = (user) => {
    if (user.role === "Admin") {
      AuthNotify.error(
        "Không thể xóa tài khoản Admin",
        "Tài khoản Admin có quyền cao nhất, vui lòng không xóa thông tin tài khoản này"
      );
      return;
    }
    Modal.confirm({
      title: (
        <span style={{ fontSize: 18, fontWeight: 600, color: "#ff4d4f" }}>
          Xóa người dùng
        </span>
      ),
      icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
      content: (
        <div style={{ marginTop: 10 }}>
          <p style={{ fontSize: 15 }}>
            Bạn có chắc muốn xóa:
            <b style={{ color: "#1677ff", marginLeft: 6 }}>{user.name}</b> ?
          </p>
        </div>
      ),
      okText: "🗑 Xóa",
      cancelText: "Hủy",
      okType: "danger",
      centered: true,

      onOk: async () => {
        try {
          setLoading(true); // 👈 thêm dòng này cho mượt
      
          await deleteUser(user.id);
      
          AuthNotify.success(
            "Xóa user thành công",
            `User "${user.name}" đã được xóa`
          );
      
          await fetchUsers(); // 👈 dùng cái này
        } catch (err) {
          AuthNotify.error("Xóa user thất bại", err?.message || "");
        } finally {
          setLoading(false); // 👈 đảm bảo tắt loading
        }
      }
    });

    console.log(user);
  };

  const filteredUsers =
    roleFilter === "ALL" ? users : users.filter((u) => u.role === roleFilter);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const phone = values.phone;

      const isPhoneExist = users.some((u) => {
        if (isEdit) {
          return u.phone === phone && u.id !== selectedUser?.id;
        }
        return u.phone === phone;
      });

      if (isPhoneExist) {
        AuthNotify.error(
          "Số điện thoại đã tồn tại",
          "Vui lòng sử dụng số điện thoại khác"
        );

        form.setFields([
          {
            name: "phone",
            errors: ["Số điện thoại đã tồn tại"],
          },
        ]);

        return;
      }

      if (isEdit && selectedUser) {
        const payload = {
          userId: selectedUser.id,
          fullName: values.name,
          phone: values.phone,
          areaId: values.areaId,
        };

        await updateUser(selectedUser.id, payload);

        AuthNotify.success(
          "Cập nhật thành công",
          "Thông tin người dùng đã được cập nhật"
        );
      } else {
        await registerUser(values);
        const newUser = {
          id: Date.now(), // hoặc lấy từ response nếu có
          name: values.name,
          phone: values.phone,
          role: values.roleName,
          areaId: values.areaId,
          status: "Hoạt động",
        };
        
        // 👇 add lên đầu
        setUsers((prev) => [newUser, ...prev]);
        AuthNotify.success(
          "Tạo người dùng thành công",
          "Tài khoản mới đã được tạo"
        );
      }

      setModalOpen(false);
      form.resetFields();
      await fetchUsers();
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.data?.message ||
        error?.message ||
        "";

      if (errorMsg.toLowerCase().includes("phone")) {
        AuthNotify.error(
          "Số điện thoại đã tồn tại",
          "Vui lòng nhập số điện thoại khác"
        );

        form.setFields([
          {
            name: "phone",
            errors: ["Số điện thoại đã tồn tại"],
          },
        ]);
      } else {
        AuthNotify.error(
          isEdit ? "Cập nhật thất bại" : "Tạo người dùng thất bại",
          "Yêu cầu không thành công, vui lòng thử lại"
        );
      }
    }
  };
  const openCreateModal = () => {
    setIsEdit(false);
    setSelectedUser(null);
    form.resetFields();
    setModalOpen(true);
  };

  const roleReverseMap = {
    Manager: 2,
    RescueTeam: 3,
    Coordinator: 4,
  };

  const openEditModal = (user) => {
    if (user.role === "Admin") {
      AuthNotify.error(
        "Không thể chỉnh sửa Admin",
        "Tài khoản Admin có quyền cao nhất, vui lòng không chỉnh sửa thông tin tài khoản này"
      );
      return;
    }

    setSelectedUser(user);

    setIsEdit(true);

    form.setFieldsValue({
      name: user.name || "",
      phone: user.phone || "",
      areaId: user.areaId || undefined,
    });

    setModalOpen(true);
  };

  const totalUsers = users.length;

  const totalAdmin = users.filter((u) => u.role === "Admin").length;

  const totalManager = users.filter((u) => u.role === "Manager").length;

  const totalCoordinator = users.filter((u) => u.role === "Coordinator").length;

  const totalRescue = users.filter((u) => u.role === "RescueTeam").length;

  const totalActive = users.length;

  return (
    <div className="userManagement">
      <div className="userManagement__header">
        <div>
          <h2 className="userManagement__title">Quản lý người dùng</h2>

          <p className="userManagement__subtitle">Dashboard quản lý hệ thống</p>
        </div>

        <Button
          className="createUserBtn"
          icon={<PlusOutlined />}
          size="large"
          onClick={openCreateModal}
        >
          Tạo người dùng
        </Button>
      </div>

      <div className="userManagement__stats">
        <StatCard
          title="Tổng người dùng"
          value={totalUsers}
          type="total"
          active={roleFilter === "ALL"}
          onClick={() => setRoleFilter("ALL")}
        />

        <StatCard
          title="Admin"
          value={totalAdmin}
          type="admin"
          active={roleFilter === "Admin"}
          onClick={() => setRoleFilter("Admin")}
        />

        <StatCard
          title="Manager"
          value={totalManager}
          type="manager"
          active={roleFilter === "Manager"}
          onClick={() => setRoleFilter("Manager")}
        />

        <StatCard
          title="Coordinator"
          value={totalCoordinator}
          type="RescueCoordinator"
          active={roleFilter === "Coordinator"}
          onClick={() => setRoleFilter("Coordinator")}
        />

        <StatCard
          title="Rescue Team"
          value={totalRescue}
          type="RescueTeam"
          active={roleFilter === "RescueTeam"}
          onClick={() => setRoleFilter("RescueTeam")}
        />
      </div>

      <UserTable
        users={filteredUsers}
        loading={loading}
        onRowClick={(user) => {
          setSelectedUser(user);
        }}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      <UserFormModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        isEdit={isEdit}
        form={form}
      />
    </div>
  );
}
