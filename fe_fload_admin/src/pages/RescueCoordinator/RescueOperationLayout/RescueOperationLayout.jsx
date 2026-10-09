import { useState } from "react";
import ListTeamCuuHo from "../../../components/RescueCoordinatorComponents/RescueOperation/ListTaskTeamSupport/ListTeamCuuHo";
import RescueOperationDetail from "../../../components/RescueCoordinatorComponents/RescueOperation/ListTaskTeamSupportDetail/RescueOperationDetail";
import { RadarChartOutlined } from "@ant-design/icons";
import "./rescue-operation.layout.css";

export default function RescueOperationLayout() {
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);

  const handleSelectMission = (assignmentId) => {
    setSelectedAssignmentId(assignmentId);
  };

  return (
    <div className="rc-operation-layout">
      {/* LEFT ACTIVE MISSIONS QUEUE */}
      <aside className="rc-operation-layout__left">
        <ListTeamCuuHo
          onSelectMission={handleSelectMission}
          selectedAssignmentId={selectedAssignmentId}
        />
      </aside>

      {/* RIGHT MISSION LIVE MONITOR */}
      <main className="rc-operation-layout__right">
        {selectedAssignmentId ? (
          <RescueOperationDetail
            key={selectedAssignmentId}
            assignmentId={selectedAssignmentId}
          />
        ) : (
          <div className="rc-op-empty">
            <div className="rc-op-empty-icon">
              <RadarChartOutlined />
            </div>
            <h3>Giám Sát Tác Chiến Thực Địa</h3>
            <p>
              Chọn một nhiệm vụ đang triển khai từ danh sách bên trái để theo dõi vị trí GPS,
              tiến độ 6 giai đoạn cứu hộ và tình hình tiếp cận hiện trường.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}