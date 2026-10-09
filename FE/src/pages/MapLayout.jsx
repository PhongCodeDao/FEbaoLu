import { Outlet } from "react-router-dom";
import MapHeader from "../Layout/MapHeader/MapHeader";

const MapLayout = () => {
  return (
    <>
      <MapHeader />
      <Outlet />
    </>
  );
};

export default MapLayout;
