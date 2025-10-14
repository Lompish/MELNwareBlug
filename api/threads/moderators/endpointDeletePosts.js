export default function deletePostByModerator(app, path, database) {
  // Endpoint: DELETE http://localhost:3000/api/deleteposts/:id
  app.delete(`${path}/deleteposts/:id`, async (request, response) => {
    const user = request.session.user;

    // Kontrollera att användaren är inloggad
    if (!user) {
      return response.status(401).json({
        message: "Unauthorized: You must be logged in to delete posts."
      });
    }

    try {
      const postId = parseInt(request.params.id);
      if (isNaN(postId)) {
        return response.status(400).json({ message: "Invalid post ID." });
      }

      // Hämta inlägget och dess tråd + forum
      const [posts] = await database.execute(`
        SELECT 
          p.id AS postId,
          p.userId AS postUserId,
          t.id AS threadId,
          t.isBlocked AS threadBlocked,
          f.isBlocked AS forumBlocked
        FROM post p
        INNER JOIN thread t ON t.id = p.threadId
        INNER JOIN forum f ON f.id = t.forumId
        WHERE p.id = ?
      `, [postId]);

      // Kontrollera att inlägget finns
      if (posts.length === 0) {
        return response.status(404).json({ message: "Post not found." });
      }

      const post = posts[0];

      // Tillåt inte radering i blockerat forum eller tråd
      if (post.threadBlocked === 1 || post.forumBlocked === 1) {
        return response.status(403).json({
          message: "This thread or forum is blocked. Posts cannot be deleted."
        });
      }

      // Kontrollera om användaren är moderator för tråden
      const [moderatorRows] = await database.execute(`
        SELECT * FROM threadModerator 
        WHERE userId = ? AND threadId = ?
      `, [user.id, post.threadId]);

      // Om användaren inte är moderator eller skapare av tråden → neka
      if (moderatorRows.length === 0) {
        return response.status(403).json({
          message: "Forbidden: Only thread moderators or the thread creator can delete posts."
        });
      }

      // Kontroll: är användaren trådskapare eller vanlig moderator
      const isCreator = moderatorRows.some(row => row.isCreator === 1);

      // Radera inlägget (hard delete)
      await database.execute(`DELETE FROM post WHERE id = ?`, [postId]);

      return response.status(200).json({
        message: `Post (ID: ${postId}) deleted successfully by ${isCreator ? "thread creator" : "thread moderator"}.`
      });

    } catch (error) {
      console.error("Error deleting post:", error);
      return response.status(500).json({
        message: "Internal server error while deleting post.",
        error
      });
    }
  });
}
