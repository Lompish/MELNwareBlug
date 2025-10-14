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
          *
        FROM user 
        WHERE email LIKE ?`,
        [email]
      );

      // Check if any users found
      if (users.length === 0) {
        return response.status(404).json({
          message: "No users found matching that email."
        });
      }

      // Return the exact match
      const user = users[0];
      return response.status(200).json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          isBlocked: user.isBlocked
        }
      });

    } catch (error) {
      console.error(error);
      return response.status(500).json({
        message: "Server error."
      });
    }
  });
}