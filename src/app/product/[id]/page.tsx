import { notFound } from "next/navigation";
import ProductDetailsPage from "@/productDetailsPage";
import { getProductById } from "@/lib/products";

type Props = { params: { id: string } };

export default function ProductDetailsRoute({ params }: Props) {
  const product = getProductById(params.id);
  if (!product) return notFound();
  return <ProductDetailsPage product={product} />;
}
