export default function postPost(app, path, database) {
  // Create new post
  app.post(`${path}/posts`, async (request, response) => {
    const user = request.session.user;
    const { threadId, postContent } = request.body;

    // Check if user is logged in
    if (!user) {
      return response.status(401).json({ message: "You must be logged in to add posts." });
    }

    // Validate
    if (!postContent || !threadId) {
      return response.status(400).json({ message: "Post content and thread are required." });
    }

    try {
      // Check if thread exists
      const [threads] = await database.execute(`SELECT id FROM thread WHERE id = ?`, [threadId]);
      if (threads.length === 0) {
        return response.status(404).json({ message: "Thread not found." });
      }

      // Create post
      const [result] = await database.execute(
        `INSERT INTO post (userId, threadId, postContent, isBlocked, isEdited)
   VALUES (?, ?, ?, 0, 0)`,
        [user.id, threadId, postContent]
      );

      return response.status(201).json({
        message: "Post added successfully.",
        postId: result.insertId
      })
    } catch (error) {
      console.log(error)

      return response.status(500).json({
        message: "Server error."
      })
    }
  })
}