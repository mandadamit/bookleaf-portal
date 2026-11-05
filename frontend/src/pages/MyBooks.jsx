
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ArrowLeft } from "lucide-react";
import api from "../services/api";

function MyBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await api.get("/books/my-books");
        setBooks(response.data.books || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load books"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  return (
    <div className="dashboard-placeholder">
      <header className="dashboard-header">
        <h2>BookLeaf</h2>
        <Link to="/author/dashboard" className="back-link">
          <ArrowLeft size={17} /> Dashboard
        </Link>
      </header>

      <main className="dashboard-content">
        <h1>My Books</h1>
        <p>Manage and view all your registered books.</p>

        {loading && <p>Loading books...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && books.length === 0 && (
          <p>No books found. Create your first book!</p>
        )}

        {!loading && books.length > 0 && (
          <section className="books-grid">
            {books.map((book) => (
              <div className="book-card" key={book._id}>
                <div className="book-card-icon">
                  <BookOpen size={28} />
                </div>

                <h3>{book.title}</h3>

                <p>
                  <strong>ISBN:</strong> {book.isbn || "Not provided"}
                </p>

                <p>
                  <strong>Created:</strong>{" "}
                  {book.createdAt
                    ? new Date(book.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export default MyBooks;
