import "./DistributionListRescue.css";
import { useEffect, useState } from "react";
import { Pagination, Spin, Tag, Select } from "antd";
import { useNavigate } from "react-router-dom";
import {
  getRescueTeamMembers,
  getAllRescueTeams,
  getAllDistributions,
  updateDistributionStatus,
  getAllAidCampaigns
} from "../../../../api/axios/RescueApi/RescueTask";
import { Modal, Input } from "antd";
import AuthNotify from "../../../utils/Common/AuthNotify";

export default function DistributionListRescue() {

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [teamMap, setTeamMap] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
const [selectedId, setSelectedId] = useState(null);
const [actionType, setActionType] = useState(""); // Completed | Rejected
const [campaignMap, setCampaignMap] = useState({});
const [selectedCampaign, setSelectedCampaign] = useState("");
const [selectedStatus, setSelectedStatus] = useState("");
const [note, setNote] = useState("");
  const navigate = useNavigate();
  const pageSize = 3;
  const campaignOptions = Object.values(campaignMap);

  const openModal = (id, type) => {
    setSelectedId(id);
    setActionType(type);
    setNote("");
    setModalVisible(true);
  };
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
  
      // 🔥 lấy danh sách team
      const teamRes = await getAllRescueTeams();
      const teams = teamRes?.data?.items || [];
  // 🔥 lấy campaign
const campaigns = await getAllAidCampaigns();

const cmap = {};
campaigns.forEach(c => {
  cmap[c.campaignID] = c;
});

setCampaignMap(cmap);

      // 🔥 map id -> name
      const map = {};
      teams.forEach(t => {
        map[t.rcid] = t.rcName;
      });
      setTeamMap(map);
  
      // 🔥 tìm team của user
      const myTeamId = await findMyTeamId(teams, user.userId);
  
      if (!myTeamId) {
        setList([]);
        return;
      }
  
      // 🔥 gọi API distribution
      const data = await getAllDistributions();
  
      const myList = data
      .filter(d => d.rescueTeamId === myTeamId)
      .filter(d => {
        const status = d.status?.toLowerCase();
    
        // ❌ loại rejected + completed
        return status !== "rejected" && status !== "completed";
      })
      .sort((a, b) => new Date(b.distributedAt) - new Date(a.distributedAt));
  
      setList(myList);
  
    } catch (err) {
      console.error("Load distribution error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    
    try {
  
      if (actionType === "Rejected" && !note) {
        AuthNotify.warning("Phải nhập lý do từ chối");
        return;
      }
  
      await updateDistributionStatus(selectedId, {
        status: actionType,
        note: note || "Không có ghi chú"
      });
  
      setModalVisible(false);
  
      // ✅ ACCEPT → chuyển trang
      if (actionType === "Accepted") {
        AuthNotify.success("Đã nhận nhiệm vụ");
  
        navigate(`/rescueTeam/chi-tiet-tro/${selectedId}`);
        return;
      }
  
      // ✅ REJECT → xoá khỏi list
      if (actionType === "Rejected") {
        AuthNotify.success("Đã từ chối");
  
        setList(prev =>
          prev.filter(x => x.distributionId !== selectedId)
        );
        return;
      }
  
      fetchDistributions();
  
    } catch (err) {
      console.error(err);
      AuthNotify.error("Cập nhật thất bại");
    }
  };
  useEffect(() => {
    fetchDistributions();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [list]);


  const statusOptions = [
    { value: "pending", label: "Đang chờ" },
    { value: "accepted", label: "Đã nhận" },
    { value: "in progress", label: "Đang phát" },

  ];

  /* ================= PAGINATION ================= */

  const filteredList = list.filter(item => {
    const matchCampaign =
      !selectedCampaign ||
      item.campaignId === selectedCampaign ||
      item.campaignID === selectedCampaign;
  
    const matchStatus =
      !selectedStatus ||
      item.status?.toLowerCase() === selectedStatus;
  
    return matchCampaign && matchStatus;
  });
  
  const paginated = filteredList.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  /* ================= STATUS ================= */
  const renderStatus = (status) => {
    const map = {
      pending: { text: "Đang chờ", color: "gold" },
      accepted: { text: "Đã nhận", color: "blue" },
      "in progress": { text: "Đang phát", color: "processing" },
      completed: { text: "Hoàn thành", color: "green" },
      rejected: { text: "Từ chối", color: "red" },
    };
  
    const key = status?.toLowerCase()?.trim();
  
    const s = map[key] || {
      text: status || "Không xác định",
      color: "default",
    };
  
    return <Tag color={s.color}>{s.text}</Tag>;
  };

  /* ================= UI ================= */

  return (
    <section className="rm-container">
  
      <div className="rm-header-fixed">
        <h3>Danh sách cứu trợ</h3>
        <span style={{ color: "white", fontSize: 20 }}>
        {filteredList.length} đợt
        </span>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>

{/* Filter campaign */}
<div className="rm-filter">
  
  <div className="rm-filter__item rm-filter__item--campaign">
    <Select
      placeholder="Chọn chiến dịch"
      allowClear
      className="rm-filter__select"
      onChange={(value) => setSelectedCampaign(value)}
      options={campaignOptions.map(c => ({
        value: c.campaignID,
        label: c.campaignName
      }))}
    />
  </div>

  <div className="rm-filter__item rm-filter__item--status">
    <Select
      placeholder="Chọn trạng thái"
      allowClear
      className="rm-filter__select"
      onChange={(value) => setSelectedStatus(value)}
      options={statusOptions}
    />
  </div>

</div>

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
  
              {/* ===== TOP ===== */}
              <div
  className="rm-top"
  style={{ cursor: "pointer" }}
  onClick={() =>
    navigate(`/rescueTeam/cuu-tro/${item.campaignId || item.campaignID}`)
  }
>
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
              {/* ===== NOTE ===== */}
              <div className="rm-address">
                Ghi chú: {item.note || "Không có"}
              </div>
  
              {/* ===== META ===== */}
              <div className="rm-meta">
              <div className="rm-status-wrap">
  <span className="rm-status-label">Trạng thái:</span>

  <span className={`status-badge ${item.status?.toLowerCase()}`}>
  {renderStatus(item.status)}
  </span>
</div>
  
                <span className="time">
                  ⏱Thời gian tạo chiến dịch: {new Date(item.distributedAt).toLocaleString("vi-VN")}
                </span>
              </div>
  
              {/* ===== ACTION ===== */}
              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10
                }}
              >
  
                {/* LEFT */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
  
                  {item.status?.toLowerCase() === "pending" && (
                    <>
                      <button
                        className="rm-btn success"
                        onClick={() => openModal(item.distributionId, "Accepted")}
                      >
                        ✔ Nhận nhiệm vụ
                      </button>
  
                      <button
                        className="rm-btn danger"
                        onClick={() => openModal(item.distributionId, "Rejected")}
                      >
                        ✖ Từ chối nhiệm vụ
                      </button>
                    </>
                  )}
  
                </div>
  
                {/* RIGHT */}
                <button
  className="rm-btn-detail"
  style={{
    whiteSpace: "nowrap",
    minWidth: "120px"
  }}
  onClick={() =>
    ["accepted", "in progress"].includes(item.status?.toLowerCase())
      ? navigate(`/rescueTeam/chi-tiet-tro/${item.distributionId}`)
      : navigate(`/rescueTeam/cuu-tro/${item.distributionId}`)
  }
>
  {["accepted", "in progress"].includes(item.status?.toLowerCase())
    ? "Xem quá trình →"
    : "Xem chi tiết →"}
</button>
  
              </div>
  
            </div>
          );
        })}
  
      </div>
  
      {/* PAGINATION */}
      {list.length > pageSize && (
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={list.length}
            onChange={setCurrentPage}
          />
        </div>
      )}
  
      {/* MODAL */}
      <Modal
        title={
          actionType === "Completed"
            ? "Hoàn thành nhiệm vụ"
            : "Từ chối nhiệm vụ"
        }
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <p>Nhập ghi chú:</p>
  
        <Input.TextArea
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Nhập ghi chú..."
        />
      </Modal>
  
    </section>
  );
}