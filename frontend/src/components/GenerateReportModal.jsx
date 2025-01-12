import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form, Spinner } from "react-bootstrap";

const GenerateReportModal = ({
  show,
  onClose,
  collectionName,
  onReportGenerated,
}) => {
  const [clusters, setClusters] = useState([]);
  const [selectedClusters, setSelectedClusters] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [checkAll, setCheckAll] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (show && collectionName) {
      const fetchClusters = async () => {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/collection/?collection_name=${collectionName}`
          );
          setClusters(response.data.data.clusters || []);
        } catch (error) {
          console.error("Failed to fetch clusters:", error);
          setErrorMessage("Failed to load clusters. Please try again.");
        }
      };

      fetchClusters();
    }
  }, [show, collectionName, API_BASE_URL]);

  const handleClusterChange = (clusterName) => {
    setSelectedClusters((prevSelected) =>
      prevSelected.includes(clusterName)
        ? prevSelected.filter((name) => name !== clusterName)
        : [...prevSelected, clusterName]
    );
  };

  const handleCheckAll = () => {
    if (!checkAll) {
      setSelectedClusters(clusters.map((cluster) => cluster.cluster_name));
    } else {
      setSelectedClusters([]);
    }
    setCheckAll(!checkAll);
  };

  const onGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const requestBody = {
        collection_name: collectionName,
        cluster_names: selectedClusters,
      };

      const headers = {
        "Content-Type": "application/json",
        "Generate-Report":
          import.meta.env.VITE_GENERATE_REPORT_HEADER || "true",
      };

      const response = await axios.post(
        `${API_BASE_URL}/report/generate`,
        requestBody,
        { headers }
      );

      const { msg } = response.data;
      onReportGenerated(msg || "Reports generated successfully");
      onClose();
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        "Failed to generate report. Please try again.";
      console.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Generate Report</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="collectionName">
            <Form.Label>Collection Name</Form.Label>
            <Form.Control
              type="text"
              value={collectionName}
              readOnly
              placeholder="Collection Name"
            />
          </Form.Group>
          <Form.Group controlId="clusters" className="mt-3">
            <Form.Label>Cluster(s)</Form.Label>
            <Form.Check
              type="checkbox"
              label="Check All"
              checked={checkAll}
              onChange={handleCheckAll}
            />
            {clusters.length > 0 ? (
              clusters.map((cluster) => (
                <Form.Check
                  type="checkbox"
                  label={cluster.cluster_name}
                  key={cluster.cluster_name}
                  value={cluster.cluster_name}
                  checked={selectedClusters.includes(cluster.cluster_name)}
                  onChange={() => handleClusterChange(cluster.cluster_name)}
                />
              ))
            ) : (
              <p>No clusters available for this collection.</p>
            )}
          </Form.Group>
        </Form>
        {isGenerating && (
          <div className="d-flex align-items-center mt-3">
            <Spinner
              animation="border"
              role="status"
              size="sm"
              className="me-2"
            />
            <span>Generating Report</span>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={isGenerating}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={onGenerateReport}
          disabled={clusters.length === 0 || isGenerating || errorMessage}
        >
          {isGenerating ? "Generating..." : "Generate"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GenerateReportModal;
