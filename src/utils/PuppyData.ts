export interface Puppy {
    id: string;
    name: string;
    image: string;
    price: number;
    age: string;
    color: string;
    description: string;
  }
  
  export const puppies: Puppy[] = [
    {
      id: "puppy1",
      name: "Crepe",
      image: "/images/puppy-placeholder.jpg",
      price: 2500,
      age: "2 weeks",
      color: "Cream",
      description: "Playful and affectionate male Pom, very friendly.",
    },
    {
      id: "puppy2",
      name: "Canvas",
      image: "/images/puppy-placeholder.jpg",
      price: 2500,
      age: "2 weeks",
      color: "Black",
      description: "Sweet female Pom with a soft coat and gentle nature.",
    },
    {
      id: "puppy3",
      name: "Chenille",
      image: "/images/puppy-placeholder.jpg",
      price: 2500,
      age: "2 weeks",
      color: "Merle",
      description: "Energetic little Pom who loves to explore.",
    },
  ];
  