
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function LogoutButton() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <button className="logout-button" onClick={handleLogout}>
        <LogOut size={17} />
        Logout
        </button>
    );
}

export default LogoutButton;
