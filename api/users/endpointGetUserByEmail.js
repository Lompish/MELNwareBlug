export default function userByEmail(app, path, database) {
  // Get user från email (with wildcard support)
  app.get(`${path}/users/by-email/:email`, async (request, response) => {
    const { email } = request.params;

    // Validera email parametrar
    if (!email || email.trim() === '') {
      return response.status(400).json({
        message: "Email parameter is required."
      });
    }

    try {
      //Hämta användare från databasen med LIKE för wildcard-sökning
      const [users] = await database.execute(
        `SELECT 
          *
        FROM user 
        WHERE email LIKE ?`,
        [email]
      );

      // kolla om någon user hittas
      if (users.length === 0) {
        return response.status(404).json({
          message: "No users found matching that email."
        });
      }

      // Returera exakt match
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