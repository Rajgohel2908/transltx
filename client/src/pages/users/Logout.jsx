const Logout = () => {
    localStorage.removeItem('token'); // Clear the token from local storage
  return (location.href = "/"); // Redirect to the home page
}

export default Logout