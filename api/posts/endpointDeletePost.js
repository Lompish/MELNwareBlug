export default function deletePost(app, path, database) {
  // // Endpoint för att radera posts från databasen - http://localhost:3000/api/posts/inläggets id
  app.delete(`${path}/posts/:id`, async (request, response) => {
    const user = request.session.user;
    const postId = request.params.id;

    // Kontrollera att användaren är inloggad
    if (!user) {
      return response.status(401).json({
        message: "You must be logged in to delete your post."
      });
    }

    try {
      // Kontrollera att användaren inte är blockerad
      const [users] = await database.execute(`SELECT isBlocked FROM user WHERE id = ?`, [user.id]);
      if (users.length && users[0].isBlocked === 1) {
        return response.status(403).json({
          message: "Your account is blocked. You can only read content."
        });
      }

      // Hämta inlägget och tillhörande tråd + forum
      const [posts] = await database.execute(`
        SELECT p.userId, p.postDateTime, t.isBlocked AS threadBlocked, f.isBlocked AS forumBlocked
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

      // Tillåt inte radering om tråden eller forumet är blockerat
      if (post.threadBlocked === 1 || post.forumBlocked === 1) {
        return response.status(403).json({
          message: "This thread or forum is blocked. You cannot delete posts in it."
        });
      }

      // Kontrollera att användaren äger inlägget
      if (post.userId !== user.id) {
        return response.status(403).json({
          message: "You can only delete your own posts."
        });
      }

      // Kolla att det inte gått mer än 24h sedan inlägget skapades
      const createdAt = new Date(post.postDateTime);
      const now = new Date();
      const minutesSinceCreation = (now - createdAt) / 1000 / 60;

      if (minutesSinceCreation > 1440) {
        return response.status(403).json({
          message: "You can only delete a post within 24h after publishing it."
        });
      }

      // Radera inlägget (hard delete)
      await database.execute(`DELETE FROM post WHERE id = ?`, [postId]);

      return response.status(200).json({
        message: "Post deleted permanently."
      });
    } catch (error) {
      console.error(error);
      return response.status(500).json({
        message: "Server error while deleting post."
      });
    }
  });
}