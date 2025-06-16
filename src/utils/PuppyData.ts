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
      name: "Cotton",
      image: "/images/cotton-6wks.jpeg",
      price: 2500,
      age: "May 1st, 2025",
      color: "White",
      description: "Please be aware that Pomeranian puppies are known to undergo color changes as they grow. Many white newborns will mature into cream or orange Pomeranians. This change is a normal part of their growth and can happen between 4 and 6 months of age.",
    },
    {
      id: "puppy2",
      name: "Canvas",
      image: "/images/canvas-6wks2.jpeg",
      price: 2500,
      age: "May 1st, 2025",
      color: "Black and White, Parti-Pom",
      description: "Please be aware that Pomeranian puppies that are born black and white are likely to retain that basic coat pattern as they mature, although the specific shades and intensities of the colors may change. Puppies are known to undergo color changes as they grow, this change is a normal part of their growth and can happen between 4 and 6 months of age.",
    },
  ];
  