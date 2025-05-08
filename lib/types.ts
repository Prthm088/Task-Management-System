import type { ObjectId } from "mongodb"

export interface User {
  _id: ObjectId | string
  name: string
  email: string
  password: string
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  _id: ObjectId | string
  title: string
  description: string | null
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "COMPLETED"
  priority: "LOW" | "MEDIUM" | "HIGH"
  dueDate: Date | null
  createdAt: Date
  updatedAt: Date
  createdById: ObjectId | string
  assignedToId: ObjectId | string | null
  createdBy?: User
  assignedTo?: User
}

export interface Notification {
  _id: ObjectId | string
  type: string
  content: string
  read: boolean
  createdAt: Date
  userId: ObjectId | string
  taskId: ObjectId | string | null
  task?: {
    _id: ObjectId | string
    title: string
  }
}
