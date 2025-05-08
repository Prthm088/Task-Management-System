"use client"

import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { Task } from "@/lib/types"
import { getPriorityColor, getStatusColor } from "@/lib/utils"

interface TaskListProps {
  tasks: Task[]
  isLoading: boolean
  onTasksChange?: (tasks: Task[]) => void
}

export function TaskList({ tasks, isLoading, onTasksChange }: TaskListProps) {
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-4 p-4 border rounded-md">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No tasks found.</div>
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Due Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow
              key={task.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => router.push(`/tasks/${task.id}`)}
            >
              <TableCell className="font-medium">{task.title}</TableCell>
              <TableCell>
                <Badge variant="outline" className={getStatusColor(task.status)}>
                  {task.status.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
              </TableCell>
              <TableCell>{task.assignedTo?.name || "Unassigned"}</TableCell>
              <TableCell>{task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "No due date"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
