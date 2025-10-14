export default function deleteThread(app, path, database) {
  // DELETE /api/threads/:forumId/:threadId
  app.delete(`${path}/threads/:forumId/:threadId`, async (request, response) => {
    const user = request.session.user;
    const { forumId, threadId } = request.params;

    if (!user) {
      return response.status(401).json({ message: "You must be logged in to delete a thread." });
    }

    try {
      // Kontrollera att användaren inte är blockerad
      const [users] = await database.execute(`SELECT isBlocked FROM user WHERE id = ?`, [user.id]);
      if (users.length && users[0].isBlocked === 1) {
        return response.status(403).json({
          message: "Your account is blocked. You can only read content."
        });
      }

      // Kontrollera att tråden finns och forumstatus
      const [threads] = await database.execute(`
        SELECT t.id, t.forumId, t.isBlocked, f.isBlocked AS forumBlocked
        FROM thread t
        INNER JOIN forum f ON f.id = t.forumId
        WHERE t.id = ?
      `, [threadId]);

      if (threads.length === 0) {
        return response.status(404).json({ message: "Thread not found." });
      }

      const thread = threads[0];

      if (thread.forumId != forumId) {
        return response.status(404).json({ message: "Thread does not belong to this forum." });
      }

      // Om tråd eller forum är blockerat
      if (thread.isBlocked === 1 || thread.forumBlocked === 1) {
        return response.status(403).json({ message: "This thread or forum is blocked." });
      }

      // Kontrollera att användaren är trådägare
      const [threadCreators] = await database.execute(
        `SELECT * FROM threadModerator WHERE threadId = ? AND userId = ? AND isCreator = 1`,
        [threadId, user.id]
      );

      if (threadCreators.length === 0) {
        return response.status(403).json({ message: "Only the thread creator can delete the thread." });
      }

      // Soft delete (block)
      await database.execute(
        `UPDATE thread SET isBlocked = 1 WHERE id = ?`,
        [threadId]
      );

      await database.execute(
        `UPDATE post SET isBlocked = 1 WHERE threadId = ?`,
        [threadId]
      );

      return response.status(200).json({ message: "Thread has been soft deleted (blocked) successfully." });
    } catch (error) {
      console.error("Error soft deleting thread:", error);
      return response.status(500).json({ message: "Server error while blocking thread." });
    }
  });
}