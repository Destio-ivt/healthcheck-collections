import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Button, Toast } from "react-bootstrap";
import CustomNavbar from "../components/Navbar";
import ReportTable from "../components/ReportTable";
import GenerateReportModal from "../components/GenerateReportModal";

const ReportPage = () => {
  const { collection_name } = useParams();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", variant: "" });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Validasi Base URL
  if (!API_BASE_URL) {
    console.error("API_BASE_URL is not defined. Please check your environment variables.");
    setToast({
      show: true,
      message: "Configuration error. API_BASE_URL is missing.",
      variant: "danger",
    });
  }

  const fetchReports = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/report/?collection_name=${collection_name}`
      );
      setReports(res.data.data.report_files || []);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
      setToast({
        show: true,
        message: "Failed to load reports. Please try again.",
        variant: "danger",
      });
    }
  };

  useEffect(() => {
    fetchReports();
  }, [collection_name]);

  const handleReportGenerated = (message) => {
    setToast({ show: true, message, variant: "success" });
    fetchReports();
  };

  const downloadFile = async (url, filename) => {
    try {
      const response = await axios.get(url, {
        responseType: "blob", // Penting untuk mengunduh file binary
      });

      // Membuat URL dari blob
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", filename); // Nama file untuk diunduh
      document.body.appendChild(link);
      link.click();
      link.remove(); // Hapus elemen setelah diunduh

      setToast({
        show: true,
        message: "File downloaded successfully!",
        variant: "success",
      });
    } catch (err) {
      console.error("Failed to download file:", err);
      setToast({
        show: true,
        message: "Failed to download file. Please try again.",
        variant: "danger",
      });
    }
  };

  const handleDownload = () => {
    const filename = `${collection_name}.zip`;
    const url = `${API_BASE_URL}/download/${filename}`;
    downloadFile(url, filename);
  };

  const handleDownloadReport = (report) => {
    const url = `${API_BASE_URL}/download/${collection_name}/${report}`;
    downloadFile(url, report);
  };

  const resetToast = () => setToast({ show: false, message: "", variant: "" });

  return (
    <div>
      <CustomNavbar />
      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>
            {collection_name} Details -{" "}
            <Button variant="secondary">
              <h4>Reports</h4>
            </Button>
          </h2>
          <div className="d-flex gap-2">
            <Button variant="secondary" onClick={() => navigate("/")}>
              Back
            </Button>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              Generate Report
            </Button>
            <Button variant="success" onClick={handleDownload}>
              Download All Reports
            </Button>
          </div>
        </div>
        <ReportTable reports={reports} onPreviewFile={handleDownloadReport} />
        <GenerateReportModal
          show={showModal}
          onClose={() => setShowModal(false)}
          collectionName={collection_name}
          onReportGenerated={handleReportGenerated}
        />
      </Container>
      <Toast
        show={toast.show}
        bg={toast.variant}
        onClose={resetToast}
        delay={3000}
        autohide
        className="position-fixed top-0 end-0 m-3"
      >
        <Toast.Header>
          <strong className="me-auto">
            {toast.variant === "success" ? "Success" : "Error"}
          </strong>
        </Toast.Header>
        <Toast.Body>{toast.message}</Toast.Body>
      </Toast>
    </div>
  );
};

export default ReportPage;
