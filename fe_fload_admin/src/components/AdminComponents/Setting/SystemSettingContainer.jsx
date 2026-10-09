import { useEffect, useMemo, useState } from "react";
import { Button, Input, Switch, message, Tabs, Table, Modal, Form, Popconfirm, Space, Card, Spin, Tag } from "antd";
import { SaveOutlined, ReloadOutlined, PlusOutlined, SettingOutlined, WarningOutlined } from "@ant-design/icons";
import "../../../pages/Admin/Setting/SystemSetting.css";
import {
  getAllSystemConfigurations,
  updateSystemConfiguration,
  seedSystemConfigurations
} from "../../../../api/axios/AdminApi/SystemConfigurations/systemConfigurationsApi";
import {
  getAllUrgencyLevels,
  createUrgencyLevel,
  updateUrgencyLevel,
  deleteUrgencyLevel,
  getAllRequestLogs
} from "../../../../api/axios/AdminApi/RescueRequests/rescueRequestsApi";
import "../../../pages/Admin/Setting/SystemSetting.css";

export default function SystemSettingContainer() {
  const [configs, setConfigs] = useState([]);
  const [urgencyLevels, setUrgencyLevels] = useState([]);
  const [requestLogs, setRequestLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState("system");
  const [activeConfigTab, setActiveConfigTab] = useState("");

  // Request Log Filter State
  const [logRequestId, setLogRequestId] = useState("");

  // Urgency Level Modal State
  const [isUrgencyModalVisible, setIsUrgencyModalVisible] = useState(false);
  const [editingUrgency, setEditingUrgency] = useState(null);
  const [form] = Form.useForm();

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const data = await getAllSystemConfigurations();
      setConfigs(data || []);
      if (data && data.length > 0 && !activeConfigTab) {
        setActiveConfigTab(data[0].configGroup);
      }
    } catch (error) {
      console.error("Fetch configs failed:", error);
      message.error("Không thể tải cấu hình hệ thống");
    } finally {
      setLoading(false);
    }
  };

  const fetchUrgencyLevels = async () => {
    try {
      setLoading(true);
      const data = await getAllUrgencyLevels();
      setUrgencyLevels(data || []);
    } catch (error) {
      console.error("Fetch urgency levels failed:", error);
      message.error("Không thể tải danh sách cấp độ khẩn cấp");
    } finally {
      setLoading(false);
    }
  };

  const fetchRequestLogs = async (id = "") => {
    try {
      setLoading(true);
      const data = await getAllRequestLogs(id || null);
      setRequestLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch request logs failed:", error);
      message.error("Không thể tải nhật ký yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
    fetchUrgencyLevels();
    fetchRequestLogs();
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
      message.success(`Đã cập nhật: ${configKey}`);
      fetchConfigs();
    } catch {
      message.error(`Cập nhật thất bại: ${configKey}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    try {
      setLoading(true);
      await seedSystemConfigurations();
      message.success("Đã nạp cấu hình mặc định");
      fetchConfigs();
    } catch {
      message.error("Nạp cấu hình mặc định thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleUrgencySubmit = async (values) => {
    try {
      setLoading(true);
      if (editingUrgency) {
        await updateUrgencyLevel(editingUrgency.urgencyLevelId, values);
        message.success("Cập nhật cấp độ khẩn cấp thành công");
      } else {
        await createUrgencyLevel(values);
        message.success("Tạo mới cấp độ khẩn cấp thành công");
      }
      setIsUrgencyModalVisible(false);
      setEditingUrgency(null);
      fetchUrgencyLevels();
    } catch {
      message.error("Thao tác thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUrgency = async (id) => {
    try {
      setLoading(true);
      await deleteUrgencyLevel(id);
      message.success("Xóa cấp độ khẩn cấp thành công");
      fetchUrgencyLevels();
    } catch {
      message.error("Xóa thất bại");
    } finally {
      setLoading(false);
    }
  };

  const configGroups = useMemo(() => {
    const groups = [...new Set(configs.map((c) => c.configGroup))];
    return groups.sort();
  }, [configs]);

  const urgencyColumns = [
    { title: "Tên cấp độ", dataIndex: "levelName", key: "levelName", width: "25%" },
    { title: "Mô tả", dataIndex: "description", key: "description", width: "45%" },
    { title: "SLA (Phút)", dataIndex: "slaMinutes", key: "slaMinutes", width: "15%" },
    {
      title: "Thao tác",
      key: "action",
      width: "15%",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            onClick={() => {
              setEditingUrgency(record);
              setIsUrgencyModalVisible(true);
              form.setFieldsValue(record);
            }}
          >
            Sửa
          </Button>

        </Space>
      ),
    },
  ];

  const getUnit = (key) => {
    key = key.toUpperCase();
    if (key === "SCORE_VICTIM_1" || key === "SCORE_VICTIM_2") return "Người";
    if (key.includes("SCORE")) return "Điểm";
    if (key.includes("PRIORITY")) return "Điểm";
    if (key === "SLA_LEVELS") return "Điểm";
    if (key.includes("TIME") || key.includes("MINUTE") || key.includes("SLA") || key.includes("TIMEOUT")) return "Phút";
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
          onChange={(checked) => handleUpdateConfig(config.configKey, String(checked), config.configGroup, config.description)}
          loading={loading}
        />
      );
    }

    const unit = getUnit(config.configKey);

    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Input.Search
          defaultValue={val}
          enterButton={<SaveOutlined />}
          onSearch={(value) => handleUpdateConfig(config.configKey, value, config.configGroup, config.description)}
          loading={loading}
          style={{ flex: 1 }}
        />
        {unit && <span style={{ whiteSpace: "nowrap", color: "#555", fontWeight: 500, minWidth: "40px" }}>{unit}</span>}
      </div>
    );
  };

  const mainTabs = [
    {
      key: "system",
      label: (
        <span>
          <SettingOutlined /> Cấu hình Hệ thống
        </span>
      ),
      children: (
        <div className="system-config-container">
          {configGroups.length > 0 ? (
            <Tabs
              tabPosition="left"
              activeKey={activeConfigTab}
              onChange={setActiveConfigTab}
              className="config-sub-tabs"
              items={configGroups.map((group) => ({
                key: group,
                label: group.toUpperCase(),
                children: (
                  <div className="config-group-content">
                    <Card title={`Nhóm: ${group.toUpperCase()}`} variant="borderless">
                      {configs
                        .filter((c) => c.configGroup === group)
                        .sort((a, b) => {
                          const order = {
                            LOW_SCORE: 1,
                            MEDIUM_SCORE: 2,
                            HIGH_SCORE: 3,
                          };
                          return (order[a.configKey] || 99) - (order[b.configKey] || 99);
                        })
                        .map((config) => (
                          <div key={config.configKey} className="config-item">
                            <div className="config-info">
                              <h4>{config.description || config.configKey}</h4>
                              <code>{config.configKey}</code>
                            </div>
                            <div className="config-input">
                              {renderConfigField(config)}
                            </div>
                          </div>
                        ))}
                    </Card>
                  </div>
                ),
              }))}
            />
          ) : (
            <div className="empty-state" style={{ textAlign: "center", padding: "40px" }}>
              <Spin spinning={loading}>
                {!loading && (
                  <>
                    <p>Không có dữ liệu cấu hình. Vui lòng nạp mặc định hoặc kiểm tra kết nối.</p>
                    <Button type="primary" onClick={handleSeed}>Nạp Cấu hình Mặc định</Button>
                  </>
                )}
              </Spin>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "urgency",
      label: (
        <span>
          <WarningOutlined /> Cấp độ Khẩn cấp
        </span>
      ),
      children: (
        <div className="urgency-management">
          <Card
            title="Danh sách Cấp độ Khẩn cấp"
          // extra={
          //   <Button type="primary" icon={<PlusOutlined />} onClick={() => {
          //     setEditingUrgency(null);
          //     setIsUrgencyModalVisible(true);
          //   }}>
          //     THÊM CẤP ĐỘ
          //   </Button>
          // }
          >
            <Table
              dataSource={urgencyLevels}
              columns={urgencyColumns}
              rowKey="urgencyLevelId"
              loading={loading}
              pagination={false}
            />
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div className="system-setting-page">
      <div className="page-header">
        <div>
          <h2>Quản trị Hệ thống</h2>
          <p>Quản lý các thông số vận hành và cấp độ khẩn cấp toàn hệ thống</p>
        </div>
        <div className="header-actions">
          <Button icon={<ReloadOutlined />} onClick={() => { fetchConfigs(); fetchUrgencyLevels(); }} loading={loading}>
            Làm mới
          </Button>
          <Popconfirm
            title="Nạp lại cấu hình mặc định?"
            description="Tất cả thay đổi hiện tại sẽ bị xóa và ghi đè bằng giá trị mặc định."
            onConfirm={handleSeed}
            okText="Xác nhận"
            cancelText="Hủy"
          >
            <Button danger icon={<ReloadOutlined />}>Nạp Mặc định</Button>
          </Popconfirm>
        </div>
      </div>

      <div className="main-tabs-container">
        <Tabs
          activeKey={activeMainTab}
          onChange={setActiveMainTab}
          items={mainTabs}
          type="card"
          className="premium-tabs"
        />
      </div>

      <Modal
        title={editingUrgency ? "Chỉnh sửa Cấp độ" : "Thêm Cấp độ Mới"}
        open={isUrgencyModalVisible}
        onCancel={() => { setIsUrgencyModalVisible(false); setEditingUrgency(null); }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          initialValues={{ levelName: "", description: "", slaMinutes: 30 }}
          onFinish={handleUrgencySubmit}
          layout="vertical"
        >
          <Form.Item name="levelName" label="Tên cấp độ" rules={[{ required: true }]}>
            <Input placeholder="Ví dụ: Cấp độ 1" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="slaMinutes" label="SLA (Phút)" rules={[{ required: true }]}>
            <Input type="number" min={1} />
          </Form.Item>
          <div className="modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
            <Button onClick={() => setIsUrgencyModalVisible(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Lưu thay đổi
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
