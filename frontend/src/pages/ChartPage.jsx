import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CustomNavbar from "../components/Navbar";
import ServerContentModal from "../components/ServerContentModal";
import { Button, Table } from "react-bootstrap";

const ChartPage = () => {
  const { collection_name, cluster_name } = useParams();
  const navigate = useNavigate();
  const [charts, setCharts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [fileContent, setFileContent] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchCharts = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/cluster/?cluster_name=${cluster_name}&collection_name=${collection_name}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch charts.");
        }
        const data = await response.json();
        setCharts(data.data?.charts || []);
      } catch (err) {
        console.error("Error fetching charts:", err);
      }
    };

    fetchCharts();
  }, [collection_name, cluster_name]);

  const handleFetchFile = async (file, endpoint) => {
    try {
      setError(null);
      setFileContent(null);
      setFileName(null);

      const response = await fetch(
        `${API_BASE_URL}/${endpoint}/file/?collection_name=${collection_name}&cluster_name=${cluster_name}&file_name=${file}`
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      // Check if file is an image
      if (file.endsWith(".png")) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob); // Create a URL for the blob
        setFileContent(imageUrl);
      } else {
        const text = await response.text();
        setFileContent(text);
      }
      
      setFileName(file)
      setShowModal(true);
    } catch (err) {
      setError(err.message);
      setShowModal(true);
    }
  };

  return (
    <div>
      <CustomNavbar />
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>
            {cluster_name} Detail -{" "}
            <Button variant="success">
              <h4>Charts</h4>
            </Button>
          </h2>
          <Button
            variant="secondary"
            onClick={() =>
              navigate(`/collection-detail/${collection_name}/clusters`)
            }
          >
            Back
          </Button>
        </div>
        {charts.length > 0 ? (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>No</th>
                <th>Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {charts.map((chart, index) => (
                <tr key={`${chart}-${index}`}>
                  <td>{index + 1}</td>
                  <td>{chart.replace(/\.(png|json)$/, "")}</td>
                  <td className="d-flex gap-2">
                    <Button
                      variant="primary"
                      onClick={() =>
                        handleFetchFile(
                          chart.replace(".png", ".json"),
                          "summary"
                        )
                      }
                    >
                      Open File <i className="fa fa-file"></i>
                    </Button>
                    <Button
                      variant="success"
                      onClick={() => handleFetchFile(chart, "chart")}
                    >
                      Open Image <i className="fa fa-image"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p className="text-center">No charts available for this cluster.</p>
        )}
      </div>

      <ServerContentModal
        show={showModal}
        onClose={() => setShowModal(false)}
        fileContent={fileContent}
        filename={fileName}
        error={error}
      />
    </div>
  );
};

export default ChartPage;
