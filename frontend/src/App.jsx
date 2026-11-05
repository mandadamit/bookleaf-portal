
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useAuth } from "./context/AuthContext";
import "./App.css";
import AuthorDashboard from "./pages/AuthorDashboard";
import CreateBook from "./pages/CreateBook";
import LogoutButton from "./components/LogoutButton";
import MyBooks from "./pages/MyBooks";
import CreateTicket from "./pages/CreateTicket";
import MyTickets from "./pages/MyTickets";
import TicketDetails from "./pages/TicketDetails";
import AdminDashboard from "./pages/AdminDashboard";
import AdminTickets from "./pages/AdminTickets";AdminDashboard

function DashboardPlaceholder({ title }) {
  const { user } = useAuth();

  return (
    <div className="dashboard-placeholder">
      <header className="dashboard-header">
        <h2>BookLeaf</h2>
        <div className="dashboard-user">
          <span>{user.name}</span>
          <LogoutButton />
        </div>
      </header>

      <main className="dashboard-content">
        <h1>{title}</h1>
        <p>Welcome back, {user.name}!</p>
        <p>Your {user.role.toLowerCase()} portal is ready.</p>
      </main>
    </div>
  );
}


function App() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to={isAuthenticated ? `/${user.role.toLowerCase()}/dashboard` : "/login"}
            replace
          />
        }
      />

      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace />
          ) : (
            <Login />
          )
        }
      />

      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace />
          ) : (
            <Register />
          )
        }
      />

      <Route
  path="/author/dashboard"
  element={
    isAuthenticated && user.role === "AUTHOR"
      ? <AuthorDashboard />
      : <Navigate to="/" replace />
  }
/>

      <Route
  path="/admin/dashboard"
  element={
    isAuthenticated && user.role === "ADMIN"
      ? <AdminDashboard />
      : <Navigate to="/" replace />
  }
/>
<Route
  path="/admin/tickets"
  element={
    isAuthenticated && user.role === "ADMIN"
      ? <AdminTickets />
      : <Navigate to="/" replace />
  }
/>
      <Route
  path="/author/books/create"
  element={
    isAuthenticated && user.role === "AUTHOR"
      ? <CreateBook />
      : <Navigate to="/" replace />
  }
/>

<Route
  path="/author/books"
  element={
    isAuthenticated && user.role === "AUTHOR"
      ? <MyBooks />
      : <Navigate to="/" replace />
  }
/>
<Route
  path="/author/tickets/create"
  element={
    isAuthenticated && user.role === "AUTHOR"
      ? <CreateTicket />
      : <Navigate to="/" replace />
  }
/>
<Route
  path="/author/tickets"
  element={
    isAuthenticated && user.role === "AUTHOR"
      ? <MyTickets />
      : <Navigate to="/" replace />
  }
/>

<Route
  path="/author/tickets/:id"
  element={
    isAuthenticated && user.role === "AUTHOR"
      ? <TicketDetails />
      : <Navigate to="/" replace />
  }
/>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
