// components/PuppyGallery.tsx
"use client";
import PuppyCard from "./PuppyCard";
import { puppies } from "@/utils/PuppyData";

export default function PuppyGallery() {
  return (
    <section
      id="puppies"
      className="px-6 md:px-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2np gap-8 bg-stone-100 pt-20 pb-20"
    >
      {puppies.map((p) => (
        <PuppyCard
          key={p.id}
          id={p.id}
          name={p.name}
          image={p.image}
          price={p.price}
        />
      ))}
    </section>
  );
}
