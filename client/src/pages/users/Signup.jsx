const Signup = ({ handleRegister, name, setName, email, setEmail, password, setPassword, onSwitchToLogin }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center px-10 text-center">
      <h1 className="text-3xl font-bold mb-4" data-aos="fade-up">Create Account</h1>
      <form onSubmit={handleRegister} className="w-full">
        <div className="form-group" data-aos="fade-up" data-aos-delay="100">
          <input
            type="text"
            id="signup-name"
            placeholder=" "
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input"
            required
          />
          <label htmlFor="signup-name" className="form-label">Name</label>
        </div>
        <div className="form-group" data-aos="fade-up" data-aos-delay="200">
          <input
            type="email"
            id="signup-email"
            placeholder=" "
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
            required
          />
          <label htmlFor="signup-email" className="form-label">Email</label>
        </div>
        <div className="form-group" data-aos="fade-up" data-aos-delay="400">
          <input
            type="password"
            id="signup-password"
            placeholder=" "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            required
          />
          <label htmlFor="signup-password" className="form-label">Password</label>
        </div>
        <div className="form-group" data-aos="fade-up" data-aos-delay="500">
          <input
            type="password"
            id="signup-confirm-password"
            placeholder=" "
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="form-input"
            required
          />
          <label htmlFor="signup-confirm-password" className="form-label">Confirm Password</label>
        </div>
        <button
          type="submit"
          className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold uppercase tracking-wider transform hover:scale-105 transition-all duration-500"
          data-aos="fade-up" 
          data-aos-delay="300"
        >
          Sign Up
        </button>
      </form>
      <p className="text-sm text-center mt-6" data-aos="fade-up" data-aos-delay="400">
        Already have an account?{" "}
        <button onClick={onSwitchToLogin} className="text-blue-600 font-semibold hover:underline focus:outline-none">
          Login
        </button>
      </p>
    </div>
  );
};

export default Signup;
