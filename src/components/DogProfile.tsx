"use client";
import { motion } from "framer-motion";

interface Props {
  name: string;
  imageSrc: string;
  description: string;
  reverse?: boolean;
}
export default function DogProfile({
  name,
  imageSrc,
  description,
  reverse,
}: Props) {
  return (
    <motion.div
      className={`flex flex-col md:flex-row items-center gap-8 px-6 md:px-20 ${
        reverse ? "md:flex-row-reverse" : ""
      }`}
    >
      <motion.img
        src={imageSrc}
        alt={name}
        className="w-full md:w-1/2 rounded-lg shadow-lg"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      />
      <div className="md:w-1/2">
        <h2 className="text-3xl font-semibold mb-4">{name}</h2>
        <p className="text-stone-200">{description}</p>
      </div>
    </motion.div>
  );
}
