import { useMemo, useState, useEffect } from "react";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";

import {
  getAvailableRescueTeams,
  getRescueTeamLocation,
  getRescueTeamVehicles
} from "../../../../api/axios/ManagerApi/rescueTeamApi";

import { getAllVehicles } from "../../../../api/axios/ManagerApi/vehicleApi";
import {getProvinces} from "../../../../api/axios/Auth/authApi";
import {
  confirmDispatchRescueRequest
} from "../../../../api/axios/CoordinatorApi/RescueRequestApi";

import AuthNotify from "../../../utils/Common/AuthNotify";

import "./rc-dispatch-map.css";

export default function DispatchMapView({ requests = [], onDispatchSuccess }) {

  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [tab, setTab] = useState("team");
  const [provinces, setProvinces] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedVehicles, setSelectedVehicles] = useState([]);

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

  const id =
    firstRequest?.id ||
    firstRequest?.requestId ||
    "N/A";
    const fullname =
    firstRequest?.fullname || firstRequest?.name || "Không rõ";
  
  const address =
    firstRequest?.address || "Không rõ địa chỉ";
  
  const status =
    firstRequest?.statusText || "Đang xử lý";
    /* ================= LOAD PROVINCES ================= */

  const fetchProvinces = async () => {

    try {

      const res = await getProvinces();

      const data = res?.data || res || [];

      setProvinces(data);

      const map = {};

      data.forEach((p) => {
        map[p.id] = p.name;
      });


    }
    catch (err) {

      console.log("Load provinces error:", err);

    }

  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProvinces();

  }, []);
  
    /* ================= MAP AREA ID -> NAME ================= */
  
const provinceMap = useMemo(() => {
  const map = {};

  provinces.forEach(p => {
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

        const availableTeams =
        teams.filter(
          t => t.teamStatus?.toLowerCase().trim() === "onduty"
        );

        const mapped = await Promise.all(

          availableTeams.map(async (team) => {

            let lat = firstRequest?.lat
            let lng = firstRequest?.lng
            let address = "Không xác định";

            try {

              const loc = await getRescueTeamLocation(team.rescueTeamId);

              const location = loc?.data?.location;

              if (location) {

                const [lngStr, latStr] = location.split(",");

                lat = parseFloat(latStr);
                lng = parseFloat(lngStr);

                address = `${lat}, ${lng}`;

              }

            } catch {
              // ignore parse error
            }

            return {
              id: team.rescueTeamId,
              name: team.teamName,
              status: team.teamStatus,
              address,
              lat,
              lng,
              areaId: team.areaId,

            };

          })

        );

        setRescueTeams(mapped);

      }
      catch (err) {

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
          getAllVehicles()
        ]);

        const teamVehicles =
          teamVehicleRes?.data?.items || [];

        const allVehicles =
          vehicleRes?.data || [];

        const mapped = teamVehicles
          .filter(v => v.isActive === true)
          .map(tv => {

            const vehicleDetail =
              allVehicles.find(v => v.vehicleId === tv.vehicleId);

            return {

              id: tv.vehicleId,
              name: vehicleDetail?.vehicleName || `Xe #${tv.vehicleId}`,
              type: vehicleDetail?.vehicleType || "Rescue Vehicle",
              location: vehicleDetail?.vehicleLocation || "Không xác định",
              status: vehicleDetail?.vehicleStatus || "ready"

            };

          });

        setVehicles(mapped);

      }
      catch (err) {

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

    setSelectedVehicles(prev => {

      if (prev.includes(id)) {

        return prev.filter(v => v !== id);

      }

      if (prev.length >= 3) {

        AuthNotify.warning(
          "Giới hạn phương tiện",
          "Chỉ được chọn tối đa 3 phương tiện"
        );

        return prev;

      }

      return [...prev, id];

    });

  };

  /* ================= MAP ================= */

  const mapUrl = useMemo(() => {

    if (!firstRequest) {
      return "https://www.google.com/maps?q=10.8231,106.6297&z=13&output=embed";
    }

    if (!selectedTeam) {
      return `https://www.google.com/maps?q=${firstRequest.lat},${firstRequest.lng}&z=15&output=embed`;
    }

    const team = rescueTeams.find(t => t.id === selectedTeam);

    if (!team) {
      return `https://www.google.com/maps?q=${firstRequest.lat},${firstRequest.lng}&z=15&output=embed`;
    }

    return `https://www.google.com/maps?saddr=${team.lat},${team.lng}&daddr=${firstRequest.lat},${firstRequest.lng}&z=15&output=embed`;

  }, [selectedTeam, rescueTeams, firstRequest]);

  /* ================= CONFIRM ================= */

  const canConfirm =
    Boolean(selectedTeam) &&
    selectedVehicles.length > 0;

  const handleConfirmDispatch = async () => {

    if (!canConfirm) {

      AuthNotify.warning(
        "Thiếu thông tin",
        "Vui lòng chọn đội cứu hộ và phương tiện"
      );

      return;

    }

    try {

      const payload = {
        rescueRequestIds: requestIds.map(Number),
        rescueTeamId: Number(selectedTeam),
        vehicleId: Number(selectedVehicles[0]),
        assignedBy: Number(assignedBy)
      };

      await confirmDispatchRescueRequest(payload);

      setRescueTeams(prev =>
        prev.filter(t => t.id !== selectedTeam)
      );

      setVehicles(prev =>
        prev.filter(v =>
          !selectedVehicles.includes(v.id)
        )
      );

      setSelectedTeam(null);
      setSelectedVehicles([]);

      AuthNotify.success(
        "Điều động thành công",
        "Đội cứu hộ đã được điều động"
      );

      onDispatchSuccess?.(requestIds);

      navigate("/coordinator/mina", {

        state: {

          teamId: selectedTeam,
          vehicleIds: selectedVehicles,
          requests

        }

      });

    }
    catch (err) {

      console.error("Dispatch error:", err);

      AuthNotify.error(
        "Điều động thất bại",
        err?.response?.data?.message ||
        err?.message ||
        "Không thể điều động"
      );

    }

  };
  const requestIds = requests.map(
    r => r.id || r.requestId
  );



  return (

    <section className={`rc-map ${collapsed ? "rc-map--expanded" : ""}`}>

      <header className="dispatch-header">

        <div className="dispatch-header-left">

        <h2 className="dispatch-title">
  Mã yêu cầu:{" "}
  {requestIds.map(id => `#${id}`).join(", ")}
  <span className="dispatch-status">{status}</span>
</h2>

        </div>

     

      </header>

      <div className="rc-map__canvas">

        <iframe
          title="rescue-map"
          className="rc-map__iframe"
          src={mapUrl}
          loading="lazy"
        />

      </div>

      <div className={`rc-map__panel ${collapsed ? "is-collapsed" : ""}`}>

        <div className="rc-map__panel-header">

          <div className="rc-map__panel-title">

            <h4>
              LỰA CHỌN NGUỒN LỰC
              <span className="rc-resource-count">
                ({teamCount} đội | {vehicleCount} xe)
              </span>
            </h4>

            <span
              className={`rc-map__tab ${tab === "team" ? "active" : ""}`}
              onClick={() => setTab("team")}
            >
              Đội Cứu Hộ ({teamCount})
            </span>

            <span
              className={`rc-map__tab ${tab === "vehicle" ? "active" : ""}`}
              onClick={() => setTab("vehicle")}
            >
              Phương Tiện ({vehicleCount})
            </span>

          </div>

          <button
            className="rc-map__collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed
              ? <>MỞ RỘNG <DownOutlined/></>
              : <>THU GỌN <UpOutlined/></>}
          </button>

        </div>

        <div className="rc-map__teams">

          {tab === "team" && rescueTeams.map(team => (

            <div
              key={team.id}
              className={`rc-team ${selectedTeam === team.id ? "active" : ""}`}
              onClick={() => toggleTeam(team.id)}
            >

<div style={{ lineHeight: "1.6" }}>
  <h5 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600 }}>
    Tên đội: {team.name}
  </h5>

  <div style={{ fontSize: 13, color: "#374151", marginBottom: 4 }}>
    📍 Khu vực: {provinceMap[Number(team.areaId)] || "Không xác định"}
  </div>

  <div style={{ fontSize: 13 }}>
    <b>Trạng thái:</b>{" "}
    <span
      style={{
        color: "#2e7d32",
        fontWeight: 600
      }}
    >
      ● Sẵn sàng
    </span>
  </div>
</div>

             

            </div>

          ))}

          {tab === "vehicle" && vehicles.map(v => (

            <div
              key={v.id}
              className={`rc-team ${selectedVehicles.includes(v.id) ? "active" : ""}`}
              onClick={() => toggleVehicle(v.id)}
            >

<div style={{ lineHeight: "1.6" }}>
  <h5 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600 }}>
    Tên phương tiện: {v.name}
  </h5>

  <div style={{ fontSize: 13, color: "#374151" }}>
    <b>Loại phương tiện:</b> {v.type}
  </div>

  <div style={{ fontSize: 13, marginTop: 4 }}>
    <b>Trạng thái:</b>{" "}
    <span
      style={{
        padding: "2px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        background: "#e8f5e9",
        color: "#2e7d32"
      }}
    >
      Sẵn sàng
    </span>
  </div>

  <div style={{ fontSize: 15, marginTop: 4, color: "#6b7280" , fontWeight: "bold"}}>
    Khu vưc: {v.location}
  </div>
</div>

            </div>

          ))}

        </div>

        <div className="rc-map__footer">

          <span className="rc-map__selected">
            Đã chọn <b>{selectedTeam ? 1 : 0}</b> đội và <b>{selectedVehicles.length}</b> xe
          </span>

          <div className="rc-map__actions">

            <Button onClick={() => navigate(-1)}>
              Hủy bỏ
            </Button>

            <Button
              type="primary"
              disabled={!canConfirm}
              onClick={handleConfirmDispatch}
            >
              ▶ Xác nhận điều động
            </Button>

          </div>

        </div>

      </div>

    </section>

  );

}