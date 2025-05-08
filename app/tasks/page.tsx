import { TasksPage } from "@/components/tasks-page"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function Tasks() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return <TasksPage />
}
