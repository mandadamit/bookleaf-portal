
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import LogoutButton from "../components/LogoutButton";
import { useAuth } from "../context/AuthContext";

function AdminTickets() {
    const { user } = useAuth();

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await api.get("/admin/tickets?limit=10");
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
                <h2>BookLeaf Admin</h2>

                <div className="dashboard-user">
                    <span>{user?.name}</span>
                    <LogoutButton />
                </div>
            </header>

            <main className="dashboard-content">
                <div className="dashboard-title-row">
                    <div>
                        <h1>Support Tickets</h1>
                        <p>Manage all author support tickets.</p>
                    </div>

                    <Link to="/admin/dashboard" className="view-ticket-button">Back to Dashboard</Link>
                </div>

                {loading && <p>Loading tickets...</p>}
                {error && <p className="error-message">{error}</p>}
                {!loading && !error && (
                    <section className="dashboard-section">
                        <h2>All Tickets ({tickets.length})</h2>
                        {tickets.length === 0 ? (<p>No support tickets found.</p>) : (
                            <div className="dashboard-list">{tickets.map((ticket) => (
                                <div className="dashboard-list-item" key={ticket._id}>
                                    <div><strong>{ticket.subject}</strong>
                                        <p>{ticket.ticketNumber} ·{" "}{ticket.author?.name || "Unknown Author"}</p>
                                        <p>{ticket.category} · {ticket.priority}</p>
                                        <p>Book: {ticket.book?.title || "Not linked"}</p>
                                    </div>

                                    <div>
                                        <span className="ticket-status">{ticket.status}</span>
                                        <p>{new Date(ticket.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>))}
                            </div>
                        )}
                    </section>
                )}
            </main>
        </div>
        );
    }

export default AdminTickets;
