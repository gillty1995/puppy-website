import Hero from "../components/Hero";
import DogProfile from "../components/DogProfile";
import PuppyCard from "../components/PuppyCard";
import CareSection from "../components/CareSection";
import ContactForm from "../components/ContactForm";
import Footer from "../components/Footer";
import Header from "@/components/Header";
import PuppyGallery from "@/components/PuppyGallery";

import { puppies } from "@/utils/PuppyData";

export default function HomePage() {
  return (
    <main>
      <Header />
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
      <PuppyGallery />
      <CareSection />
      <ContactForm />
      <Footer />
    </main>
  );
}
