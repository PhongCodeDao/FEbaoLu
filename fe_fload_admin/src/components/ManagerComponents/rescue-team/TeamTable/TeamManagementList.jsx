'use client';

import { useState, useEffect } from 'react';

import { Modal, Pagination, Input, Select, Space } from 'antd';

import { ExclamationCircleOutlined } from '@ant-design/icons';
import VehicleTable from "./VehicleTable";
import {
  deleteRescueTeam
} from '../../../../../api/axios/ManagerApi/rescueTeamApi';

import {
  getProvinces
} from '../../../../../api/axios/Auth/authApi';

import './TeamManagementList.css';

import MemberTable from './MemberTable';
import CreateTeamModal from '../CreateTeam/TeamModal/CreateTeamModal';
import EditTeamModal from '../EditTeam/EditTeamModal';

import AuthNotify from "../../../../utils/Common/AuthNotify";

/* MUI */

import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

export default function TeamManagementList({
  teamsData,
  onTeamChanged,
  searchQuery,
  areaFilterId,
  onSearchChange,
  onAreaChange,
  onResetFilters,
}) {

  const [createOpen, setCreateOpen] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);

  const [expandedTeamId, setExpandedTeamId] = useState(null);

  const [provinceMap, setProvinceMap] = useState({});

  /* PAGINATION */

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  const startIndex = (currentPage - 1) * pageSize;

  const sortedTeams = [...teamsData].sort((a, b) => b.id - a.id);

  const paginatedTeams =
    sortedTeams.slice(
      startIndex,
      startIndex + pageSize
    );

  async function fetchProvinces() {

    try {

      const res = await getProvinces();

      const data = res?.data || res || [];

      const map = {};

      data.forEach((p) => {
        map[p.id] = p.name;
      });

      setProvinceMap(map);

    }
    catch (err) {

      console.log("Load provinces error:", err);

    }

  };

  /* ================= LOAD PROVINCES ================= */

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProvinces();

  }, []);

  /* ================= EXPAND MEMBERS ================= */

  const handleTeamClick = (teamId) => {

    setExpandedTeamId(
      expandedTeamId === teamId ? null : teamId
    );

  };

  /* ================= EDIT TEAM ================= */

  const handleEditTeam = (team) => {

    setEditingTeam(team);

    setEditModalVisible(true);

  };

  /* ================= DELETE TEAM ================= */

  const handleDeleteTeam = (teamId, teamName) => {

    Modal.confirm({

      title: "Xác nhận xóa đội",
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc muốn xóa đội "${teamName}"?`,
      okType: "danger",

      onOk: async () => {

        try {

          await deleteRescueTeam(teamId);

          AuthNotify.success(
            "Đã xóa đội",
            "Đội cứu hộ đã được xóa khỏi hệ thống"
          );

          onTeamChanged?.();

        }
        catch (error) {

          const message =
            error?.response?.data?.message ||
            error?.response?.data?.title ||
            "";

          AuthNotify.error(
            "Không thể xóa đội",
            message || "Lỗi hệ thống"
          );

        }

      }

    });

  };

  /* ================= UI ================= */

  return (

    <div className="team-mgmt-card">

      {/* HEADER */}

      <div className="team-mgmt-header">

        <div className="team-mgmt-title">
          🚑 Danh sách đội cứu hộ ({teamsData.length})
        </div>

        <Space size={8} wrap>
          <Input
            allowClear
            placeholder="Tìm theo tên đội / SĐT"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            style={{ width: 220 }}
          />

          <Select
            allowClear
            placeholder="Khu vực"
            style={{ width: 180 }}
            value={areaFilterId}
            onChange={onAreaChange}
            options={[
              ...Array.from(
                new Map(
                  teamsData
                    .filter((t) => t.areaId != null)
                    .map((t) => [
                      Number(t.areaId),
                      {
                        value: Number(t.areaId),
                        label: `Khu vực #${t.areaId}`,
                      },
                    ])
                ).values()
              ),
            ]}
          />

          <Button
            size="small"
            onClick={() => onResetFilters?.()}
          >
            Xóa filter
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
            className="team-mgmt-create-btn"
          >
            Tạo đội cứu hộ
          </Button>
        </Space>

      </div>

      {/* TABLE */}

      <div className="team-mgmt-table-wrapper">

        <div className="team-mgmt-table-head">

          <span>STT</span>
          <span>TÊN ĐỘI</span>
          <span>SĐT</span>
          <span>KHU VỰC</span>
          
          <span>HÀNH ĐỘNG</span>

        </div>

        {paginatedTeams.map((team, index) => (

          <div key={team.id}>

            <div className="team-mgmt-table-row">

              <div className="team-mgmt-col-center">
                {startIndex + index + 1}
              </div>

              <div className="team-mgmt-team-name">
                {team.name}
              </div>

              <div>
                {team.phone}
              </div>

              {/* AREA */}

              <div className="team-mgmt-area-cell">
                {provinceMap[team.areaId] || "Không xác định"}
              </div>

              {/* ACTION */}

              <div className="team-mgmt-col-action">

                <Stack direction="row" spacing={1}>

                  <Tooltip title="Chỉnh sửa">
                    <IconButton
                      size="small"
                      className="team-mgmt-action-edit"
                      onClick={() => handleEditTeam(team)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Xóa">
                    <IconButton
                      size="small"
                      className="team-mgmt-action-delete"
                      onClick={() => handleDeleteTeam(team.id, team.name)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Xem thành viên">
                    <IconButton
                      size="small"
                      className="team-mgmt-action-expand"
                      onClick={() => handleTeamClick(team.id)}
                    >
                      {expandedTeamId === team.id
                        ? <ExpandLessIcon fontSize="small" />
                        : <ExpandMoreIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>

                </Stack>

              </div>

            </div>

            {expandedTeamId === team.id && (

<div className="team-expand-box">

  {/* MEMBER */}
  <MemberTable teamId={team.id} />

  {/* VEHICLE */}
  <VehicleTable teamId={team.id} />

</div>

)}

          </div>

        ))}

      </div>

      {/* PAGINATION */}

      <div className="team-mgmt-pagination">

        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={teamsData.length}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
        />

      </div>

      {/* CREATE TEAM */}

      <CreateTeamModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => {
          setCurrentPage(1);
          onTeamChanged?.();
        }}
      />

      {/* EDIT TEAM */}

      <EditTeamModal
        open={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        team={editingTeam}
        onSuccess={onTeamChanged}
      />

    </div>

  );

}