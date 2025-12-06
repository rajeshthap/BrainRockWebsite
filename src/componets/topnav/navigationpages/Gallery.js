import React, { useState, useEffect } from "react";
import { Container, Row, Spinner, Alert } from "react-bootstrap";
import "../../../assets/css/course.css";
import FooterPage from "../../footer/FooterPage";
import { Link } from "react-router-dom";

// Define the base URL for your API
const API_BASE_URL = "https://mahadevaaya.com/brainrock.in/brainrock/backendbr";

function Gallery() {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch gallery items on component mount
  useEffect(() => {
    const fetchGalleryItems = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/gallery-items/`);
        if (!response.ok) {
          throw new Error("Failed to fetch gallery items");
        }
        const result = await response.json();
        const itemsData = result.data || result;

        // Process the data to construct full image URLs
        const processedItems = itemsData.map((item) => ({
          ...item,
          fullImageUrl: item.image ? `${API_BASE_URL}${item.image}` : null,
        }));

        setGalleryItems(processedItems);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryItems();
  }, []);

  return (
    <>
      <div className="gallery-banner">
        <div className="site-breadcrumb-wpr">
          <h2 className="breadcrumb-title">Our Gallery</h2>
          <ul className="breadcrumb-menu clearfix">
            <li>
              <Link className="breadcrumb-home" to="/">
                Home
              </Link>
            </li>

            <li className="px-2">/</li>

            <li>
              <Link className="breadcrumb-about" to="/">
                Gallery
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="ourteam-section">
        <Container className="ourteam-box mt-4 mb-3">

          <div className="our-heading-team">
            {loading && (
              <div className="text-center my-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            )}

            {error && (
              <Alert variant="danger" className="mt-3">
                Error: {error}
              </Alert>
            )}

            {!loading && !error && (
              <section className="our-team-section">
                <div className="container">
                  <Row>
                    {galleryItems.length === 0 ? (
                      <div className="col-12 text-center">
                        <p>No items in the gallery.</p>
                      </div>
                    ) : (
                      galleryItems.map((item) => (
                        <div
                          className="col-lg-3 col-md-6 col-sm-6"
                          key={item.id}
                        >
                          <div className="our-our-teams">
                            <div className="pic">
                              {item.fullImageUrl ? (
                                <img
                                  src={item.fullImageUrl}
                                  alt={item.full_name}
                                />
                              ) : (
                                <div className="no-image-placeholder">
                                  No Image
                                </div>
                              )}
                            </div>

                            <div className="team-content">
                              <h3 className="title">{item.full_name}</h3>
                              <span className="post">{item.course_name}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </Row>
                </div>
              </section>
            )}
          </div>

        </Container>
        <Container fluid className="br-footer-box">
          <FooterPage />
        </Container>
      </div>
    </>
  );
}

export default Gallery;
