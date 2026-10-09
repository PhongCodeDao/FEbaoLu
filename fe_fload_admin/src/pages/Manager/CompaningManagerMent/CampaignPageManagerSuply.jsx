import { useEffect, useMemo, useState } from "react";
import { Table, Tag, Input, Select, Button } from "antd";

import {
  getAllAidCampaigns,
} from "../../../../api/axios/AdminApi/suplyingApi";

import AuthNotify from "../../../utils/Common/AuthNotify";
import { useNavigate } from "react-router-dom";

import "./CampaignPageManagerSuply.css";

export default function CampaignPageManagerSuply() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ================= FILTER =================
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [monthFilter, setMonthFilter] = useState(null);
  const [yearFilter, setYearFilter] = useState(null);

  /* ================= LOAD ================= */

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await getAllAidCampaigns();

      const data =
        res?.items ||
        res?.data ||
        res ||
        [];

      setList(data);

    } catch {
      AuthNotify.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= STATUS ================= */

  const renderStatus = (status) => {
    const map = {
      accepted: { text: "Đã nhận", color: "blue" },
      rejected: { text: "Từ chối", color: "red" },
      "in progress": { text: "Đang thực hiện", color: "processing" },
      completed: { text: "Hoàn thành", color: "green" },

      pending: { text: "Đang chờ", color: "gold" },
      active: { text: "Đang hoạt động", color: "blue" },

      "đã nhận": { text: "Đã nhận", color: "blue" },
      "từ chối": { text: "Từ chối", color: "red" },
      "đang thực hiện": { text: "Đang thực hiện", color: "processing" },
      "hoàn thành": { text: "Hoàn thành", color: "green" },
    };

    const key = status?.toLowerCase()?.trim();

    const s = map[key] || {
      text: status || "Không rõ",
      color: "default",
    };

    return <Tag color={s.color}>{s.text}</Tag>;
  };

  const getStatusText = (status) => {
    const map = {
      accepted: { text: "Đã nhận" },
      rejected: { text: "Từ chối" },
      "in progress": { text: "Đang thực hiện" },
      completed: { text: "Hoàn thành" },
      pending: { text: "Đang chờ" },
      active: { text: "Đang hoạt động" },
      "đã nhận": { text: "Đã nhận" },
      "từ chối": { text: "Từ chối" },
      "đang thực hiện": { text: "Đang thực hiện" },
      "hoàn thành": { text: "Hoàn thành" },
    };

    const key = status?.toLowerCase?.()?.trim?.();
    return map[key]?.text || status || "Không rõ";
  };

  const monthOptions = useMemo(() => {
    const months = Array.from(new Set(list.map((x) => x.month).filter((m) => m != null)));
    return months.sort((a, b) => Number(a) - Number(b)).map((m) => ({
      value: m,
      label: `Tháng ${m}`,
    }));
  }, [list]);

  const yearOptions = useMemo(() => {
    const years = Array.from(new Set(list.map((x) => x.year).filter((y) => y != null)));
    return years.sort((a, b) => Number(b) - Number(a)).map((y) => ({
      value: y,
      label: `${y}`,
    }));
  }, [list]);

  const statusOptions = useMemo(() => {
    const statuses = Array.from(new Set(list.map((x) => x.status).filter((s) => s != null)));
    return statuses.map((s) => ({ value: s, label: getStatusText(s) }));
  }, [list]);

  const filteredList = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((r) => {
      const matchesQuery =
        !q ||
        String(r.campaignID ?? "").toLowerCase().includes(q) ||
        String(r.campaignName ?? "").toLowerCase().includes(q) ||
        String(r.adminName ?? "").toLowerCase().includes(q) ||
        String(r.month ?? "").toLowerCase().includes(q) ||
        String(r.year ?? "").toLowerCase().includes(q);

      const matchesStatus = statusFilter == null || r.status === statusFilter;
      const matchesMonth = monthFilter == null || r.month === monthFilter;
      const matchesYear = yearFilter == null || r.year === yearFilter;

      return matchesQuery && matchesStatus && matchesMonth && matchesYear;
    });
  }, [list, query, statusFilter, monthFilter, yearFilter]);

  /* ================= TABLE ================= */

  const columns = [
    {
      title: "ID",
      dataIndex: "campaignID",
      width: 80,
    },
    {
      title: "Tên chiến dịch",
      dataIndex: "campaignName",
      render: (text, record) => (
        <span
          className="link"
          onClick={() =>
            navigate(`/manager/ke-hoach-cuu-tro/${record.campaignID}`)
          }
        >
          {text}
        </span>
      ),
    },
    {
      title: "Thời gian",
      render: (_, record) =>
        `Tháng ${record.month}/${record.year}`,
    },
    {
      title: "Người tạo",
      dataIndex: "adminName",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      render: (date) =>
        new Date(date).toLocaleString("vi-VN"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: renderStatus,
    },
  ];

  /* ================= UI ================= */

  return (
    <div className="campaign-page">

      {/* HEADER */}
      <div className="campaign-header">
        <div className="left">
          <h2>Danh sách chiến dịch</h2>

          <span className="count">
            {filteredList.length} chiến dịch
          </span>
        </div>
      </div>

      {/* FILTER BAR */}
      <div style={{ marginBottom: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Input
          allowClear
          placeholder="Tìm theo ID / tên / người tạo"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: 280 }}
        />
        <Select
          allowClear
          placeholder="Trạng thái"
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 200 }}
          options={statusOptions}
          showSearch
          optionFilterProp="label"
        />
        <Select
          allowClear
          placeholder="Tháng"
          value={monthFilter}
          onChange={setMonthFilter}
          style={{ width: 150 }}
          options={monthOptions}
        />
        <Select
          allowClear
          placeholder="Năm"
          value={yearFilter}
          onChange={setYearFilter}
          style={{ width: 120 }}
          options={yearOptions}
        />
        <Button
          onClick={() => {
            setQuery("");
            setStatusFilter(null);
            setMonthFilter(null);
            setYearFilter(null);
          }}
        >
          Xóa filter
        </Button>
      </div>

      {/* TABLE */}
      <Table
        rowKey="campaignID"
        columns={columns}
        dataSource={filteredList}
        loading={loading}
        pagination={{
          pageSize: 6,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} chiến dịch`,
        }}
      />

    </div>
  );
}