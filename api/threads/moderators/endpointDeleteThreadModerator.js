export default function deleteThreadModerator(app, path, database) {

  // Ta bort moderator från tråd - http://localhost:3000/api/threads/:thread-id/moderators/:user-id
    app.delete(`${path}/threads/:threadId/moderators/:userId`, async (request, response) => {
      const user = request.session.user;
      const { threadId, userId } = request.params;

      if (!user) {
        return response.status(401).json({ message: "You must be logged in to remove moderators." });
      }

      try {
        // Kontrollera att tråden finns
        const [threads] = await database.execute(
          `SELECT id FROM thread WHERE id = ?`,
          [threadId]
        );
        if (threads.length === 0) {
          return response.status(404).json({ message: "Thread not found." });
        }

        // Kontrollera att användaren är trådägare
        const [owners] = await database.execute(
          `SELECT * FROM threadModerator WHERE threadId = ? AND userId = ? AND isCreator = 1`,
          [threadId, user.id]
        );
        if (owners.length === 0) {
          return response.status(403).json({ message: "Only the thread creator can remove moderators." });
        }

        // Kontrollera att moderator-användaren som ska tas bort är moderator
        const [mods] = await database.execute(
          `SELECT * FROM threadModerator WHERE threadId = ? AND userId = ? AND isCreator = 0`,
          [threadId, userId]
        );
        if (mods.length === 0) {
          return response.status(404).json({ message: "Moderator not found or cannot remove the creator." });
        }

        // Ta bort moderatorn
        await database.execute(
          `DELETE FROM threadModerator WHERE threadId = ? AND userId = ?`,
          [threadId, userId]
        );

        return response.status(200).json({ message: "Moderator removed successfully." });
      } catch (error) {
        console.error(error);
        return response.status(500).json({ message: "Server error while removing moderator." });
      }
    });
  }