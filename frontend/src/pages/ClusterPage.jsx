import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Button,
  Alert,
  Toast,
  ToastContainer,
  Modal,
} from "react-bootstrap";
import ClusterTable from "../components/ClusterTable";
import CustomNavbar from "../components/Navbar";
import AddCollectionModal from "../components/AddCollectionModal";

const ClusterPage = () => {
  const { collection_name } = useParams();
  const navigate = useNavigate();

  const [clusters, setClusters] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [files, setFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", variant: "" });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchClusters();
  }, [collection_name]);

  const fetchClusters = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/collection/?collection_name=${collection_name}`
      );
      setClusters(response.data.data.clusters);
    } catch (error) {
      console.error("Failed to fetch clusters:", error);
      setNotification({
        message: "Failed to load clusters.",
        variant: "danger",
      });
    }
  };

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
      formData.append("collection_name", collection_name);

      await axios.post(`${API_BASE_URL}/server`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Add-New-Collection": "true",
        },
      });

      setToast({
        show: true,
        message: "Files uploaded successfully.",
        variant: "success",
      });
      fetchClusters();
      setShowAddModal(false);
    } catch (error) {
      console.error("Failed to add collection:", error);
      setToast({
        show: true,
        message: "Failed to upload files.",
        variant: "danger",
      });
    } finally {
      setIsProcessing(false);
      setFiles([]);
    }
  };

  const handleDeleteCluster = (cluster) => {
    setSelectedCluster(cluster);
    setShowDeleteModal(true);
  };

  const handleDeleteSuccess = () => {
    setClusters((prevClusters) =>
      prevClusters.filter(
        (c) => c.cluster_name !== selectedCluster.cluster_name
      )
    );
  };

  const ClusterConfirmDeleteModal = ({
    show,
    onClose,
    onConfirm,
    collectionName,
    clusterName,
  }) => {
    const handleDelete = async () => {
      try {
        const requestBody = {
          collection_name: collectionName,
          cluster_name: clusterName,
        };

        const headers = {
          "Content-Type": "application/json",
          "Delete-Cluster": "true",
        };

        await axios.delete(`${API_BASE_URL}/cluster`, {
          data: requestBody,
          headers,
        });
        onConfirm();
        setToast({
          show: true,
          message: "Cluster deleted successfully.",
          variant: "success",
        });
        onClose();
      } catch (error) {
        console.error("Failed to delete cluster:", error);
        setToast({
          show: true,
          message: "Failed to delete cluster.",
          variant: "danger",
        });
      }
    };

    return (
      <Modal show={show} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Cluster</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to delete this cluster?
            <br />
            <strong>Cluster Name:</strong> {clusterName}
            <br />
            <strong>Collection Name:</strong> {collectionName}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  return (
    <div>
      <CustomNavbar />

      <Container className="mt-4">
        {notification && (
          <Alert variant={notification.variant} className="mt-2">
            {notification.message}
          </Alert>
        )}

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>
            {collection_name} Detail -{" "}
            <Button variant="danger">
              <h4>Clusters</h4>
            </Button>
          </h2>
          <div className="d-flex gap-2">
            <Button variant="secondary" onClick={() => navigate("/")}>
              Back
            </Button>
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
              Add Server
            </Button>
          </div>
        </div>

        <ClusterTable
          collectionName={collection_name}
          clusters={clusters}
          onDelete={handleDeleteCluster}
        />

        <AddCollectionModal
          show={showAddModal}
          onHide={() => setShowAddModal(false)}
          generatedCollectionName={collection_name}
          files={files}
          errorMessage={errorMessage}
          isProcessing={isProcessing}
          onFileChange={handleFileChange}
          onAddCollection={handleAddCollection}
        />

        {showDeleteModal && selectedCluster && (
          <ClusterConfirmDeleteModal
            show={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDeleteSuccess}
            collectionName={collection_name}
            clusterName={selectedCluster.cluster_name}
          />
        )}
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
            </strong>
          </Toast.Header>
          <Toast.Body>{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default ClusterPage;
