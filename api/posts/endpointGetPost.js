export default function getPosts(app, path, database) {
  app.get(`${path}/posts`, async (request, response) => {
    const user = request.session.user;

    try {
      let query;
      let params = [];

      if (!user) {
        // Ej inloggad: visa bara inlägg från publika trådar
        query = `
          SELECT p.*, u.username, t.threadName, t.isPrivate
          FROM post p
          INNER JOIN user u ON u.id = p.userId
          INNER JOIN thread t ON t.id = p.threadId
          WHERE t.isPrivate = 0
          ORDER BY p.postDateTime DESC
        `;
      } else {
        // Inloggad: visa publika + privata där användaren har tillgång
        query = `
          SELECT p.*, u.username, t.threadName, t.isPrivate
          FROM post p
          INNER JOIN user u ON u.id = p.userId
          INNER JOIN thread t ON t.id = p.threadId
          LEFT JOIN privateThread_x_user ptu ON ptu.threadId = t.id AND ptu.userId = ?
          LEFT JOIN threadModerator tm ON tm.threadId = t.id AND tm.userId = ?
          WHERE t.isPrivate = 0 
             OR ptu.userId IS NOT NULL 
             OR tm.userId IS NOT NULL
          ORDER BY p.postDateTime DESC
        `;
        params = [user.id, user.id];
      }

      const [posts] = await database.execute(query, params);

      return response.status(200).json(posts);
    } catch (error) {
      console.error(error);
      return response.status(500).json({ message: "Server error." });
    }
  });
}