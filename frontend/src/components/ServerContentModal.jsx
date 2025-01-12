import React from "react";
import { Modal, Button } from "react-bootstrap";

const ServerContentModal = ({
  show,
  onClose,
  server,
  filename,
  fileContent,
  error,
}) => {
  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        {server ? (
          <Modal.Title>
            {server} - {filename}
          </Modal.Title>
        ) : (
          <Modal.Title>{filename}</Modal.Title>
        )}
      </Modal.Header>
      <Modal.Body>
        {error ? (
          <p className="text-danger">{error}</p>
        ) : fileContent && fileContent.startsWith("blob:") ? (
          <img src={fileContent} alt="Chart" className="img-fluid" />
        ) : (
          <pre>{fileContent}</pre>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ServerContentModal;
