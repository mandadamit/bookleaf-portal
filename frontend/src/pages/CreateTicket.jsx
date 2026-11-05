
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../services/api";

const categories = [
  { value: "ROYALTY_PAYMENTS", label: "Royalty Payments" },
  { value: "ISBN_METADATA", label: "ISBN / Metadata" },
  { value: "PRINTING_QUALITY", label: "Printing Quality" },
  { value: "DISTRIBUTION_AVAILABILITY", label: "Distribution / Availability" },
  { value: "BOOK_STATUS", label: "Book Status" },
  { value: "GENERAL_INQUIRY", label: "General Inquiry" },
  { value: "ACCOUNT", label: "Account" },
];

function CreateTicket() {
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    bookId: "",
    category: "GENERAL_INQUIRY",
  });

  const [loading, setLoading] = useState(false);
  const [booksLoading, setBooksLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await api.get("/books/my-books");
        setBooks(response.data.books || []);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load books");
      } finally {
        setBooksLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      await api.post("/tickets", {
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        bookId: formData.bookId || undefined,
        category: formData.category,
      });

      navigate("/author/tickets");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to create support ticket"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-placeholder">
      <header className="dashboard-header">
        <h2>BookLeaf</h2>
        <Link to="/author/dashboard" className="back-link">
          <ArrowLeft size={17} /> Dashboard
        </Link>
      </header>

      <main className="dashboard-content">
        <h1>Raise Support Ticket</h1>
        <p>Describe your issue and our support team will assist you.</p>

        <section className="dashboard-section ticket-form-section">
          {error && <p className="error-message">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Enter ticket subject"
                required
              />
            </div>

            <div className="input-group">
              <label>Related Book (Optional)</label>
              <select
                name="bookId"
                value={formData.bookId}
                onChange={handleChange}
                disabled={booksLoading}
              >
                <option value="">
                  {booksLoading ? "Loading books..." : "Select a book"}
                </option>

                {books.map((book) => (
                  <option key={book._id} value={book._id}>
                    {book.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your issue in detail..."
                rows={6}
                required
              />
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={loading || booksLoading}
            >
              {loading ? "Submitting..." : "Submit Ticket"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default CreateTicket;
