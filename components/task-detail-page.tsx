"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { format } from "date-fns"
import { ArrowLeft, Calendar, Clock, Edit, Trash2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { EditTaskDialog } from "@/components/edit-task-dialog"
import { useToast } from "@/hooks/use-toast"
import type { Task } from "@/lib/types"
import { getPriorityColor, getStatusColor } from "@/lib/utils"

export function TaskDetailPage({ id }: { id: string }) {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [task, setTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await fetch(`/api/tasks/${id}`)

        if (!response.ok) {
          throw new Error("Task not found")
        }

        const data = await response.json()
        setTask(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load task details",
          variant: "destructive",
        })
        router.push("/tasks")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTask()
  }, [id, router, toast])

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete task")
      }

      toast({
        title: "Success",
        description: "Task deleted successfully",
      })

      router.push("/tasks")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      })
    }
  }

  const isCreator = task?.createdById === session?.user.id

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <Button variant="ghost" size="sm" disabled>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to tasks
          </Button>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex flex-wrap gap-2 mt-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push("/tasks")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to tasks
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Task not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/tasks")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to tasks
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-2xl">{task.title}</CardTitle>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className={getStatusColor(task.status)}>
                {task.status.replace("_", " ")}
              </Badge>
              <Badge variant="outline" className={getPriorityColor(task.priority)}>
                {task.priority} Priority
              </Badge>
            </div>
          </div>
          {isCreator && (
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setIsEditDialogOpen(true)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-muted-foreground whitespace-pre-wrap">
            {task.description || "No description provided."}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Assigned to: {task.assignedTo?.name || "Unassigned"}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Created by: {task.createdBy?.name}</span>
            </div>
            {task.dueDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Due date: {format(new Date(task.dueDate), "PPP")}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Created: {format(new Date(task.createdAt), "PPP")}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/50 px-6 py-3">
          <p className="text-xs text-muted-foreground">
            Last updated: {format(new Date(task.updatedAt), "PPP 'at' p")}
          </p>
        </CardFooter>
      </Card>

      <EditTaskDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} task={task} onTaskUpdated={setTask} />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
