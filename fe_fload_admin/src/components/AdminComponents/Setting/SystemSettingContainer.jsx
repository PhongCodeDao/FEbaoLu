import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Input,
  Switch,
  Tabs,
  Table,
  Modal,
  Form,
  Popconfirm,
  Space,
  Card,
  Spin,
  Tag,
  Tooltip,
} from "antd";
import {
  SaveOutlined,
  ReloadOutlined,
  SettingOutlined,
  WarningOutlined,
  EditOutlined,
  ControlOutlined,
  FieldTimeOutlined,
  SlidersOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import "../../../pages/Admin/Setting/SystemSetting.css";
import {
  getAllSystemConfigurations,
  updateSystemConfiguration,
  seedSystemConfigurations,
} from "../../../../api/axios/AdminApi/SystemConfigurations/systemConfigurationsApi";
import {
  getAllUrgencyLevels,
  updateUrgencyLevel,
} from "../../../../api/axios/AdminApi/RescueRequests/rescueRequestsApi";
import AuthNotify from "../../../utils/Common/AuthNotify";

export default function SystemSettingContainer() {
  const [configs, setConfigs] = useState([]);
  const [urgencyLevels, setUrgencyLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState("system");
  const [activeConfigTab, setActiveConfigTab] = useState("");

  // Urgency Level Modal State
  const [isUrgencyModalVisible, setIsUrgencyModalVisible] = useState(false);
  const [editingUrgency, setEditingUrgency] = useState(null);
  const [form] = Form.useForm();

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const data = await getAllSystemConfigurations();
      const list = Array.isArray(data) ? data : [];
      setConfigs(list);
      if (list.length > 0 && !activeConfigTab) {
        setActiveConfigTab(list[0].configGroup);
      }
    } catch (error) {
      console.error("Fetch configs failed:", error);
      AuthNotify.error("Không thể tải cấu hình hệ thống");
    } finally {
      setLoading(false);
    }
  };

  const fetchUrgencyLevels = async () => {
    try {
      setLoading(true);
      const data = await getAllUrgencyLevels();
      setUrgencyLevels(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch urgency levels failed:", error);
      AuthNotify.error("Không thể tải danh sách cấp độ khẩn cấp");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
    fetchUrgencyLevels();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpdateConfig = async (configKey, configValue, configGroup, description) => {
    try {
      setLoading(true);
      await updateSystemConfiguration(configKey, {
        configKey,
        configValue,
        configGroup,
        description,
      });
      AuthNotify.success(`Đã cập nhật cấu hình: ${configKey}`);
      await fetchConfigs();
    } catch {
      AuthNotify.error(`Cập nhật thất bại: ${configKey}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    try {
      setLoading(true);
      await seedSystemConfigurations();
      AuthNotify.success("Đã nạp lại cấu hình mặc định");
      await fetchConfigs();
    } catch {
      AuthNotify.error("Nạp cấu hình mặc định thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleUrgencySubmit = async (values) => {
    try {
      setLoading(true);
      if (editingUrgency) {
        await updateUrgencyLevel(editingUrgency.urgencyLevelId, values);
        AuthNotify.success("Cập nhật cấp độ khẩn cấp thành công");
      }
      setIsUrgencyModalVisible(false);
      setEditingUrgency(null);
      await fetchUrgencyLevels();
    } catch {
      AuthNotify.error("Thao tác thất bại");
    } finally {
      setLoading(false);
    }
  };

  const configGroups = useMemo(() => {
    const groups = [...new Set(configs.map((c) => c.configGroup))];
    return groups.sort();
  }, [configs]);

  const getUnit = (key) => {
    key = (key || "").toUpperCase();
    if (key === "SCORE_VICTIM_1" || key === "SCORE_VICTIM_2") return "Người";
    if (key.includes("SCORE") || key.includes("PRIORITY") || key === "SLA_LEVELS") return "Điểm";
    if (
      key.includes("TIME") ||
      key.includes("MINUTE") ||
      key.includes("SLA") ||
      key.includes("TIMEOUT")
    )
      return "Phút";
    if (key.includes("DISTANCE") || key.includes("RADIUS")) return "km";
    if (key.includes("PERCENT") || key.includes("RATE") || key.includes("RATIO")) return "%";
    return "";
  };

  const renderConfigField = (config) => {
    const val = config.configValue;
    const isBoolean = val === "true" || val === "false";

    if (isBoolean) {
      return (
        <Switch
          checked={val === "true"}
          onChange={(checked) =>
            handleUpdateConfig(
              config.configKey,
              String(checked),
              config.configGroup,
              config.description
            )
          }
          loading={loading}
        />
      );
    }

    const unit = getUnit(config.configKey);

    return (
      <div className="config-input-wrapper">
        <Input.Search
          defaultValue={val}
          enterButton={
            <Button type="primary" icon={<SaveOutlined />}>
              Lưu
            </Button>
          }
          onSearch={(value) =>
            handleUpdateConfig(config.configKey, value, config.configGroup, config.description)
          }
          loading={loading}
          className="config-search-input"
        />
        {unit && <span className="config-unit-badge">{unit}</span>}
      </div>
    );
  };

  const urgencyColumns = [
    {
      title: "MÃ CẤP ĐỘ",
      dataIndex: "urgencyLevelId",
      width: 110,
      align: "center",
      render: (id) => <span className="urgency-id-tag">Cấp {id}</span>,
    },
    {
      title: "Tên Cấp Độ",
      dataIndex: "levelName",
      width: 220,
      render: (name, record) => {
        const id = record.urgencyLevelId;
        const colorClass = id === 1 ? "red" : id === 2 ? "orange" : id === 3 ? "blue" : "green";
        return (
          <div className="urgency-name-cell">
            <span className={`urgency-bullet ${colorClass}`} />
            <span className="urgency-name-text">{name}</span>
          </div>
        );
      },
    },
    {
      title: "Mô Tả Tiêu Chí",
      dataIndex: "description",
      render: (text) => <span className="urgency-desc-text">{text || "--"}</span>,
    },
    {
      title: "Thời Gian Xử Lý (SLA)",
      dataIndex: "slaMinutes",
      width: 180,
      render: (min) => (
        <div className="urgency-sla-cell">
          <FieldTimeOutlined className="cell-icon" />
          <span>{min} phút</span>
        </div>
      ),
    },
    {
      title: "Thao Tác",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Tooltip title="Chỉnh sửa SLA">
          <button
            className="action-btn edit-btn"
            onClick={() => {
              setEditingUrgency(record);
              setIsUrgencyModalVisible(true);
              form.setFieldsValue(record);
            }}
          >
            <EditOutlined />
          </button>
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="system-setting-page">
      {/* HEADER CARD */}
      <div className="setting-header-card">
        <div className="setting-header-left">
          <div className="setting-badge">
            <span>⚙️ THAM SỐ VẬN HÀNH</span>
          </div>
          <h2 className="setting-title">Cấu Hình & Quản Trị Hệ Thống</h2>
          <p className="setting-subtitle">
            Tinh chỉnh các ngưỡng thuật toán chấm điểm khẩn cấp, thời hạn phản hồi SLA và thông số vận hành
          </p>
        </div>

        <div className="setting-header-actions">
          <Tooltip title="Tải lại cài đặt">
            <Button
              className="refresh-btn"
              icon={<ReloadOutlined spin={loading} />}
              onClick={() => {
                fetchConfigs();
                fetchUrgencyLevels();
              }}
              size="large"
            />
          </Tooltip>

          <Popconfirm
            title="Nạp lại cấu hình mặc định?"
            description="Tất cả thay đổi cấu hình hiện tại sẽ được khôi phục về giá trị mặc định của hệ thống."
            onConfirm={handleSeed}
            okText="Xác nhận"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button danger size="large" icon={<ReloadOutlined />} className="seed-btn">
              Nạp Cấu Hình Mặc Định
            </Button>
          </Popconfirm>
        </div>
      </div>

      {/* MAIN NAVIGATION TABS */}
      <div className="setting-tabs-wrapper">
        <div className="setting-tab-buttons">
          <button
            className={`tab-nav-btn ${activeMainTab === "system" ? "active" : ""}`}
            onClick={() => setActiveMainTab("system")}
          >
            <SlidersOutlined /> Cấu Hình Tham Số ({configs.length})
          </button>
          <button
            className={`tab-nav-btn ${activeMainTab === "urgency" ? "active" : ""}`}
            onClick={() => setActiveMainTab("urgency")}
          >
            <WarningOutlined /> Cấp Độ Khẩn Cấp & SLA ({urgencyLevels.length})
          </button>
        </div>

        {/* TAB 1: SYSTEM PARAMS */}
        {activeMainTab === "system" && (
          <div className="system-tab-content">
            {configGroups.length > 0 ? (
              <div className="config-layout">
                {/* Group Selector Sidebar */}
                <div className="config-group-sidebar">
                  <div className="sidebar-title">
                    <AppstoreOutlined /> Nhóm Tham Số
                  </div>
                  {configGroups.map((group) => {
                    const count = configs.filter((c) => c.configGroup === group).length;
                    return (
                      <div
                        key={group}
                        className={`group-nav-item ${activeConfigTab === group ? "active" : ""}`}
                        onClick={() => setActiveConfigTab(group)}
                      >
                        <span className="group-name">{group.toUpperCase()}</span>
                        <span className="group-count">{count}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Group Items Main Card */}
                <div className="config-group-panel">
                  <div className="panel-header">
                    <div>
                      <h3 className="panel-title">
                        Nhóm: <span>{activeConfigTab.toUpperCase()}</span>
                      </h3>
                      <p className="panel-subtitle">
                        Các tham số thuật toán và quy tắc liên quan đến {activeConfigTab}
                      </p>
                    </div>
                  </div>

                  <div className="config-items-list">
                    {configs
                      .filter((c) => c.configGroup === activeConfigTab)
                      .map((config) => (
                        <div key={config.configKey} className="config-row-card">
                          <div className="config-meta">
                            <h4 className="config-name">
                              {config.description || config.configKey}
                            </h4>
                            <code className="config-key-code">{config.configKey}</code>
                          </div>
                          <div className="config-control">
                            {renderConfigField(config)}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-config-state">
                <Spin spinning={loading}>
                  {!loading && (
                    <div className="empty-box">
                      <ControlOutlined style={{ fontSize: 44, color: "#94a3b8" }} />
                      <p>Chưa có dữ liệu cấu hình</p>
                      <Button type="primary" onClick={handleSeed}>
                        Nạp Cấu Hình Mặc Định
                      </Button>
                    </div>
                  )}
                </Spin>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: URGENCY LEVELS */}
        {activeMainTab === "urgency" && (
          <div className="urgency-tab-content">
            <div className="urgency-card">
              <div className="urgency-card-header">
                <div>
                  <h3 className="card-title">Cấp Độ Khẩn Cấp & Thời Gian Phản Hồi (SLA)</h3>
                  <p className="card-subtitle">
                    Hệ thống tự động phân loại mức độ nguy cấp dựa trên điểm đánh giá và kích hoạt cảnh báo SLA
                  </p>
                </div>
              </div>

              <Table
                dataSource={urgencyLevels}
                columns={urgencyColumns}
                rowKey="urgencyLevelId"
                loading={loading}
                pagination={false}
                className="premium-urgency-table"
              />
            </div>
          </div>
        )}
      </div>

      {/* EDIT URGENCY MODAL */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>⏱️</span>
            <span style={{ fontSize: 16, fontWeight: 700 }}>Chỉnh Sửa Thời Hạn SLA</span>
          </div>
        }
        open={isUrgencyModalVisible}
        onCancel={() => {
          setIsUrgencyModalVisible(false);
          setEditingUrgency(null);
        }}
        footer={null}
        destroyOnClose
        centered
        width={500}
      >
        <Form
          form={form}
          initialValues={{ levelName: "", description: "", slaMinutes: 30 }}
          onFinish={handleUrgencySubmit}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="levelName"
            label="Tên cấp độ"
            rules={[{ required: true, message: "Vui lòng nhập tên cấp độ" }]}
          >
            <Input placeholder="Ví dụ: Cấp độ 1 - Rất khẩn cấp" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả tiêu chuẩn"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <Input.TextArea rows={3} placeholder="Mô tả tình huống áp dụng mức độ này" />
          </Form.Item>

          <Form.Item
            name="slaMinutes"
            label="Thời hạn SLA (Phút)"
            rules={[{ required: true, message: "Vui lòng nhập thời hạn phút" }]}
          >
            <Input type="number" min={1} placeholder="Ví dụ: 30" />
          </Form.Item>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              marginTop: 24,
            }}
          >
            <Button
              onClick={() => {
                setIsUrgencyModalVisible(false);
                setEditingUrgency(null);
              }}
            >
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Lưu thay đổi
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
