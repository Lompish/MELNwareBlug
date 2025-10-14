export default function postPost(app, path, database) {
  // Skapa nytt inlägg
  app.post(`${path}/posts`, async (request, response) => {
    const user = request.session.user;
    const { threadId, postContent } = request.body;

    // Kontrollera att användaren är inloggad
    if (!user) {
      return response.status(401).json({ message: "You must be logged in to add posts." });
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
    if (!postContent || !threadId) {
      return response.status(400).json({ message: "Post content and thread are required." });
      }
      
      // Kontrollera att tråden (och dess forum) inte är blockerad
      const [threads] = await database.execute(`
        SELECT t.id, t.isBlocked, f.isBlocked AS forumBlocked
        FROM thread t
        INNER JOIN forum f ON f.id = t.forumId
        WHERE t.id = ?
      `, [threadId]);

      if (threads.length === 0) {
        return response.status(404).json({ message: "Thread not found." });
      }

      const thread = threads[0];

      if (thread.isBlocked === 1 || thread.forumBlocked === 1) {
        return response.status(403).json({
          message: "This thread or forum is blocked. You cannot post here."
        });
      }

      // Skapa inlägget
      const [result] = await database.execute(
        `INSERT INTO post (userId, threadId, postContent, isBlocked, isEdited)
         VALUES (?, ?, ?, 0, 0)`,
        [user.id, threadId, postContent]
      );

      return response.status(201).json({
        message: "Post added successfully.",
        postId: result.insertId
      });
    } catch (error) {
      console.error("Error creating post:", error);
      return response.status(500).json({ message: "Server error." });
    }
  });
}