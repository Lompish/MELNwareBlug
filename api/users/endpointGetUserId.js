export default function userId(app, path, database) {
  // Get user by ID
  app.get(`${path}/users/:id`, async (request, response) => {
    const { id } = request.params;

    // Validate ID parameter
    if (!id || isNaN(id)) {
      return response.status(400).json({
        message: "Valid user ID is required."
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
        WHERE id = ?`,
        [id]
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