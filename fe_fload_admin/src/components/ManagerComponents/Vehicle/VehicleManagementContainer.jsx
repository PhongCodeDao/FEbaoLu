import { useEffect, useState } from "react";
import "../../../pages/Manager/Vehicle/VehicleManagement.css";
import {
  Button,
  Tag,
  Input,
  Progress,
  Modal,
  message,
  Card,
  Form,
  Select,
  Drawer,
  Pagination,
  Upload,
  Image,
} from "antd";

import {
  SearchOutlined
} from "@ant-design/icons";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  getAllVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  uploadCommonImage,
  updateVehicleImage,
} from "../../../../api/axios/ManagerApi/vehicleApi";
import AuthNotify from "../../../utils/Common/AuthNotify";


export default function VehicleManagementContainer() {

  const [vehicleList, setVehicleList] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const [progressPercent, setProgressPercent] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [form] = Form.useForm();
  const [imageFileList, setImageFileList] = useState([]);
  const MAX_UPLOAD_SIZE_MB = 2;
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedActionVehicle, setSelectedActionVehicle] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const getVehicleId = (vehicle) => vehicle?.id || vehicle?.vehicleId || vehicle?.vehicleID;

  const toAbsoluteImageUrl = (rawUrl, withApiPrefix = false) => {
    if (!rawUrl) return "";
    const clean = String(rawUrl).trim();
    if (!clean || clean === "string" || clean === "/string") return "";
    if (clean.startsWith("http://") || clean.startsWith("https://")) return clean;
    if (!clean.startsWith("/") && !clean.includes("/")) return "";
    const base = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
    const path = clean.startsWith("/") ? clean : `/${clean}`;
    if (withApiPrefix && path.startsWith("/uploads/")) {
      return `${base}/api${path}`;
    }
    return `${base}${path}`;
  };

  const toDevProxiedImageUrl = (rawUrl, withApiPrefix = false) => {
    if (!import.meta.env.DEV) return "";
    if (!rawUrl) return "";
    const clean = String(rawUrl).trim();
    if (!clean || clean === "string" || clean === "/string") return "";
    if (clean.startsWith("http://") || clean.startsWith("https://")) return "";
    const path = clean.startsWith("/") ? clean : `/${clean}`;
    if (withApiPrefix && path.startsWith("/uploads/")) {
      return `/api${path}`; // hits vite proxy "/api/uploads"
    }
    return path; // hits vite proxy "/uploads"
  };

  /* ================= LOAD ================= */

  const loadVehicles = async () => {
    try {
      const res = await getAllVehicles({ q: search });
      setVehicleList(res.data || []);
    } catch {
      message.error("Không tải được vehicles");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadVehicles();
  }, []);

  /* ================= SEARCH ================= */

  const handleSearch = () => {
    setCurrentPage(1);
    loadVehicles();
  };

  /* ================= CREATE ================= */

  const handleCreate = () => {
    setEditingVehicle(null);
    form.resetFields();
    setImageFileList([]);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
  
      // 🔥 chuẩn hóa payload
      const payload = {
        vehicleName: values.vehicleName,
        vehicleType: values.vehicleType,
        vehicleLocation: values.vehicleLocation,
        vehicleStatus: values.vehicleStatus,
      };
  
      let targetVehicleId = null;

      if (editingVehicle) {
        const id = getVehicleId(editingVehicle);
        targetVehicleId = id;
        await updateVehicle(id, payload);
        AuthNotify.success("Cập nhật phương tiện thành công");
      } else {
        const createRes = await createVehicle(payload);
        const createdVehicle = createRes?.data;
        targetVehicleId = getVehicleId(createdVehicle);
        AuthNotify.success("Tạo phương tiện thành công");
      }

      if (imageFileList.length > 0 && targetVehicleId) {
        const fileObj = imageFileList[0]?.originFileObj;
        if (fileObj) {
          try {
            const uploadRes = await uploadCommonImage(fileObj, "vehicles");
            const imageUrl = uploadRes?.data?.url;
            if (imageUrl) {
              await updateVehicleImage(targetVehicleId, imageUrl);
            }
          } catch (uploadErr) {
            const status = uploadErr?.response?.status;
            if (status === 413) {
              AuthNotify.warning(
                "Ảnh quá lớn",
                `Vui lòng chọn ảnh nhỏ hơn ${MAX_UPLOAD_SIZE_MB}MB`
              );
            } else {
              AuthNotify.warning(
                "Upload ảnh thất bại",
                "Phương tiện đã được lưu, nhưng chưa cập nhật ảnh."
              );
            }
          }
        }
      }
  
      setModalVisible(false);
      setEditingVehicle(null);
      form.resetFields();
      setImageFileList([]);
  
      loadVehicles();
  
    } catch (err) {
      console.error(err);
      AuthNotify.error("Lưu thất bại");
    }
  };

  /* ================= EDIT ================= */

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
  
    // 🔥 map field chắc chắn đúng
    form.setFieldsValue({
      vehicleName: vehicle.vehicleName,
      vehicleType: vehicle.vehicleType,
      vehicleLocation: vehicle.vehicleLocation,
      vehicleStatus: vehicle.vehicleStatus,
    });
    setImageFileList([]);
  
    setModalVisible(true);
  };

  /* ================= DELETE ================= */

  const handleDelete = (vehicle) => {
    setSelectedActionVehicle(vehicle);
    setDeleteDialogOpen(true);
  };
  const confirmDeleteVehicle = async () => {
    try {
      const id = selectedActionVehicle?.id || selectedActionVehicle?.vehicleId;
      if (!id) return;

      await deleteVehicle(id);
      AuthNotify.success("Đã xóa phương tiện");
      setVehicleList((prev) => prev.filter((v) => (v.id || v.vehicleId) !== id));
    } catch (err) {
      console.error(err);
      AuthNotify.error("Xóa thất bại");
    } finally {
      setDeleteDialogOpen(false);
      setSelectedActionVehicle(null);
    }
  };
  /* ================= STATUS ================= */

  const getStatusTag = (status) => {

    const map = {
      ready: { color: "green", text: "SẴN SÀNG" },
      maintenance: { color: "orange", text: "BẢO TRÌ" },
      stop: { color: "red", text: "DỪNG" },
      "ready-action": { color: "blue", text: "SẴN SÀNG HOẠT ĐỘNG" },
    };

    const data = map[status] || map.ready;

    return <Tag color={data.color}>{data.text}</Tag>;
  };

  /* ================= FILTER ================= */

  const filteredVehicles = vehicleList.filter((v) => {

    const matchStatus =
      filterStatus === "all" || v.vehicleStatus === filterStatus;

    const matchType =
      !filterType || v.vehicleType === filterType;

    const matchSearch =
      !search ||
      v.vehicleName?.toLowerCase().includes(search.toLowerCase()) ||
      v.plateNumber?.toLowerCase().includes(search.toLowerCase());

    return matchStatus && matchType && matchSearch;
  });

  /* ================= PAGINATION ================= */

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedVehicles = filteredVehicles.slice(
    startIndex,
    startIndex + pageSize
  );

  /* ================= COUNT ================= */

  const count = (status) =>
    vehicleList.filter((v) => v.vehicleStatus === status).length;

  const total = vehicleList.length;
  const readyCount = count("ready");

  const realPercent = total ? Math.round((readyCount / total) * 100) : 0;

  /* ================= PROGRESS ================= */

  useEffect(() => {

    let i = 0;

    const interval = setInterval(() => {

      i += 1;

      if (i >= realPercent) {
        clearInterval(interval);
        setProgressPercent(realPercent);
      } else {
        setProgressPercent(i);
      }

    }, 10);

    return () => clearInterval(interval);

  }, [realPercent]);

  /* ================= ACTION MENU ================= */

  const handleOpenActionMenu = (event, vehicle) => {
    event.stopPropagation();
    setSelectedActionVehicle(vehicle);
    setMenuAnchorEl(event.currentTarget);
  };
  const handleCloseActionMenu = () => {
    setMenuAnchorEl(null);
  };

  /* ================= DRAWER ================= */

  const openDrawer = (vehicle) => {
    setSelectedVehicle(vehicle);
    setDrawerVisible(true);
  };

  /* ================= TYPE OPTIONS ================= */

  const typeOptions = [
    ...new Set(vehicleList.map(v => v.vehicleType))
  ].map(t => ({
    label: t,
    value: t
  }));

  /* ================================================= */

  return (
    <div className="vehicle-page">

      {/* PERFORMANCE & QUICK METRICS */}
      <div className="vehicle-performance-box">
        <div className="performance-header">
          <div>
            <h3>Tỷ Lệ Sẵn Sàng Vận Hành</h3>
            <p>Tổng số phương tiện quản lý: <strong>{total} phương tiện</strong></p>
          </div>
          <span className="percentage">{progressPercent}%</span>
        </div>

        <Progress
          percent={progressPercent}
          strokeColor={{
            '0%': '#0284c7',
            '100%': '#10b981',
          }}
          showInfo={false}
          strokeWidth={10}
        />

        <div className="vehicle-quick-stats">
          <div className="quick-stat-item stat-ready" onClick={() => setFilterStatus("ready")}>
            <span className="stat-dot green-dot"></span>
            <div className="stat-text">
              <span className="stat-val">{count("ready")}</span>
              <span className="stat-lbl">Sẵn sàng điều động</span>
            </div>
          </div>
          <div className="quick-stat-item stat-action" onClick={() => setFilterStatus("ready-action")}>
            <span className="stat-dot blue-dot"></span>
            <div className="stat-text">
              <span className="stat-val">{count("ready-action")}</span>
              <span className="stat-lbl">Đang làm nhiệm vụ</span>
            </div>
          </div>
          <div className="quick-stat-item stat-maintenance" onClick={() => setFilterStatus("maintenance")}>
            <span className="stat-dot amber-dot"></span>
            <div className="stat-text">
              <span className="stat-val">{count("maintenance")}</span>
              <span className="stat-lbl">Đang bảo trì / sửa chữa</span>
            </div>
          </div>
          <div className="quick-stat-item stat-stop" onClick={() => setFilterStatus("stop")}>
            <span className="stat-dot red-dot"></span>
            <div className="stat-text">
              <span className="stat-val">{count("stop")}</span>
              <span className="stat-lbl">Tạm ngưng hoạt động</span>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH UI */}
      <div className="vehicle-search-bar">
        <div className="vehicle-search-inputs">
          <Input
            prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
            placeholder="Tìm theo tên xe hoặc biển số..."
            value={search}
            allowClear
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 280 }}
          />

          <Select
            placeholder="Loại phương tiện"
            allowClear
            options={typeOptions}
            value={filterType}
            onChange={(v) => setFilterType(v)}
            style={{ width: 180 }}
          />

          <Select
            placeholder="Trạng thái"
            allowClear
            value={filterStatus}
            onChange={(v) => setFilterStatus(v || "all")}
            options={[
              { value: "all", label: "Tất cả trạng thái" },
              { value: "ready", label: "Sẵn sàng" },
              { value: "ready-action", label: "Đang nhiệm vụ" },
              { value: "maintenance", label: "Bảo trì" },
              { value: "stop", label: "Dừng" },
            ]}
            style={{ width: 180 }}
          />

          <Button
            onClick={() => {
              setSearch("");
              setFilterType(null);
              setFilterStatus("all");
            }}
          >
            Đặt lại bộ lọc
          </Button>
        </div>

        <Button
          type="primary"
          onClick={handleCreate}
          className="vehicle-create-btn"
        >
          + Thêm phương tiện mới
        </Button>
      </div>

      {/* CARD GRID */}
      {paginatedVehicles.length === 0 ? (
        <div className="vehicle-empty-state">
          <p>Không tìm thấy phương tiện nào phù hợp với điều kiện tìm kiếm.</p>
        </div>
      ) : (
        <div className="vehicle-grid">
          {paginatedVehicles.map((v) => (
            <Card
              key={getVehicleId(v)}
              className="vehicle-card"
              hoverable
              onClick={() => openDrawer(v)}
            >
              <div className="vehicle-card-image-wrap">
                {v.vehicleImg ? (
                  <Image
                    src={toDevProxiedImageUrl(v.vehicleImg) || toAbsoluteImageUrl(v.vehicleImg)}
                    fallback={
                      toDevProxiedImageUrl(v.vehicleImg, true) ||
                      toAbsoluteImageUrl(v.vehicleImg, true)
                    }
                    referrerPolicy="no-referrer"
                    alt={v.vehicleName}
                    width="100%"
                    height={160}
                    style={{ objectFit: "cover", borderRadius: "10px 10px 0 0" }}
                    preview={false}
                  />
                ) : (
                  <div className="vehicle-placeholder-image">
                    <span style={{ fontSize: 40 }}>🚐</span>
                  </div>
                )}
                <div className="vehicle-status-badge-overlay">
                  {getStatusTag(v.vehicleStatus)}
                </div>
              </div>

              <div className="vehicle-card-content">
                <div className="vehicle-card-header">
                  <div className="vehicle-card-title-box">
                    <h3 className="vehicle-name">{v.vehicleName}</h3>
                    {v.plateNumber && (
                      <span className="vehicle-plate-pill">{v.plateNumber}</span>
                    )}
                  </div>

                  <div onClick={(e) => e.stopPropagation()}>
                    <IconButton
                      size="small"
                      onClick={(e) => handleOpenActionMenu(e, v)}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </div>
                </div>

                <div className="vehicle-card-body">
                  <div className="vehicle-info-row">
                    <span className="info-label">Loại:</span>
                    <span className="info-val">{v.vehicleType || "Chưa xác định"}</span>
                  </div>
                  <div className="vehicle-info-row">
                    <span className="info-label">Vị trí:</span>
                    <span className="info-val" title={v.vehicleLocation}>
                      {v.vehicleLocation || "Chưa gán vị trí"}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="vehicle-pagination-wrap">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredVehicles.length}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
        />
      </div>

      {/* MODAL */}

      <Modal
        title={editingVehicle ? "Cập nhật phương tiện" : "Thêm phương tiện"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
      >

        <Form form={form} layout="vertical">

          <Form.Item
            name="vehicleName"
            label="Tên phương tiện"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="vehicleType"
            label="Loại phương tiện"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="vehicleLocation"
            label="Vị trí"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="vehicleStatus"
            label="Trạng thái"
          >
            <Select
              options={[
                { value: "ready", label: "Sẵn sàng" },
                { value: "ready-action", label: "Ready Action" },
                { value: "maintenance", label: "Bảo trì" },
                { value: "stop", label: "Dừng" },
              ]}
            />
          </Form.Item>

          <Form.Item label="Hình phương tiện">
            <Upload
              listType="picture"
              maxCount={1}
              fileList={imageFileList}
              beforeUpload={(file) => {
                const isUnderLimit = file.size / 1024 / 1024 <= MAX_UPLOAD_SIZE_MB;
                if (!isUnderLimit) {
                  AuthNotify.warning(
                    "Ảnh quá lớn",
                    `Vui lòng chọn ảnh nhỏ hơn ${MAX_UPLOAD_SIZE_MB}MB`
                  );
                }
                return isUnderLimit ? false : Upload.LIST_IGNORE;
              }}
              onChange={({ fileList }) => setImageFileList(fileList)}
              accept="image/*"
            >
              <Button>Chọn ảnh</Button>
            </Upload>
          </Form.Item>

        </Form>

      </Modal>

      {/* DRAWER */}

      <Drawer
        title="Chi tiết phương tiện"
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        size="default"
      >

        {selectedVehicle && (

          <div className="drawer-content">

            <p><b>Mã:</b> {getVehicleId(selectedVehicle)}</p>
            <p><b>Tên xe:</b> {selectedVehicle.vehicleName}</p>
            <p><b>Loại xe:</b> {selectedVehicle.vehicleType}</p>
            <p><b>Vị trí:</b> {selectedVehicle.vehicleLocation}</p>
            <p><b>Trạng thái:</b> {getStatusTag(selectedVehicle.vehicleStatus)}</p>
            {selectedVehicle.vehicleImg && (
              <div style={{ marginTop: 12 }}>
                <Image
                  src={
                    toDevProxiedImageUrl(selectedVehicle.vehicleImg) ||
                    toAbsoluteImageUrl(selectedVehicle.vehicleImg)
                  }
                  fallback={
                    toDevProxiedImageUrl(selectedVehicle.vehicleImg, true) ||
                    toAbsoluteImageUrl(selectedVehicle.vehicleImg, true)
                  }
                  referrerPolicy="no-referrer"
                  alt={selectedVehicle.vehicleName}
                  width="100%"
                  style={{ borderRadius: 8 }}
                />
              </div>
            )}

          </div>

        )}

      </Drawer>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseActionMenu}
      >
        <MenuItem
          onClick={() => {
            handleCloseActionMenu();
            if (selectedActionVehicle) handleEdit(selectedActionVehicle);
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Cập nhật</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleCloseActionMenu();
            if (selectedActionVehicle) handleDelete(selectedActionVehicle);
          }}
          sx={{ color: "#d32f2f" }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: "#d32f2f" }} />
          </ListItemIcon>
          <ListItemText>Xóa</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Xóa phương tiện?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa phương tiện{" "}
            <b>{selectedActionVehicle?.vehicleName || ""}</b> không?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
          <Button danger type="primary" onClick={confirmDeleteVehicle}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
}