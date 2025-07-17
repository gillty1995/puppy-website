export interface Puppy {
    id: string;
    name: string;
    image: string;
    price: number | string;
    age: string;
    color: string;
    description: string;
    skills?: string;
  }
  
  export const puppies: Puppy[] = [
    {
      id: "puppy1",
      name: "Cotton",
      image: "/images/cotton-9wks.jpeg",
      price: "SOLD",
      age: "May 1st, 2025",
      color: "White",
      description: "Please be aware that Pomeranian puppies are known to undergo color changes as they grow. Many white newborns will mature into cream or orange Pomeranians. This change is a normal part of their growth and can happen between 4 and 6 months of age.",
      skills: "Our puppies learn potty training by being taken outside immediately after meals and staying out until they relieve themselves, which consistently reinforces proper bathroom habits. Thanks to early, positive exposure to new people and environments, they develop social skills that help them grow into friendly, confident dogs unafraid of strangers or unfamiliar situations."
    },
    {
      id: "puppy2",
      name: "Canvas",
      image: "/images/canvas-9wks.jpeg",
      price: "SOLD",
      age: "May 1st, 2025",
      color: "Black and White, Parti-Pom",
      description: "Please be aware that Pomeranian puppies that are born black and white are likely to retain that basic coat pattern as they mature, although the specific shades and intensities of the colors may change. Puppies are known to undergo color changes as they grow, this change is a normal part of their growth and can happen between 4 and 6 months of age.",
      skills: "Our puppies learn potty training by being taken outside immediately after meals and staying out until they relieve themselves, which consistently reinforces proper bathroom habits. Thanks to early, positive exposure to new people and environments, they develop social skills that help them grow into friendly, confident dogs unafraid of strangers or unfamiliar situations."
    },
  ];
  