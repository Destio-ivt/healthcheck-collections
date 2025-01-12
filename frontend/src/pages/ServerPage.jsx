import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CustomNavbar from "../components/Navbar";
import { Button, Table } from "react-bootstrap";
import ServerContentModal from "../components/ServerContentModal";

const ServerPage = () => {
  const { collection_name, cluster_name } = useParams();
  const navigate = useNavigate();
  const [servers, setServers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [fileContent, setFileContent] = useState(null);
  const [filename, setFileName] = useState(null)
  const [serverName, setServerName] = useState(null)
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetch(
      `${API_BASE_URL}/cluster/?cluster_name=${cluster_name}&collection_name=${collection_name}`
    )
      .then((response) => response.json())
      .then((data) => setServers(data.data.servers || []))
      .catch((error) => console.error("Error fetching servers:", error));
  }, [collection_name, cluster_name]);

  const handleOpenFile = async (server_name, file) => {
    try {
      setError(null);
      setFileContent(null);
      setFileName(null)
      setServerName(null)

      const response = await fetch(
        `${API_BASE_URL}/server/file/?collection_name=${collection_name}&cluster_name=${cluster_name}&server_name=${server_name}&file_name=${file}`
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.text();
      setFileContent(data);
      setShowModal(true);
      setServerName(server_name)
      setFileName(file)
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
            <Button variant="primary">
              <h4>Servers</h4>
            </Button>
          </h2>
          <div className="d-flex gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                navigate(`/collection-detail/${collection_name}/clusters`)
              }
            >
              Back
            </Button>
          </div>
        </div>
        {servers.length > 0 ? (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>No</th>
                <th>Server Name</th>
                <th>File Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {servers.map((server, index) => (
                <React.Fragment key={index}>
                  {server.files.length > 0 ? (
                    server.files.map((file, fileIndex) => (
                      <tr key={`${index}-${fileIndex}`}>
                        {fileIndex === 0 && (
                          <>
                            <td
                              rowSpan={server.files.length}
                              style={{
                                verticalAlign: "middle",
                                textAlign: "center",
                              }}
                            >
                              {index + 1}
                            </td>
                            <td
                              rowSpan={server.files.length}
                              style={{ verticalAlign: "middle" }}
                            >
                              {server.server_name}
                            </td>
                          </>
                        )}
                        <td>{file}</td>
                        <td>
                          <Button
                            variant="primary"
                            onClick={() =>
                              handleOpenFile(server.server_name, file)
                            }
                          >
                            Open File <i className="fa fa-file"></i>
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr key={`no-files-${index}`}>
                      <td style={{ textAlign: "center" }}>{index + 1}</td>
                      <td>{server.server_name}</td>
                      <td>No files</td>
                      <td>-</td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </Table>
        ) : (
          <p className="text-center">No servers available for this cluster.</p>
        )}
      </div>

      <ServerContentModal
        show={showModal}
        onClose={() => setShowModal(false)}
        fileContent={fileContent}
        error={error}
        filename={filename}
        server={serverName}
      />
    </div>
  );
};

export default ServerPage;
