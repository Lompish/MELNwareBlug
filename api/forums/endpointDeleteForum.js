export default function deleteForum(app, path, database) {
  // DELETE FORUM
  app.delete(`${path}/forums/:forumId`, async (request, response) => {
    const user = request.session.user;
    const { forumId } = request.params;

    if (!user) {
      return response.status(401).json({ message: "You must be logged in to delete a forum." });
    }

    try {
      // Kontrollera att forumet finns
      const [forums] = await database.execute(
        `SELECT * FROM forum WHERE id = ?`,
        [forumId]
      );

      if (forums.length === 0) {
        return response.status(404).json({ message: "Forum not found." });
      }

      // Kontrollera att användaren är forumets skapare
      const [forumCreators] = await database.execute(
        `SELECT * FROM user_x_forum WHERE forumId = ? AND userId = ? AND isCreator = 1`,
        [forumId, user.id]
      );

      if (forumCreators.length === 0) {
        return response.status(403).json({ message: "Only the forum creator can delete this forum." });
      }

      // Hämta alla trådar i forumet
      const [threads] = await database.execute(
        `SELECT id FROM thread WHERE forumId = ?`,
        [forumId]
      );

      // Loopa igenom trådarna och ta bort deras poster + moderatorer
      for (const thread of threads) {
        const threadId = thread.id;

        // Ta bort alla poster i tråden
        await database.execute(`DELETE FROM post WHERE threadId = ?`, [threadId]);

        // Ta bort alla trådmoderatorer
        await database.execute(`DELETE FROM threadModerator WHERE threadId = ?`, [threadId]);

        // Ta bort själva tråden
        await database.execute(`DELETE FROM thread WHERE id = ?`, [threadId]);
      }

      // Ta bort alla användarkopplingar till forumet
      await database.execute(`DELETE FROM user_x_forum WHERE forumId = ?`, [forumId]);

      // Ta bort själva forumet
      await database.execute(`DELETE FROM forum WHERE id = ?`, [forumId]);

      return response.status(200).json({ message: "Forum and all related data deleted successfully." });

    } catch (error) {
      console.error("Error deleting forum:", error);
      return response.status(500).json({ message: "Server error while deleting forum." });
    }
  });
}
