import { useMemo, useState, useEffect } from "react";
import {
  UpOutlined,
  DownOutlined,
  TeamOutlined,
  CarOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  AlertOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Button, Tag, Spin } from "antd";

import {
  getAvailableRescueTeams,
  getRescueTeamLocation,
  getRescueTeamVehicles,
} from "../../../../api/axios/ManagerApi/rescueTeamApi";

import { getAllVehicles } from "../../../../api/axios/ManagerApi/vehicleApi";
import { getProvinces } from "../../../../api/axios/Auth/authApi";
import { confirmDispatchRescueRequest } from "../../../../api/axios/CoordinatorApi/RescueRequestApi";
import AuthNotify from "../../../utils/Common/AuthNotify";

import "./rc-dispatch-map.css";

export default function DispatchMapView({ requests = [], onDispatchSuccess }) {
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [tab, setTab] = useState("team");
  const [provinces, setProvinces] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [rescueTeams, setRescueTeams] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const teamCount = rescueTeams.length;
  const vehicleCount = vehicles.length;

  /* ================= USER ================= */
  let user = {};
  try {
    user =
      JSON.parse(sessionStorage.getItem("user")) ||
      JSON.parse(localStorage.getItem("user")) ||
      {};
  } catch {
    user = {};
  }
  const assignedBy = user?.userId || 0;

  /* ================= REQUEST ================= */
  const firstRequest = requests[0] || {};
  const fullname = firstRequest?.fullname || firstRequest?.name || "Người dân gặp nạn";
  const address = firstRequest?.address || "Chưa xác định tọa độ";
  const status = firstRequest?.statusText || "Chờ điều phối";

  const requestIds = requests.map((r) => r.id || r.requestId);

  /* ================= LOAD PROVINCES ================= */
  const fetchProvinces = async () => {
    try {
      const res = await getProvinces();
      const data = res?.data || res || [];
      setProvinces(data);
    } catch (err) {
      console.log("Load provinces error:", err);
    }
  };

  useEffect(() => {
    fetchProvinces();
  }, []);

  const provinceMap = useMemo(() => {
    const map = {};
    provinces.forEach((p) => {
      map[Number(p.id)] = p.name;
    });
    return map;
  }, [provinces]);

  /* ================= LOAD TEAMS ================= */
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teamRes = await getAvailableRescueTeams();
        const teams = teamRes?.data || [];
        const availableTeams = teams.filter(
          (t) => t.teamStatus?.toLowerCase().trim() === "onduty"
        );

        const mapped = await Promise.all(
          availableTeams.map(async (team) => {
            let lat = firstRequest?.lat;
            let lng = firstRequest?.lng;
            let addr = "Không xác định";

            try {
              const loc = await getRescueTeamLocation(team.rescueTeamId);
              const location = loc?.data?.location;
              if (location) {
                const [lngStr, latStr] = location.split(",");
                lat = parseFloat(latStr);
                lng = parseFloat(lngStr);
                addr = `${lat}, ${lng}`;
              }
            } catch {
              // ignore parse error
            }

            return {
              id: team.rescueTeamId,
              name: team.teamName,
              status: team.teamStatus,
              address: addr,
              lat,
              lng,
              areaId: team.areaId,
            };
          })
        );
        setRescueTeams(mapped);
      } catch (err) {
        console.error("Load teams error:", err);
      }
    };

    fetchTeams();
  }, [firstRequest, provinces]);

  /* ================= LOAD VEHICLES ================= */
  useEffect(() => {
    const fetchVehicles = async () => {
      if (!selectedTeam) {
        setVehicles([]);
        return;
      }

      try {
        const [teamVehicleRes, vehicleRes] = await Promise.all([
          getRescueTeamVehicles(selectedTeam),
          getAllVehicles(),
        ]);

        const teamVehicles = teamVehicleRes?.data?.items || [];
        const allVehicles = vehicleRes?.data || [];

        const mapped = teamVehicles
          .filter((v) => v.isActive === true)
          .map((tv) => {
            const vehicleDetail = allVehicles.find(
              (v) => v.vehicleId === tv.vehicleId
            );
            return {
              id: tv.vehicleId,
              name: vehicleDetail?.vehicleName || `Phương tiện #${tv.vehicleId}`,
              type: vehicleDetail?.vehicleType || "Cứu hộ đường thủy",
              location: vehicleDetail?.vehicleLocation || "Kho chỉ huy",
              status: vehicleDetail?.vehicleStatus || "ready",
            };
          });

        setVehicles(mapped);
      } catch (err) {
        console.error("Load vehicles error:", err);
      }
    };

    fetchVehicles();
  }, [selectedTeam]);

  /* ================= SELECT TEAM ================= */
  const toggleTeam = (id) => {
    setSelectedTeam(id);
    setSelectedVehicles([]);
  };

  /* ================= SELECT VEHICLE ================= */
  const toggleVehicle = (id) => {
    setSelectedVehicles((prev) => {
      if (prev.includes(id)) {
        return prev.filter((v) => v !== id);
      }
      if (prev.length >= 3) {
        AuthNotify.warning(
          "Giới hạn phương tiện",
          "Chỉ được chọn tối đa 3 phương tiện tác chiến"
        );
        return prev;
      }
      return [...prev, id];
    });
  };

  /* ================= MAP ================= */
  const mapUrl = useMemo(() => {
    if (!firstRequest?.lat) {
      return "https://www.google.com/maps?q=10.8231,106.6297&z=13&output=embed";
    }

    if (!selectedTeam) {
      return `https://www.google.com/maps?q=${firstRequest.lat},${firstRequest.lng}&z=15&output=embed`;
    }

    const team = rescueTeams.find((t) => t.id === selectedTeam);
    if (!team || !team.lat) {
      return `https://www.google.com/maps?q=${firstRequest.lat},${firstRequest.lng}&z=15&output=embed`;
    }

    return `https://www.google.com/maps?saddr=${team.lat},${team.lng}&daddr=${firstRequest.lat},${firstRequest.lng}&z=15&output=embed`;
  }, [selectedTeam, rescueTeams, firstRequest]);

  /* ================= CONFIRM ================= */
  const canConfirm = Boolean(selectedTeam) && selectedVehicles.length > 0;

  const handleConfirmDispatch = async () => {
    if (!canConfirm) {
      AuthNotify.warning(
        "Thiếu thông tin",
        "Vui lòng chọn 1 đội cứu hộ và ít nhất 1 phương tiện"
      );
      return;
    }

    try {
      setConfirmLoading(true);
      const payload = {
        rescueRequestIds: requestIds.map(Number),
        rescueTeamId: Number(selectedTeam),
        vehicleId: Number(selectedVehicles[0]),
        assignedBy: Number(assignedBy),
      };

      await confirmDispatchRescueRequest(payload);

      setRescueTeams((prev) => prev.filter((t) => t.id !== selectedTeam));
      setVehicles((prev) => prev.filter((v) => !selectedVehicles.includes(v.id)));

      setSelectedTeam(null);
      setSelectedVehicles([]);

      AuthNotify.success(
        "Điều động thành công",
        "Lệnh điều động đã được phát đi đến đội cứu hộ trực chiến"
      );

      onDispatchSuccess?.(requestIds);
      navigate("/coordinator/mina", {
        state: {
          teamId: selectedTeam,
          vehicleIds: selectedVehicles,
          requests,
        },
      });
    } catch (err) {
      console.error("Dispatch error:", err);
      AuthNotify.error(
        "Điều động thất bại",
        err?.response?.data?.message || err?.message || "Không thể điều động"
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  const selectedTeamObj = rescueTeams.find((t) => t.id === selectedTeam);

  return (
    <section className={`rc-map ${collapsed ? "rc-map--expanded" : ""}`}>
      {/* HEADER */}
      <header className="dispatch-header">
        <div className="dispatch-header-left">
          <h2 className="dispatch-title">
            Yêu cầu: {requestIds.map((id) => `#${id}`).join(", ")}
            <span className="dispatch-status">{status}</span>
          </h2>
        </div>

        <div className="dispatch-header-right">
          <span className="dispatch-user">
            <UserOutlined style={{ marginRight: 6, color: "#0284c7" }} />
            {fullname}
          </span>
          <span className="dispatch-address">
            <EnvironmentOutlined style={{ marginRight: 4, color: "#ef4444" }} />
            {address}
          </span>
        </div>
      </header>

      {/* MAP CANVAS */}
      <div className="rc-map__canvas">
        <iframe
          title="rescue-map"
          className="rc-map__iframe"
          src={mapUrl}
          loading="lazy"
        />
      </div>

      {/* DOCK PANEL */}
      <div className={`rc-map__panel ${collapsed ? "is-collapsed" : ""}`}>
        <div className="rc-map__panel-header">
          <div className="rc-map__tabs-group">
            <span
              className={`rc-map__tab ${tab === "team" ? "active" : ""}`}
              onClick={() => setTab("team")}
            >
              <TeamOutlined />
              Đội Cứu Hộ Trực Chiến
              <span className="rc-map__tab-badge">{teamCount}</span>
            </span>

            <span
              className={`rc-map__tab ${tab === "vehicle" ? "active" : ""}`}
              onClick={() => setTab("vehicle")}
            >
              <CarOutlined />
              Phương Tiện Khả Dụng
              <span className="rc-map__tab-badge">{vehicleCount}</span>
            </span>
          </div>

          <button
            className="rc-map__collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <>Mở Rộng <DownOutlined /></>
            ) : (
              <>Thu Gọn <UpOutlined /></>
            )}
          </button>
        </div>

        {/* CARDS LIST */}
        <div className="rc-map__teams">
          {tab === "team" &&
            (rescueTeams.length === 0 ? (
              <div style={{ padding: 20, color: "#94a3b8", textAlign: "center", gridColumn: "1/-1" }}>
                Không có đội cứu hộ nào đang trong trạng thái sẵn sàng trực chiến
              </div>
            ) : (
              rescueTeams.map((team) => {
                const isActive = selectedTeam === team.id;
                return (
                  <div
                    key={team.id}
                    className={`rc-team ${isActive ? "active" : ""}`}
                    onClick={() => toggleTeam(team.id)}
                  >
                    <div>
                      <div className="rc-team__status">● Sẵn sàng trực chiến</div>
                      <h5>{team.name}</h5>
                      <p>
                        <EnvironmentOutlined style={{ marginRight: 4, color: "#ef4444" }} />
                        {provinceMap[Number(team.areaId)] || "Khu vực tiền tuyến"}
                      </p>
                    </div>
                    <div className="rc-team__meta">
                      <span>Mã đội #{team.id}</span>
                      {isActive && <Tag color="blue">Đã chọn</Tag>}
                    </div>
                  </div>
                );
              })
            ))}

          {tab === "vehicle" &&
            (!selectedTeam ? (
              <div style={{ padding: 20, color: "#94a3b8", textAlign: "center", gridColumn: "1/-1" }}>
                Vui lòng chọn 1 Đội Cứu Hộ trước để xem phương tiện thuộc đội đó
              </div>
            ) : vehicles.length === 0 ? (
              <div style={{ padding: 20, color: "#94a3b8", textAlign: "center", gridColumn: "1/-1" }}>
                Đội này chưa được cấp phát phương tiện sẵn sàng
              </div>
            ) : (
              vehicles.map((v) => {
                const isSelected = selectedVehicles.includes(v.id);
                return (
                  <div
                    key={v.id}
                    className={`rc-team ${isSelected ? "active" : ""}`}
                    onClick={() => toggleVehicle(v.id)}
                  >
                    <div>
                      <span className="rc-team__status">● Sẵn sàng</span>
                      <h5>{v.name}</h5>
                      <p>Loại: {v.type}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>
                        Vị trí đỗ: {v.location}
                      </p>
                    </div>
                    <div className="rc-team__meta">
                      <span>Mã xe #{v.id}</span>
                      {isSelected && <Tag color="blue">Đã chọn ({selectedVehicles.indexOf(v.id) + 1}/3)</Tag>}
                    </div>
                  </div>
                );
              })
            ))}
        </div>

        {/* FOOTER ACTION */}
        <div className="rc-map__footer">
          <span className="rc-map__selected">
            Đã chọn:{" "}
            <strong>{selectedTeamObj ? selectedTeamObj.name : "Chưa chọn đội"}</strong>
            {selectedVehicles.length > 0 && ` + ${selectedVehicles.length} phương tiện`}
          </span>

          <div className="rc-map__actions">
            <Button onClick={() => navigate(-1)} style={{ borderRadius: 8 }}>
              Quay lại
            </Button>
            <Button
              className="btn-confirm"
              disabled={!canConfirm}
              loading={confirmLoading}
              onClick={handleConfirmDispatch}
            >
              ▶ Phát Lệnh Điều Động Tác Chiến
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}