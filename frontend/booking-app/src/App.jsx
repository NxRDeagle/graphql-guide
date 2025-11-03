import * as React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import AuthContext from "./context/auth-context";
import Navigation from "./components/navigation";
import Auth from "./pages/auth";
import Bookings from "./pages/bookings";
import Events from "./pages/events";
import "./App.css";

function App() {
  const [authData, setAuthData] = React.useState({ token: null, userId: null });

  const login = (token, userId) => {
    setAuthData({ token, userId });
  };

  const logout = () => {
    setAuthData({ token: null, userId: null });
  };

  return (
    <BrowserRouter>
      <AuthContext.Provider
        value={{
          token: authData.token,
          userId: authData.userId,
          login,
          logout,
        }}
      >
        <Navigation />
        <main className="main-content">
          <Routes>
            {!authData.token && (
              <Route path="/" element={<Navigate replace to="/auth" />} />
            )}
            {authData.token && (
              <Route path="/" element={<Navigate replace to="/events" />} />
            )}
            {authData.token && (
              <Route path="/auth" element={<Navigate replace to="/events" />} />
            )}
            {!authData.token && <Route path="/auth" element={<Auth />} />}
            <Route path="/events" element={<Events />} />
            {authData.token && (
              <Route path="/bookings" element={<Bookings />} />
            )}
          </Routes>
        </main>
      </AuthContext.Provider>
    </BrowserRouter>
  );
}

export default App;
