import { useMemo, useState } from "react";
import { Button, Checkbox, Input, message, Space, Tabs } from "antd";
import "../../../pages/Admin/Permissions/Permissions.css";

const ROLES = ["admin", "manager", "coordinator", "rescue"];

const FEATURES = [
  { id: "dispatch", name: "Điều phối / Phân công", actions: ["view", "assign", "update", "delete"] },
  { id: "reports", name: "Báo cáo", actions: ["view", "export"] },
  { id: "inventory", name: "Kho hàng", actions: ["view", "update", "deduct"] },
  { id: "requests", name: "Yêu cầu cứu hộ", actions: ["create", "view", "update", "close"] },
  { id: "settings", name: "Cấu hình hệ thống", actions: ["view", "update"] },
  { id: "logs", name: "Logs hệ thống", actions: ["view", "clear"] },
];

function readRoleMatrix() {
  try {
    const raw = localStorage.getItem("system_configs");
    const parsed = raw ? JSON.parse(raw) : [];
    const item = (parsed || []).find((c) => c.key === "ROLE_PERMISSION_MATRIX");
    if (item && typeof item.value === "object") return item.value;
  } catch {
    // ignore
  }
  // default empty matrix
  const mat = {};
  ROLES.forEach((r) => {
    mat[r] = {};
    FEATURES.forEach((f) => (mat[r][f.id] = []));
  });
  return mat;
}

function saveRoleMatrix(matrix) {
  const raw = localStorage.getItem("system_configs");
  const configs = raw ? JSON.parse(raw) : [];
  const idx = configs.findIndex((c) => c.key === "ROLE_PERMISSION_MATRIX");
  if (idx >= 0) configs[idx].value = matrix;
  else configs.push({ key: "ROLE_PERMISSION_MATRIX", name: "ROLE_PERMISSION_MATRIX – Ma trận quyền", type: "json", value: matrix, group: "permission" });
  localStorage.setItem("system_configs", JSON.stringify(configs));
}

function pushLog(entry) {
  const raw = localStorage.getItem("system_logs");
  const arr = raw ? JSON.parse(raw) : [];
  arr.unshift(entry);
  localStorage.setItem("system_logs", JSON.stringify(arr));
}

export default function PermissionsContainer() {
  const [matrix, setMatrix] = useState(() => readRoleMatrix());
  const [username, setUsername] = useState("");
  const [activeRole, setActiveRole] = useState("admin");
  const [userOverrides, setUserOverrides] = useState(() => {
    const raw = localStorage.getItem("user_permissions");
    return raw ? JSON.parse(raw) : {};
  });

  const handleToggle = (role, featureId, action, checked) => {
    setMatrix((prev) => {
      const copy = { ...prev };
      copy[role] = { ...copy[role] };
      const arr = new Set(copy[role][featureId] || []);
      if (checked) arr.add(action);
      else arr.delete(action);
      copy[role][featureId] = Array.from(arr);
      return copy;
    });
  };

  const handleSaveMatrix = () => {
    saveRoleMatrix(matrix);
    const actor = localStorage.getItem("role") || "system";
    pushLog({ id: Date.now(), time: new Date().toISOString(), level: "INFO", user: actor, message: `Cập nhật ma trận quyền` });
    message.success("Lưu ma trận quyền thành công");
  };

  const handleSaveUserOverride = () => {
    if (!username) return message.error("Nhập username để lưu override");
    const newOverrides = { ...userOverrides, [username]: matrix };
    setUserOverrides(newOverrides);
    localStorage.setItem("user_permissions", JSON.stringify(newOverrides));
    const actor = localStorage.getItem("role") || "system";
    pushLog({ id: Date.now(), time: new Date().toISOString(), level: "INFO", user: actor, message: `Gán quyền đặc biệt cho user=${username}` });
    message.success("Lưu override cho user thành công");
  };

  const handleLoadUser = () => {
    if (!username) return message.error("Nhập username để load override");
    const u = userOverrides[username];
    if (u) setMatrix(u);
    else message.info("Không tìm thấy override cho user này");
  };

  const featureRows = useMemo(() => FEATURES, []);

  const tabItems = ROLES.map((role) => ({
    key: role,
    label: role.charAt(0).toUpperCase() + role.slice(1),
    children: (
      <div className="role-permissions">
        <div className="permissions-list">
          {featureRows.map((feature) => (
            <div key={feature.id} className="permission-item">
              <div className="permission-header">
                <div className="permission-label">
                  <h4>{feature.name}</h4>
                  <p className="permission-feature-id">{feature.id}</p>
                </div>
              </div>
              <div className="permission-actions">
                <div className="actions-row">
                  {feature.actions.map((action) => {
                    const checked = (matrix[role] && matrix[role][feature.id] || []).includes(action);
                    return (
                      <label className="action-item" key={action}>
                        <Checkbox
                          checked={checked}
                          onChange={(e) => handleToggle(role, feature.id, action, e.target.checked)}
                        />
                        <span className="action-label">{action}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="permission-action">
                <Button
                  type="text"
                  size="small"
                  onClick={handleSaveMatrix}
                  className="save-btn"
                >
                  Lưu
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  }));

  return (
    <div className="permissions-page">
      <div className="page-header">
        <div>
          <h2>Quản lý Phân quyền</h2>
          <p>Cấu hình chi tiết quyền hạn theo role, chức năng và hành động</p>
        </div>
      </div>

      <div className="permissions-container">
        <div className="user-override-section">
          <div className="override-header">
            <h3>Quyền đặc biệt cho User</h3>
            <div className="override-actions">
              <Space>
                <Input
                  placeholder="Nhập username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ width: 200 }}
                />
                <Button onClick={handleLoadUser}>Tải quyền</Button>
                <Button onClick={handleSaveUserOverride} type="default">
                  Lưu đặc biệt
                </Button>
              </Space>
            </div>
          </div>
        </div>

        <div className="matrix-box">
          <Tabs
            activeKey={activeRole}
            onChange={setActiveRole}
            items={tabItems}
            className="permissions-tabs"
          />
        </div>
      </div>
    </div>
  );
}
