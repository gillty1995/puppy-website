import Hero from "../components/Hero";
import DogProfile from "../components/DogProfile";
import PuppyCard from "../components/PuppyCard";
import CareSection from "../components/CareSection";
import ContactForm from "../components/ContactForm";
import Footer from "../components/Footer";

import { puppies } from "@/utils/PuppyData";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <section id="parents">
        {/* Cashmere (mom) on white */}
        <div className="bg-zinc-900 py-16">
          <DogProfile
            name="Cashmere"
            imageSrc="/images/cash2.jpg"
            description="Loving mother with champion bloodline…"
            reverse={false}
          />
        </div>

        {/* Corduroy (dad) on black */}
        <div className="bg-zinc-800 py-16">
          <DogProfile
            name="Corduroy"
            imageSrc="/images/cord6.jpg"
            description="Energetic father with playful spirit…"
            reverse={true}
          />
        </div>
      </section>
      <section className="px-6 md:px-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-stone-100 pt-20 pb-20">
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
      <CareSection />
      <ContactForm />
      <Footer />
    </main>
  );
}
