import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getCollections } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function GET(req: Request, { params }: { params: { taskId: string } }) {
  try {
    const session = await auth()

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!params.taskId) {
      return new NextResponse("Task ID is required", { status: 400 })
    }

    const { tasks, users } = await getCollections()

    const task = await tasks.findOne({ _id: new ObjectId(params.taskId) })

    if (!task) {
      return new NextResponse("Task not found", { status: 404 })
    }

    // Get creator and assignee details
    const createdBy = task.createdById ? await users.findOne({ _id: new ObjectId(task.createdById.toString()) }) : null

    const assignedTo = task.assignedToId
      ? await users.findOne({ _id: new ObjectId(task.assignedToId.toString()) })
      : null

    return NextResponse.json({
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
    })
  } catch (error) {
    console.error("[TASK_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { taskId: string } }) {
  try {
    const session = await auth()

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { title, description, dueDate, priority, status, assignedToId } = body

    if (!params.taskId) {
      return new NextResponse("Task ID is required", { status: 400 })
    }

    const { tasks, notifications, users } = await getCollections()

    const task = await tasks.findOne({ _id: new ObjectId(params.taskId) })

    if (!task) {
      return new NextResponse("Task not found", { status: 404 })
    }

    // Check if user is the creator or the assignee
    if (
      task.createdById.toString() !== session.user.id &&
      (!task.assignedToId || task.assignedToId.toString() !== session.user.id)
    ) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const updateData = {
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority,
      status,
      assignedToId: assignedToId || null,
      updatedAt: new Date(),
    }

    await tasks.updateOne({ _id: new ObjectId(params.taskId) }, { $set: updateData })

    // Create notification if task assignment changed
    if (assignedToId && assignedToId !== task.assignedToId?.toString() && assignedToId !== session.user.id) {
      await notifications.insertOne({
        type: "TASK_ASSIGNED",
        content: `You have been assigned a task: ${title}`,
        userId: assignedToId,
        taskId: new ObjectId(params.taskId),
        read: false,
        createdAt: new Date(),
      })
    }

    // Get updated task with user details
    const updatedTask = await tasks.findOne({ _id: new ObjectId(params.taskId) })

    const createdBy = updatedTask.createdById
      ? await users.findOne({ _id: new ObjectId(updatedTask.createdById.toString()) })
      : null

    const assignedTo = updatedTask.assignedToId
      ? await users.findOne({ _id: new ObjectId(updatedTask.assignedToId.toString()) })
      : null

    return NextResponse.json({
      ...updatedTask,
      id: updatedTask._id.toString(),
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
    })
  } catch (error) {
    console.error("[TASK_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { taskId: string } }) {
  try {
    const session = await auth()

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!params.taskId) {
      return new NextResponse("Task ID is required", { status: 400 })
    }

    const { tasks, notifications } = await getCollections()

    const task = await tasks.findOne({ _id: new ObjectId(params.taskId) })

    if (!task) {
      return new NextResponse("Task not found", { status: 404 })
    }

    // Only creator can delete tasks
    if (task.createdById.toString() !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    // Delete related notifications
    await notifications.deleteMany({
      taskId: new ObjectId(params.taskId),
    })

    // Delete the task
    await tasks.deleteOne({ _id: new ObjectId(params.taskId) })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[TASK_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
