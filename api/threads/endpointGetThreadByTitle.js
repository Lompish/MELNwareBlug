export default function threadByTitle(app, path, database) {
  // Get threads by title
  app.get(`${path}/threads/by-title/:title`, async (request, response) => {
    const user = request.session.user;
    const { title } = request.params;

    // Validera title parametrar
    if (!title || title.trim() === '') {
      return response.status(400).json({ message: "Title parameter is required." });
    }

    try {
      // Bygg query baserade påuser login status
      let query;
      let params;

      if (user) {
        // inloggad: visa publika trådar + privata trådar där user är moderator
        query = `
          SELECT DISTINCT
            t.id,
            t.forumId,
            t.threadName,
            t.threadDescription,
            t.isPrivate,
            t.creationDate,
            t.isBlocked
          FROM thread t
          LEFT JOIN threadModerator tm ON t.id = tm.threadId AND tm.userId = ?
          WHERE t.threadName LIKE ? 
            AND t.isBlocked = 0
            AND (t.isPrivate = 0 OR (t.isPrivate = 1 AND tm.userId IS NOT NULL))
          ORDER BY t.creationDate DESC`;
        params = [user.id, `%${title}%`];
      } else {
        // ej inloggad: visa bara publika trådar
        query = `
          SELECT 
            id,
            forumId,
            threadName,
            threadDescription,
            isPrivate,
            creationDate,
            isBlocked
          FROM thread
          WHERE threadName LIKE ? 
            AND isBlocked = 0
            AND isPrivate = 0
          ORDER BY creationDate DESC`;
        params = [`%${title}%`];
      }

      //SÄKERT - Prepared statement med parametrar
      const [threads] = await database.execute(query, params);

      return response.status(200).json({
        threads: threads,
        count: threads.length
      });
    } catch (error) {
      console.log(error);
      return response.status(500).json({
        message: "Server error."
      });
    }
  });
}
