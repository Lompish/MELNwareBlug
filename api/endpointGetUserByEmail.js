export default function userByEmail(app, path, database) {
  // Get user by email
  app.get(`${path}/users/by-email/:email`, async (request, response) => {
    const { email } = request.params;

    // Validate email parameter
    if (!email || email.trim() === '') {
      return response.status(400).json({
        message: "Email parameter is required."
      });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return response.status(400).json({
        message: "Invalid email format."
      });
    }

    try {
      // Get user from database
      const [users] = await database.execute(
        `SELECT 
          id,
          username,
          email,
          isBlocked
        FROM user 
        WHERE email = ?`,
        [email]
      );

      // Check if user exists
      if (users.length === 0) {
        return response.status(404).json({
          message: "User not found."
        });
      }

      const user = users[0];

      // Return user data (without sensitive info like password)
      return response.status(200).json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          isBlocked: user.isBlocked
        }
      });

    } catch (error) {
      console.log(error);
      return response.status(500).json({
        message: "Server error."
      });
    }
  });
}

export default function userByEmail(app, path, database) {
  // Get user by email (with wildcard support)
  app.get(`${path}/users/by-email/:email`, async (request, response) => {
    const { email } = request.params;

    // Validate email parameter
    if (!email || email.trim() === '') {
      return response.status(400).json({
        message: "Email parameter is required."
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
        WHERE email LIKE ?`,
        [`%${email}%`]
      );

      // Check if any users found
      if (users.length === 0) {
        return response.status(404).json({
          message: "No users found matching that email."
        });
      }

      // If exact match found, return single user
      const exactMatch = users.find(u => u.email.toLowerCase() === email.toLowerCase());
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