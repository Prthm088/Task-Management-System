import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getCollections } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = await auth()

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { users } = await getCollections()

    const usersList = await users
      .find(
        {},
        {
          projection: {
            _id: 1,
            name: 1,
            email: 1,
          },
        },
      )
      .sort({ name: 1 })
      .toArray()

    return NextResponse.json(
      usersList.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      })),
    )
  } catch (error) {
    console.error("[USERS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
