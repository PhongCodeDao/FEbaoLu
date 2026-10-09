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

      {/* PERFORMANCE */}

      <div className="vehicle-performance">

        <div className="performance-header">

          <div>
            <h3>Hiệu suất Phương Tiện</h3>
            <p>Tổng: {total}</p>
          </div>

          <span className="percentage">{progressPercent}%</span>

        </div>

        <Progress percent={progressPercent} showInfo={false} />

      </div>

      {/* SEARCH UI */}

      <div className="vehicle-search">

        <Input
          prefix={<SearchOutlined />}
          placeholder="Tìm theo tên hoặc biển số..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select
          placeholder="Loại xe"
          allowClear
          options={typeOptions}
          onChange={(v) => setFilterType(v)}
        />

        <Select
          placeholder="Trạng thái"
          allowClear
          onChange={(v) => setFilterStatus(v || "all")}
          options={[
            { value: "ready", label: "Sẵn sàng" },
            { value: "ready-action", label: "Ready Action" },
            { value: "maintenance", label: "Bảo trì" },
            { value: "stop", label: "Dừng" },
          ]}
        />

        <Button type="primary" onClick={handleSearch}>
          Tìm kiếm
        </Button>

        <Button onClick={handleCreate}>
          Thêm phương tiện
        </Button>

      </div>

      {/* CARD GRID */}

      <div className="vehicle-grid">

        {paginatedVehicles.map((v) => (

          <Card
            key={getVehicleId(v)}
            className="vehicle-card"
            hoverable
            onClick={() => openDrawer(v)}
          >

            {v.vehicleImg && (
              <Image
                src={toDevProxiedImageUrl(v.vehicleImg) || toAbsoluteImageUrl(v.vehicleImg)}
                fallback={
                  toDevProxiedImageUrl(v.vehicleImg, true) ||
                  toAbsoluteImageUrl(v.vehicleImg, true)
                }
                referrerPolicy="no-referrer"
                alt={v.vehicleName}
                width="100%"
                height={180}
                style={{ objectFit: "cover", borderRadius: 8, marginBottom: 12 }}
                preview={false}
              />
            )}

            <div className="vehicle-card-header">

              <h3>{v.vehicleName}</h3>

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

              <p><b>Loại:</b> {v.vehicleType}</p>
              <p><b>Vị trí:</b> {v.vehicleLocation}</p>

              <div style={{ marginTop: 10 }}>
                {getStatusTag(v.vehicleStatus)}
              </div>

            </div>

          </Card>

        ))}

      </div>

      <Pagination
        style={{ marginTop: 20 }}
        current={currentPage}
        pageSize={pageSize}
        total={filteredVehicles.length}
        onChange={(page) => setCurrentPage(page)}
      />

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