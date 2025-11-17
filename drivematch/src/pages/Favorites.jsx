// src/pages/Favorites.jsx
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import VehicleCard from "../components/VehicleCard";

const Favorites = () => {
  const { isAuthenticated, favorites, toggleFavorite, loadingAuth } =
    useContext(AuthContext);

  const [localFavs, setLocalFavs] = useState([]);

  useEffect(() => {
    setLocalFavs(favorites);
  }, [favorites]);

  const showToast = (msg, error = false) => {
    const toast = document.createElement("div");
    toast.textContent = msg;
    toast.className = `fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg animate-fade-in-out text-sm z-[9999] ${
      error ? "bg-red-600" : "bg-blue-600"
    } text-white`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  };

  const handleRemove = async (id) => {
    await toggleFavorite(id);
    showToast("Removed from favorites");
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center text-neutral-500">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-2xl font-semibold mb-3 text-blue-600">
          Login Required
        </h2>
        <p className="opacity-70 text-lg">
          Please login to view your favorite vehicles.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-6 bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold text-blue-600 mb-8">
          ❤️ Your Favorite Vehicles
        </h1>

        {localFavs.length === 0 ? (
          <p className="text-lg opacity-70">No favorites yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {localFavs.map((v) => (
              <div key={v._id} className="relative">
                <VehicleCard vehicle={v} />

                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(v._id)}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fade animation */}
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(10px); }
          10%, 90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(10px); }
        }
        .animate-fade-in-out {
          animation: fadeInOut 2.5s ease forwards;
        }
      `}</style>
    </div>
  );
};

export default Favorites;
