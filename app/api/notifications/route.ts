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

    const { notifications, tasks } = await getCollections()

    const notificationsList = await notifications
      .find({
        userId: session.user.id,
        read: false,
      })
      .sort({ createdAt: -1 })
      .toArray()

    // Get task details for notifications
    const taskIds = notificationsList.filter((n) => n.taskId).map((n) => new ObjectId(n.taskId))

    const tasksList =
      taskIds.length > 0
        ? await tasks.find({ _id: { $in: taskIds } }, { projection: { _id: 1, title: 1 } }).toArray()
        : []

    const tasksMap = new Map(tasksList.map((task) => [task._id.toString(), task]))

    const notificationsWithTasks = notificationsList.map((notification) => {
      const task = notification.taskId ? tasksMap.get(notification.taskId.toString()) : null

      return {
        ...notification,
        id: notification._id.toString(),
        task: task
          ? {
              id: task._id.toString(),
              title: task.title,
            }
          : null,
      }
    })

    return NextResponse.json(notificationsWithTasks)
  } catch (error) {
    console.error("[NOTIFICATIONS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { id, read } = body

    if (!id) {
      return new NextResponse("Notification ID is required", { status: 400 })
    }

    const { notifications } = await getCollections()

    const notification = await notifications.findOne({ _id: new ObjectId(id) })

    if (!notification) {
      return new NextResponse("Notification not found", { status: 404 })
    }

    if (notification.userId.toString() !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    await notifications.updateOne({ _id: new ObjectId(id) }, { $set: { read } })

    const updatedNotification = await notifications.findOne({ _id: new ObjectId(id) })

    return NextResponse.json({
      ...updatedNotification,
      id: updatedNotification._id.toString(),
    })
  } catch (error) {
    console.error("[NOTIFICATION_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
