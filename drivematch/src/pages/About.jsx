import { motion } from "framer-motion";
import { Car, Gauge, Sparkles, Lightbulb, GitCompare, BarChart3 } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const About = () => {
  return (
    <div className="min-h-screen bg-neutral-98 dark:bg-neutral-10 transition-colors">
      {/* 🌠 HERO */}
      <section className="bg-gradient-to-r from-blue-50 via-blue-60 to-purple-60 text-neutral-98 py-20 shadow-md text-center">
        <motion.h1
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.3 }}
          className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight"
        >
          About <span className="text-neutral-95">DriveMatch</span>
        </motion.h1>
        <motion.p
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.4 }}
          className="text-neutral-90 text-lg max-w-2xl mx-auto"
        >
          Your intelligent vehicle comparison and recommendation companion —
          built to help you make confident decisions.
        </motion.p>
      </section>

      {/* 🌟 Mission Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial="hidden"
          whileInView="show"
          variants={fadeUp}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-neutral-20 rounded-2xl shadow-xl border border-neutral-85 dark:border-neutral-40 p-8"
        >
          <h2 className="text-2xl font-bold text-neutral-20 dark:text-neutral-90 mb-4">
            🚀 Our Mission
          </h2>

          <p className="text-neutral-40 dark:text-neutral-70 leading-relaxed text-lg">
            DriveMatch was created with a simple purpose — to simplify the process of
            finding and comparing the perfect vehicle. Whether you're looking for your
            next car or bike, DriveMatch gives you **data-driven insights**, **AI-powered analysis**, and 
            a **clean, modern interface** to explore options effortlessly.
          </p>
        </motion.div>
      </section>

      {/* 🔹 Feature Highlights */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="text-3xl font-bold text-center text-neutral-20 dark:text-neutral-90 mb-10">
          Why DriveMatch?
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            {
              icon: <GitCompare size={28} />,
              title: "Powerful Vehicle Comparison",
              desc: "Compare multiple vehicles side-by-side with real-time highlighting and AI verdicts."
            },
            {
              icon: <Sparkles size={28} />,
              title: "AI-Driven Recommendations",
              desc: "Our assistant analyzes mileage, price, specs, and more to suggest the best option."
            },
            {
              icon: <Car size={28} />,
              title: "Detailed Specifications",
              desc: "Everything from engine to transmission to features — structured cleanly."
            },
            {
              icon: <Gauge size={28} />,
              title: "Performance Insights",
              desc: "Access performance scores, mileage stats, and key analytic charts instantly."
            },
            {
              icon: <BarChart3 size={28} />,
              title: "Visual Insights Dashboard",
              desc: "Beautiful Recharts graphs help you understand vehicle data effortlessly."
            },
            {
              icon: <Lightbulb size={28} />,
              title: "Smart User Experience",
              desc: "Smooth animations, intelligent filters, dark mode, and a premium UI design."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="show"
              variants={fadeUp}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              className="
                bg-white dark:bg-neutral-20 rounded-2xl shadow-lg 
                border border-neutral-85 dark:border-neutral-40 
                p-6 hover:shadow-xl transition cursor-default
              "
            >
              <div className="text-blue-60 dark:text-blue-40 mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-neutral-20 dark:text-neutral-90 mb-2">
                {feature.title}
              </h3>
              <p className="text-neutral-40 dark:text-neutral-70">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 🤝 Contact / Footer */}
      <section className="py-14 bg-neutral-95 dark:bg-neutral-20 text-center">
        <h2 className="text-2xl font-bold text-neutral-20 dark:text-neutral-90 mb-3">
          Have Questions?
        </h2>
        <p className="text-neutral-50 dark:text-neutral-70">
          We're constantly improving DriveMatch. Feel free to reach out or share ideas!
        </p>
      </section>
    </div>
  );
};

export default About;
