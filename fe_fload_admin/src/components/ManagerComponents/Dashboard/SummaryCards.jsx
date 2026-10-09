import { Card, Row, Col } from "antd";
import "./SummaryCards.css";

export default function SummaryCards({ summary, onClickItem }) {
  const items = [
    { key: "total", label: "Tổng yêu cầu", value: summary.totalRequests },
    { key: "open", label: "Đang xử lý", value: summary.openRequests },
    { key: "assigned", label: "Đã phân công", value: summary.activeAssignments },
    // { key: "overdue", label: "Quá hạn", value: summary.overdueRequests },
    // { key: "campaign", label: "Chiến dịch đang thực hiện ", value: summary.activeCampaigns },
    { key: "stock", label: "Cảnh báo kho", value: summary.inventoryAlertCount },
  ];

  return (
    <Row gutter={16}>
      {items.map((item, i) => (
        <Col span={6} key={i}>
          <Card
            className="summary-card"
            hoverable
            onClick={() => onClickItem?.(item.key)}
          >
            <div className="summary-value">{item.value}</div>
            <div className="summary-label">{item.label}</div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}