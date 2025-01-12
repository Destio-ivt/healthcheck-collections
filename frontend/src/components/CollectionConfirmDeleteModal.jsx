import React from "react";
import { Modal, Button } from "react-bootstrap";

const CollectionConfirmDelete = ({ show, onHide, collectionName, onDelete }) => (
  <Modal show={show} onHide={onHide}>
    <Modal.Header closeButton>
      <Modal.Title>Delete Collection</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      Are you sure you want to delete this collection?
      <br />
      <strong>Collection Name:</strong> {collectionName}
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={onHide}>
        Cancel
      </Button>
      <Button variant="danger" onClick={onDelete}>
        Delete
      </Button>
    </Modal.Footer>
  </Modal>
);

export default CollectionConfirmDelete;
