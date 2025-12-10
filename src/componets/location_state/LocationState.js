import React, { useEffect, useState, useCallback } from "react";
import { Form, Col } from "react-bootstrap";
import axios from "axios";
 
const LocationState = ({
  formData = {},
  handleInputChange,
  formErrors = {},
}) => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
 
  // Fetch countries once
 useEffect(() => {
  const fetchCountries = async () => {
    try {
      const res = await axios.get("https://mahadevaaya.com/backend/api/countries/");
      // Ensure it's an array
      setCountries(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
    }
  };
  fetchCountries();
}, []);
 
  // Fetch states when country changes
  useEffect(() => {
    if (!formData.country) return;
    const selectedCountry = countries.find((c) => c.name_ascii === formData.country);
    if (!selectedCountry) return;
 
    const fetchStates = async () => {
      try {
        const res = await axios.get(
          `https://mahadevaaya.com/backend/api/regions/?country=${selectedCountry.id}`
        );
        setStates(res.data);
      } catch (err) {
      }
    };
    fetchStates();
  }, [formData.country, countries]);
  // Fetch cities when state changes
  useEffect(() => {
    if (!formData.state) return;
    const selectedState = states.find((s) => s.name_ascii === formData.state);
    if (!selectedState) return;
 
    const fetchCities = async () => {
      try {
        const res = await axios.get(
          `https://mahadevaaya.com/backend/api/cities/?region=${selectedState.id}`
        );
        setCities(res.data);
      } catch (err) {
      }
    };
    fetchCities();
  }, [formData.state, states]);
 
  // Stable handler
  const onChange = useCallback(
    (field, value) => {
      handleInputChange(field, value);
        if (value && value.trim() !== "") {
      handleInputChange("clearError", field); // custom signal to clear error
    }
    },
    [handleInputChange]
  );
 
  return (
    <>
      {/* Country */}
      <Col md={4}>
        <Form.Group className="mb-3" controlId="countrySelect">
          <Form.Label className="br-label">
            Country <span className="br-span-star">*</span>
          </Form.Label>
          <Form.Select
            className="br-form-control"
            value={formData.country || ""}
            required
            onChange={(e) => onChange("country", e.target.value)}
          >
            <option value="">Select Country</option>
            {countries.map((c) => (
              <option key={c.id} value={c.name_ascii}>
                {c.name_ascii}
              </option>
            ))}
          </Form.Select>
          {formErrors.country && (
            <small className="br-alert-feedback">
              {formErrors.country}
            </small>
          )}
        </Form.Group>
      </Col>
 
      {/* State */}
      <Col md={4}>
        <Form.Group className="mb-3" controlId="stateSelect">
          <Form.Label className="br-label">
            State <span className="br-span-star">*</span>
          </Form.Label>
          <Form.Select
            className="br-form-control"
            required
            value={formData.state || ""}
            onChange={(e) => onChange("state", e.target.value)}
          >
            <option value="">Select State</option>
            {states.map((s) => (
              <option key={s.id} value={s.name_ascii}>
                {s.name_ascii}
              </option>
            ))}
          </Form.Select>
          {formErrors.state && (
            <small className="br-alert-feedback">
              {formErrors.state}
            </small>
          )}
        </Form.Group>
      </Col>
 
      {/* City */}
      <Col md={4}>
        <Form.Group className="mb-3" controlId="citySelect">
          <Form.Label className="br-label">
            City <span className="br-span-star">*</span>
          </Form.Label>
          <Form.Select
            className="br-form-control"
            required
            value={formData.city || ""}
            onChange={(e) => onChange("city", e.target.value)}
          >
            <option value="">Select City</option>
            {cities.map((ct) => (
              <option key={ct.id} value={ct.name_ascii}>
                {ct.name_ascii}
              </option>
            ))}
          </Form.Select>
          {formErrors.city && (
             <small className="br-alert-feedback">
              {formErrors.city}
            </small>
          )}
        </Form.Group>
      </Col>
    </>
  );
};
 
export default LocationState;