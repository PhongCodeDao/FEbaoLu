import { useEffect, useMemo, useState } from "react";
import { Tag, Select } from "antd";
import { getPendingRescueRequests,getUrgencyLevels } from "../../../../api/axios/CoordinatorApi/RescueRequestApi";
import AuthNotify from "../../../utils/Common/AuthNotify";
import { getRequestStatuses } from "../../../../api/axios/Auth/authApi";
import "./ListTeamSuccessful.css";


/* ================= TIME AGO ================= */

function timeAgo(ts) {
  const diff = Date.now() - ts;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;

  return new Date(ts).toLocaleDateString("vi-VN");
}
const getUrgencyColor = (id) => {
  const colors = [
    "red",
    "orange",
    "green",
    "blue",
    "purple",
    "cyan",
    "gold",
    "lime",
    "magenta",
    "volcano"
  ];

  return colors[(id - 1) % colors.length] || "default";
};


/* ================= REQUEST TYPES ================= */



/* ================= CONVERT API ================= */


const API_BASE = "https://api-rescue.purintech.id.vn";

const convertApiToMission = (data = [], statuses = [], urgencyLevels = []) => {

  if (!Array.isArray(data)) return [];
  const VALID_STATUS = [5, 6];
  return data
  .filter(item => VALID_STATUS.includes(item.statusId))
    .map((item) => {

      const statusObj = statuses.find(
        s => s.statusId === item.statusId
      );
      const urgencyObj = urgencyLevels.find(
        u => u.urgencyLevelId === item.urgencyLevelId
      );
      const images = [];

      // imageUrls
      if (Array.isArray(item.imageUrls)) {
        images.push(...item.imageUrls);
      }
      
      // images
      if (Array.isArray(item.images)) {
        images.push(...item.images);
      }
      
      // locationImageUrl (FIX QUAN TRỌNG)
      if (item.locationImageUrl) {
        if (typeof item.locationImageUrl === "string") {
          images.push(...item.locationImageUrl.split(","));
        } else if (Array.isArray(item.locationImageUrl)) {
          images.push(...item.locationImageUrl);
        }
      }
      
      // normalize + clean + dedupe
      const normalizedImages = [...new Set(
        images
          .map(i => i?.trim())
          .filter(Boolean)
          .map(i =>
            i.startsWith("http")
              ? i
              : `${API_BASE}${i.startsWith("/") ? "" : "/"}${i}`
          )
      )];

      return {
        id: item.rescueRequestId,
        name: item.fullName,
        phone: item.contactPhone,
        address: item.address,
        urgencyScore: item.urgencyScore,
        lat: item.locationLat,
        lng: item.locationLng,

        locationLat: item.locationLat,
        locationLng: item.locationLng,

        createdAt: new Date(item.createdAt).getTime(),

        incident: item.requestType || "Không rõ",

          status: "completed",
          statusText:
          item.statusId === 6
            ? "Đã từ chối"
            : statusObj?.description || "Đã hoàn thành",
          statusId: item.statusId,
          images: normalizedImages,
        urgencyLevelName: urgencyObj?.levelName,
        urgencyLevelId: item.urgencyLevelId,
        detailDescription: item.detailDescription,
        rescueTeamNote: item.rescueTeamNote,
        victimCount: item.victimCount,
        availableRescueTool: item.availableRescueTool,
        specialNeeds: item.specialNeeds,
      };

    });

};
/* ================= COMPONENT ================= */

export default function ListTeamSuccessful({ onSelectMission }) {

  const [missions, setMissions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [requestStatuses, setRequestStatuses] = useState([]);
  const [, forceRender] = useState(0);
  const [currentTime, setCurrentTime] = useState("");
  const [urgencyLevels, setUrgencyLevels] = useState([]);
  const [filters, setFilters] = useState({
    requestType: "",
    address: "",
    urgencyLevel: "",
    status: "" 
  });

  /* ================= LOAD API ================= */

  const fetchData = async () => {

    try {

      setLoading(true);

      const response = await getPendingRescueRequests();
      const list = Array.isArray(response)
      ? response
      : response?.data || [];

    
    setMissions(
      convertApiToMission(list, requestStatuses, urgencyLevels)
    );

    }
    catch (error) {

      AuthNotify.error(
        "Không tải được dữ liệu",
        error?.response?.data?.message || error.message
      );

    }
    finally {
      setLoading(false);
    }

  };

  useEffect(() => {
    if (requestStatuses.length > 0 && urgencyLevels.length > 0) {
      fetchData();
    }
  }, [requestStatuses, urgencyLevels]);

  /* ================= ADDRESS OPTIONS ================= */

  const ADDRESS_OPTIONS = useMemo(() => {

    const unique = [...new Set(missions.map(m => m.address).filter(Boolean))];

    return unique.map(addr => ({
      label: addr,
      value: addr
    }));

  }, [missions]);

  const INCIDENT_OPTIONS = useMemo(() => {

    const unique = [...new Set(
      missions
        .map(m => m.incident)
        .filter(Boolean)
    )];
  
    return unique.map(i => ({
      label: i,
      value: i
    }));
  
  }, [missions]);




  useEffect(() => {
    const loadUrgency = async () => {
      try {
        const data = await getUrgencyLevels();
        const list = Array.isArray(data)
          ? data
          : data?.data || [];
  
        setUrgencyLevels(list);
      } catch (err) {
        console.error("LOAD URGENCY ERROR:", err);
      }
    };
  
    loadUrgency();
  }, []);

  /* ================= REALTIME CLOCK ================= */

  useEffect(() => {

    const updateTime = () => {

      const now = new Date();

      setCurrentTime(
        now.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );

    };

    updateTime();

    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);

  }, []);

  /* ================= UPDATE TIME AGO ================= */

  useEffect(() => {

    const timer = setInterval(() => {
      forceRender(n => n + 1);
    }, 60000);

    return () => clearInterval(timer);

  }, []);

  /* ================= FILTER ================= */

  const filtered = useMemo(() => {
    let list = [...missions];
  
    if (filters.requestType)
      list = list.filter(
        m => m.incident === filters.requestType
      );
      if (filters.status)
        list = list.filter(
          m => String(m.statusId) === filters.status
        );
  
    if (filters.address)
      list = list.filter(m => m.address === filters.address);
  
    if (filters.urgencyLevel)
      list = list.filter(
        m => m.urgencyLevelId === filters.urgencyLevel
      );
  
    list.sort((a, b) => b.createdAt - a.createdAt);
  
    return list;
  }, [missions, filters]);

  useEffect(() => {

    const loadStatuses = async () => {
  
      try {
  
        const data = await getRequestStatuses();
  
        const list = Array.isArray(data)
          ? data
          : data?.data || [];
  
        setRequestStatuses(list);
  
      } catch (error) {
  
        console.error("LOAD STATUS ERROR:", error);
  
      }
  
    };
  
    loadStatuses();
  
  }, []);

  /* ================= UI ================= */

  return (

    <aside className="rc-queue">

      <div className="rc-queue__header">

        <h3>Danh sách nhiệm vụ ({filtered.length})</h3>

        <span className="rc-queue__live">
          {currentTime}
        </span>

      </div>

<div className="rc-filter">

  {/* LOẠI YÊU CẦU */}

  <Select
    placeholder="Loại yêu cầu"
    showSearch
    allowClear
    value={filters.requestType || undefined}
    style={{ width: "100%" }}
    options={[
      { label: "Tất cả", value: "" },
      ...INCIDENT_OPTIONS
    ]}
    optionFilterProp="label"
    onChange={(value) =>
      setFilters(prev => ({
        ...prev,
        requestType: value || ""
      }))
    }
  />

  {/* ĐỊA CHỈ */}

  <Select
    placeholder="Địa chỉ"
    showSearch
    allowClear
    value={filters.address || undefined}
    style={{ width: "100%", marginTop: 8 }}
    options={[
      { label: "Tất cả", value: "" },
      ...ADDRESS_OPTIONS
    ]}
    optionFilterProp="label"
    onChange={(value) =>
      setFilters({
        requestType: "",
        address: value || "",
        urgencyLevel: ""
      })
    }
  />
<Select
  placeholder="Mức độ nguy hiểm"
  allowClear
  value={filters.urgencyLevel || undefined}
  style={{ width: "100%", marginTop: 8 }}
  options={[
    { label: "Tất cả", value: "" },
    ...urgencyLevels.map(u => ({
      label: u.levelName,
      value: u.urgencyLevelId
    }))
  ]}
  onChange={(value) =>
    setFilters({
      ...filters,
      urgencyLevel: value || ""
    })
  }
/>
<Select
  placeholder="Trạng thái"
  allowClear
  value={filters.status || undefined}
  style={{ width: "100%", marginTop: 8 }}
  options={[
    { label: "Tất cả", value: "" },
    { label: "Hoàn thành", value: "5" },
    { label: "Đã từ chối", value: "6" }
  ]}
  onChange={(value) =>
    setFilters({
      ...filters,
      status: value || ""
    })
  }
/>


</div>



      {/* LIST */}

      <div className="rc-queue__list">

        {loading ? (

          <div className="rc-loading">
            Đang tải dữ liệu...
          </div>

        ) : filtered.length === 0 ? (

          <div className="rc-empty">
            Không có dữ liệu
          </div>

        ) : (

          filtered.map((m) => (

            <div
            className="rc-queue__card"
            key={m.id}
            onClick={() => {
              console.log("CLICK ITEM:", m);
              onSelectMission(m);
            }}
          >

              <div className="rc-queue__top">

                <span className="rc-queue__id">
                  Mã yêu cầu: #{m.id}
                  
                </span>

                <span className="rc-queue__time">

                  {timeAgo(m.createdAt)}
                  <div className="rc-queue__status">
                  <Tag color={m.statusId === 6 ? "red" : "green"}>
  {m.statusText}
</Tag>
</div>

                </span>

              </div>
              <div
  className="info-box-minato"
  style={{
    background: "#fff",
    borderRadius: 12,
    padding: "14px 16px",
    border: "1px solid #eee",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: 8
  }}
>
<strong
    style={{
      fontSize: 15,
      fontWeight: 700,
      color: "#1677ff"
    }}
  >
     Họ và tên: {m.name}
  </strong>

  <div
    style={{
      fontSize: 14,
      fontWeight: 600,
      color: "#52c41a",
      padding: "6px 10px",
      background: "#f6ffed",
      borderRadius: 8,
      border: "1px solid #b7eb8f"
    }}
  >
    Số điện thoại: {m.phone}
  </div>

  <div
    style={{
      fontSize: 14,
      color: "#444",
      padding: "6px 10px",
      background: "#fafafa",
      borderRadius: 8,
      border: "1px solid #eee"
    }}
  >
     Vị trí: {m.address}
  </div>

              <div className="rc-queue__tags">
  <Tag color="red">{m.incident}</Tag>


  <Tag color={getUrgencyColor(m.urgencyLevelId)}>
  {m.urgencyLevelName}
</Tag>
</div>
            </div>
            </div>

          ))

        )}

      </div>

    </aside>

  );

}