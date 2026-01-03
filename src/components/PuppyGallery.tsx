// components/PuppyGallery.tsx
"use client";
import PuppyCard from "./PuppyCard";
import { puppies } from "@/utils/PuppyData";

export default function PuppyGallery() {
  return (
    <section
      id="puppies"
      className="px-6 md:px-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 bg-stone-100 pt-20 pb-20"
    >
      {puppies.map((p, idx) => {
        if (idx === 4) {
          return (
            <div key={p.id} className="sm:col-span-2 sm:flex sm:justify-center">
              <div className="w-full sm:w-1/2 lg:w-1/2">
                <PuppyCard
                  id={p.id}
                  name={p.name}
                  image={p.image}
                  price={p.price}
                />
              </div>
            </div>
          );
        }

        return (
          <PuppyCard
            key={p.id}
            id={p.id}
            name={p.name}
            image={p.image}
            price={p.price}
          />
        );
      })}
    </section>
  );
}
