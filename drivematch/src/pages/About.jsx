import { motion } from "framer-motion";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import {
  Car,
  Gauge,
  Sparkles,
  Lightbulb,
  GitCompare,
  BarChart3,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const About = () => {
  const { theme } = useContext(ThemeContext);
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] transition-colors">

      {/* 🌠 HERO */}
      <section
        className={`py-20 text-center shadow-lg transition-colors duration-300 rounded-b ${
          theme === "dark"
            ? "bg-gradient-to-r from-zinc-600/70 via-zinc-800 to-zinc-900 text-white"
            : "bg-gradient-to-r from-blue-100/60 via-blue-200/60 to-cyan-200/60 text-neutral-900"
        }`}
      >
        <motion.h1
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.3 }}
          className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight"
        >
          About <span className="text-white">DriveMatch</span>
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.4 }}
          className="text-neutral-500 text-lg max-w-2xl mx-auto"
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
          className="
            bg-[var(--color-bg)] 
            border border-[var(--color-text)]/20 
            rounded-2xl shadow-xl p-8
          "
        >
          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-4">
            🚀 Our Mission
          </h2>

          <p className="text-[var(--color-text)]/70 leading-relaxed text-lg">
            DriveMatch was created with a simple purpose — to simplify the process
            of finding and comparing the perfect vehicle. Whether you're looking
            for your next car or bike, DriveMatch gives you
            <b> data-driven insights</b>, <b>AI-powered analysis</b>, and a
            <b> clean, modern interface</b> to explore options effortlessly.
          </p>
        </motion.div>
      </section>

      {/* 🔹 Feature Highlights */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="text-3xl font-bold text-center mb-10">
          Why DriveMatch?
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            {
              icon: <GitCompare size={28} />,
              title: "Powerful Vehicle Comparison",
              desc: "Compare multiple vehicles side-by-side with real-time highlighting and AI verdicts.",
            },
            {
              icon: <Sparkles size={28} />,
              title: "AI-Driven Recommendations",
              desc: "Analyzes mileage, price, specs and more to suggest the perfect option.",
            },
            {
              icon: <Car size={28} />,
              title: "Detailed Specifications",
              desc: "Everything from engine to transmission — neatly structured for clarity.",
            },
            {
              icon: <Gauge size={28} />,
              title: "Performance Insights",
              desc: "Performance scores, mileage stats, and more at your fingertips.",
            },
            {
              icon: <BarChart3 size={28} />,
              title: "Visual Insights Dashboard",
              desc: "Beautiful visualizations with real-time analytics.",
            },
            {
              icon: <Lightbulb size={28} />,
              title: "Smart User Experience",
              desc: "Smooth animations, filters, dark mode, and premium UI design.",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="show"
              variants={fadeUp}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              className="
                bg-[var(--color-bg)] 
                border border-[var(--color-text)]/20
                rounded-2xl shadow-lg 
                p-6 hover:shadow-xl 
                transition cursor-default
              "
            >
              <div className="text-blue-600 dark:text-blue-400 mb-4">
                {feature.icon}
              </div>

              <h3 className="text-lg font-semibold mb-2">
                {feature.title}
              </h3>

              <p className="text-[var(--color-text)]/70">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 🤝 Contact / Footer */}
      <section className="py-14 bg-[var(--color-text)]/5 text-center">
        <h2 className="text-2xl font-bold mb-3">Have Questions?</h2>

        <p className="text-[var(--color-text)]/70">
          We're constantly improving DriveMatch. Feel free to reach out or share ideas!
        </p>
      </section>
    </div>
  );
};

export default About;
