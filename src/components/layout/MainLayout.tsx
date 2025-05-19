import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";

const MainLayout = () => {
  const location = useLocation();
  const hideHeaderOn = ["/dashboard", "/upload"];
  const shouldHideHeader = hideHeaderOn.includes(location.pathname) || location.pathname.startsWith("/roadmap");
  return (
    <>
      {!shouldHideHeader && <Header />}
      <Outlet />
    </>
  );
};

export default MainLayout; 