'use client';

import { useState, useEffect } from 'react';
import {
  Button,
  Tag,
  Spin,
  Modal
} from 'antd';

import {
  ExclamationCircleOutlined,
  PlusOutlined
} from '@ant-design/icons';

import {
  getRescueTeamMembers,
  deleteTeamMember
} from '../../../../../api/axios/ManagerApi/rescueTeamApi';

import { getAllUser } from '../../../../../api/axios/AdminApi/userApi';

import './MemberTable.css';
import CreateMemberModal from "../CreateTeam/MemberModal/CreateMemberModal";

import AuthNotify from "../../../../utils/Common/AuthNotify";

import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';


export default function MemberTable({ teamId }) {

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);


  /* ================= FETCH MEMBERS ================= */

  const fetchMembers = async () => {

    if (!teamId) return;

    try {

      setLoading(true);

      /* gọi 2 API */

      const [teamRes, userRes] = await Promise.all([
        getRescueTeamMembers(teamId),
        getAllUser()
      ]);

      /* ===== normalize team members ===== */

      const rawMembers = teamRes.data;

      let membersList = [];

      if (Array.isArray(rawMembers)) {
        membersList = rawMembers;
      }
      else if (Array.isArray(rawMembers?.data)) {
        membersList = rawMembers.data;
      }
      else if (Array.isArray(rawMembers?.items)) {
        membersList = rawMembers.items;
      }

      /* ===== normalize users ===== */

      const rawUsers = userRes.data ?? userRes;

      let usersList = [];

      if (Array.isArray(rawUsers)) {
        usersList = rawUsers;
      }
      else if (Array.isArray(rawUsers?.data)) {
        usersList = rawUsers.data;
      }
      else if (Array.isArray(rawUsers?.items)) {
        usersList = rawUsers.items;
      }

      /* ===== merge roleName ===== */

      const normalized = membersList.map(member => {

        const user = usersList.find(
          u => Number(u.userId) === Number(member.userId)
        );

        return {

          userId: member.userId,
          fullName: member.fullName,
          phone: member.phone,
          roleName: user?.roleName || member.roleName || "Member",
          areaId: member.areaId,
          createdAt: member.createdAt

        };

      });

      setMembers(normalized);

    }
    catch (error) {

      console.error(error);

      AuthNotify.error(
        "Tải dữ liệu thất bại",
        "Không thể tải danh sách thành viên"
      );

    }
    finally {

      setLoading(false);

    }

  };


  useEffect(() => {
    fetchMembers();
  }, [teamId]);


  /* ================= DELETE ================= */

  const handleDeleteMember = (userId, fullName) => {

    Modal.confirm({

      title: 'Xác nhận xóa',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc muốn xóa "${fullName}"?`,
      okType: 'danger',

      onOk: async () => {

        try {

          await deleteTeamMember(teamId, userId);

          AuthNotify.success(
            "Đã xóa thành viên",
            "Thành viên đã được xóa khỏi đội"
          );

          fetchMembers();

        }
        catch {

          AuthNotify.error(
            "Xóa thất bại",
            "Không thể xóa thành viên"
          );

        }

      },

    });

  };


  if (loading) {

    return (

      <div className="member-table-container loading">
        <Spin tip="Đang tải thành viên..." />
      </div>

    );

  }


  return (

    <div className="member-table-container">

      {/* HEADER */}

      <div className="member-table-header">

        <h4>
          👥 Danh sách thành viên ({members.length})
        </h4>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateOpen(true)}
        >
          Tạo thành viên
        </Button>

      </div>


      {/* TABLE */}

      <div className="member-table-wrapper">

        <div className="member-table-head">
          <span>ID</span>
          <span>HỌ TÊN</span>
          <span>ĐT LIÊN LẠC</span>
          <span>VAI TRÒ</span>
          <span>HÀNH ĐỘNG</span>
        </div>


        {members.length === 0 ? (

          <div className="no-data">
            Chưa có thành viên
          </div>

        ) : (

          members.map(member => (

            <MemberRow
              key={member.userId}
              {...member}
              onDelete={() =>
                handleDeleteMember(
                  member.userId,
                  member.fullName
                )
              }
            />

          ))

        )}

      </div>


      <CreateMemberModal
        open={createOpen}
        teamId={teamId}
        members={members}
        memberCount={members.length}
        onClose={() => setCreateOpen(false)}
        onSuccess={fetchMembers}
      />

    </div>

  );

}


/* ========================================================= */

function MemberRow({
  userId,
  fullName,
  phone,
  roleName,
  onDelete
}) {

  const roleColor = {
    Admin: "volcano",
    Manager: "red",
    Leader: "orange",
    Coordinator: "purple",
    Rescuer: "blue"
  };

  return (

    <div className="member-row">

      <div className="id-cell">
        <strong>{userId}</strong>
      </div>

      <div className="name-cell">
        {fullName}
      </div>

      <div className="phone-cell">
        {phone || "—"}
      </div>

      <div className="role-cell">

        <Tag color={roleColor[roleName] || "blue"}>
          {roleName}
        </Tag>

      </div>

      <div className="actions-cell">

        <Tooltip title="Xóa">
          <IconButton
            size="small"
            className="action-delete"
            onClick={onDelete}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>

      </div>

    </div>

  );

}