
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function CreateBook() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    isbn: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim()) {
      setError("Book title is required");
      return;
    }

    try {
      setLoading(true);

      await api.post("/books", {
        title: formData.title.trim(),
        isbn: formData.isbn.trim(),
      });

      navigate("/author/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to create book"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create New Book</h2>
        <p className="auth-heading">Add your book details</p>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Book Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter book title"
              required
            />
          </div>

          <div className="input-group">
            <label>ISBN (Optional)</label>
            <input
              type="text"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              placeholder="Enter ISBN"
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Book"}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/author/dashboard">Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );
}

export default CreateBook;
