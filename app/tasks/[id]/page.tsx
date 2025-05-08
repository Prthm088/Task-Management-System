import { TaskDetailPage } from "@/components/task-detail-page"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function TaskDetail({ params }: { params: { id: string } }) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return <TaskDetailPage id={params.id} />
}
