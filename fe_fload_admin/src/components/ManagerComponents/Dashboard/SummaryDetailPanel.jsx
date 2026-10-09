import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Image,
  Modal,
  Row,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";

const { Paragraph, Text, Title } = Typography;

const SUMMARY_TITLES = {
  total: "Danh sách tổng yêu cầu",
  open: "Danh sách yêu cầu đang xử lý",
  completed: "Danh sách yêu cầu đã hoàn thành",
  overdue: "Danh sách yêu cầu quá hạn",
  campaign: "Danh sách chiến dịch đang thực hiện",
  stock: "Danh sách cảnh báo kho",
};

// Mapping summaryKey với key thực tế trong data API
const DATA_KEY_MAPPING = {
  total: "rescueTrends",
  open: "requestsByArea",
  completed: "requestsByArea",
  overdue: "requestsByArea",
  campaign: "campaignProgress",
  stock: "inventoryAlerts",
};

const IMAGE_FIELD_HINTS = ["image", "img", "photo", "avatar", "url"];
const DATE_FIELD_HINTS = ["date", "time", "at"];
const API_BASE = "https://api-rescue.purintech.id.vn";

const LABEL_OVERRIDES = {
  rescueRequestId: "Mã yêu cầu cứu hộ",
  requestId: "Mã yêu cầu",
  assignmentId: "Mã phân công",
  rescueTeamId: "Mã đội cứu hộ",
  vehicleId: "Mã phương tiện",
  assignmentStatus: "Trạng thái phân công",
  assignedBy: "Người phân công",
  assignedAt: "Thời gian phân công",
  completedAt: "Thời gian hoàn thành",
  rejectReason: "Lý do từ chối",
  requestType: "Loại yêu cầu",
  contactPhone: "Số điện thoại liên hệ",
  locationLat: "Vĩ độ",
  locationLng: "Kinh độ",
  urgencyLevelId: "Mức độ khẩn cấp",
  urgencyScore: "Điểm khẩn cấp",
  statusId: "Mã trạng thái",
  createdAt: "Thời gian tạo",
  fullName: "Họ tên",
  address: "Địa chỉ",
  victimCount: "Số nạn nhân",
  availableRescueTool: "Thiết bị cứu hộ sẵn có",
  specialNeeds: "Nhu cầu đặc biệt",
  detailDescription: "Mô tả chi tiết",
  rescueTeamNote: "Ghi chú đội cứu hộ",
  areaId: "Mã khu vực",
  areaName: "Tên khu vực",
  warehouseId: "Mã kho",
  warehouseName: "Tên kho",
  reliefItemId: "Mã vật phẩm",
  reliefItemName: "Tên vật phẩm",
  quantity: "Số lượng",
  threshold: "Ngưỡng cảnh báo",
  note: "Ghi chú",
  total: "Tổng",
  totalRequests: "Tổng yêu cầu",
  openRequests: "Yêu cầu đang mở",
  campaignId: "Mã chiến dịch",
  campaignName: "Tên chiến dịch",
  status: "Trạng thái",
  completionRate: "Tỷ lệ hoàn thành",
  totalBeneficiaries: "Tổng số người thụ hưởng",
  distributedBeneficiaries: "Đã phân phối",
  type: "Loại hoạt động",
  title: "Tiêu đề",
};

const formatLabel = (value) =>
  LABEL_OVERRIDES[String(value || "")] ||
  String(value || "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());

const isPrimitive = (value) =>
  value === null ||
  value === undefined ||
  ["string", "number", "boolean"].includes(typeof value);

const isImageUrl = (value) =>
  typeof value === "string" &&
  /^https?:\/\//i.test(value) &&
  /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(value);

const isHttpUrl = (value) =>
  typeof value === "string" && /^https?:\/\//i.test(value);

const resolveImageUrl = (value) => {
  if (!value || typeof value !== "string") {
    return "";
  }

  if (isHttpUrl(value)) {
    return value;
  }

  return `${API_BASE}/${value.replace(/^\/+/, "")}`;
};

const looksLikeDateField = (fieldName) =>
  DATE_FIELD_HINTS.some((hint) => String(fieldName).toLowerCase().includes(hint));

const looksLikeImageField = (fieldName, value) =>
  IMAGE_FIELD_HINTS.some((hint) => String(fieldName).toLowerCase().includes(hint)) &&
  typeof value === "string" &&
  value.trim() !== "";

const formatValue = (fieldName, value) => {
  if (value === null || value === undefined || value === "") {
    return <Text type="secondary">Không có</Text>;
  }

  if (typeof value === "boolean") {
    return <Tag color={value ? "green" : "red"}>{value ? "Có" : "Không"}</Tag>;
  }

  if (looksLikeDateField(fieldName) && !Number.isNaN(Date.parse(value))) {
    return new Date(value).toLocaleString("vi-VN");
  }

  if (looksLikeImageField(fieldName, value) || isImageUrl(value)) {
    return (
      <Image
        src={resolveImageUrl(value)}
        alt={formatLabel(fieldName)}
        width={88}
        height={64}
        style={{ objectFit: "cover", borderRadius: 10 }}
      />
    );
  }

  if (isHttpUrl(value)) {
    return (
      <a href={value} target="_blank" rel="noreferrer">
        Mở liên kết
      </a>
    );
  }

  if (Array.isArray(value) || (typeof value === "object" && value !== null)) {
    return (
      <pre className="summary-detail-json">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  return String(value);
};

// ==================== HÀM MỚI: LẤY DATA ĐÚNG THEO summaryKey ====================
const getArrayData = (data, summaryKey) => {
  if (!data || typeof data !== "object") return null;

  const mappedKey = DATA_KEY_MAPPING[summaryKey];
  if (mappedKey && Array.isArray(data[mappedKey])) {
    return data[mappedKey];
  }

  // Fallback cho total
  if (summaryKey === "total" && data.summary) {
    return [data.summary];
  }

  // Nếu không map được thì dùng hàm cũ
  return extractArrayData(data);
};

const extractArrayData = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const candidateKeys = ["items", "list", "data", "results", "records"];

  for (const key of candidateKeys) {
    if (Array.isArray(value[key])) {
      return value[key];
    }
  }

  return null;
};

const buildSummaryFields = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [];
  }

  return Object.entries(value)
    .filter(
      ([key, fieldValue]) =>
        key !== "items" &&
        key !== "note" &&
        key !== "total" &&
        isPrimitive(fieldValue)
    )
    .map(([key, fieldValue]) => ({
      key,
      label: formatLabel(key),
      children: formatValue(key, fieldValue),
    }));
};

const normalizeRows = (rows) =>
  rows.map((row, index) => {
    if (row && typeof row === "object" && !Array.isArray(row)) {
      return {
        key:
          row.id ??
          row.requestId ??
          row.rescueRequestId ??
          row.assignmentId ??
          row.campaignId ??
          row.warehouseId ??
          index,
        ...row,
      };
    }

    return { key: index, value: row };
  });

const isRescueRequestRow = (row) => {
  if (
    !row ||
    typeof row !== "object" ||
    Array.isArray(row) ||
    !Object.prototype.hasOwnProperty.call(row, "rescueRequestId")
  ) {
    return false;
  }

  const hasRequestSpecificFields =
    Object.prototype.hasOwnProperty.call(row, "statusId") ||
    Object.prototype.hasOwnProperty.call(row, "requestType") ||
    Object.prototype.hasOwnProperty.call(row, "urgencyLevelId");

  return hasRequestSpecificFields;
};

const buildRescueRequestColumns = () => [
  {
    title: "Rescue Request Id",
    dataIndex: "rescueRequestId",
    key: "rescueRequestId",
  },
  {
    title: "Request Type",
    dataIndex: "requestType",
    key: "requestType",
    render: (value) => value || <Text type="secondary">Không có</Text>,
  },
  {
    title: "Contact Phone",
    dataIndex: "contactPhone",
    key: "contactPhone",
  },
  {
    title: "Location Lat",
    dataIndex: "locationLat",
    key: "locationLat",
  },
  {
    title: "Location Lng",
    dataIndex: "locationLng",
    key: "locationLng",
  },
  {
    title: "Urgency Level Id",
    dataIndex: "urgencyLevelId",
    key: "urgencyLevelId",
  },
  {
    title: "Urgency Score",
    dataIndex: "urgencyScore",
    key: "urgencyScore",
  },
  {
    title: "Status Id",
    dataIndex: "statusId",
    key: "statusId",
  },
  {
    title: "Created At",
    dataIndex: "createdAt",
    key: "createdAt",
    render: (value) => formatValue("createdAt", value),
  },
];

const buildColumns = (rows) => {
  const sampleRow = rows.find(
    (row) => row && typeof row === "object" && !Array.isArray(row)
  );

  if (!sampleRow) {
    return [
      {
        title: "Giá trị",
        dataIndex: "value",
        key: "value",
        render: (value) => formatValue("value", value),
      },
    ];
  }

  return Object.keys(sampleRow)
    .filter((key) => key !== "key")
    .map((key) => ({
      title: formatLabel(key),
      dataIndex: key,
      key,
      render: (value) => formatValue(key, value),
    }));
};

const buildRescueRequestDetailFields = (row) => {
  if (!row) {
    return [];
  }

  const hiddenKeys = new Set(["key", "locationImageUrl", "attachments"]);

  return Object.entries(row)
    .filter(([key]) => !hiddenKeys.has(key))
    .map(([key, value]) => ({
      key,
      label: formatLabel(key),
      children: formatValue(key, value),
    }));
};

const normalizeAttachments = (attachments) => {
  if (!Array.isArray(attachments)) {
    return [];
  }

  return attachments
    .map((item, index) => ({
      key: item?.attachmentId ?? index,
      url: resolveImageUrl(item?.fileUrl || item?.url || ""),
    }))
    .filter((item) => item.url);
};

const getRequestImages = (request) => {
  const imgs = [];

  if (Array.isArray(request?.imageUrls)) {
    imgs.push(...request.imageUrls);
  }

  if (Array.isArray(request?.images)) {
    imgs.push(...request.images);
  }

  if (request?.locationImageUrl) {
    if (typeof request.locationImageUrl === "string") {
      imgs.push(...request.locationImageUrl.split(","));
    } else if (Array.isArray(request.locationImageUrl)) {
      imgs.push(...request.locationImageUrl);
    }
  }

  return [...new Set(
    imgs
      .map((item) => item?.trim?.() || item)
      .filter(Boolean)
      .map((item) =>
        item.startsWith("http")
          ? item
          : `${API_BASE}${item.startsWith("/") ? "" : "/"}${item}`
      )
  )];
};

const detailText = (value, fallback = "Không có") =>
  value === null || value === undefined || value === "" ? fallback : String(value);

export default function SummaryDetailPanel({
  summaryKey,
  loading,
  data,
  onClear,
}) {
  if (!summaryKey && !loading) {
    return null;
  }

  const title = SUMMARY_TITLES[summaryKey] || "Chi tiết dashboard";

  // === SỬA CHÍNH Ở ĐÂY ===
  const rows = getArrayData(data, summaryKey);
  const normalizedRows = rows ? normalizeRows(rows) : [];
  const isRescueRequestTable = normalizedRows.some(isRescueRequestRow);
  const columns = rows
    ? isRescueRequestTable
      ? buildRescueRequestColumns()
      : buildColumns(normalizedRows)
    : [];

  const summaryFields = buildSummaryFields(data?.summary || data);

  // Tính totalCount tốt hơn
  const totalCount = 
    data?.summary?.totalRequests ?? 
    data?.summary?.activeCampaigns ?? 
    data?.summary?.inventoryAlertCount ?? 
    normalizedRows.length ?? 
    0;

  const [selectedRowKey, setSelectedRowKey] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    setSelectedRowKey(null);
    setIsDetailModalOpen(false);
  }, [summaryKey, data]);

  const selectedRow = useMemo(
    () => normalizedRows.find((row) => row.key === selectedRowKey) ?? null,
    [normalizedRows, selectedRowKey]
  );

  const rescueRequestDetailFields = buildRescueRequestDetailFields(selectedRow);
  const requestImages = getRequestImages(selectedRow);
  const attachmentImages = normalizeAttachments(selectedRow?.attachments)
    .map((item) => item.url)
    .filter(Boolean);
  const allImages = [...new Set([...requestImages, ...attachmentImages])];

  return (
    <Card className="summary-detail-panel">
      <div className="summary-detail-header">
        <div>
          <Text className="summary-detail-eyebrow">Chi tiết theo thẻ</Text>
          <Title level={4} className="summary-detail-title">
            {title}
          </Title>
          <Paragraph className="summary-detail-subtitle">
            {loading
              ? "Đang tải dữ liệu chi tiết..."
              : `Đang hiển thị ${totalCount} bản ghi`}
          </Paragraph>
        </div>

        <Button onClick={onClear}>Đóng chi tiết</Button>
      </div>

      {loading ? (
        <div className="summary-detail-loading">
          <Spin size="large" />
        </div>
      ) : !data ? (
        <Empty description="Chưa có dữ liệu chi tiết" />
      ) : (
        <>
          <Row gutter={[16, 16]} className="summary-detail-metrics">
            <Col xs={24}>
              <div className="summary-detail-stat">
                <span className="summary-detail-stat-label">Tổng bản ghi</span>
                <strong className="summary-detail-stat-value">{totalCount}</strong>
              </div>
            </Col>
          </Row>

          {summaryFields.length > 0 ? (
            <Descriptions
              bordered
              size="middle"
              column={{ xs: 1, sm: 2, lg: 3 }}
              items={summaryFields}
              className="summary-detail-descriptions"
            />
          ) : null}

          {rows ? (
            <>
              <Table
                className="summary-detail-table"
                columns={columns}
                dataSource={normalizedRows}
                pagination={{ pageSize: 8, showSizeChanger: false }}
                scroll={{ x: 1200 }}
                rowClassName={(record) =>
                  record.key === selectedRowKey ? "summary-detail-row-active" : ""
                }
                onRow={(record) => ({
                  onClick: () => {
                    setSelectedRowKey(record.key);
                    if (isRescueRequestTable) {
                      setIsDetailModalOpen(true);
                    }
                  },
                  style: { cursor: "pointer" },
                })}
              />
            </>
          ) : (
            <pre className="summary-detail-json">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </>
      )}

      {isRescueRequestTable && selectedRow ? (
        <Modal
          open={isDetailModalOpen}
          onCancel={() => setIsDetailModalOpen(false)}
          footer={null}
          width={1080}
          className="summary-detail-modal"
          title={`Chi tiết yêu cầu cứu hộ #${selectedRow.rescueRequestId}`}
        >
          <div className="summary-detail-modal-grid">
            <div className="summary-detail-modal-main">
              <div className="summary-detail-hero">
                <div>
                  <Text className="summary-detail-eyebrow">Yêu cầu cứu hộ</Text>
                  <Title level={3} className="summary-detail-modal-title">
                    #{selectedRow.rescueRequestId}
                  </Title>
                  <Paragraph className="summary-detail-modal-subtitle">
                    {detailText(selectedRow.requestType)}
                  </Paragraph>
                </div>

                <div className="summary-detail-status-pill">
                  <span>Trạng thái</span>
                  <strong>{detailText(selectedRow.statusId)}</strong>
                </div>
              </div>

              <div className="summary-detail-section-card">
                <Title level={5} className="summary-detail-section-title">
                  Thông tin liên hệ
                </Title>
                <div className="summary-detail-info-grid">
                  <div className="summary-detail-info-item">
                    <span>Họ tên</span>
                    <strong>{detailText(selectedRow.fullName)}</strong>
                  </div>
                  <div className="summary-detail-info-item">
                    <span>Số điện thoại</span>
                    <strong>{detailText(selectedRow.contactPhone)}</strong>
                  </div>
                  <div className="summary-detail-info-item summary-detail-info-item-full">
                    <span>Địa chỉ</span>
                    <strong>{detailText(selectedRow.address)}</strong>
                  </div>
                </div>
              </div>

              <div className="summary-detail-section-card">
                <Title level={5} className="summary-detail-section-title">
                  Thông tin yêu cầu
                </Title>
                <div className="summary-detail-info-grid">
                  <div className="summary-detail-info-item">
                    <span>Thời gian tạo</span>
                    <strong>{formatValue("createdAt", selectedRow.createdAt)}</strong>
                  </div>
                  <div className="summary-detail-info-item">
                    <span>Mức độ khẩn cấp</span>
                    <strong>{detailText(selectedRow.urgencyLevelId)}</strong>
                  </div>
                  <div className="summary-detail-info-item">
                    <span>Điểm khẩn cấp</span>
                    <strong>{detailText(selectedRow.urgencyScore)}</strong>
                  </div>
                  <div className="summary-detail-info-item">
                    <span>Số nạn nhân</span>
                    <strong>{detailText(selectedRow.victimCount)}</strong>
                  </div>
                  <div className="summary-detail-info-item">
                    <span>Thiết bị cứu hộ sẵn có</span>
                    <strong>{detailText(selectedRow.availableRescueTool)}</strong>
                  </div>
                  <div className="summary-detail-info-item">
                    <span>Nhu cầu đặc biệt</span>
                    <strong>{detailText(selectedRow.specialNeeds)}</strong>
                  </div>
                </div>
              </div>

              <div className="summary-detail-section-card">
                <Title level={5} className="summary-detail-section-title">
                  Mô tả chi tiết
                </Title>
                <div className="summary-detail-text-block">
                  {detailText(selectedRow.detailDescription)}
                </div>
              </div>

              <div className="summary-detail-section-card">
                <Title level={5} className="summary-detail-section-title">
                  Ghi chú đội cứu hộ
                </Title>
                <div className="summary-detail-text-block">
                  {detailText(selectedRow.rescueTeamNote)}
                </div>
              </div>

              <div className="summary-detail-gallery-block">
                <Text className="summary-detail-gallery-title">Vị trí trên bản đồ</Text>
                <div className="summary-detail-map-frame">
                  <iframe
                    title={`map-${selectedRow.rescueRequestId}`}
                    src={`https://www.google.com/maps?q=${selectedRow.locationLat ?? 0},${selectedRow.locationLng ?? 0}&z=15&output=embed`}
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            <div className="summary-detail-modal-side">
              <Card className="summary-detail-modal-info" bordered={false}>
                <Text className="summary-detail-gallery-title">Thông tin nhanh</Text>
                <div className="summary-detail-quick-grid">
                  <div>
                    <span>Mã trạng thái</span>
                    <strong>{selectedRow.statusId ?? "Không có"}</strong>
                  </div>
                  <div>
                    <span>Điểm khẩn cấp</span>
                    <strong>{selectedRow.urgencyScore ?? "Không có"}</strong>
                  </div>
                  <div>
                    <span>Số nạn nhân</span>
                    <strong>{selectedRow.victimCount ?? "Không có"}</strong>
                  </div>
                  <div>
                    <span>Điện thoại</span>
                    <strong>{selectedRow.contactPhone ?? "Không có"}</strong>
                  </div>
                  <div>
                    <span>Vĩ độ - Kinh độ</span>
                    <strong>
                      {detailText(selectedRow.locationLat)}, {detailText(selectedRow.locationLng)}
                    </strong>
                  </div>
                  <div>
                    <span>Mã khu vực</span>
                    <strong>{detailText(selectedRow.areaId)}</strong>
                  </div>
                </div>
              </Card>

              {allImages.length > 0 ? (
                <div className="summary-detail-gallery-block">
                  <Text className="summary-detail-gallery-title">Hình ảnh hiện trường</Text>
                  <div className="summary-detail-gallery">
                    <Image.PreviewGroup>
                      {allImages.map((img, index) => (
                        <Image
                          key={`${selectedRow.rescueRequestId}-${index}`}
                          src={img}
                          alt={`Rescue ${selectedRow.rescueRequestId}-${index}`}
                          width={index === 0 ? 260 : 120}
                          height={index === 0 ? 180 : 96}
                          style={{ objectFit: "cover", borderRadius: 14 }}
                          preview={false}
                        />
                      ))}
                    </Image.PreviewGroup>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </Modal>
      ) : null}
    </Card>
  );
}