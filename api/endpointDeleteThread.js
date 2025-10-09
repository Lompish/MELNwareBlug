export default function deleteThread(app, path, database) {
  // DELETE THREAD
app.delete(`${path}/threads/:forumId/:threadId`, async (request, response) => {
  const user = request.session.user
  const { forumId, threadId } = request.params

  if (!user) {
    return response.status(401).json({ message: "You must be logged in to delete a thread." })
  }

  try {
    // Check if thread exists
    const [threads] = await database.execute(
      `SELECT * FROM thread WHERE id = ?`,
      [threadId]
    )

    if (threads.length === 0) {
      return response.status(404).json({ message: "Thread not found." })
    }

    // Check thread is in right forum
    if (threads[0].forumId != forumId) {
      return response.status(404).json({ message: "Thread does not belong to this forum." })
    }

    const [threadCreators] = await database.execute(
      `SELECT * FROM threadModerator WHERE threadId = ? AND userId = ? AND isCreator = 1`,
      [threadId, user.id]
    )

    if (threadCreators.length === 0) {
      return response.status(403).json({ message: "Only the thread creator can delete the thread." })
    }

    // Delete thread posts so we can delete thread
    await database.execute(`DELETE FROM post WHERE threadId = ?`, [threadId])

    // Delete thread moderators so we can delete thread
    await database.execute(`DELETE FROM threadModerator WHERE threadId = ?`, [threadId])

    // Delete thread
    await database.execute(`DELETE FROM thread WHERE id = ?`, [threadId])

    return response.status(200).json({ message: "Thread deleted successfully." })

  } catch (error) {
    console.error('Error deleting thread:', error)
    return response.status(500).json({ message: "Server error while deleting thread." })
  }
})
}