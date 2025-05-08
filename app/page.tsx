import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { DashboardPage } from "@/components/dashboard-page"

export default async function Home() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return <DashboardPage />
}
