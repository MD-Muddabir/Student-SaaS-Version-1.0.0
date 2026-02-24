/**
 * Institute Settings Page
 * Complete institute profile after registration
 */

import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import "./Dashboard.css";

function InstituteSettings() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [instituteData, setInstituteData] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        address: "",
        logo: "",
    });

    useEffect(() => {
        fetchInstituteData();
    }, []);

    const fetchInstituteData = async () => {
        try {
            const response = await api.get(`/institutes/${user.institute_id}`);
            const institute = response.data.data;
            setInstituteData(institute);
            setFormData({
                name: institute.name || "",
                phone: institute.phone || "",
                address: institute.address || "",
                logo: institute.logo || "",
            });
        } catch (error) {
            console.error("Error fetching institute:", error);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await api.put(`/institutes/${user.institute_id}`, formData);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                fetchInstituteData();
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update institute");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1>Institute Settings</h1>
                    <p>Complete your institute profile</p>
                </div>
            </div>

            {success && (
                <div className="alert alert-success" style={{ marginBottom: "1rem" }}>
                    <span>✅</span>
                    <span>Institute details updated successfully!</span>
                </div>
            )}

            {error && (
                <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
                    <span>⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Institute Information</h3>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: "1.5rem" }}>
                    <div className="form-group">
                        <label className="form-label">Institute Name *</label>
                        <input
                            type="text"
                            name="name"
                            className="form-input"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Phone Number *</label>
                        <input
                            type="tel"
                            name="phone"
                            className="form-input"
                            placeholder="9876543210"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Address *</label>
                        <textarea
                            name="address"
                            className="form-textarea"
                            rows="3"
                            placeholder="Complete address with city and pincode"
                            value={formData.address}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Logo URL (Optional)</label>
                        <input
                            type="text"
                            name="logo"
                            className="form-input"
                            placeholder="https://example.com/logo.png"
                            value={formData.logo}
                            onChange={handleChange}
                        />
                    </div>

                    {instituteData && (
                        <div className="form-group">
                            <label className="form-label">Current Plan</label>
                            <div style={{
                                padding: "0.75rem",
                                background: "#f3f4f6",
                                borderRadius: "0.5rem",
                                marginTop: "0.5rem"
                            }}>
                                <p><strong>Plan:</strong> {instituteData.Plan?.name || "No Plan"}</p>
                                <p><strong>Status:</strong> {instituteData.status}</p>
                                {instituteData.subscription_end && (
                                    <p><strong>Expires:</strong> {new Date(instituteData.subscription_end).toLocaleDateString()}</p>
                                )}
                            </div>
                        </div>
                    )}

                    <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate("/admin/dashboard")}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>

            {/* Subscription Section */}
            <div className="card" style={{ marginTop: "2rem" }}>
                <div className="card-header">
                    <h3 className="card-title">Subscription Management</h3>
                </div>
                <div style={{ padding: "1.5rem" }}>
                    <p>Upgrade your plan to unlock more features</p>
                    <button
                        className="btn btn-primary"
                        style={{ marginTop: "1rem" }}
                        onClick={() => navigate("/pricing")}
                    >
                        View Plans & Upgrade
                    </button>
                </div>
            </div>
        </div>
    );
}

export default InstituteSettings;
