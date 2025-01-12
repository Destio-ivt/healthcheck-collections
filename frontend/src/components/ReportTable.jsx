import React from "react";
import { Table, Button } from "react-bootstrap";

const ReportTable = ({ reports, onPreviewFile }) => {
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>No</th>
          <th>Report Name</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {reports.map((report, index) => (
          <tr key={index}>
            <td>{index + 1}</td>
            <td>{report}</td>
            <td>
              <Button variant="primary" onClick={() => onPreviewFile(report)}>
                Download File <i className="fa fa-file"></i>
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default ReportTable;
