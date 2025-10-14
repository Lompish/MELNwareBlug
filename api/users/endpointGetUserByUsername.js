export default function userByUsername(app, path, database) {
  // Get user från username (with wildcard support)
  app.get(`${path}/users/by-username/:username`, async (request, response) => {
    const { username } = request.params;

    // Validera username parametrar
    if (!username || username.trim() === '') {
      return response.status(400).json({
        message: "Username parameter is required."
      });
    }

    try {
      // hämta users från databas med LIKE för wildcard search
      const [users] = await database.execute(
        `SELECT 
          id,
          username,
          email,
          isBlocked
        FROM user 
        WHERE username LIKE ?`,
        [`%${username}%`]
      );

      // kolla om någon user hittas
      if (users.length === 0) {
        return response.status(404).json({
          message: "No users found matching that username."
        });
      }

      // om exakt user match hittas, returnera endast den user
      const exactMatch = users.find(u => u.username.toLowerCase() === username.toLowerCase());
      if (exactMatch) {
        return response.status(200).json({
          user: {
            id: exactMatch.id,
            username: exactMatch.username,
            email: exactMatch.email,
            isBlocked: exactMatch.isBlocked
          }
        });
      }

      // Returnera alla matchande users (partial matches)
      return response.status(200).json({
        users: users.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          isBlocked: user.isBlocked
        })),
        count: users.length
      });

    } catch (error) {
      console.log(error);
      return response.status(500).json({
        message: "Server error."
      });
    }
  });
}