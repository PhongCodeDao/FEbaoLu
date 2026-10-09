import { useState } from "react";
import ListTeamRescue from "../../../components/RescueCoordinatorComponents/ListTeamRescue/ListTeamRescue";
import DispatchMapView from "../../../components/RescueCoordinatorComponents/DispatchMap/DispatchMapView";
import { CompassOutlined } from "@ant-design/icons";
import "./dispatch-map-layout.css";

export default function DispatchMapPage() {
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [, setRemovedRequests] = useState([]);

  const handleDispatchSuccess = (requestIds) => {
    setRemovedRequests((prev) => [...prev, ...requestIds]);
    setSelectedRequests([]);
  };

  return (
    <div className="rcd-layout">
      {/* SIDEBAR QUEUE */}
      <aside className="rcd-layout__sidebar">
        <ListTeamRescue onSelectRequest={setSelectedRequests} />
      </aside>

      {/* MAIN DISPATCH & MAP */}
      <main className="rcd-layout__main">
        {selectedRequests.length > 0 ? (
          <DispatchMapView
            requests={selectedRequests}
            onDispatchSuccess={handleDispatchSuccess}
          />
        ) : (
          <div className="rcd-empty-state">
            <div className="rcd-empty-icon">
              <CompassOutlined />
            </div>
            <h3>Sẵn Sàng Điều Phối Đội Cứu Hộ</h3>
            <p>
              Chọn một hoặc nhiều yêu cầu đã xác minh từ danh sách bên trái để định vị trên bản đồ
              và gán đội cứu hộ cùng phương tiện tác chiến.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}