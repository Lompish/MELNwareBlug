export default function patchThreads(app, acl, path, database) {
  // Edit a thread (PATCH)
app.patch(`${path}/threads/:id`, async (request, response) => {
  const user = request.session.user
  const threadId = request.params.id
  const { forumId, threadName, threadDescription, isPrivate } = request.body

  if (!user) {
    return response.status(401).json({ message: "You must be logged in to edit a thread." })
  }


  try {
    // Check that the thread exists
    const [threads] = await database.execute(`SELECT id FROM thread WHERE id = ?`, [threadId])
    if (threads.length === 0) {
      return response.status(404).json({ message: "Thread not found." })
    }

    // Check if user is thread creator
    const [threadCreators] = await database.execute(
      `SELECT * FROM threadModerator WHERE threadId = ? AND userId = ? AND isCreator = 1`,
      [threadId, user.id]
    )

    console.log('Thread creator:', threadCreators)
    console.log('Looking for userId:', user.id, 'threadId:', threadId)

    if (threadCreators.length === 0) {
      return response.status(403).json({ message: "Only thread creators can edit threads." })
    }

    // No fields provided
    if (!threadName && !threadDescription && typeof isPrivate === "undefined" && !forumId) {
      return response.status(400).json({ message: "No fields provided to update." })
    }
    // Forum not found
    if (forumId) {
      const [forums] = await database.execute(`SELECT id FROM forum WHERE id = ?`, [forumId]);
      if (forums.length === 0) {
        return response.status(404).json({ message: "Forum not found." });
      }
    }


    // Update thread
    await database.execute(
      `UPDATE thread 
   SET
    forumId = COALESCE(?, forumId),
    threadName = COALESCE(?, threadName),
    threadDescription = COALESCE(?, threadDescription),
    isPrivate = COALESCE(?, isPrivate)
   WHERE id = ?`,
      [
        forumId || null,
        threadName || null,
        threadDescription || null,
        typeof isPrivate === "boolean" ? (isPrivate ? 1 : 0) : null,
        threadId
      ]
    )
    return response.status(200).json({ message: "Thread updated successfully." })

  } catch (error) {
    console.error(error)
    return response.status(500).json({ message: "Server error while updating thread." })
  }
})
}