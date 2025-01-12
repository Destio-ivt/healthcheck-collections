import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Container, Toast, ToastContainer } from "react-bootstrap";
import CustomNavbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import CollectionTable from "../components/CollectionTable";
import AddCollectionModal from "../components/AddCollectionModal";
import CollectionConfirmDelete from "../components/CollectionConfirmDeleteModal";

const MainPage = () => {
  const [collections, setCollections] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", variant: "" });
  const [files, setFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const generatedCollectionName = (() => {
    const date = new Date();
    const jakartaTime = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).formatToParts(date);

    const formattedDate = `${jakartaTime[4].value}-${jakartaTime[2].value}-${jakartaTime[0].value}-${jakartaTime[6].value}.${jakartaTime[8].value}`;
    return `healthcheck_${formattedDate}`;
  })();

  const fetchCollections = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/collection`);
      setCollections(response.data.data);
    } catch (error) {
      showToast("danger", "Failed to fetch collections.");
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const showToast = (variant, message) => {
    setToast({ show: true, variant, message });
    setTimeout(() => setToast({ show: false, message: "", variant: "" }), 3000);
  };

  const navigate = useNavigate();

  const handleView = (collectionName) =>
    navigate(`/collection-detail/${collectionName}/clusters`);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const invalidFiles = selectedFiles.filter(
      (file) => !file.name.toLowerCase().endsWith(".zip")
    );
    setErrorMessage(
      invalidFiles.length ? "Only .zip files are allowed." : null
    );
    setFiles(invalidFiles.length ? [] : selectedFiles);
  };

  const handleAddCollection = async () => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("collection_name", generatedCollectionName);

      await axios.post(`${API_BASE_URL}/server`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Add-New-Collection": "true",
        },
      });

      showToast("success", "Files uploaded successfully.");
      fetchCollections();
      setShowAddModal(false);
    } catch {
      showToast("danger", "Failed to add collection.");
    } finally {
      setIsProcessing(false);
      setFiles([]);
    }
  };

  const handleDeleteCollection = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/collection`, {
        data: { collection_name: selectedCollection?.collection_name },
        headers: {
          "Content-Type": "application/json",
          "Delete-Collection": "true",
        },
      });

      showToast("success", "Collection deleted successfully.");
      fetchCollections();
      setShowDeleteModal(false);
    } catch {
      showToast("danger", "Failed to delete collection.");
    }
  };

  return (
    <div>
      <CustomNavbar />
      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Healthcheck Collections</h2>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            Add Collection
          </Button>
        </div>
        <CollectionTable
          collections={collections}
          onDelete={(collection) => {
            setSelectedCollection(collection);
            setShowDeleteModal(true);
          }}
          onView={handleView}
        />
        <AddCollectionModal
          show={showAddModal}
          onHide={() => setShowAddModal(false)}
          generatedCollectionName={generatedCollectionName}
          files={files}
          errorMessage={errorMessage}
          isProcessing={isProcessing}
          onFileChange={handleFileChange}
          onAddCollection={handleAddCollection}
        />
        <CollectionConfirmDelete
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          collectionName={selectedCollection?.collection_name}
          onDelete={handleDeleteCollection}
        />
      </Container>
      <ToastContainer position="top-end" className="p-3">
        <Toast
          show={toast.show}
          bg={toast.variant}
          onClose={() => setToast({ show: false, message: "", variant: "" })}
        >
          <Toast.Header>
            <strong className="me-auto">
              {toast.variant === "success" ? "Success" : "Error"}
            </strong>{" "}
          </Toast.Header>{" "}
          <Toast.Body>{toast.message}</Toast.Body>{" "}
        </Toast>{" "}
      </ToastContainer>{" "}
    </div>
  );
};

export default MainPage;
