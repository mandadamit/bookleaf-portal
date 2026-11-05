
import { useEffect, useState } from "react";
import { BookOpen, Ticket, Clock, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";
import LogoutButton from "../components/LogoutButton";
import { useAuth } from "../context/AuthContext";

function AuthorDashboard() {
  const { user } = useAuth();

  const [books, setBooks] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [booksResponse, ticketsResponse] = await Promise.all([
          api.get("/books/my-books"),
          api.get("/tickets/my-tickets"),
        ]);

        setBooks(booksResponse.data.books || []);
        setTickets(ticketsResponse.data.tickets || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const normalizedStatus = (status) => status?.toUpperCase();

  const openTickets = tickets.filter((ticket) =>
    ["OPEN", "IN_PROGRESS", "PENDING"].includes(
      normalizedStatus(ticket.status)
    )
  ).length;

  const resolvedTickets = tickets.filter((ticket) =>
    ["RESOLVED", "CLOSED"].includes(normalizedStatus(ticket.status))
  ).length;

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-placeholder">
      <header className="dashboard-header">
        <h2>BookLeaf</h2>
        <div className="dashboard-user">
          <span>{user?.name}</span>
          <LogoutButton />
        </div>
      </header>

      <main className="dashboard-content">
        <div className="dashboard-title-row">
  <h1>Author Dashboard</h1>

  <div className="dashboard-actions">
  <Link to="/author/books/create" className="create-book-button">
    + Create New Book
  </Link>

  <Link to="/author/tickets/create" className="create-book-button">
    + Raise Support Ticket
  </Link>
</div>
</div>
        <p>Welcome back, {user?.name}!</p>
        
        {error && <p className="error-message">{error}</p>}

        <section className="dashboard-stats">
          <div className="stat-card">
            <BookOpen />
            <div>
              <h3>Total Books</h3>
              <strong>{books.length}</strong>
            </div>
          </div>

          <div className="stat-card">
            <Ticket />
            <div>
              <h3>Total Tickets</h3>
              <strong>{tickets.length}</strong>
            </div>
          </div>

          <div className="stat-card">
            <Clock />
            <div>
              <h3>Open Tickets</h3>
              <strong>{openTickets}</strong>
            </div>
          </div>

          <div className="stat-card">
            <CheckCircle />
            <div>
              <h3>Resolved Tickets</h3>
              <strong>{resolvedTickets}</strong>
            </div>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="dashboard-title-row">
            <h2>My Recent Books</h2>

            <Link to="/author/books" className="create-book-button">
                View All Books
            </Link>
            </div>

          {books.length === 0 ? (
            <p>No books added yet.</p>
          ) : (
            <div className="dashboard-list">
              {books.slice(0, 5).map((book) => (
                <div className="dashboard-list-item" key={book._id}>
                  <div>
                    <strong>{book.title}</strong>
                    <p>ISBN: {book.isbn || "Not provided"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-section">
            <div className="dashboard-title-row">
                <h2>Recent Support Tickets</h2>
                <Link to="/author/tickets" className="create-book-button">
                    View All Tickets
                </Link>
            </div>

          {tickets.length === 0 ? (
            <p>No support tickets raised yet.</p>
          ) : (
            <div className="dashboard-list">
              {tickets.slice(0, 5).map((ticket) => (
                <div className="dashboard-list-item" key={ticket._id}>
                  <div>
                    <strong>{ticket.subject}</strong>
                    <p>
                      {ticket.ticketNumber} · {ticket.category}
                    </p>
                  </div>
                  <span className="ticket-status">
                    {ticket.status || "N/A"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AuthorDashboard;
