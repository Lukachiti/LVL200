function AuthModal({ isRegisterMode, setIsRegisterMode, authFormData, setAuthFormData, setToken, setUser, setShowAuthModal, setAuthError }) {
    
  
    const handleLogout = () => {
    setUser(null);
    setToken(null);
    setShowAdminModal(false);
  };
  const authError = "";
  const handleAuthInputChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setAuthFormData({ ...authFormData, [e.target.name]: value });
  };
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError("");
    const endpoint = isRegisterMode ? "/api/auth/register" : "/api/auth/login";

    fetch(`http://localhost:5000${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(authFormData),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message || "Authentication operation failed");
        return data;
      })
      .then((data) => {
        if (isRegisterMode) {
          setIsRegisterMode(false);
          setAuthError("Account registered! Proceeding to Sign In.");
        } else {
          setToken(data.token);
          setUser(data.user);
          setShowAuthModal(false);
          setAuthFormData({
            username: "",
            email: "",
            password: "",
            isAdmin: false,
          });
        }
      })
      .catch((err) => setAuthError(err.message));
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-card">
        <h2 className="auth-title">
          {isRegisterMode ? "Create Account" : "Sign In"}
        </h2>

        {authError && <div className="auth-error-msg">{authError}</div>}

        <form onSubmit={handleAuthSubmit} className="auth-form">
          {isRegisterMode && (
            <input
              type="text"
              name="username"
              placeholder="Username"
              required
              onChange={handleAuthInputChange}
              className="auth-input"
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            required
            onChange={handleAuthInputChange}
            className="auth-input"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            onChange={handleAuthInputChange}
            className="auth-input"
          />

          {isRegisterMode && (
            <label className="auth-checkbox-label">
              <input
                type="checkbox"
                name="isAdmin"
                onChange={handleAuthInputChange}
              />
              Register account with Admin Authorization status?
            </label>
          )}

          <button type="submit" className="auth-submit-btn">
            {isRegisterMode ? "Sign Up" : "Log In"}
          </button>
        </form>
        <p className="auth-switch-prompt">
          {isRegisterMode ? "Already have an account?" : "Need an account?"}
          <span
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setAuthError("");
            }}
            className="auth-switch-link"
          >
            {isRegisterMode ? "Sign In" : "Sign Up"}
          </span>
        </p>
        <button
          onClick={() => setShowAuthModal(false)}
          className="auth-cancel-btn"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default AuthModal;
