
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function TicketDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await api.get(`/tickets/${id}`);
        setTicket(response.data.ticket);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load ticket"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  const handleReply = async (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    try {
      setSending(true);
      setError("");

      const response = await api.post(`/tickets/${id}/messages`, {
        message: message.trim(),
      });

      setTicket(response.data.data);
      setMessage("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to send reply"
      );
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p>Loading ticket...</p>;

  if (error && !ticket) {
    return <p className="error-message">{error}</p>;
  }

  if (!ticket) return <p>Ticket not found.</p>;

  return (
    <div className="dashboard-placeholder">
      <header className="dashboard-header">
        <h2>BookLeaf</h2>
        <Link to="/author/tickets" className="back-link">
          <ArrowLeft size={17} /> My Tickets
        </Link>
      </header>

      <main className="dashboard-content">
        <h1>{ticket.subject}</h1>

        <section className="dashboard-section">
          <p><strong>Ticket No:</strong> {ticket.ticketNumber}</p>
          <p><strong>Category:</strong> {ticket.category}</p>
          <p><strong>Priority:</strong> {ticket.priority}</p>
          <p><strong>Status:</strong> {ticket.status}</p>
          <p><strong>Book:</strong> {ticket.book?.title || "Not linked"}</p>

          <div className="ticket-description">
            <strong>Description</strong>
            <p>{ticket.description}</p>
          </div>
        </section>

        <section className="dashboard-section">
          <h2>Conversation</h2>

          {ticket.messages?.length === 0 && (
            <p>No replies yet.</p>
          )}

          <div className="ticket-messages">
            {ticket.messages?.map((item, index) => {
              const senderId = String(
                item.sender?._id || item.sender
              );

              const isAuthor = senderId === String(user?.id);

              return (
                <div className="ticket-message" key={item._id || index}>
                  <strong>{isAuthor ? "You" : "Support Team"}</strong>
                  <p>{item.message}</p>
                  <small>
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : ""}
                  </small>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleReply} className="ticket-reply-form">
            {error && <p className="error-message">{error}</p>}

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your reply..."
              rows={4}
              required
            />

            <button
              type="submit"
              className="auth-button"
              disabled={sending || !message.trim()}
            >
              {sending ? "Sending..." : "Send Reply"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default TicketDetails;
