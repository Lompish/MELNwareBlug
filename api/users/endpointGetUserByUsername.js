export default function userByUsername(app, path, database) {
  // Get user by username (with wildcard support)
  app.get(`${path}/users/by-username/:username`, async (request, response) => {
    const { username } = request.params;

    // Validate username parameter
    if (!username || username.trim() === '') {
      return response.status(400).json({
        message: "Username parameter is required."
      });
    }

    try {
      // Get users from database with LIKE for wildcard search
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

      // Check if any users found
      if (users.length === 0) {
        return response.status(404).json({
          message: "No users found matching that username."
        });
      }

      // If exact match found, return single user
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

      // Return all matching users (partial matches)
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