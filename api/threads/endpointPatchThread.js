export default function patchThreads(app, path, database) {
  app.patch(`${path}/threads/:id`, async (request, response) => {
    const user = request.session.user;
    const threadId = request.params.id;
    const { forumId, threadName, threadDescription, isPrivate } = request.body;

    if (!user) {
      return response.status(401).json({ message: "You must be logged in to edit a thread." });
    }

    try {
      // Kontrollera blockerad användare
      const [users] = await database.execute(`SELECT isBlocked FROM user WHERE id = ?`, [user.id]);
      if (users.length && users[0].isBlocked === 1) {
        return response.status(403).json({ message: "Your account is blocked. You can only read content." });
      }

      // Hämta tråd + forum
      const [threads] = await database.execute(
        `SELECT t.id, t.forumId, t.isBlocked AS threadBlocked, f.isBlocked AS forumBlocked
         FROM thread t
         LEFT JOIN forum f ON f.id = t.forumId
         WHERE t.id = ?`,
        [threadId]
      );

      if (threads.length === 0) return response.status(404).json({ message: "Thread not found." });

      const thread = threads[0];
      if (thread.threadBlocked === 1 || thread.forumBlocked === 1) {
        return response.status(403).json({ message: "This thread or forum is blocked." });
      }

      // Kontrollera att användaren är trådskapare
      const [creators] = await database.execute(
        `SELECT * FROM threadModerator WHERE threadId = ? AND userId = ? AND isCreator = 1`,
        [threadId, user.id]
      );

      if (creators.length === 0) return response.status(403).json({ message: "Only thread creators can edit threads." });

      // Ingen uppdatering
      if (!forumId && !threadName && !threadDescription && typeof isPrivate === "undefined") {
        return response.status(400).json({ message: "No fields provided to update." });
      }

      // Forumkontroll
      if (forumId) {
        const [forums] = await database.execute(`SELECT id FROM forum WHERE id = ?`, [forumId]);
        if (forums.length === 0) return response.status(404).json({ message: "Forum not found." });
      }

      // Dynamisk uppdatering
      const fields = [];
      const values = [];

      if (forumId !== undefined) { fields.push("forumId = ?"); values.push(forumId); }
      if (threadName !== undefined) { fields.push("threadName = ?"); values.push(threadName); }
      if (threadDescription !== undefined) { fields.push("threadDescription = ?"); values.push(threadDescription); }
      if (typeof isPrivate === "boolean") { fields.push("isPrivate = ?"); values.push(isPrivate ? 1 : 0); }

      values.push(threadId);

      await database.execute(`UPDATE thread SET ${fields.join(", ")} WHERE id = ?`, values);

      return response.status(200).json({ message: "Thread updated successfully." });

    } catch (error) {
      console.error(error);
      return response.status(500).json({ message: "Server error while updating thread." });
    }
  });
}
