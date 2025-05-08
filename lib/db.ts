import clientPromise from "./mongodb"
import type { Collection, Db } from "mongodb"
import type { User, Task, Notification } from "./types"

let db: Db
let collections: {
  users: Collection<User>
  tasks: Collection<Task>
  notifications: Collection<Notification>
}

export async function getDb() {
  if (!db) {
    const client = await clientPromise
    db = client.db(process.env.MONGODB_DB || "task-management")

    collections = {
      users: db.collection<User>("users"),
      tasks: db.collection<Task>("tasks"),
      notifications: db.collection<Notification>("notifications"),
    }
  }

  return { db, collections }
}

export async function getCollections() {
  const { collections } = await getDb()
  return collections
}
