import { json } from "@sveltejs/kit";
import { User } from "$lib/db/models/User.js";
import { getSession } from "$lib/auth/session.js";

/**
 * Handle depiction description operations
 * POST: Save/update user's depiction description
 * GET: Get user's depiction description
 */
export async function POST({ request }) {
  try {
    const session = await getSession(request);

    if (!session || !session.userId) {
      return json({ error: "Not authenticated" }, { status: 401 });
    }

    console.log(
      "Depiction POST - Session userId:",
      session.userId,
      "type:",
      typeof session.userId
    );

    const body = await request.json();
    const { description } = body;

    if (typeof description !== "string") {
      return json({ error: "Description must be a string" }, { status: 400 });
    }

    // Try to find user directly in database first for debugging
    const { connectToDatabase } = await import("$lib/db/mongodb.js");
    const { ObjectId } = await import("mongodb");
    const db = await connectToDatabase();
    const users = db.collection("users");

    try {
      const directQuery = await users.findOne({
        _id: new ObjectId(session.userId),
      });
      console.log(
        "Depiction POST - Direct query result:",
        directQuery ? "Found" : "Not found"
      );
      if (directQuery) {
        console.log("Depiction POST - Direct query user:", {
          _id: directQuery._id.toString(),
          email: directQuery.email,
        });
      } else {
        // List all users to see what's in the database
        const allUsers = await users.find({}).limit(10).toArray();
        console.log(
          "Depiction POST - All users in DB:",
          allUsers.map((u) => ({ _id: u._id.toString(), email: u.email }))
        );
      }
    } catch (directError) {
      console.error(
        "Depiction POST - Direct query error:",
        directError.message
      );
    }

    console.log(
      "Depiction POST - About to call updateDepictionDescription with userId:",
      session.userId
    );
    const updatedUser = await User.updateDepictionDescription(
      session.userId,
      description
    );
    console.log(
      "Depiction POST - updateDepictionDescription returned:",
      updatedUser ? "User object" : "null"
    );

    if (!updatedUser) {
      console.error(
        "Depiction POST - User not found for userId:",
        session.userId
      );
      // Try one more time with findById to confirm user exists
      const confirmUser = await User.findById(session.userId);
      console.log(
        "Depiction POST - Confirm user exists:",
        confirmUser ? "Yes" : "No"
      );
      if (confirmUser) {
        console.log(
          "Depiction POST - User exists but update failed. Trying direct update..."
        );
        // Try direct update as fallback
        const { connectToDatabase } = await import("$lib/db/mongodb.js");
        const { ObjectId } = await import("mongodb");
        const db = await connectToDatabase();
        const usersCollection = db.collection("users");
        try {
          const directResult = await usersCollection.findOneAndUpdate(
            { _id: new ObjectId(session.userId) },
            {
              $set: {
                depictionDescription: description.trim(),
                updatedAt: new Date(),
              },
            },
            { returnDocument: "after" }
          );
          if (directResult.value) {
            const { password: _, ...userWithoutPassword } = directResult.value;
            return json({
              success: true,
              user: {
                _id: userWithoutPassword._id.toString(),
                name: userWithoutPassword.name,
                email: userWithoutPassword.email,
                username: userWithoutPassword.username,
                depictionDescription:
                  userWithoutPassword.depictionDescription || "",
              },
            });
          }
        } catch (directError) {
          console.error(
            "Depiction POST - Direct update also failed:",
            directError.message
          );
        }
      }
      return json({ error: "User not found" }, { status: 404 });
    }

    return json({
      success: true,
      user: {
        _id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        username: updatedUser.username,
        depictionDescription: updatedUser.depictionDescription || "",
      },
    });
  } catch (error) {
    console.error("Save depiction description error:", error);
    return json(
      { error: "Failed to save depiction description", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET({ request }) {
  try {
    const session = await getSession(request);

    if (!session || !session.userId) {
      return json({ error: "Not authenticated" }, { status: 401 });
    }

    console.log(
      "Depiction GET - Session userId:",
      session.userId,
      "type:",
      typeof session.userId
    );

    // Try to find user directly in database as well for debugging
    const { connectToDatabase } = await import("$lib/db/mongodb.js");
    const { ObjectId } = await import("mongodb");
    const db = await connectToDatabase();
    const users = db.collection("users");

    try {
      const directQuery = await users.findOne({
        _id: new ObjectId(session.userId),
      });
      console.log(
        "Depiction GET - Direct query result:",
        directQuery ? "Found" : "Not found"
      );
      if (directQuery) {
        console.log("Depiction GET - Direct query user:", {
          _id: directQuery._id.toString(),
          email: directQuery.email,
        });
      }
    } catch (directError) {
      console.error("Depiction GET - Direct query error:", directError.message);
    }

    const user = await User.findById(session.userId);

    if (!user) {
      console.error(
        "Depiction GET - User not found for userId:",
        session.userId
      );
      // Try to list all users to see what's in the database
      try {
        const allUsers = await users.find({}).limit(10).toArray();
        console.log(
          "Depiction GET - All users in DB:",
          allUsers.map((u) => ({ _id: u._id.toString(), email: u.email }))
        );
      } catch (listError) {
        console.error(
          "Depiction GET - Error listing users:",
          listError.message
        );
      }
      return json({ error: "User not found" }, { status: 404 });
    }

    return json({
      depictionDescription: user.depictionDescription || "",
    });
  } catch (error) {
    console.error("Get depiction description error:", error);
    return json(
      { error: "Failed to get depiction description", details: error.message },
      { status: 500 }
    );
  }
}
