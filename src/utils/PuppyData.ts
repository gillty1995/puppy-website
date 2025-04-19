export interface Puppy {
    id: string;
    name: string;
    image: string;
    price: number;
    description: string;
  }
  
  export const puppies: Puppy[] = [
    {
      id: "puppy1",
      name: "Crepe",
      image: "/images/puppy-placeholder.jpg",
      price: 2500,
      description: "Playful and affectionate male Pom, very friendly.",
    },
    {
      id: "puppy2",
      name: "Canvas",
      image: "/images/puppy-placeholder.jpg",
      price: 2500,
      description: "Sweet female Pom with a soft coat and gentle nature.",
    },
    {
      id: "puppy3",
      name: "Chenille",
      image: "/images/puppy-placeholder.jpg",
      price: 2500,
      description: "Energetic little Pom who loves to explore.",
    },
  ];
  