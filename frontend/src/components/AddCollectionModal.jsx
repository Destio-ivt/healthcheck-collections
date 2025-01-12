import React from "react";
import { Modal, Form, Button, Spinner } from "react-bootstrap";

const AddCollectionModal = ({
  show,
  onHide,
  generatedCollectionName,
  files,
  errorMessage,
  isProcessing,
  onFileChange,
  onAddCollection,
}) => (
  <Modal show={show} onHide={!isProcessing ? onHide : null}>
    <Modal.Header closeButton={!isProcessing}>
      <Modal.Title>Add Collection</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form>
        <Form.Group controlId="collectionName">
          <Form.Label>Collection Name</Form.Label>
          <Form.Control type="text" value={generatedCollectionName} readOnly />
        </Form.Group>
        <Form.Group controlId="fileUpload" className="mt-3">
          <Form.Label>File Server(s)</Form.Label>
          <Form.Control
            type="file"
            multiple
            onChange={onFileChange}
            accept=".zip"
            disabled={isProcessing}
          />
          {errorMessage && <Form.Text className="text-danger">{errorMessage}</Form.Text>}
        </Form.Group>
      </Form>
      {isProcessing && (
        <div className="d-flex align-items-center mt-3">
          <Spinner animation="border" role="status" size="sm" className="me-2" />
          <span>Processing Files</span>
        </div>
      )}
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={onHide} disabled={isProcessing}>
        Close
      </Button>
      <Button
        variant="primary"
        onClick={onAddCollection}
        disabled={files.length === 0 || !!errorMessage || isProcessing}
      >
        {isProcessing ? "Processing..." : "Add"}
      </Button>
    </Modal.Footer>
  </Modal>
);

export default AddCollectionModal;
