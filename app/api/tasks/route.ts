import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getCollections } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function GET(req: Request) {
  try {
    const session = await auth()

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const priority = searchParams.get("priority")
    const assignedTo = searchParams.get("assignedTo")
    const search = searchParams.get("search")

    const { tasks, users } = await getCollections()

    let query: any = {
      $or: [{ createdById: session.user.id }, { assignedToId: session.user.id }],
    }

    if (status && status !== "ALL") {
      query.status = status
    }

    if (priority && priority !== "ALL") {
      query.priority = priority
    }

    if (assignedTo === "me") {
      query = { assignedToId: session.user.id }
    } else if (assignedTo === "created") {
      query = { createdById: session.user.id }
    }

    if (search) {
      query.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    const tasksList = await tasks.find(query).sort({ createdAt: -1 }).toArray()

    // Fetch user details for created by and assigned to
    const userIds = new Set<string>()
    tasksList.forEach((task) => {
      if (task.createdById) userIds.add(task.createdById.toString())
      if (task.assignedToId) userIds.add(task.assignedToId.toString())
    })

    const usersList = await users
      .find({
        _id: { $in: Array.from(userIds).map((id) => new ObjectId(id)) },
      })
      .toArray()

    const usersMap = new Map(usersList.map((user) => [user._id.toString(), user]))

    const tasksWithUsers = tasksList.map((task) => {
      const createdBy = task.createdById ? usersMap.get(task.createdById.toString()) : null
      const assignedTo = task.assignedToId ? usersMap.get(task.assignedToId.toString()) : null

      return {
        ...task,
        id: task._id.toString(),
        createdBy: createdBy
          ? {
              id: createdBy._id.toString(),
              name: createdBy.name,
              email: createdBy.email,
            }
          : null,
        assignedTo: assignedTo
          ? {
              id: assignedTo._id.toString(),
              name: assignedTo.name,
              email: assignedTo.email,
            }
          : null,
      }
    })

    return NextResponse.json(tasksWithUsers)
  } catch (error) {
    console.error("[TASKS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { title, description, dueDate, priority, status, assignedToId } = body

    if (!title) {
      return new NextResponse("Title is required", { status: 400 })
    }

    const { tasks, notifications } = await getCollections()

    const now = new Date()
    const taskData = {
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority,
      status,
      assignedToId: assignedToId || null,
      createdById: session.user.id,
      createdAt: now,
      updatedAt: now,
    }

    const result = await tasks.insertOne(taskData)
    const taskId = result.insertedId

    // Create notification if task is assigned to someone
    if (assignedToId && assignedToId !== session.user.id) {
      await notifications.insertOne({
        type: "TASK_ASSIGNED",
        content: `You have been assigned a new task: ${title}`,
        userId: assignedToId,
        taskId: taskId,
        read: false,
        createdAt: now,
      })
    }

    return NextResponse.json({
      id: taskId.toString(),
      ...taskData,
    })
  } catch (error) {
    console.error("[TASKS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
