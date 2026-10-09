import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import { CheckCircle2, ArrowRight } from "lucide-react";
import InventoryManagementContainer from "../../../components/ManagerComponents/Inventory/InventoryManagementContainer";
import "../../page-layout.css";
import "./InventoryManagement.css";

export default function InventoryManagement() {
  const navigate = useNavigate();

  return (
    <div className="inventory-page-wrapper">
      {/* EXECUTIVE COMMAND HERO BANNER */}
      <div className="inventory-hero-banner">
        <div className="inventory-hero-backdrop"></div>
        <div className="inventory-hero-content">
          <div className="inventory-hero-top">
            <div className="inventory-hero-status-pill">
              <span className="inventory-pulse-dot"></span>
              <span className="inventory-status-text">HỆ THỐNG KHO VẬT TƯ 24/7</span>
              <span className="inventory-status-divider">•</span>
              <span className="inventory-time-text">Kiểm kê & Điều phối hàng cứu trợ</span>
            </div>

            <Button
              className="inventory-approve-link-btn"
              onClick={() => navigate("/manager/approve")}
            >
              <span>Phê duyệt xuất nhập kho</span>
              <ArrowRight size={16} />
            </Button>
          </div>

          <div className="inventory-hero-main">
            <div className="inventory-hero-title-group">
              <div className="inventory-hero-icon-wrap">
                📦
              </div>
              <div>
                <h1 className="inventory-hero-title">
                  Trung Tâm Quản Lý Kho & Hàng Cứu Trợ
                </h1>
                <p className="inventory-hero-subtitle">
                  Theo dõi số lượng tồn kho theo thời gian thực, quản lý các điểm tập kết hàng hóa, hạn mức ngân sách và danh mục nhu yếu phẩm
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="inventory-page-content">
        <InventoryManagementContainer />
      </div>
    </div>
  );
}
