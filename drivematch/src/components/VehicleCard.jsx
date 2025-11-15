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
      className={`bg-surface border border-outline rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition p-4 ${className}`}
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
        <div className="w-full h-40 bg-surface-variant rounded-xl flex items-center justify-center">
          <CarFront className="text-outline-variant" size={36} />
        </div>
      )}

      {/* NAME */}
      <h4 className="text-lg font-bold mt-3 text-on-surface">
        {vehicle.name}
      </h4>

      {/* BRAND */}
      <p className="text-sm text-on-surface-variant">{vehicle.brand}</p>

      {/* PRICE */}
      <p className="text-lg font-semibold text-primary mt-1">
        ₹{vehicle.price?.toLocaleString()}
      </p>

      {/* BUTTON */}
      <Link
        to={`/vehicle/${vehicle._id}`}
        className="mt-4 block bg-primary text-lg py-2 rounded-lg text-center hover:bg-primary-dark transition font-mediumbold border-2"
      >
        View Details
      </Link>
    </motion.div>
  );
};

export default VehicleCard;
