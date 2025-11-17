// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

// CONTEXT
import { ThemeProvider } from "./context/ThemeProvider";
import { CompareProvider } from "./context/CompareProvider";

// LAYOUT
import Navbar from "./components/Navbar";
import ChatAssistant from "./components/ChatAssistant";

// PAGES
import Home from "./pages/Home";
import Compare from "./pages/Compare";
import CompareHistory from "./pages/CompareHistory";
import Insights from "./pages/Insights";
import VehicleDetails from "./pages/VehicleDetails";
import About from "./pages/About";
import { AuthProvider } from "./context/AuthContext"; 
import Login from "./pages/Login";
import Favorites from "./pages/Favorites"; 


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
      <CompareProvider>
        <BrowserRouter>

          {/* GLOBAL NAVBAR */}
          <Navbar />

          {/* ROUTES */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/history" element={<CompareHistory />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/vehicle/:id" element={<VehicleDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/favorites" element={<Favorites />} />
          </Routes>

          {/* FLOATING AI CHAT ASSISTANT */}
          <ChatAssistant />

        </BrowserRouter>
      </CompareProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
