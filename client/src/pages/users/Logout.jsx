import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Clear tokens
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');

        // Reload page - Context will re-initialize without user
        window.location.href = '/';
    }, [navigate]);

    return null; // This component doesn't render anything
}

export default Logout