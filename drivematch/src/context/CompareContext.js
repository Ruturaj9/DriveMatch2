import { createContext } from "react";

export const CompareContext = createContext({
  rooms: {},
  addVehicleToRoom: () => {},
  removeVehicleFromRoom: () => {},
  clearRoom: () => {},
});
