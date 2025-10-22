import { redirect } from "next/navigation";

export default function ProfilePage() {
  // Redirect to my-information page as default
  redirect("/profile/my-information");
}
