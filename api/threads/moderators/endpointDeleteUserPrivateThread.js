// Endpoint för moderatorer och trådägare att ta bort användare från privata trådar

export default function deleteUserPrivateThread(app, path, database) {
  // DELETE  http://localhost:3000/api/threads/:threadId/private/:userId
  app.delete(`${path}/threads/:threadId/private/:userId`, async (request, response) => {
    const user = request.session.user;
    const { threadId, userId } = request.params;

    if (!user) {
      return response.status(401).json({
        message: "You must be logged in to remove users from private threads."
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
          message: "This action only applies to private threads."
        });
      }

      // Kontrollera att användaren är trådägare eller moderator
      const [mods] = await database.execute(
        `SELECT * FROM threadModerator WHERE threadId = ? AND userId = ?`,
        [threadId, user.id]
      );

      if (mods.length === 0) {
        return response.status(403).json({
          message: "Only moderators or the thread owner can remove users."
        });
      }

      // Kontrollera att användaren som ska tas bort från privat tråd finns i privateThread_x_user
      const [privateUser] = await database.execute(
        `SELECT * FROM privateThread_x_user WHERE threadId = ? AND userId = ?`,
        [threadId, userId]
      );

      if (privateUser.length === 0) {
        return response.status(404).json({
          message: "User not found in this private thread."
        });
      }

      // Ta bort användaren
      await database.execute(
        `DELETE FROM privateThread_x_user WHERE threadId = ? AND userId = ?`,
        [threadId, userId]
      );

      return response.status(200).json({
        message: "User removed from private thread successfully."
      });
    } catch (error) {
      console.error("Error removing user from private thread:", error);
      return response.status(500).json({
        message: "Server error while removing user from private thread."
      });
    }
  });
}
