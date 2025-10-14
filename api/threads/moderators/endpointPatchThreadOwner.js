export default function patchThreadOwner(app, path, database) {

  // Lämna över ägandet till en annan användare - http://localhost:3000/api/threads/:thread-id/transfer-ownership
  app.patch(`${path}/threads/:threadId/transfer-ownership`, async (request, response) => {
    const user = request.session.user;
    const { threadId } = request.params;
    const { newOwnerId } = request.body;

    if (!user) {
      return response.status(401).json({ message: "You must be logged in to transfer thread ownership." });
    }

    if (!newOwnerId) {
      return response.status(400).json({ message: "New ownerId is required." });
    }

    try {
      // Kontrollera att tråden finns
      const [threads] = await database.execute(
        `SELECT id, threadName FROM thread WHERE id = ?`,
        [threadId]
      );

      if (threads.length === 0) {
        return response.status(404).json({ message: "Thread not found." });
      }

      // Kontrollera att användaren är nuvarande trådägare
      const [currentOwner] = await database.execute(
        `SELECT * FROM threadModerator WHERE threadId = ? AND userId = ? AND isCreator = 1`,
        [threadId, user.id]
      );

      if (currentOwner.length === 0) {
        return response.status(403).json({ message: "Only the current thread owner can transfer ownership." });
      }

      // Kontrollera att nya ägaren existerar
      const [newOwner] = await database.execute(
        `SELECT id, username FROM user WHERE id = ?`,
        [newOwnerId]
      );

      if (newOwner.length === 0) {
        return response.status(404).json({ message: "New owner user not found." });
      }

      const newOwnerName = newOwner[0].username;

      // Kolla om nya trådägaren redan finns i threadModerator
      const [existing] = await database.execute(
        `SELECT * FROM threadModerator WHERE threadId = ? AND userId = ?`,
        [threadId, newOwnerId]
      );
      // Lägg till nya användaren i threadModerator
      if (existing.length === 0) {
        await database.execute(
          `INSERT INTO threadModerator (userId, threadId, isCreator) VALUES (?, ?, 0)`,
          [newOwnerId, threadId]
        );
      }

      // Ändra nuvarande trådägare till vanlig moderator (isCreator = 0)
      await database.execute(
        `UPDATE threadModerator SET isCreator = 0 WHERE threadId = ? AND userId = ?`,
        [threadId, user.id]
      );

      // Lägg till ny trådägare (isCreator = 1)
      await database.execute(
        `UPDATE threadModerator SET isCreator = 1 WHERE threadId = ? AND userId = ?`,
        [threadId, newOwnerId]
      );

      return response.status(200).json({
        message: `Ownership of thread "${threads[0].threadName}" was successfully transferred to ${newOwnerName}.`,
        newOwnerId: newOwnerId,
        newOwnerName: newOwnerName
      });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ message: "Server error while transferring ownership." });
    }
  });
}