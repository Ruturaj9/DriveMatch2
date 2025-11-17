// src/context/CompareContext.jsx
import { createContext, useState } from "react";
import axios from "axios";

export const CompareContext = createContext({
  rooms: {},
  addVehicleToRoom: () => {},
  removeVehicleFromRoom: () => {},
  clearRoom: () => {},
  createNewRoom: () => {},
  findCompatibleRoom: () => {},
  saveHistory: () => {},
  getRooms: () => {},
});

export const CompareProvider = ({ children }) => {
  const [rooms, setRooms] = useState({
    1: [],
    2: [],
    3: [],
  });

  /* -------------------------------------------------------
     👍 Always return latest rooms (prevents stale state)
  ------------------------------------------------------- */
  const getRooms = () => rooms;

  /* -------------------------------------------------------
     👍 Normalize incoming vehicles so all objects match
  ------------------------------------------------------- */
  const normalize = (v) => ({
    _id: v._id,
    name: v.name,
    brand: v.brand,
    type: v.type,
    price: v.price,
    image: v.image,
    mileage: v.mileage,
    enginePower: v.enginePower,
    performanceScore: v.performanceScore,
    transmission: v.transmission,
  });

  /* -------------------------------------------------------
     👍 Find 1 room that can hold ALL vehicles together
  ------------------------------------------------------- */
  const findCompatibleRoom = (vehicles) => {
    const type = vehicles[0]?.type;
    const ids = vehicles.map((v) => v._id);

    for (const roomId of Object.keys(rooms)) {
      const room = rooms[roomId];

      // Empty room → perfect
      if (room.length === 0) return roomId;

      // Type mismatch
      if (room[0].type !== type) continue;

      // If room already contains EXACT comparison → reuse
      const roomIds = room.map((r) => r._id);
      const same =
        roomIds.length === ids.length &&
        [...roomIds].sort().every((x, i) => x === [...ids].sort()[i]);

      if (same) return roomId;

      // Must fit all vehicles together
      if (room.length + vehicles.length <= 2) return roomId;
    }

    return null;
  };

  /* -------------------------------------------------------
     👍 ADD VEHICLE (normalized, no duplicates, type-safe)
  ------------------------------------------------------- */
  const addVehicleToRoom = (roomId, vehicle) => {
    const clean = normalize(vehicle);
    const room = rooms[roomId] || [];

    // Duplicate
    if (room.some((v) => v._id === clean._id)) {
      return { ok: true, room };
    }

    // Type mismatch
    if (room.length > 0 && room[0].type !== clean.type) {
      return { ok: false, error: "TYPE_MISMATCH" };
    }

    // Max 2
    if (room.length >= 2) {
      return { ok: false, error: "FULL" };
    }

    const updated = {
      ...rooms,
      [roomId]: [...room, clean],
    };

    setRooms(updated);
    return { ok: true, room: updated[roomId] };
  };

  /* -------------------------------------------------------
     REMOVE VEHICLE
  ------------------------------------------------------- */
  const removeVehicleFromRoom = (roomId, vehicleId) => {
    const updated = {
      ...rooms,
      [roomId]: rooms[roomId].filter((v) => v._id !== vehicleId),
    };
    setRooms(updated);
  };

  /* -------------------------------------------------------
     CLEAR ROOM
  ------------------------------------------------------- */
  const clearRoom = (roomId) => {
    const updated = { ...rooms, [roomId]: [] };
    setRooms(updated);
  };

  /* -------------------------------------------------------
     CREATE NEW ROOM
  ------------------------------------------------------- */
  const createNewRoom = () => {
    const nextId = Object.keys(rooms).length + 1;
    const updated = { ...rooms, [nextId]: [] };
    setRooms(updated);
    return nextId;
  };

  /* -------------------------------------------------------
     SAVE HISTORY
  ------------------------------------------------------- */
  const saveHistory = async ({ roomNumber, vehicles, verdict, winnerId }) => {
    try {
      if (!vehicles || vehicles.length === 0) {
        return { ok: false, message: "No vehicles to save" };
      }

      const clean = vehicles.map(normalize);

      const res = await axios.post("http://localhost:5000/api/compare/save", {
        roomNumber,
        vehicles: clean,
        verdict,
        winnerId,
      });

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
        findCompatibleRoom,
        saveHistory,
        getRooms,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};
