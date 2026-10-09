import { useEffect, useState } from "react";
import { Table, Select, Button, Popconfirm, Tag } from "antd";

import {
  getRescueTeamVehicles,
  addVehicleToTeam,
  removeVehicleFromTeam
} from "../../../../../api/axios/ManagerApi/rescueTeamApi";

import { getAllVehicles } from "../../../../../api/axios/ManagerApi/vehicleApi";

import AuthNotify from "../../../../utils/Common/AuthNotify";

import "./VehicleTable.css";

export default function VehicleTable({ teamId }) {

  const [vehicles, setVehicles] = useState([]);
  const [allVehicles, setAllVehicles] = useState([]);

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [selectedVehicle, setSelectedVehicle] = useState(null);

  /* ================= LOAD DATA ================= */

  const fetchData = async () => {
    try {
      setLoading(true);

      const [teamRes, allRes] = await Promise.all([
        getRescueTeamVehicles(teamId, true),
        getAllVehicles()
      ]);

      /* TEAM VEHICLES */
      let teamData =
        teamRes?.data?.items ||
        teamRes?.data ||
        [];

      if (!Array.isArray(teamData)) teamData = [];

      /* ALL VEHICLES */
      let allData =
        allRes?.data?.items ||
        allRes?.data ||
        [];

      if (!Array.isArray(allData)) allData = [];

      /* 🔥 FILTER READY */
      const readyVehicles = allData.filter(
        v => v.vehicleStatus?.toLowerCase() === "ready"
      );

      /* 🔥 MERGE DATA → FIX TRẮNG TÊN */
      const mergedTeamVehicles = teamData.map(tv => {
        const fullVehicle = allData.find(
          v => v.vehicleId === tv.vehicleId
        );

        return {
          vehicleId: tv.vehicleId,
          vehicleType: fullVehicle?.vehicleType || "N/A",
          vehicleName: fullVehicle?.vehicleName || "N/A",
          vehicleLocation: fullVehicle?.vehicleLocation || "N/A",
          vehicleStatus: fullVehicle?.vehicleStatus || tv.vehicleStatus || "UNKNOWN"
        };
      });

      setVehicles(mergedTeamVehicles);
      setAllVehicles(readyVehicles);

    } catch (err) {
      console.error("LOAD VEHICLE ERROR:", err);

      AuthNotify.error(
        "Lỗi tải dữ liệu",
        "Không thể tải danh sách phương tiện"
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teamId) fetchData();
  }, [teamId]);

  /* ================= ADD ================= */

  const handleAdd = async () => {

    if (!selectedVehicle) return;

    const vehicleId = Number(selectedVehicle);

    /* ❌ LIMIT 4 */
    if (vehicles.length >= 4) {
      AuthNotify.warning(
        "Giới hạn",
        "Mỗi đội chỉ tối đa 4 phương tiện"
      );
      return;
    }

    /* ❌ CHECK READY */
    const vehicle = allVehicles.find(v => v.vehicleId === vehicleId);

    if (!vehicle || vehicle.vehicleStatus?.toLowerCase() !== "ready") {
      AuthNotify.warning(
        "Không hợp lệ",
        "Chỉ được thêm xe ở trạng thái READY"
      );
      return;
    }

    /* ❌ CHECK EXIST */
    const existed = vehicles.some(v => v.vehicleId === vehicleId);

    if (existed) {
      AuthNotify.warning(
        "Xe đã tồn tại",
        "Phương tiện đã có trong đội"
      );
      return;
    }

    try {
      setActionLoading(true);

      await addVehicleToTeam(teamId, vehicleId);

      AuthNotify.success(
        "Thành công",
        "Đã thêm phương tiện vào đội"
      );

      setSelectedVehicle(null);

      await fetchData();

    } catch (err) {

      console.error("ADD ERROR:", err);

      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        err.message;

      AuthNotify.error("Thêm thất bại", msg);

    } finally {
      setActionLoading(false);
    }
  };

  /* ================= REMOVE ================= */

  const handleRemove = async (vehicleId) => {
    try {
      setActionLoading(true);

      await removeVehicleFromTeam(teamId, vehicleId);

      AuthNotify.success(
        "Đã xóa",
        "Phương tiện đã được gỡ khỏi đội"
      );

      await fetchData();

    } catch (err) {
      AuthNotify.error(
        "Không thể xóa",
        err?.message || "Có lỗi xảy ra"
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* ================= TABLE ================= */

  const columns = [

    {
      title: "Tên phương tiện",
      dataIndex: "vehicleName"
    },

    {
      title: "Loại phương tiện",
      dataIndex: "vehicleType"
    },
    {
      title: "Khu vực",
      dataIndex: "vehicleLocation"
    },

    {
      title: "Trạng thái",
      render: (_, record) => {
        const status = record.vehicleStatus?.toUpperCase();
    
        const color =
          status === "READY" ? "green" :
          status === "BUSY" ? "orange" :
          "red";
    
        const statusText =
          status === "READY" ? "Sẵn sàng" :
          status === "BUSY" ? "Đang bận" :
          status === "MAINTENANCE" ? "Bảo trì" :
          "Không xác định";
    
        return <Tag color={color}>{statusText}</Tag>;
      }
    },

    {
      title: "Hành động",
      render: (_, record) => (
        <Popconfirm
          title="Xóa phương tiện?"
          onConfirm={() => handleRemove(record.vehicleId)}
        >
          <Button
            danger
            size="small"
            loading={actionLoading}
          >
            Xóa
          </Button>
        </Popconfirm>
      )
    }

  ];

  /* ================= UI ================= */

  return (

    <div className="vehicle-table">

      {/* HEADER */}
      <div className="vehicle-header">

        <h4>🚑 Phương tiện đội</h4>

        <div className="vehicle-add">

          <Select
            placeholder="Chọn phương tiện (READY)"
            value={selectedVehicle}
            onChange={setSelectedVehicle}
            style={{ width: 260 }}
            options={allVehicles.map(v => ({
              label: `${v.vehicleName} (${v.vehicleLocation})`,
              value: v.vehicleId
            }))}
          />

          <Button
            type="primary"
            onClick={handleAdd}
            loading={actionLoading}
          >
            Thêm
          </Button>

        </div>

      </div>

      {/* TABLE */}
      <Table
        rowKey="vehicleId"
        columns={columns}
        dataSource={vehicles}
        loading={loading}
        pagination={false}
        bordered
        size="middle"
      />

    </div>
  );
}