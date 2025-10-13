export default function postThreadModerator(app, path, database) {

  // Lägg till moderator till tråd - http://localhost:3000/api/threads/:thread-id/moderators
  app.post(`${path}/threads/:threadId/moderators`, async (request, response) => {
    const user = request.session.user;
    const { threadId } = request.params;
    const { newModeratorId } = request.body;

    if (!user) {
      return response.status(401).json({ message: "You must be logged in to assign moderators." });
    }

    if (!newModeratorId) {
      return response.status(400).json({ message: "UserId for moderator is required." });
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

      // Kontrollera att användare är trådägare
      const [owners] = await database.execute(
        `SELECT * FROM threadModerator WHERE threadId = ? AND userId = ? AND isCreator = 1`,
        [threadId, user.id]
      );

      if (owners.length === 0) {
        return response.status(403).json({ message: "Only the thread creator can assign moderators." });
      }

      // Kontrollera att användare (framtida moderator) finns
      const [users] = await database.execute(
        `SELECT id FROM user WHERE id = ?`,
        [newModeratorId]
      );

      if (users.length === 0) {
        return response.status(404).json({ message: "User not found." });
      }

      // Kolla om användaren redan är moderator i tråden
      const [existingMods] = await database.execute(
        `SELECT * FROM threadModerator WHERE threadId = ? AND userId = ?`,
        [threadId, newModeratorId]
      );

      if (existingMods.length > 0) {
        return response.status(409).json({ message: "User is already a moderator for this thread." });
      }

      // Lägg till moderatorn
      await database.execute(
        `INSERT INTO threadModerator (userId, threadId, isCreator) VALUES (?, ?, 0)`,
        [newModeratorId, threadId]
      );

      return response.status(201).json({ message: "Moderator added successfully." });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ message: "Server error while adding moderator." });
    }
  });
}