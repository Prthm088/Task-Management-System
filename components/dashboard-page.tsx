"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskList } from "@/components/task-list"
import { TaskStats } from "@/components/task-stats"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import type { Task } from "@/lib/types"
import Sidebar from '@/components/sidebar'

export function DashboardPage() {
  const { data: session } = useSession()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("/api/tasks")
        const data = await response.json()
        setTasks(data)
      } catch (error) {
        console.error("Failed to fetch tasks:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTasks()
  }, [])

  const assignedTasks = tasks.filter((task) => task.assignedToId === session?.user.id)
  const createdTasks = tasks.filter((task) => task.createdById === session?.user.id)
  const overdueTasks = tasks.filter((task) => {
    if (!task.dueDate) return false
    const dueDate = new Date(task.dueDate)
    const today = new Date()
    return dueDate < today && task.status !== "COMPLETED"
  })

  const handleTaskCreated = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev])
  }

  return (
    
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {session?.user?.name || "User"} 👋</h1>
          <p className="text-muted-foreground text-sm mt-1">Here’s your task overview.</p>
        </div>
        <Button
          className="rounded-xl px-5 py-2 shadow hover:shadow-md transition"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </div>

      <TaskStats
        totalTasks={tasks.length}
        assignedTasks={assignedTasks.length}
        completedTasks={tasks.filter((t) => t.status === "COMPLETED").length}
        overdueTasks={overdueTasks.length}
      />

      <Tabs defaultValue="assigned" className="mt-8">
        <TabsList className="bg-muted p-1 rounded-lg w-full sm:w-auto flex flex-wrap gap-2 justify-start sm:justify-normal">
          <TabsTrigger value="assigned" className="px-4 py-2 rounded-lg">
            Assigned to Me ({assignedTasks.length})
          </TabsTrigger>
          <TabsTrigger value="created" className="px-4 py-2 rounded-lg">
            Created by Me ({createdTasks.length})
          </TabsTrigger>
          <TabsTrigger value="overdue" className="px-4 py-2 rounded-lg">
            Overdue ({overdueTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assigned" className="mt-6">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Tasks Assigned to You</CardTitle>
              <CardDescription className="text-sm">
                Tasks assigned by others that need your attention.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TaskList tasks={assignedTasks} isLoading={isLoading} onTasksChange={setTasks} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="created" className="mt-6">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Tasks You Created</CardTitle>
              <CardDescription className="text-sm">
                Tasks created by you for yourself or others.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TaskList tasks={createdTasks} isLoading={isLoading} onTasksChange={setTasks} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue" className="mt-6">
          <Card className="rounded-2xl shadow-sm border border-destructive">
            <CardHeader>
              <CardTitle className="text-xl text-destructive">Overdue Tasks</CardTitle>
              <CardDescription className="text-sm">
                Tasks that missed their deadlines and are still pending.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TaskList tasks={overdueTasks} isLoading={isLoading} onTasksChange={setTasks} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateTaskDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onTaskCreated={handleTaskCreated}
      />
    </div>
    
  )
}
