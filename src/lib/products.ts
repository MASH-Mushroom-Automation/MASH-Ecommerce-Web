export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  weight: string;
  images: string[];
  image: string; // primary image (alias for images[0])
  category: string;
  grower: string;
  tag?: string;
  inStock?: boolean;
};

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Fresh White Oyster Mushrooms",
    description:
      "Delicate, nutty flavor perfect for stir-fries and soups. Harvested daily for maximum freshness.",
    price: 120,
    weight: "250g",
    images: [
      "/placeholder.png",
      "/placeholder.png",
      "/placeholder.png",
      "/placeholder.png",
    ],
    image: "/placeholder.png",
    category: "Fresh Mushroom",
    grower: "Simply Fresh Farm",
    tag: "New",
    inStock: true,
  },
  {
    id: "2",
    name: "Vibrant Pink Oyster Mushrooms",
    description:
      "Beautiful pink caps with a meaty texture—great for sautés and vegan bacon.",
    price: 140,
    weight: "250g",
    images: [
      "/placeholder.png",
      "/placeholder.png",
      "/placeholder.png",
      "/placeholder.png",
    ],
    image: "/placeholder.png",
    category: "Fresh Mushroom",
    grower: "Simply Fresh Farm",
    inStock: true,
  },
  {
    id: "3",
    name: "Blue Oyster Mushrooms",
    description:
      "Rich umami notes and dense texture—ideal for broths and roasts.",
    price: 150,
    weight: "200g",
    images: [
      "/placeholder.png",
      "/placeholder.png",
      "/placeholder.png",
      "/placeholder.png",
    ],
    image: "/placeholder.png",
    category: "Fresh Mushroom",
    grower: "The Mushroom Patch Cultivation",
  },
  {
    id: "9",
    name: "Crispy Mushroom Chicharon",
    description:
      "Crunchy, savory mushroom snack—perfect with dips or as topping.",
    price: 150,
    weight: "100g pack",
    images: [
      "/placeholder.png",
      "/placeholder.png",
      "/placeholder.png",
      "/placeholder.png",
    ],
    image: "/placeholder.png",
    category: "Mushroom Products",
    grower: "Simply Fresh Farm",
  },
];

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
