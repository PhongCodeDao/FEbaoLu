import { Routes, Route } from "react-router-dom";
import MainLayout from "../pages/MainLayout";
// import MapLayout from "../pages/MapLayout";
import NewsPage from "../pages/Home/News/NewsPage"
import Home from "../pages/Home/Home";
import RescueMap from "../pages/RescueMap/RescueMap";
import EmergencyRequest from "../pages/EmergencyRequest/EmergencyRequest";
import NewsDetail from "../pages/Home/News/NewsDetail";

const AppRoutes = () => {
  return (
    <Routes>
      {/* WEBSITE BÌNH THƯỜNG */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/newpage" element={<NewsPage />} />
        <Route path="/news/:id" element={<NewsDetail/>}/>
      </Route>

    
      <Route  >
        <Route path="/map" element={<RescueMap />} />
      </Route>
      <Route>
      <Route path="/emergency" element={<EmergencyRequest />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
