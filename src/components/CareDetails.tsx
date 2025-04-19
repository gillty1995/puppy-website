// components/CareDetails.tsx
"use client";
import { motion } from "framer-motion";

export default function CareDetails() {
  return (
    <motion.section
      className="space-y-12 text-gray-700 leading-relaxed"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.2 } },
      }}
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-semibold">Nutrition & Feeding</h2>
        <p>
          Detailed feeding schedules, portion guidelines, and recommended brands
          to keep your puppy healthy and growing strong.
        </p>
      </motion.div>

      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-semibold">Grooming & Hygiene</h2>
        <p>
          Tips on brushing, bathing, and nail trimming to maintain a clean,
          comfortable coat.
        </p>
      </motion.div>

      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-semibold">Training & Socialization</h2>
        <p>
          Step-by-step potty training, leash walking basics, and social
          exercises to build confidence and good behavior.
        </p>
      </motion.div>

      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-semibold">Health & Veterinary Care</h2>
        <p>
          Recommended vaccination schedules, common health checks, and when to
          seek professional care.
        </p>
      </motion.div>
    </motion.section>
  );
}
