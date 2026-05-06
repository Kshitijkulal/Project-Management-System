import { redirect } from "next/navigation";

// Root always lands on login. The login page handles
// the "already authenticated" redirect to /dashboard.
export default function Home() {
  redirect("/login");
}
