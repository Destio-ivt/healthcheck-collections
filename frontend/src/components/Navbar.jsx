import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import axios from "axios";
import { useNavigate, useLocation, matchPath } from "react-router-dom";

const CustomNavbar = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch collections from API
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/collection`);
        setCollections(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch collections:", error);
      }
    };
    fetchCollections();
  }, []);

  // Update selected collection based on current location
  useEffect(() => {
    const mainMenuMatch = matchPath({ path: "/" }, location.pathname);
    const chartOrServerMatch = matchPath(
      { path: "/collection/:collection_name/cluster/:cluster_name/:type" },
      location.pathname
    );
    const detailMatch = matchPath(
      { path: "/collection-detail/:collection_name/:type" },
      location.pathname
    );

    if (mainMenuMatch) {
      setSelectedCollection(""); // Clear collection on main menu
    } else if (chartOrServerMatch) {
      setSelectedCollection(chartOrServerMatch.params.collection_name);
    } else if (detailMatch) {
      setSelectedCollection(detailMatch.params.collection_name);
    }
  }, [location]);

  // Handle collection selection from dropdown
  const handleSelectCollection = (collectionName) => {
    navigate(`/collection-detail/${collectionName}/clusters`);
  };

  const isActive = (path) => location.pathname.includes(path);

  return (
    <Navbar style={{ backgroundColor: "#6c757d" }} expand="lg" className="py-3">
      <Container>
        {/* Menu 1: Healthcheck Collections */}
        <Navbar.Brand
          href="/"
          className="fs-5 fw-bold text-white text-uppercase"
          style={{ cursor: "pointer" }}
        >
          Healthcheck Collections
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {/* Menu 2: Dropdown with collections */}
            <NavDropdown
              title={selectedCollection || "Select Collection"}
              id="collection-dropdown"
              className="fs-5 fw-semibold text-white"
            >
              {collections.map((collection) => (
                <NavDropdown.Item
                  key={collection.collection_name}
                  onClick={() => handleSelectCollection(collection.collection_name)}
                  className="fs-6 text-dark"
                >
                  {collection.collection_name || "Unnamed Collection"}
                </NavDropdown.Item>
              ))}
            </NavDropdown>

            {/* Menu 3: Clusters and Reports */}
            {selectedCollection && (
              <>
                <Nav.Link
                  href={`/collection-detail/${selectedCollection}/clusters`}
                  className={`fs-5 fw-semibold ${
                    isActive("/clusters") ? "text-white fw-bold" : "text-white"
                  }`}
                  style={{
                    borderBottom: isActive("/clusters")
                      ? "3px solid #f8f9fa"
                      : "none",
                  }}
                >
                  Clusters
                </Nav.Link>
                <Nav.Link
                  href={`/collection-detail/${selectedCollection}/reports`}
                  className={`fs-5 fw-semibold ${
                    isActive("/reports") ? "text-white fw-bold" : "text-white"
                  }`}
                  style={{
                    borderBottom: isActive("/reports")
                      ? "3px solid #f8f9fa"
                      : "none",
                  }}
                >
                  Reports
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>

      <style jsx="true">{`
        .nav-link {
          transition: background-color 0.3s ease, color 0.3s ease;
        }
        .nav-link:hover {
          background-color: #5a6268; /* Darker shade of Bootstrap secondary */
          color: #f8f9fa;
        }
      `}</style>
    </Navbar>
  );
};

export default CustomNavbar;
