export default function threads(app, acl, path, database) {
  // Create new thread
  app.post(`${path}/threads`, async (request, response) => {
    const user = request.session.user;
    const { forumId, threadName, threadDescription, isPrivate } = request.body;

    // Check if user is logged in
    if (!user) {
      return response.status(401).json({ message: "You must be logged in to create a thread." });
    }

    // Validate
    if (!threadName || !forumId) {
      return response.status(400).json({ message: "Thread name and forum are required." });
    }

    try {
      // Check if forum exists
      const [forums] = await database.execute(`SELECT id FROM forum WHERE id = ?`, [forumId]);
      if (forums.length === 0) {
        return response.status(404).json({ message: "Forum not found." });
      }

      // Create thread
      const [result] = await database.execute(
        `INSERT INTO thread (forumId, threadName, threadDescription, isPrivate, isBlocked)
   VALUES (?, ?, ?, ?, 0)`,
        [forumId, threadName, threadDescription || null, isPrivate ? 1 : 0]
      );

      const threadId = result.insertId;
      // Add user to the threadModerator table as creator(isCreator)
      const [modResult] = await database.execute(
        `INSERT INTO threadModerator (userId, threadId, isCreator)
   VALUES (?, ?, 1)`,
        [user.id, threadId]
      )

      return response.status(201).json({
        message: "Thread created successfully.",
        threadId: result.insertId
      })
    } catch (error) {
      console.log(error)

      return response.status(500).json({
        message: "Server error."
      })
    }
  })
}