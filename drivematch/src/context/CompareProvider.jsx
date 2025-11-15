// src/context/CompareProvider.jsx
import { useState, useEffect } from "react";
import { CompareContext } from "./CompareContext";

export const CompareProvider = ({ children }) => {
  const [rooms, setRooms] = useState(() => {
    try {
      const saved = localStorage.getItem("compareRooms");
      return saved ? JSON.parse(saved) : { "1": [] };
    } catch {
      return { "1": [] };
    }
  });

  // ---------------------------------------------------------
  // 🧹 Remove empty rooms automatically (except Room 1)
  // ---------------------------------------------------------
  const cleanRooms = (roomsObj) => {
    const cleaned = {};

    Object.keys(roomsObj)
      .sort((a, b) => Number(a) - Number(b))
      .forEach((key, index) => {
        const room = roomsObj[key];
        // Keep Room 1 even if empty
        if (index === 0) {
          cleaned["1"] = room;
        } else if (room.length > 0) {
          cleaned[String(Object.keys(cleaned).length + 1)] = room;
        }
      });

    // Ensure at least one room exists
    if (!cleaned["1"]) cleaned["1"] = [];

    return cleaned;
  };

  // ---------------------------------------------------------
  // 🔄 Sync with localStorage
  // ---------------------------------------------------------
  useEffect(() => {
    localStorage.setItem("compareRooms", JSON.stringify(rooms));
  }, [rooms]);

  // ---------------------------------------------------------
  // ➕ Create new room
  // ---------------------------------------------------------
  const createNewRoom = () => {
    setRooms((prev) => {
      const newIndex = String(Object.keys(prev).length + 1);
      return {
        ...prev,
        [newIndex]: [],
      };
    });
  };

  // ---------------------------------------------------------
  // 🧠 Find room by vehicle type (auto-place feature)
  // ---------------------------------------------------------
  const findRoomWithType = (type) => {
    const keys = Object.keys(rooms);
    for (let key of keys) {
      const room = rooms[key];
      if (room.length > 0 && room[0].type?.toLowerCase() === type.toLowerCase()) {
        return key;
      }
    }
    return null;
  };

  // ---------------------------------------------------------
  // 🛑 Validate type compatibility
  // ---------------------------------------------------------
  const canAddToRoom = (roomNumber, vehicle) => {
    const room = rooms[roomNumber] || [];

    if (room.length === 0) return true;

    const existingType = room[0].type?.toLowerCase();
    const newType = vehicle.type?.toLowerCase();

    return existingType === newType;
  };

  // ---------------------------------------------------------
  // ➕ Add vehicle to room with:
  //    ✔ type validation
  //    ✔ auto-place in matching type room
  //    ✔ auto-clean rooms
  // ---------------------------------------------------------
  const addVehicleToRoom = (roomNumber, vehicle) => {
    if (!vehicle?._id) return { ok: false, error: "INVALID" };

    const vehicleType = vehicle.type?.toLowerCase();

    // 1️⃣ Auto place: If same type room exists, use that
    const autoRoom = findRoomWithType(vehicleType);
    if (autoRoom && autoRoom !== String(roomNumber)) {
      roomNumber = autoRoom;
    }

    // 2️⃣ Validate type
    if (!canAddToRoom(roomNumber, vehicle)) {
      return { ok: false, error: "TYPE_MISMATCH" };
    }

    setRooms((prev) => {
      const updated = structuredClone(prev);

      if (!updated[roomNumber]) updated[roomNumber] = [];

      // avoid duplicates
      if (!updated[roomNumber].some((v) => v._id === vehicle._id)) {
        updated[roomNumber].push(vehicle);
      }

      return cleanRooms(updated);
    });

    return { ok: true };
  };

  // ---------------------------------------------------------
  // ➖ Remove vehicle + clean empty rooms
  // ---------------------------------------------------------
  const removeVehicleFromRoom = (roomNumber, id) => {
    setRooms((prev) => {
      const updated = structuredClone(prev);
      updated[roomNumber] = updated[roomNumber].filter((v) => v._id !== id);

      return cleanRooms(updated);
    });
  };

  // ---------------------------------------------------------
  // 🧹 Clear entire room + clean layout
  // ---------------------------------------------------------
  const clearRoom = (roomNumber) => {
    setRooms((prev) => {
      const updated = structuredClone(prev);
      updated[roomNumber] = [];
      return cleanRooms(updated);
    });
  };

  return (
    <CompareContext.Provider
      value={{
        rooms,
        addVehicleToRoom,
        removeVehicleFromRoom,
        clearRoom,
        createNewRoom,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};
