import "./DistributionListRescueHistory.css";
import { useEffect, useState } from "react";
import { Pagination, Spin, Tag, Select } from "antd";
import {
  getRescueTeamMembers,
  getAllRescueTeams,
  getAllDistributions,
  getAllAidCampaigns
} from "../../../../../api/axios/RescueApi/RescueTask";
import { useNavigate } from "react-router-dom";
export default function DistributionListRescueHistory() {

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [teamMap, setTeamMap] = useState({});
  const [campaignMap, setCampaignMap] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [filterCampaign, setFilterCampaign] = useState(null);
const [filterStatus, setFilterStatus] = useState(null);
const navigate = useNavigate();
  const pageSize = 3;

  const user =
    JSON.parse(localStorage.getItem("user")) ||
    JSON.parse(sessionStorage.getItem("user")) ||
    {};

  /* ================= FIND TEAM ================= */
  const findMyTeamId = async (teams, userId) => {
    for (const team of teams) {
      try {
        const res = await getRescueTeamMembers(team.rcid);
        const members = res?.data?.items || [];

        const isMember = members.some(m => m.userId === userId);
        if (isMember) return team.rcid;
      } catch {}
    }
    return null;
  };

  /* ================= LOAD ================= */
  const fetchDistributions = async () => {
    try {
      setLoading(true);

      if (!user?.userId) return;

      const teamRes = await getAllRescueTeams();
      const teams = teamRes?.data?.items || [];

      // map team
      const map = {};
      teams.forEach(t => {
        map[t.rcid] = t.rcName;
      });
      setTeamMap(map);

      // campaign
      const campaigns = await getAllAidCampaigns();
      const cmap = {};
      campaigns.forEach(c => {
        cmap[c.campaignID] = c;
      });
      setCampaignMap(cmap);

      const myTeamId = await findMyTeamId(teams, user.userId);

      if (!myTeamId) {
        setList([]);
        return;
      }

      const data = await getAllDistributions();

    
      const myList = data
        .filter(d => d.rescueTeamId === myTeamId)
        .filter(d => {
          const status = d.status?.toLowerCase();
          return status === "completed" || status === "rejected";
        })
        .sort((a, b) => new Date(b.distributedAt) - new Date(a.distributedAt));

      setList(myList);

    } catch (err) {
      console.error("Load distribution error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistributions();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterCampaign, filterStatus]);

  const campaignOptions = [
    { label: "Tất cả chiến dịch", value: "ALL" },
    ...[...new Map(
      list.map(item => [
        item.campaignId || item.campaignID,
        {
          label:
            campaignMap[item.campaignId]?.campaignName ||
            campaignMap[item.campaignID]?.campaignName ||
            `Chiến dịch ${item.campaignId}`,
          value: item.campaignId || item.campaignID
        }
      ])
    ).values()]
  ];
  
  const statusOptions = [
    { label: "Tất cả trạng thái", value: "ALL" },
    { label: "Hoàn thành", value: "completed" },
    { label: "Từ chối", value: "rejected" }
  ];

  const filteredList = list.filter(item => {

    const matchCampaign =
      !filterCampaign ||
      filterCampaign === "ALL" ||
      item.campaignId === filterCampaign ||
      item.campaignID === filterCampaign;
  
    const matchStatus =
      !filterStatus ||
      filterStatus === "ALL" ||
      item.status?.toLowerCase() === filterStatus;
  
    return matchCampaign && matchStatus;
  });
  /* ================= PAGINATION ================= */
  const paginated = filteredList.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  /* ================= STATUS ================= */
  const renderStatus = (status) => {
    const map = {
      // EN
      accepted: { text: "Đã nhận", color: "blue" },
      rejected: { text: "Từ chối", color: "red" },
      "in progress": { text: "Đang phát", color: "processing" },
      completed: { text: "Hoàn thành", color: "green" },
  
      // VI (🔥 thêm)
      "đã nhận": { text: "Đã nhận", color: "blue" },
      "từ chối": { text: "Từ chối", color: "red" },
      "đang phát": { text: "Đang phát", color: "processing" },
      "hoàn thành": { text: "Hoàn thành", color: "green" },
    };
  
    const key = String(status || "")
      .trim()
      .toLowerCase();
  
    const s = map[key] || {
      text: status || "Không rõ",
      color: "default",
    };
  
    return <Tag color={s.color}>{s.text}</Tag>;
  };

  /* ================= UI ================= */
  return (
    <section className="rm-container">

      <div className="rm-header-fixed">
        <h3>Lịch sử cứu trợ</h3>
        <span style={{ color: "white", fontSize: 20 }}>
        {filteredList.length} đợt
        </span>
      </div>
      <div style={{ padding: 10, display: "flex", gap: 10 }}>

<Select
  allowClear
  showSearch
  placeholder=" Chọn chiến dịch"
  options={campaignOptions}
  value={filterCampaign}
  onChange={setFilterCampaign}
  style={{ width: "50%" }}
/>

<Select
  allowClear
  placeholder=" Trạng thái"
  options={statusOptions}
  value={filterStatus}
  onChange={setFilterStatus}
  style={{ width: "50%" }}
/>

</div>
      <div className="rm-list-scroll">

        {loading && (
          <div className="rm-loading">
            <Spin size="large" />
            <p>Đang tải...</p>
          </div>
        )}

        {!loading && list.length === 0 && (
          <p className="rm-empty">Không có dữ liệu</p>
        )}

        {paginated.map(item => {

          const campaign =
            campaignMap[item.campaignId] ||
            campaignMap[item.campaignID];

          return (
            <div key={item.distributionId} className="rm-card">

              {/* TOP */}
              <div className="rm-top">
                <div className="rm-avatar">
                  #{item.distributionId}
                </div>

                <div>
                  <h4>
                    Tên chiến dịch: {campaign?.campaignName || `Chiến dịch ${item.campaignId}`}
                  </h4>

                  <div className="rm-campaign-info">
                    <span className="rm-date">
                      Lịch: {campaign
                        ? `Tháng ${campaign.month}/${campaign.year}`
                        : "Không rõ"}
                    </span>
                  </div>

                  <span>
                    Tên đội: {teamMap[item.rescueTeamId] || `Team ${item.rescueTeamId}`}
                  </span>
                </div>
              </div>

              {/* NOTE */}
              <div className="rm-address">
                Ghi chú: {item.note || "Không có"}
              </div>

              {/* META */}
              <div className="rm-meta">
                <div className="rm-status-wrap">
                  <span className="rm-status-label">Trạng thái:</span>
                  {renderStatus(item.status)}
                </div>

                <span className="time">
                  ⏱Thời gian: {new Date(item.distributedAt).toLocaleString("vi-VN")}
                </span>
              </div>

              {item.status?.toLowerCase() === "completed" && (
  <div style={{ marginTop: 12, textAlign: "right" }}>
    <button
      className="rm-btn-detail"
      onClick={() =>
        navigate(`/rescueTeam/chi-tiet-tro/${item.distributionId}`)
      }
    >
      Xem chi tiết →
    </button>
  </div>
)}
            </div>
          );
        })}
      </div>

      {/* PAGINATION */}
      {filteredList.length > pageSize && (
  <Pagination
    current={currentPage}
    pageSize={pageSize}
    total={filteredList.length}
    onChange={setCurrentPage}
  />
)}

    </section>
  );
}