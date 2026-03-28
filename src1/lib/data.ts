import poster1 from "@/assets/poster-1.jpg";
import poster2 from "@/assets/poster-2.jpg";
import poster3 from "@/assets/poster-3.jpg";
import poster4 from "@/assets/poster-4.jpg";
import poster5 from "@/assets/poster-5.jpg";
import poster6 from "@/assets/poster-6.jpg";

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  sizes: string[];
  bestseller: boolean;
  featured: boolean;
  rating: number;
  reviews: number;
}

export const products: Product[] = [
  {
    id: "1",
    title: "Botanical Line Art",
    description: "Delicate hand-drawn botanical illustration. Minimal elegance for any room.",
    price: 29,
    images: [poster1],
    category: "Botanical",
    sizes: ["A4", "A3", "A2"],
    bestseller: true,
    featured: true,
    rating: 4.9,
    reviews: 124,
  },
  {
    id: "2",
    title: "Typography Quote",
    description: "Bold serif typography on clean white. Daily motivation, elevated.",
    price: 24,
    images: [poster2],
    category: "Typography",
    sizes: ["A4", "A3", "A2"],
    bestseller: true,
    featured: false,
    rating: 4.8,
    reviews: 89,
  },
  {
    id: "3",
    title: "Abstract Shapes",
    description: "Earth-toned abstract composition. Organic forms in perfect harmony.",
    price: 34,
    images: [poster3],
    category: "Abstract",
    sizes: ["A4", "A3", "A2"],
    bestseller: false,
    featured: true,
    rating: 4.7,
    reviews: 67,
  },
  {
    id: "4",
    title: "Architecture Minimal",
    description: "Black & white architectural photography. Clean lines, bold structure.",
    price: 32,
    images: [poster4],
    category: "Photography",
    sizes: ["A4", "A3", "A2"],
    bestseller: false,
    featured: true,
    rating: 4.6,
    reviews: 45,
  },
  {
    id: "5",
    title: "Sunset Mountains",
    description: "Watercolor mountain landscape in warm earth tones. Serenity on your wall.",
    price: 28,
    images: [poster5],
    category: "Nature",
    sizes: ["A4", "A3", "A2"],
    bestseller: true,
    featured: false,
    rating: 4.9,
    reviews: 156,
  },
  {
    id: "6",
    title: "Eucalyptus Branch",
    description: "Soft botanical illustration of eucalyptus. Natural beauty, timeless appeal.",
    price: 26,
    images: [poster6],
    category: "Botanical",
    sizes: ["A4", "A3", "A2"],
    bestseller: true,
    featured: true,
    rating: 4.8,
    reviews: 98,
  },
];

export const categories = [
  { name: "Botanical", count: 24 },
  { name: "Typography", count: 18 },
  { name: "Abstract", count: 32 },
  { name: "Photography", count: 21 },
  { name: "Nature", count: 15 },
  { name: "Minimal", count: 28 },
];

export const testimonials = [
  {
    name: "Sarah M.",
    text: "The quality is incredible. My room feels like a gallery now. Absolutely love it.",
    rating: 5,
  },
  {
    name: "Alex K.",
    text: "Perfect for my study space. The botanical prints are stunning and the paper quality is premium.",
    rating: 5,
  },
  {
    name: "Priya R.",
    text: "Ordered three posters and they exceeded my expectations. The framing option is a game-changer.",
    rating: 5,
  },
];
