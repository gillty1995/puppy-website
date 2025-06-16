"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

interface PuppyCardProps {
  id: string;
  name: string;
  image: string;
  price: number;
}

export default function PuppyCard({ id, name, image, price }: PuppyCardProps) {
  return (
    <Link href={`/puppy/${id}`}>
      <div className="flex flex-col cursor-pointer group">
        {/* Card image + price overlay */}
        <motion.div
          className="relative overflow-hidden rounded-3xl"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Image
            src={image}
            alt={name}
            width={400}
            height={580}
            className="w-full h-[580px] object-cover"
          />

          {/* Price badge inside image */}
          <div className="absolute inset-x-0 bottom-6 flex justify-center">
            <span className="relative px-30 py-2 border border-gray-800 text-gray-800 bg-transparent rounded-full overflow-hidden">
              {/* white fill that scales up from bottom */}
              <span
                className="
                  absolute inset-0 bg-white 
                  origin-bottom scale-y-0 
                  group-hover:scale-y-100 
                  transition-transform duration-300 ease-in-out
                  max-sm:bg-white max-sm:scale-y-100
                "
              />
              {/* the price text sits above the fill */}
              <span className="relative">${price.toFixed(2)}</span>
            </span>
          </div>
        </motion.div>

        {/* Name sits below the picture */}
        <h3 className="mt-4 text-4xl font-semibold text-gray-900">{name}</h3>
      </div>
    </Link>
  );
}
