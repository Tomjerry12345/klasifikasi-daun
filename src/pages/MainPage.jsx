import { Outlet } from "react-router-dom";
import AppBarComponent from "../component/AppBarComponent";
import "./MainStyle.scss";

const MainPage = () => {
  return (
    <div>
      <AppBarComponent />
      <div className="main">
        <Outlet />
      </div>
    </div>
  );
};

export default MainPage;
