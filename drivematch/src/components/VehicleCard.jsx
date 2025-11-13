import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CarFront } from "lucide-react";

const VehicleCard = ({ vehicle, className = "" }) => {
  const handleImageError = (e) => (e.target.src = "/placeholder.jpg");

  if (!vehicle) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`bg-neutral-98 dark:bg-neutral-20 border border-neutral-90 dark:border-neutral-40 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition p-4 ${className}`}
    >
      {/* IMAGE */}
      {vehicle.image ? (
        <img
          src={vehicle.image}
          alt={vehicle.name}
          onError={handleImageError}
          className="w-full h-40 object-cover rounded-xl"
        />
      ) : (
        <div className="w-full h-40 bg-neutral-90 dark:bg-neutral-40 rounded-xl flex items-center justify-center">
          <CarFront className="text-neutral-40 dark:text-neutral-70" size={36} />
        </div>
      )}

      {/* TITLE */}
      <h4 className="text-lg font-bold mt-3">{vehicle.name}</h4>
      <p className="text-neutral-40 dark:text-neutral-70 text-sm">{vehicle.brand}</p>

      {/* PRICE */}
      <p className="text-blue-60 dark:text-blue-40 font-semibold text-lg mt-1">
        ₹{vehicle.price?.toLocaleString()}
      </p>

      {/* DETAILS BUTTON */}
      <Link
        to={`/vehicle/${vehicle._id}`}
        className="mt-4 block bg-blue-60 hover:bg-blue-70 text-white py-2 rounded-lg text-center transition font-medium"
      >
        View Details
      </Link>
    </motion.div>
  );
};

export default VehicleCard;
