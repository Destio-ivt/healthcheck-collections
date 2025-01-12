import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import ClusterPage from "./pages/ClusterPage";
import ReportPage from "./pages/ReportPage";
import ChartPage from "./pages/ChartPage";
import ServerPage from "./pages/ServerPage";

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/collection-detail/:collection_name/clusters" element={<ClusterPage />} />
      <Route path="/collection-detail/:collection_name/reports" element={<ReportPage />} />
      <Route
        path="/collection/:collection_name/cluster/:cluster_name/chart"
        element={<ChartPage />}
      />
      <Route
        path="/collection/:collection_name/cluster/:cluster_name/server"
        element={<ServerPage />}
      />
    </Routes>
  </Router>
);

export default App;
