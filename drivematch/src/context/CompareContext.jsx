// src/context/CompareContext.jsx
import { createContext, useState } from "react";
import axios from "axios";

export const CompareContext = createContext({
  rooms: {},
  addVehicleToRoom: () => {},
  removeVehicleFromRoom: () => {},
  clearRoom: () => {},
  createNewRoom: () => {},
  saveHistory: () => {},
});

export const CompareProvider = ({ children }) => {
  const [rooms, setRooms] = useState({
    1: [],
    2: [],
    3: [],
  });

  /* ==========================================================
     ADD VEHICLE TO ROOM
  ========================================================== */
  const addVehicleToRoom = (roomId, vehicle) => {
    const room = rooms[roomId] || [];

    // Type mismatch (cars vs bikes)
    if (room.length > 0 && room[0].type !== vehicle.type) {
      return { ok: false, error: "TYPE_MISMATCH" };
    }

    // Max 2 allowed in each room
    if (room.length >= 2) {
      return { ok: false, error: "FULL" };
    }

    const updated = {
      ...rooms,
      [roomId]: [...room, vehicle],
    };

    setRooms(updated);
    return { ok: true, room: updated[roomId] };
  };

  /* ==========================================================
     REMOVE VEHICLE
  ========================================================== */
  const removeVehicleFromRoom = (roomId, vehicleId) => {
    const updated = {
      ...rooms,
      [roomId]: rooms[roomId].filter((v) => v._id !== vehicleId),
    };
    setRooms(updated);
  };

  /* ==========================================================
     CLEAR ROOM
  ========================================================== */
  const clearRoom = (roomId) => {
    const updated = { ...rooms, [roomId]: [] };
    setRooms(updated);
  };

  /* ==========================================================
     CREATE NEW ROOM (AUTO ID)
  ========================================================== */
  const createNewRoom = () => {
    const nextId = Object.keys(rooms).length + 1;
    const updated = { ...rooms, [nextId]: [] };
    setRooms(updated);
    return nextId;
  };

  /* ==========================================================
     SAVE COMPARISON HISTORY (AUTH REQUIRED)
     — FRONTEND MUST SEND FULL VEHICLE OBJECTS
     — USE CORRECT ENDPOINT "/api/compare/save"
  ========================================================== */
  const saveHistory = async ({ roomNumber, vehicles, verdict, winnerId }) => {
    try {
      if (!vehicles || vehicles.length < 1) {
        return { ok: false, message: "No vehicles to save" };
      }

      const res = await axios.post(
        "http://localhost:5000/api/compare/save",
        {
          roomNumber,
          vehicles, // FULL OBJECTS — NOT JUST IDS
          verdict,
          winnerId,
        }
      );

      return { ok: true, message: res.data.message };
    } catch (err) {
      console.error("❌ Compare Save Error:", err);
      return {
        ok: false,
        message: err.response?.data?.message || "Failed to save history",
      };
    }
  };

  return (
    <CompareContext.Provider
      value={{
        rooms,
        addVehicleToRoom,
        removeVehicleFromRoom,
        clearRoom,
        createNewRoom,
        saveHistory,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};
