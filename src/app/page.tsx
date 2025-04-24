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
        {/* Cashmere (mom) */}
        <div className="bg-zinc-900 py-16">
          <DogProfile
            name="Cashmere"
            imageSrc="/images/cash2.jpg"
            description="Meet Cashmere, our cherished three-year-old “dam” and proud AKC-registered Pomeranian. At a petite eight pounds, she sports a mismarked black coat — a trait she inherited from her mother, a fellow black Pomeranian born and raised right here in St. Louis, Missouri. Her father, an orange Pomeranian also from St. Louis, rounds out her pedigree.
            Cashmere is the perfect blend of smart and spirited. She’s obedient and eager to please — especially when treats are involved. Whether she’s tackling a brisk walk, dominating a game of tug-of-war, or showing off her surprisingly graceful swimming skills, she does it all with boundless energy and enthusiasm."
            reverse={false}
          />
        </div>

        {/* Corduroy (dad) */}
        <div className="bg-zinc-800 py-16 ">
          <DogProfile
            name="Corduroy"
            imageSrc="/images/cord6.jpg"
            description="Meet Corduroy, our adored one-year-old, six-pound AKC-registered cream Pomeranian sire. He spent his first eight weeks in Tennessee, where both of his purebred orange Pomeranian parents still live.

            Corduroy is the very definition of a lap dog — nothing makes him happier than a good belly rub. When he’s not curled up in your arms or dozing in a sunny spot, you’ll find him bounding along hiking trails or gleefully chasing down balls in spirited games of fetch."
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
