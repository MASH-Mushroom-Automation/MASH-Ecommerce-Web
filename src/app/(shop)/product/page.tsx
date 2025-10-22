// This page redirects to the product catalog
import { redirect } from "next/navigation";

export default function ProductPage() {
  redirect("/catalog");
}
