import { useEffect, useState } from "react";

import {
  getAvailableRescueTeams,
  getRescueTeamVehicles,
} from "../../../../../api/axios/ManagerApi/rescueTeamApi";

import { getAllVehicles } from "../../../../../api/axios/ManagerApi/vehicleApi";

import { updateRescueAssignment } from "../../../../../api/axios/CoordinatorApi/RescueRequestApi";

import "./update-detail-team.css";

import AuthNotify from "../../../../utils/Common/AuthNotify";

export default function UpdateDetailTeam({ open, onClose, detail, onSave }) {
  const [teams, setTeams] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [allVehicles, setAllVehicles] = useState([]);

  const [teamId, setTeamId] = useState("");
  const [vehicleId, setVehicleId] = useState("");

  const [loading, setLoading] = useState(false);

  /* ================= STATUS TEAM ================= */

  const translateTeamStatus = (status) => {
    switch (status) {
      case "on duty":
        return "🟢 Đang trực";

      case "ready":
        return "🟢 Sẵn sàng";

      case "busy":
        return "🔴 Đang bận";

      default:
        return "Không rõ";
    }
  };

  /* ================= LOAD TEAM ================= */

  useEffect(() => {
    if (!open) return;

    const fetchTeams = async () => {
      try {
        const teamRes = await getAvailableRescueTeams();

        const teamList = teamRes?.data || teamRes || [];

        setTeams(teamList);
      } catch (err) {
        console.error("Load teams error:", err);
      }
    };

    fetchTeams();
  }, [open]);

  /* ================= LOAD ALL VEHICLES ================= */

  useEffect(() => {
    if (!open) return;

    const fetchVehicles = async () => {
      try {
        const vehicleRes = await getAllVehicles();

        const list = vehicleRes?.data || vehicleRes || [];

        setAllVehicles(list);
      } catch (err) {
        console.error("Load vehicles error:", err);
      }
    };

    fetchVehicles();
  }, [open]);

  /* ================= SET DEFAULT DATA ================= */

  useEffect(() => {
    if (detail) {
      setTeamId(Number(detail.rescueTeamId) || "");
      setVehicleId(Number(detail.vehicleId) || "");
    }
  }, [detail]);

  /* ================= LOAD TEAM VEHICLES ================= */

  useEffect(() => {
    if (!teamId) {
      setVehicles([]);
      return;
    }

    const fetchTeamVehicles = async () => {
      try {
        const res = await getRescueTeamVehicles(teamId);

        const teamVehicles = res?.data?.items || [];

        const mapped = teamVehicles
          .filter((v) => v.isActive)
          .map((tv) => {
            const vehicleDetail = allVehicles.find(
              (v) => v.vehicleId === tv.vehicleId
            );

            return {
              vehicleId: tv.vehicleId,
              vehicleName: vehicleDetail?.vehicleName || `Xe ${tv.vehicleId}`,
            };
          });

        setVehicles(mapped);

        /* reset vehicle nếu team mới không có vehicle */

        if (mapped.length === 0) {
          setVehicleId("");
        }
      } catch (err) {
        console.error("Load team vehicles error:", err);
      }
    };

    fetchTeamVehicles();
  }, [teamId, allVehicles]);

  /* ================= CHANGE TEAM ================= */

  const handleChangeTeam = (value) => {
    setTeamId(Number(value));
    setVehicleId(""); // reset vehicle khi đổi team
  };

  /* ================= UPDATE ================= */

  const handleSave = async () => {
    if (!teamId || !vehicleId) {
      AuthNotify.warning(
        "Thiếu thông tin",
        "Vui lòng chọn đội cứu hộ và phương tiện"
      );

      return;
    }

    try {
      setLoading(true);

      const payload = {
        rescueTeamId: Number(teamId),
        vehicleId: Number(vehicleId),
      };

      await updateRescueAssignment(detail.assignmentId, payload);

      AuthNotify.success(
        "Cập nhật thành công",
        "Đã thay đổi đội cứu hộ và phương tiện"
      );

      if (onSave) {
        onSave(payload);
      }

      onClose();
    } catch (err) {
      console.error("Update assignment error:", err);

      AuthNotify.error(
        "Cập nhật thất bại",
        err?.response?.data?.message || "Không thể cập nhật đội cứu hộ"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="udt-overlay">
      <div className="udt-popup">
        <h3>🚑 Cập nhật đội cứu hộ</h3>

        {/* TEAM */}

        <label>Đội cứu hộ</label>

        <select
          value={teamId}
          disabled={loading}
          onChange={(e) => handleChangeTeam(e.target.value)}
        >
          <option value="">Chọn đội cứu hộ</option>

          {teams.map((team) => (
            <option key={team.rescueTeamId} value={team.rescueTeamId}>
              {team.teamName} - {translateTeamStatus(team.teamStatus)}
            </option>
          ))}
        </select>

        {/* VEHICLE */}

        <label>Phương tiện</label>

        <select
          value={vehicleId}
          disabled={loading || !teamId}
          onChange={(e) => setVehicleId(Number(e.target.value))}
        >
          <option value="">Chọn phương tiện</option>

          {vehicles.length === 0 && teamId && (
            <option value="">Không có phương tiện</option>
          )}

          {vehicles.map((v) => (
            <option key={v.vehicleId} value={v.vehicleId}>
              {v.vehicleName}
            </option>
          ))}
        </select>

        {/* ACTION */}

        <div className="udt-actions">
          <button className="btn-cancel" onClick={onClose} disabled={loading}>
            Hủy
          </button>

          <button
            className="btn-save"
            onClick={handleSave}
            disabled={loading || !teamId || !vehicleId}
          >
            {loading ? "Đang cập nhật..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}
