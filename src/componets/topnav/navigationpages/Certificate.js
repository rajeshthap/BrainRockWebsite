import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import FooterPage from "../../footer/FooterPage";

const Certificate = () => {
  const [certificateNumber, setCertificateNumber] = useState('');
  const [certificateData, setCertificateData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!certificateNumber.trim()) {
      setError('Please enter a certificate number');
      return;
    }

    setLoading(true);
    setError('');
    setNotFound(false);
    setCertificateData(null);

    try {
      // First, fetch all certificates
      const allCertificatesResponse = await axios.get(
        "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/certificate/"
      );

      if (allCertificatesResponse.data.success && allCertificatesResponse.data.data.length > 0) {
        // Find the certificate that matches the input certificate number
        const foundCertificate = allCertificatesResponse.data.data.find(
          cert => cert.certificate_number === certificateNumber
        );

        if (foundCertificate) {
          setCertificateData(foundCertificate);
        } else {
          setNotFound(true);
        }
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error('Error fetching certificate:', err);
      setError('Failed to fetch certificate details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get the full URL for the PDF file
  const getPdfUrl = () => {
    if (!certificateData || !certificateData.pdf_file) return null;
    // The base URL is the same as the API endpoint
    const baseUrl = "https://mahadevaaya.com/brainrock.in/brainrock/backendbr";
    return `${baseUrl}${certificateData.pdf_file}`;
  };

  // Handle viewing the PDF
  const handleViewPdf = () => {
    const pdfUrl = getPdfUrl();
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  // Handle downloading the PDF
  const handleDownloadPdf = () => {
    const pdfUrl = getPdfUrl();
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.target = '_blank';
      link.download = `${certificateData.certificate_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <>
      <div className='feedback-banner'>
        <div className='site-breadcrumb-wpr'>
          <h2 className='breadcrumb-title'>Certificate Verification</h2>
          <ul className='breadcrumb-menu clearfix'>
            <li>
              <Link className="breadcrumb-home" to="/">Home</Link>
            </li>
            <li className='px-2'>/</li>
            <li>
              <Link className="breadcrumb-about" to="/">Certificate</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="ourteam-section">
        <Container className="">
          <div className="ourteam-box mt-4 mb-3 text-heading">
            <h2 className="text-center mb-4">Verify Your Certificate</h2>
            <p className="text-center mb-4">Enter your certificate number to verify its authenticity</p>

            <Form onSubmit={handleSearch} className="mb-5">
              <Row className="justify-content-center">
                <Col md={8}>
                  <Form.Group>
                    <Form.Label className="br-label">
                      Certificate Number <span className="br-span-star">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      className="br-form-control"
                      value={certificateNumber}
                      onChange={(e) => setCertificateNumber(e.target.value)}
                      placeholder="Enter Your Certificate Number"
                    />
                  </Form.Group>
                </Col>
                <Col md={4} className="d-flex align-items-end search-btn">
                  <Button
                    type="submit"
                    className="w-80"
                    variant="primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" />
                        Searching...
                      </>
                    ) : 'Search'}
                  </Button>
                </Col>
              </Row>
            </Form>

            {error && <Alert variant="danger">{error}</Alert>}

            {notFound && (
              <Alert variant="warning">
                No certificate found with number: {certificateNumber}. Please check the number and try again.
              </Alert>
            )}

            {certificateData && (
              <Card className="certificate-card mb-4">
                <Card.Header as="h5" className="text-center bg-primary text-white">
                  Certificate Details
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <p><strong>Certificate Number:</strong> {certificateData.certificate_number}</p>
                      <p><strong>Certificate ID:</strong> {certificateData.certificate_id}</p>
                      <p><strong>Full Name:</strong> {certificateData.full_name}</p>
                      <p><strong>Father's Name:</strong> {certificateData.father_name}</p>
                    </Col>
                    <Col md={6}>
                      <p><strong>Program:</strong> {certificateData.program}</p>
                      <p><strong>Start Date:</strong> {formatDate(certificateData.from_date)}</p>
                      <p><strong>End Date:</strong> {formatDate(certificateData.to_date)}</p>
                      <p><strong>Issued Date:</strong> {formatDate(certificateData.created_at)}</p>
                    </Col>
                  </Row>
                  
                  {/* PDF Section */}
                  <Row className="mt-4">
                    <Col className="text-center">
                      <h5 className="mb-3">Certificate Document</h5>
                      <div className="d-flex justify-content-center gap-3">
                        <Button 
                          variant="outline-primary" 
                          onClick={handleViewPdf}
                          disabled={!certificateData.pdf_file}
                        >
                          View PDF
                        </Button>
                        <Button 
                          variant="primary" 
                          onClick={handleDownloadPdf}
                          disabled={!certificateData.pdf_file}
                        >
                          Download PDF
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
                <Card.Footer className="text-center text-muted">
                  This certificate is authentic and issued by BrainRock Technologies
                </Card.Footer>
              </Card>
            )}
          </div>
        </Container>
      </div>

      <Container fluid className="br-footer-box">
        <FooterPage />
      </Container>
    </>
  );
};

export default Certificate;