
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../services/api";

function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await api.get("/tickets/my-tickets");
        setTickets(response.data.tickets || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load tickets"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
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
        <h1>My Support Tickets</h1>
        <p>View all your submitted support requests.</p>

        {loading && <p>Loading tickets...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && tickets.length === 0 && (
          <p>No support tickets found.</p>
        )}

        {!loading && tickets.length > 0 && (
          <section className="dashboard-section">
            <div className="dashboard-list">
              {tickets.map((ticket) => (
                <div className="dashboard-list-item" key={ticket._id}>
                  <div>
                    <strong>{ticket.subject}</strong>
                    <p>Ticket No: {ticket.ticketNumber}</p>
                    <p>Category: {ticket.category}</p>
                    <p>
                      Book: {ticket.book?.title || "Not linked"}
                    </p>
                    <p>
                      Created:{" "}
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <span className="ticket-status">
                    {ticket.status || "N/A"}
                  </span>
                  <Link to={`/author/tickets/${ticket._id}`} className="view-ticket-button">
                    View Details
                    </Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default MyTickets;