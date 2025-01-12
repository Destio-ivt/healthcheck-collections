import React from "react";
import { Table, Button } from "react-bootstrap";

const CollectionTable = ({ collections, onDelete, onView }) => (
  <Table striped bordered hover>
    <thead>
      <tr>
        <th>No</th>
        <th>Collection Name</th>
        <th>Clusters Added</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      {collections.map((collection, index) => (
        <tr key={index}>
          <td>{index + 1}</td>
          <td>{collection.collection_name}</td>
          <td>{collection.clusters.length}</td>
          <td className="d-flex gap-2">
            <Button variant="primary" onClick={() => onView(collection.collection_name)}>
              Detail <i className="fa fa-info-circle"></i>
            </Button>
            <Button variant="danger" onClick={() => onDelete(collection)}>
              Delete <i className="fa fa-trash"></i>
            </Button>
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
);

export default CollectionTable;
