export default function patchPost(app, path, database) {
  // Redigera ett inlägg (PATCH POST)
  app.patch(`${path}/posts/:id`, async (request, response) => {
    const user = request.session.user
    const postId = request.params.id
    const { postContent } = request.body

    // Kontrollera inloggning
    if (!user) {
      return response.status(401).json({
        message: "You must be logged in to edit your post."
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

    // Kontrollera att innehåll skickats
    if (!postContent || postContent.trim() === "") {
      return response.status(400).json({
        message: "Post content is required."
      });
      }
      
      // Kontrollera att inlägget existerar
      const [posts] = await database.execute(
        `SELECT userId, threadId, postDateTime FROM post WHERE id = ?`,
        [postId]
      );

      if (posts.length === 0) {
        return response.status(404).json({ message: "Post not found." });
      }

      const post = posts[0];
      // Kontrollera tråd- och forumstatus
      const [threads] = await database.execute(`
        SELECT t.id, t.isBlocked, f.isBlocked AS forumBlocked
        FROM thread t
        INNER JOIN forum f ON f.id = t.forumId
        WHERE t.id = ?
      `, [post.threadId]);

      if (threads.length > 0 && (threads[0].isBlocked === 1 || threads[0].forumBlocked === 1)) {
        return response.status(403).json({
          message: "This thread or forum is blocked. You cannot edit posts in it."
        });
      }

      if (post.userId !== user.id) {
        return response.status(403).json({ message: "You can only edit your own posts." });
      }

      // Kontrollera tidsgräns (24h)
      const createdAt = new Date(post.postDateTime);
      const now = new Date();
      const minutesSinceCreation = (now - createdAt) / 1000 / 60;
      if (minutesSinceCreation > 1440) {
        return response.status(403).json({
          message: "You can only edit a post within 24h after publishing it."
        });
      }

      // Uppdatera inlägget
      await database.execute(
        `UPDATE post SET postContent = ?, isEdited = 1, editedAt = NOW() WHERE id = ?`,
        [postContent, postId]
      );

      return response.status(200).json({ message: "Post updated successfully." });
    } catch (error) {
      console.error("Error updating post:", error);
      return response.status(500).json({ message: "Server error while updating post." });
    }
  });
}