import { useEffect, useState, useMemo } from "react";
import {
  Button,
  Popconfirm,
  Table,
  Tag,
  Input,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  CalendarOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ClearOutlined,
} from "@ant-design/icons";

import {
  getAllAidCampaigns,
  deleteAidCampaign,
} from "../../../../api/axios/AdminApi/suplyingApi";

import AuthNotify from "../../../utils/Common/AuthNotify";
import CreateCampaign from "../../../components/AdminComponents/AidSupplyCamping/CreateCamping/CreateCampaign";
import EditCampaign from "../../../components/AdminComponents/AidSupplyCamping/EditCamping/EditCampaign";
import { useNavigate } from "react-router-dom";

import "./CampaignPage.css";

export default function CampaignPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selected, setSelected] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const navigate = useNavigate();

  /* ================= LOAD ================= */
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getAllAidCampaigns();
      const data = res?.items || res?.data || res || [];
      setList(Array.isArray(data) ? data : []);
    } catch {
      AuthNotify.error("Lỗi tải dữ liệu", "Không thể tải danh sách chiến dịch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    try {
      await deleteAidCampaign(id);
      setList((prev) => prev.filter((x) => x.campaignID !== id));
      AuthNotify.success("Đã xóa chiến dịch thành công");
    } catch {
      AuthNotify.error("Xóa thất bại", "Có lỗi xảy ra khi xóa chiến dịch");
    }
  };

  /* ================= STATUS FORMATTER ================= */
  const renderStatus = (status) => {
    const key = status?.toLowerCase()?.trim() || "";
    if (key.includes("hoàn thành") || key.includes("completed")) {
      return (
        <span className="campaign-status-badge completed">
          <CheckCircleOutlined /> Hoàn thành
        </span>
      );
    }
    if (key.includes("đang thực hiện") || key.includes("in progress")) {
      return (
        <span className="campaign-status-badge in-progress">
          <span className="status-ping" /> Đang thực hiện
        </span>
      );
    }
    if (key.includes("từ chối") || key.includes("rejected")) {
      return (
        <span className="campaign-status-badge rejected">
          Từ chối
        </span>
      );
    }
    if (key.includes("đã nhận") || key.includes("accepted")) {
      return (
        <span className="campaign-status-badge accepted">
          Đã nhận
        </span>
      );
    }
    return (
      <span className="campaign-status-badge pending">
        <ClockCircleOutlined /> {status || "Đang chờ"}
      </span>
    );
  };

  /* ================= METRICS ================= */
  const totalCampaigns = list.length;
  const inProgressCampaigns = list.filter((c) => {
    const s = c.status?.toLowerCase() || "";
    return s.includes("đang thực hiện") || s.includes("in progress") || s.includes("đã nhận") || s.includes("accepted");
  }).length;
  const completedCampaigns = list.filter((c) => {
    const s = c.status?.toLowerCase() || "";
    return s.includes("hoàn thành") || s.includes("completed");
  }).length;

  /* ================= FILTERED LIST ================= */
  const filteredList = useMemo(() => {
    return list.filter((item) => {
      // Status filter
      if (statusFilter !== "ALL") {
        const s = item.status?.toLowerCase() || "";
        if (statusFilter === "IN_PROGRESS" && !s.includes("đang thực hiện") && !s.includes("in progress") && !s.includes("đã nhận")) {
          return false;
        }
        if (statusFilter === "COMPLETED" && !s.includes("hoàn thành") && !s.includes("completed")) {
          return false;
        }
        if (statusFilter === "PENDING" && !s.includes("chờ") && !s.includes("pending")) {
          return false;
        }
      }

      // Search keyword
      if (searchTerm.trim()) {
        const key = searchTerm.toLowerCase().trim();
        const matchName = item.campaignName?.toLowerCase().includes(key);
        const matchAdmin = item.adminName?.toLowerCase().includes(key);
        const matchId = String(item.campaignID).includes(key);
        if (!matchName && !matchAdmin && !matchId) return false;
      }

      return true;
    });
  }, [list, statusFilter, searchTerm]);

  /* ================= TABLE COLUMNS ================= */
  const columns = [
    {
      title: "MÃ",
      dataIndex: "campaignID",
      width: 80,
      align: "center",
      render: (id) => <span className="campaign-id-tag">#{id}</span>,
    },
    {
      title: "Tên Chiến Dịch Cứu Trợ",
      dataIndex: "campaignName",
      render: (text, record) => (
        <div
          className="campaign-name-cell"
          onClick={() => navigate(`/admin/chien-dich-cuu-tro/${record.campaignID}`)}
        >
          <div className="campaign-name-icon">📦</div>
          <div className="campaign-name-info">
            <span className="campaign-name-title">{text}</span>
            <span className="campaign-name-hint">Click để xem danh sách người thụ hưởng</span>
          </div>
        </div>
      ),
    },
    {
      title: "Thời Gian",
      width: 160,
      render: (_, record) => (
        <div className="campaign-period-cell">
          <CalendarOutlined className="cell-icon" />
          <span>Tháng {record.month}/{record.year}</span>
        </div>
      ),
    },
    {
      title: "Người Tạo",
      dataIndex: "adminName",
      width: 170,
      render: (name) => (
        <div className="campaign-admin-cell">
          <div className="admin-avatar">
            <UserOutlined />
          </div>
          <span>{name || "Hệ thống"}</span>
        </div>
      ),
    },
    {
      title: "Ngày Tạo",
      dataIndex: "createdAt",
      width: 170,
      render: (date) => (
        <span className="campaign-date-text">
          {date ? new Date(date).toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }) : "--"}
        </span>
      ),
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      width: 160,
      render: renderStatus,
    },
    {
      title: "Hành Động",
      width: 180,
      align: "center",
      render: (_, record) => (
        <div className="campaign-actions" onClick={(e) => e.stopPropagation()}>
          <Tooltip title="Xem người thụ hưởng">
            <button
              className="campaign-action-btn view-btn"
              onClick={() => navigate(`/admin/chien-dich-cuu-tro/${record.campaignID}`)}
            >
              <TeamOutlined />
            </button>
          </Tooltip>

          <Tooltip title="Chỉnh sửa chiến dịch">
            <button
              className="campaign-action-btn edit-btn"
              onClick={() => {
                setSelected(record);
                setOpenEdit(true);
              }}
            >
              <EditOutlined />
            </button>
          </Tooltip>

          <Popconfirm
            title="Xác nhận xóa chiến dịch?"
            description="Bạn có chắc muốn xóa chiến dịch này cùng các dữ liệu liên quan?"
            onConfirm={() => handleDelete(record.campaignID)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa chiến dịch">
              <button className="campaign-action-btn delete-btn">
                <DeleteOutlined />
              </button>
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="campaign-page">
      {/* HEADER */}
      <div className="campaign-header-card">
        <div className="campaign-header-left">
          <div className="campaign-badge">
            <span>📦 KẾ HOẠCH CỨU TRỢ</span>
          </div>
          <h2 className="campaign-title">Quản Lý Chiến Dịch Cứu Trợ</h2>
          <p className="campaign-subtitle">
            Khởi tạo, theo dõi tiến độ và phân phối nguồn lực cứu trợ đến các hộ dân vùng bão lũ
          </p>
        </div>

        <div className="campaign-header-actions">
          <Tooltip title="Tải lại danh sách">
            <Button
              className="refresh-icon-btn"
              icon={<ReloadOutlined spin={loading} />}
              onClick={fetchData}
              size="large"
            />
          </Tooltip>

          <Button
            type="primary"
            className="create-campaign-btn"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setOpenCreate(true)}
          >
            Tạo chiến dịch mới
          </Button>
        </div>
      </div>

      {/* KPI METRICS CARDS */}
      <div className="campaign-metrics-grid">
        <div
          className={`campaign-metric-card total ${statusFilter === "ALL" ? "active" : ""}`}
          onClick={() => setStatusFilter("ALL")}
        >
          <div className="metric-icon-wrap total">
            <FileTextOutlined />
          </div>
          <div className="metric-info">
            <span className="metric-val">{totalCampaigns}</span>
            <span className="metric-lbl">Tổng số chiến dịch</span>
          </div>
        </div>

        <div
          className={`campaign-metric-card in-progress ${statusFilter === "IN_PROGRESS" ? "active" : ""}`}
          onClick={() => setStatusFilter("IN_PROGRESS")}
        >
          <div className="metric-icon-wrap in-progress">
            <ClockCircleOutlined />
          </div>
          <div className="metric-info">
            <span className="metric-val">{inProgressCampaigns}</span>
            <span className="metric-lbl">Đang triển khai</span>
          </div>
        </div>

        <div
          className={`campaign-metric-card completed ${statusFilter === "COMPLETED" ? "active" : ""}`}
          onClick={() => setStatusFilter("COMPLETED")}
        >
          <div className="metric-icon-wrap completed">
            <CheckCircleOutlined />
          </div>
          <div className="metric-info">
            <span className="metric-val">{completedCampaigns}</span>
            <span className="metric-lbl">Đã hoàn thành</span>
          </div>
        </div>
      </div>

      {/* FILTER & CONTROLS BAR */}
      <div className="campaign-controls-bar">
        <div className="search-wrap">
          <Input
            className="campaign-search-input"
            placeholder="Tìm theo tên chiến dịch, người tạo, mã ID..."
            prefix={<SearchOutlined className="search-icon" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
          />
        </div>

        <div className="filter-summary">
          <span className="filter-label">Bộ lọc:</span>
          <span className="filter-chip">
            Trạng thái:{" "}
            <b>
              {statusFilter === "ALL"
                ? "Tất cả"
                : statusFilter === "IN_PROGRESS"
                ? "Đang triển khai"
                : "Hoàn thành"}
            </b>
          </span>
          {searchTerm && (
            <span className="filter-chip">
              Từ khóa: <b>{searchTerm}</b>
            </span>
          )}

          {(statusFilter !== "ALL" || searchTerm) && (
            <Button
              type="link"
              className="clear-filter-btn"
              icon={<ClearOutlined />}
              onClick={() => {
                setStatusFilter("ALL");
                setSearchTerm("");
              }}
            >
              Đặt lại bộ lọc
            </Button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="campaign-table-card">
        <Table
          rowKey="campaignID"
          columns={columns}
          dataSource={filteredList}
          loading={loading}
          pagination={{
            pageSize: 7,
            showSizeChanger: false,
            showTotal: (total) => `Tổng ${total} chiến dịch`,
          }}
          className="premium-campaign-table"
        />
      </div>

      {/* CREATE MODAL */}
      <CreateCampaign
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSuccess={(newItem) => {
          if (!newItem) {
            fetchData();
            return;
          }
          setList((prev) => [newItem, ...prev]);
        }}
      />

      {/* EDIT MODAL */}
      <EditCampaign
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        data={selected}
        onSuccess={fetchData}
      />
    </div>
  );
}