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

  const cleanRooms = (roomsObj) => {
    const cleaned = {};
    Object.keys(roomsObj)
      .sort((a, b) => Number(a) - Number(b))
      .forEach((key, index) => {
        const room = roomsObj[key];
        if (index === 0) {
          cleaned["1"] = room;
        } else if (room.length > 0) {
          cleaned[String(Object.keys(cleaned).length + 1)] = room;
        }
      });
    if (!cleaned["1"]) cleaned["1"] = [];
    return cleaned;
  };

  useEffect(() => {
    localStorage.setItem("compareRooms", JSON.stringify(rooms));
  }, [rooms]);

  const createNewRoom = () => {
    let newIndex = 1;
    while (rooms[String(newIndex)]) {
      newIndex++;
    }
    setRooms((prev) => ({
      ...prev,
      [String(newIndex)]: [],
    }));
    return String(newIndex);
  };

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

  const canAddToRoom = (roomNumber, vehicle) => {
    const room = rooms[roomNumber] || [];
    if (room.length === 0) return true;
    const existingType = room[0].type?.toLowerCase();
    const newType = vehicle.type?.toLowerCase();
    return existingType === newType;
  };

  const addVehicleToRoom = (roomNumber, vehicle, skipAuto = false) => {
    if (!vehicle?._id) return { ok: false, error: "INVALID" };

    const vehicleType = vehicle.type?.toLowerCase();

    if (!skipAuto) {
      const autoRoom = findRoomWithType(vehicleType);
      if (autoRoom && autoRoom !== String(roomNumber)) {
        roomNumber = autoRoom;
      }
    }

    setRooms((prev) => {
      const updated = structuredClone(prev);
      if (!updated[roomNumber]) updated[roomNumber] = [];

      if (!updated[roomNumber].some((v) => v._id === vehicle._id)) {
        updated[roomNumber].push(vehicle);
      }

      return cleanRooms(updated);
    });

    return { ok: true };
  };

  const removeVehicleFromRoom = (roomNumber, id) => {
    setRooms((prev) => {
      const updated = structuredClone(prev);
      updated[roomNumber] = updated[roomNumber].filter((v) => v._id !== id);
      return cleanRooms(updated);
    });
  };

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
