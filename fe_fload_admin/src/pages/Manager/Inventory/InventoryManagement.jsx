import InventoryManagementContainer from "../../../components/ManagerComponents/Inventory/InventoryManagementContainer";
import "../../page-layout.css";

export default function InventoryManagement() {
  return (
    <div className="page-shell">

      <div className="page-shell__header">
        <div className="page-shell__header-left">
          <div className="page-shell__icon" style={{ background: "#fff7ed" }}>
            📦
          </div>
          <div>
            <h2 className="page-shell__title">Quản lý kho hàng</h2>
            <p className="page-shell__subtitle">Theo dõi hàng hóa, kho bãi và giao dịch xuất nhập</p>
          </div>
        </div>
      </div>

      <div className="page-shell__body">
        <InventoryManagementContainer />
      </div>

    </div>
  );
}
