// Endpoint för moderatorer och trådägare att blockera eller avblockera inlägg (soft delete / restore)

export default function patchBlockPost(app, path, database) {
  // PATCH http://localhost:3000/api/posts/:id/block
  app.patch(`${path}/posts/:id/block`, async (request, response) => {
    const user = request.session.user;
    const postId = request.params.id;
    const { isBlocked } = request.body;

    // Kontrollera inloggning
    if (!user) {
      return response.status(401).json({
        message: "You must be logged in to moderate posts."
      });
    }

    // Validera att isBlocked finns
    if (typeof isBlocked !== "boolean") {
      return response.status(400).json({
        message: "isBlocked (true/false) is required in request body."
      });
    }

    try {
      // Hämta post och trådid
      const [posts] = await database.execute(
        `SELECT id, threadId, isBlocked FROM post WHERE id = ?`,
        [postId]
      );

      if (posts.length === 0) {
        return response.status(404).json({ message: "Post not found." });
      }

      const post = posts[0];

      // Hämta tråd för att verifiera moderator
      const [threads] = await database.execute(
        `SELECT id FROM thread WHERE id = ?`,
        [post.threadId]
      );

      if (threads.length === 0) {
        return response.status(404).json({ message: "Thread not found." });
      }

      const thread = threads[0];

      // Kontrollera att användaren är trådägare eller moderator
      const [moderators] = await database.execute(
        `SELECT * FROM threadModerator WHERE threadId = ? AND userId = ?`,
        [thread.id, user.id]
      );

      if (moderators.length === 0) {
        return response.status(403).json({
          message: "Only thread owner or moderators can change post block status."
        });
      }

      // Om samma status redan gäller → avbryt
      if ((isBlocked && post.isBlocked === 1) || (!isBlocked && post.isBlocked === 0)) {
        return response.status(409).json({
          message: isBlocked
            ? "Post is already blocked."
            : "Post is already unblocked."
        });
      }

      // Uppdatera blockstatus
      await database.execute(
        `UPDATE post SET isBlocked = ?, blockedAt = ${isBlocked ? "NOW()" : "NULL"} WHERE id = ?`,
        [isBlocked ? 1 : 0, postId]
      );

      const action = isBlocked ? "blocked" : "unblocked";

      return response.status(200).json({
        message: `Post has been ${action} successfully.`,
        postId,
        isBlocked
      });
    } catch (error) {
      console.error("Error updating post block status:", error);
      return response.status(500).json({
        message: "Server error while updating post block status."
      });
    }
  });
}