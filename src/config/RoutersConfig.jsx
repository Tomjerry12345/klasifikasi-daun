import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "../pages/home/HomePage";
import KlasifikasiPage from "../pages/klasifikasi/KlasifikasiPage";
import MainPage from "../pages/MainPage";
import TestingPage from "../pages/testing/TestingPage";

const RoutersConfig = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />}>
          <Route index element={<HomePage />} />
          <Route path="klasifikasi" element={<KlasifikasiPage />} />
        </Route>
        <Route path="/test" element={<TestingPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default RoutersConfig;
