export default function getPostsByThread(app, path, database) {
  app.get(`${path}/threads/:threadId/posts`, async (request, response) => {
    const user = request.session.user;
    const { threadId } = request.params;

    try {
      // Kontrollera att tråden finns
      const [threads] = await database.execute(
        `SELECT id, isPrivate FROM thread WHERE id = ?`,
        [threadId]
      );

      if (threads.length === 0) {
        return response.status(404).json({ message: "Thread not found." });
      }

      const thread = threads[0];

      // Om tråden är privat, kontrollera åtkomst
      if (thread.isPrivate === 1) {
        if (!user) {
          return response.status(403).json({
            message: "This is a private thread. Please log in."
          });
        }

        // Kolla om användaren har tillgång
        const [access] = await database.execute(`
          SELECT * FROM privateThread_x_user 
          WHERE threadId = ? AND userId = ?
        `, [threadId, user.id]);

        // Kolla om användaren är moderator
        const [moderator] = await database.execute(`
          SELECT * FROM threadModerator 
          WHERE threadId = ? AND userId = ?
        `, [threadId, user.id]);

        if (access.length === 0 && moderator.length === 0) {
          return response.status(403).json({
            message: "You don't have access to this private thread."
          });
        }
      }

      // Hämta alla posts i tråden
      const [posts] = await database.execute(`
        SELECT p.*, u.username
        FROM post p
        INNER JOIN user u ON u.id = p.userId
        WHERE p.threadId = ?
        ORDER BY p.postDateTime ASC
      `, [threadId]);

      return response.status(200).json(posts);
    } catch (error) {
      console.error(error);
      return response.status(500).json({ message: "Server error." });
    }
  });
}