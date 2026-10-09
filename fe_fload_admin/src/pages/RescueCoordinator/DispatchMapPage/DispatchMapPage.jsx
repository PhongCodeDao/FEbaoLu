import { useState } from "react";
import ListTeamRescue from "../../../components/RescueCoordinatorComponents/ListTeamRescue/ListTeamRescue";
import DispatchMapView from "../../../components/RescueCoordinatorComponents/DispatchMap/DispatchMapView";
import "./dispatch-map-layout.css";

export default function DispatchMapPage() {

  const [selectedRequests, setSelectedRequests] = useState([]);
  const [removedRequests, setRemovedRequests] = useState([]);

  const handleDispatchSuccess = (requestIds) => {

    setRemovedRequests(prev => [...prev, ...requestIds]);
    setSelectedRequests([]); // reset sau khi dispatch

  };

  return (

    <div className="rcd-layout">

      <aside className="rcd-layout__sidebar">
        <ListTeamRescue
          onSelectRequest={setSelectedRequests}
        />
      </aside>

      <main className="rcd-layout__main">

        {selectedRequests.length > 0 ? (
          <DispatchMapView
            requests={selectedRequests}
            onDispatchSuccess={handleDispatchSuccess}
          />
        ) : (
          <div  style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            fontWeight: 600,
            color: "#555"
          }}>
            Chọn yêu cầu bên trái để hiển thị
          </div>
        )}

      </main>

    </div>

  );
}