// Endpoint för moderatorer och trådägare att lägga till användare till privata trådar

export default function postUserPrivateThread(app, path, database) {
  // POST /api/threads/:threadId/private-users
  app.post(`${path}/threads/:threadId/private-users`, async (request, response) => {
    const user = request.session.user;
    const { threadId } = request.params;
    const { newUserId } = request.body;

    if (!user) {
      return response.status(401).json({
        message: "You must be logged in to add users to private threads."
      });
    }

    if (!newUserId) {
      return response.status(400).json({
        message: "newUserId is required."
      });
    }

    try {
      // Kontrollera att tråden finns och är privat
      const [threads] = await database.execute(
        `SELECT id, isPrivate FROM thread WHERE id = ?`,
        [threadId]
      );

      if (threads.length === 0) {
        return response.status(404).json({ message: "Thread not found." });
      }

      const thread = threads[0];
      if (thread.isPrivate === 0) {
        return response.status(403).json({
          message: "You can only add users to private threads."
        });
      }

      // Kontrollera att användaren är moderator eller ägare
      const [mods] = await database.execute(
        `SELECT * FROM threadModerator WHERE threadId = ? AND userId = ?`,
        [threadId, user.id]
      );

      if (mods.length === 0) {
        return response.status(403).json({
          message: "Only moderators or the thread owner can add users."
        });
      }

      // Kontrollera att användaren finns
      const [users] = await database.execute(
        `SELECT id FROM user WHERE id = ?`,
        [newUserId]
      );

      if (users.length === 0) {
        return response.status(404).json({
          message: "User not found."
        });
      }

      // Kontrollera att användaren inte redan är med
      const [existing] = await database.execute(
        `SELECT * FROM privateThread_x_user WHERE threadId = ? AND userId = ?`,
        [threadId, newUserId]
      );

      if (existing.length > 0) {
        return response.status(409).json({
          message: "User is already part of this private thread."
        });
      }

      // Lägg till användaren
      await database.execute(
        `INSERT INTO privateThread_x_user (threadId, userId) VALUES (?, ?)`,
        [threadId, newUserId]
      );

      return response.status(201).json({
        message: "User added to private thread successfully."
      });
    } catch (error) {
      console.error("Error adding user to private thread:", error);
      return response.status(500).json({
        message: "Server error while adding user to private thread."
      });
    }
  });
}
