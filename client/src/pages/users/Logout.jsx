import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.removeItem('token'); // Clear the token from local storage
        sessionStorage.removeItem('token'); // Clear the token from session storage
        // After removing the token, navigate to the home page and then force a full reload.
        // The full reload ensures all application state, including context, is reset.
        navigate('/', { replace: true }); // Navigate to home using React Router
        window.location.reload(); // Force a full page reload
    }, [navigate]); // Dependency array to ensure this runs only once on mount

    return null; // This component doesn't render anything
}

export default Logout