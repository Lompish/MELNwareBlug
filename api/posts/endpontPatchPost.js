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

    // Kontrollera att innehåll skickats
    if (!postContent || postContent.trim() === "") {
      return response.status(400).json({
        message: "Post content is required."
      });
    }

    try {
      // Kontrollera att inlägget existerar och hämta skapelsetid
      const [posts] = await database.execute(
        `SELECT userId, postDateTime FROM post WHERE id = ?`,
        [postId]
      );

      if (posts.length === 0) {
        return response.status(404).json({ message: "Post not found." });
      }

      const post = posts[0];

      // Kontrollera om tråden är blockad
      const [threads] = await database.execute(
        `SELECT isBlocked FROM thread WHERE id = (SELECT threadId FROM post WHERE id = ?)`,
        [postId]
      );

      if (threads.length > 0 && threads[0].isBlocked === 1) {
        return response.status(403).json({
          message: "This thread is blocked. You cannot edit posts in it."
        });
      }

      // Kontrollera att användaren är postaren av inlägget
      if (posts[0].userId !== user.id) {
        return response.status(403).json({
          message: "You can only edit your own posts."
        });
      }

    // Kontrollera att det inte gått mer än 24h sedan inlägget gjordes
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
        `UPDATE post
         SET postContent = ?, isEdited = 1, editedAt = NOW()
         WHERE id = ?`,
        [postContent, postId]
      );

      return response.status(200).json({
        message: "Post updated successfully."
      });
    } catch (error) {
      console.error(error);
      return response.status(500).json({
        message: "Server error while updating post."
      });
    }
  });
}