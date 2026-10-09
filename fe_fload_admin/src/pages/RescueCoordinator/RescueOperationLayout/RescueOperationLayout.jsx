import { useState } from "react";
import ListTeamCuuHo from "../../../components/RescueCoordinatorComponents/RescueOperation/ListTaskTeamSupport/ListTeamCuuHo";
import RescueOperationDetail from "../../../components/RescueCoordinatorComponents/RescueOperation/ListTaskTeamSupportDetail/RescueOperationDetail";
import "./rescue-operation.layout.css";

export default function RescueOperationLayout() {

  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);

  /* khi click mission bên trái */
  const handleSelectMission = (assignmentId) => {
    setSelectedAssignmentId(assignmentId);
  };

  return (
    <div className="rc-operation-layout">

      {/* LEFT */}
      <aside className="rc-operation-layout__left">

        <ListTeamCuuHo
          onSelectMission={handleSelectMission}
          selectedAssignmentId={selectedAssignmentId}
        />

      </aside>

      {/* RIGHT */}
      <main className="rc-operation-layout__right">

        {selectedAssignmentId ? (

          <RescueOperationDetail
            key={selectedAssignmentId}
            assignmentId={selectedAssignmentId}
          />

        ) : (

          <div
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            fontWeight: 600,
            color: "#555"
          }}
        >
      
            Chọn nhiệm vụ bên trái để xem chi tiết
          </div>

        )}

      </main>

    </div>
  );
}