export default function postThread(app, path, database) {
  // Skapa ny tråd http://localhost:3000/api/threads
  app.post(`${path}/threads`, async (request, response) => {
    const user = request.session.user;
    const { forumId, threadName, threadDescription, isPrivate } = request.body;

    // Kontrollera att användaren är inloggad
    if (!user) {
      return response.status(401).json({ message: "You must be logged in to create a thread." });
    }

    try {
      // Kontrollera att användaren inte är blockerad
      const [users] = await database.execute(`SELECT isBlocked FROM user WHERE id = ?`, [user.id]);
      if (users.length && users[0].isBlocked === 1) {
        return response.status(403).json({
          message: "Your account is blocked. You can only read content."
        });
      }

    // Validera input
    if (!threadName || !forumId) {
      return response.status(400).json({ message: "Thread name and forum are required." });
    }

      // Kontrollera att forumet finns och inte är blockerat
      const [forums] = await database.execute(
        `SELECT id, isBlocked FROM forum WHERE id = ?`,
        [forumId]
      );
      if (forums.length === 0)
        return response.status(404).json({ message: "Forum not found." });
      if (forums[0].isBlocked === 1)
        return response.status(403).json({
          message: "This forum is blocked. You cannot create threads here."
        });

      // Skapa tråd
      const [result] = await database.execute(
        `INSERT INTO thread (forumId, threadName, threadDescription, isPrivate, isBlocked)
         VALUES (?, ?, ?, ?, 0)`,
        [forumId, threadName, threadDescription || null, isPrivate ? 1 : 0]
      );

      const threadId = result.insertId;

      // Lägg till användaren som skapare i threadModerator
      await database.execute(
        `INSERT INTO threadModerator (userId, threadId, isCreator)
         VALUES (?, ?, 1)`,
        [user.id, threadId]
      );

      return response.status(201).json({
        message: "Thread created successfully.",
        threadId
      });
    } catch (error) {
      console.error("Error creating thread:", error);
      return response.status(500).json({ message: "Server error." });
    }
  });
}