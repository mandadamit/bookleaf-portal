
import { useEffect, useState } from "react";
import {
  Ticket,
  Clock,
  RefreshCw,
  MessageCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

import api from "../services/api";
import LogoutButton from "../components/LogoutButton";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

function AdminDashboard() {
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState({
    total: 0,
    statusCounts: {},
    tickets: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/admin/tickets?limit=10");
        setDashboard(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const counts = dashboard.statusCounts || {};

  const stats = [
    { label: "Total Tickets", value: dashboard.total, icon: Ticket },
    { label: "Open", value: counts.OPEN || 0, icon: Clock },
    { label: "In Progress", value: counts.IN_PROGRESS || 0, icon: RefreshCw },
    {
      label: "Waiting for Author",
      value: counts.WAITING_FOR_AUTHOR || 0,
      icon: MessageCircle,
    },
    { label: "Resolved", value: counts.RESOLVED || 0, icon: CheckCircle },
    { label: "Closed", value: counts.CLOSED || 0, icon: XCircle },
  ];

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
            <h1>Admin Dashboard</h1>
            <Link to="/admin/tickets" className="view-ticket-button">Manage Support Tickets</Link>
        </div>
        
        <p>Welcome back, {user?.name}!</p>

        {loading && <p>Loading dashboard...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && (
          <>
            <section className="dashboard-stats">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div className="stat-card" key={stat.label}>
                    <Icon />
                    <div>
                      <h3>{stat.label}</h3>
                      <strong>{stat.value}</strong>
                    </div>
                  </div>
                );
              })}
            </section>

            <section className="dashboard-section">
              <h2>Recent Support Tickets</h2>

              {dashboard.tickets.length === 0 ? (
                <p>No support tickets found.</p>
              ) : (
                <div className="dashboard-list">
                  {dashboard.tickets.map((ticket) => (
                    <div className="dashboard-list-item" key={ticket._id}>
                      <div>
                        <strong>{ticket.subject}</strong>
                        <p>
                          {ticket.ticketNumber} ·{" "}
                          {ticket.author?.name || "Unknown Author"}
                        </p>
                        <p>
                          {ticket.category} · {ticket.priority}
                        </p>
                      </div>

                      <span className="ticket-status">
                        {ticket.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
