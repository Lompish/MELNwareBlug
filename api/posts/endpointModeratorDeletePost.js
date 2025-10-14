// Trådägare/moderator kan radera inlägg i sina trådar
export default function moderatorDeletePost(app, path, database) {
  // Endpoint för att radera posts från databasen - http://localhost:3000/api/posts/:id
  app.delete(`${path}/posts/:id`, async (request, response) => {
    const user = request.session.user;
    const postId = request.params.id;

    // Kontrollera att användaren är inloggad
    if (!user) {
      return response.status(401).json({
        message: "You must be logged in to delete a post."
      });
    }

    try {
      // Hämta inlägget och tillhörande tråd
      const [posts] = await database.execute(
        `SELECT p.userId, p.threadId, t.isBlocked AS threadBlocked, f.isBlocked AS forumBlocked
         FROM post p
         INNER JOIN thread t ON t.id = p.threadId
         INNER JOIN forum f ON f.id = t.forumId
         WHERE p.id = ?`,
        [postId]
      );

      // Kontrollera att inlägget finns
      if (posts.length === 0) {
        return response.status(404).json({ message: "Post not found." });
      }

      const post = posts[0];

      // Kontrollera att användaren antingen äger inlägget
      // eller är moderator/trådägare för tråden
      if (post.userId !== user.id) {
        const [mods] = await database.execute(
          `SELECT * FROM threadModerator WHERE threadId = ? AND userId = ?`,
          [post.threadId, user.id]
        );

        if (mods.length === 0) {
          return response.status(403).json({
            message: "Only moderators and thread owner can delete posts in this thread."
          });
        }
      }

      // Radera (hard delete)
      await database.execute(`DELETE FROM post WHERE id = ?`, [postId]);

      return response.status(200).json({
        message: "Post deleted successfully by moderator or thread owner."
      });
    } catch (error) {
      console.error("Error deleting post:", error);
      return response.status(500).json({
        message: "Server error while deleting post."
      });
    }
  });
}