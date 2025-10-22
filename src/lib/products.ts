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
      "/white.jpg",
      "/white-2.jpg",
      "/white-3.jpg",
      "/white-4.jpg",
    ],
    image: "/white.jpg",
    category: "Fresh Mushroom",
    grower: "FungiFreshFarms",
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
    grower: "FungiFreshFarms",
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
    grower: "TheMushroomPatchBukidnon",
    inStock: true,
  },
  {
    id: "4",
    name: "DIY Mushroom Growing Kit",
    description:
      "Everything you need to grow your own oyster mushrooms at home! Perfect for beginners.",
    price: 350,
    weight: "1 kit",
    images: [
      "/placeholder.png",
      "/placeholder.png",
      "/placeholder.png",
      "/placeholder.png",
    ],
    image: "/placeholder.png",
    category: "Growing Kits",
    grower: "KingFarms",
    tag: "Popular",
    inStock: true,
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
    grower: "FungiFreshFarms",
    inStock: true,
  },
];

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
