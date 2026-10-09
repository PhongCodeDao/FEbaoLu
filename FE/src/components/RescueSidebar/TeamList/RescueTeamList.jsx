import { useEffect, useState, useMemo } from "react";
import { Input, Select, Button, Tag, message, Spin, Empty } from "antd";
import {
  PhoneOutlined,
  EnvironmentOutlined,
  SearchOutlined
} from "@ant-design/icons";
import axios from "axios";

import {
  getProvinces,
  getAllRescueTeams,
  getRescueTeamLocation
} from "../../../api/service/geographicApi";

import "./RescueTeamList.css";

const { Option } = Select;

/* ================= STATUS ================= */

const normalizeStatus = (status) => {
  if (!status) return "rest";
  return status.toLowerCase().includes("on") ? "ready" : "duty";
};

/* ================= REMOVE ACCENT ================= */

const removeVietnameseTones = (str = "") =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/* ================= REVERSE GEOCODE ================= */

const reverseGeocode = async (lat, lng) => {
  try {
    const res = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: { lat, lon: lng, format: "json" }
      }
    );
    return res.data.display_name;
  } catch {
    return null;
  }
};

export default function RescueTeamList() {

  const [teamsData, setTeamsData] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvince, setSelectedProvince] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);

      const [teamRes, provinceRes] = await Promise.all([
        getAllRescueTeams(),
        getProvinces()
      ]);

      const teamsArray =
        teamRes?.items ||
        teamRes?.data ||
        teamRes ||
        [];

      const teamsWithLocation = await Promise.all(
        teamsArray.map(async (team) => {

          let lat = null;
          let lng = null;
          let address = null;

          try {
            const locRes = await getRescueTeamLocation(team.rcid ?? team.id);
            const locationStr = locRes?.location;

            if (locationStr?.includes(",")) {
              const [lngStr, latStr] = locationStr.split(",");
              lat = Number(latStr);
              lng = Number(lngStr);
              address = await reverseGeocode(lat, lng);
            }

          } catch {}

          return {
            id: team.rcid ?? team.id,
            name: team.rcName ?? team.name,
            phone: team.rcPhone ?? "",
            status: normalizeStatus(team.rcStatus ?? team.status),
            areaId: Number(team.areaId) || 0,
            lat,
            lng,
            address
          };
        })
      );

      setTeamsData(teamsWithLocation);

      const provinceArray =
        provinceRes?.items ||
        provinceRes?.data ||
        provinceRes ||
        [];

      setProvinces(provinceArray);

    } catch {
      message.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER ================= */

  const filteredTeams = useMemo(() => {

    let result = teamsData;

    if (selectedProvince !== "all") {
      result = result.filter(
        t => t.areaId === Number(selectedProvince)
      );
    }

    if (search.trim()) {
      const keyword = removeVietnameseTones(search);

      result = result.filter(t =>
        removeVietnameseTones(t.name).includes(keyword) ||
        t.phone.includes(keyword)
      );
    }

    return result;

  }, [teamsData, selectedProvince, search]);

  if (loading) {
    return (
      <div className="loading-wrapper">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="rescue-container">

      <div className="rescue-filter">

        <Input
          prefix={<SearchOutlined />}
          placeholder="Tìm theo tên hoặc số điện thoại..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          size="large"
        />

        <Select
          value={selectedProvince}
          onChange={setSelectedProvince}
          size="large"
        >
          <Option value="all">Tất cả khu vực</Option>
          {provinces.map(p => (
            <Option key={p.id} value={p.id}>
              {p.name}
            </Option>
          ))}
        </Select>

        <div className="team-count">
          ĐỘI CỨU HỘ ({filteredTeams.length})
        </div>
      </div>

      <div className="team-list-scroll">

        {filteredTeams.length === 0 && (
          <Empty description="Không tìm thấy đội phù hợp" />
        )}

        {filteredTeams.map(team => {

          const province = provinces.find(
            p => Number(p.id) === team.areaId
          );

          return (
            <TeamCard
              key={team.id}
              {...team}
              provinceName={province?.name}
            />
          );
        })}

      </div>
    </div>
  );
}

/* ================= CARD ================= */

function TeamCard({
  name,
  phone,
  status,
  provinceName,
  areaId,
  lat,
  lng,
  address
}) {

  const isReady = status === "ready";

  const handleCall = () => {
    if (phone) window.location.href = `tel:${phone}`;
  };

  const openMap = () => {
    if (!lat || !lng) {
      message.warning("Đội này chưa có vị trí");
      return;
    }

    window.open(
      `https://www.google.com/maps?q=${lat},${lng}`,
      "_blank"
    );
  };

  return (
    <div className="team-card-modern">

      <div className="team-header-modern">
        <h4>{name}</h4>
        <Tag color={isReady ? "green" : "orange"}>
          {isReady ? "Sẵn sàng" : "Đang trực"}
        </Tag>
      </div>

      {/* 🔥 HIỂN THỊ KHU VỰC THEO areaId */}
      {areaId !== 0 && (
        <div className="team-info">
          <EnvironmentOutlined />
          <span>{provinceName || "Khu vực không xác định"}</span>
        </div>
      )}

      {/* 🔥 ĐỊA CHỈ TỪ TỌA ĐỘ
      <div className="team-info">
        <EnvironmentOutlined />
        <span>
          {address
            ? address
            : (lat && lng
                ? `${lat}, ${lng}`
                : "Chưa có vị trí")}
        </span>
      </div> */}

      <div className="team-info">
        <PhoneOutlined />
        <span>{phone || "Chưa có SĐT"}</span>
      </div>

      {lat && lng && (
        <Button
          icon={<EnvironmentOutlined />}
          block
          style={{ marginTop: 8 }}
          onClick={openMap}
        >
          Xem vị trí
        </Button>
      )}

      {isReady && (
        <Button
          type="primary"
          block
          onClick={handleCall}
          style={{ marginTop: 8 }}
        >
          Liên hệ
        </Button>
      )}

    </div>
  );
}