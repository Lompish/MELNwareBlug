// Hämta alla inlägg i en tråd men hindrar användare som inte fått tillgång till privata trådar att hämta inläggen

export default function getPostsByThreadId(app, path, database) {
  // GET http://localhost:3000/api/threads/:threadId/posts
  app.get(`${path}/threads/:threadId/posts`, async (request, response) => {
    const user = request.session.user || null;
    const { threadId } = request.params;

    try {
      // Kontrollera att tråden finns
      const [threads] = await database.execute(
        `SELECT id, isPrivate, isBlocked FROM thread WHERE id = ?`,
        [threadId]
      );

      if (threads.length === 0) {
        return response.status(404).json({ message: "Thread not found." });
      }

      const thread = threads[0];

      // Kontrollera åtkomst om tråden är privat
      if (thread.isPrivate === 1) {
        // Oinloggade användare får inte se läsa privata trådar
        if (!user) {
          return response.status(401).json({
            message: "You must be logged in to view private threads."
          });
        }

        // Kontrollera om användaren är inbjuden till tråden (privateThread_x_user)
        const [privateAccess] = await database.execute(
          `SELECT * FROM privateThread_x_user WHERE threadId = ? AND userId = ?`,
          [threadId, user.id]
        );

        // Kontrollera om användaren är moderator eller trådägare
        const [moderatorAccess] = await database.execute(
          `SELECT * FROM threadModerator WHERE threadId = ? AND userId = ?`,
          [threadId, user.id]
        );

        // Blockera åtkomst om användaren inte är inbjuden eller moderator/trådägare
        if (privateAccess.length === 0 && moderatorAccess.length === 0) {
          return response.status(403).json({
            message: "You do not have access to this private thread."
          });
        }
      }

      // Hämta synliga (dock ej blockerade) inlägg onvändaren har åtkomst
      const [posts] = await database.execute(
        `SELECT 
          p.id, 
          p.userId,
          u.username AS author,
          p.postContent,
          p.postDateTime,
          p.isEdited,
          p.editedAt
         FROM post AS p
         INNER JOIN user AS u ON p.userId = u.id
         WHERE p.threadId = ? AND p.isBlocked = 0
         ORDER BY p.postDateTime ASC`,
        [threadId]
      );

      // Returnera inläggen
      return response.status(200).json({
        threadId,
        posts
      });
    } catch (error) {
      console.error("Error fetching posts by thread ID:", error);
      return response.status(500).json({
        message: "Server error while fetching posts."
      });
    }
  });
}
