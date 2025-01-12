import React from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button } from "react-bootstrap";

const ClusterTable = ({ collectionName, clusters, onDelete }) => {
  const navigate = useNavigate();

  const handleViewCharts = (cluster) => {
    navigate(
      `/collection/${collectionName}/cluster/${cluster.cluster_name}/chart`
    );
  };

  const handleViewServers = (cluster) => {
    navigate(
      `/collection/${collectionName}/cluster/${cluster.cluster_name}/server`
    );
  };

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>No</th>
          <th>Cluster Name</th>
          <th>Server Added</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {clusters.map((cluster, index) => (
          <tr key={index}>
            <td>{index + 1}</td>
            <td>{cluster.cluster_name}</td>
            <td>{cluster.servers.length}</td>
            <td className="d-flex gap-2">
              <Button
                variant="success"
                onClick={() => handleViewCharts(cluster)}
              >
                Charts <i className="fa fa-chart-bar"></i>
              </Button>
              <Button
                variant="primary"
                onClick={() => handleViewServers(cluster)}
              >
                Servers <i className="fa fa-server"></i>
              </Button>
              <Button variant="danger" onClick={() => onDelete(cluster)}>
                Delete <i className="fa fa-trash"></i>
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default ClusterTable;
