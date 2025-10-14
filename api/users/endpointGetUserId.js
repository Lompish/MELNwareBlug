export default function userId(app, path, database) {
  // Get user av ID
  app.get(`${path}/users/:id`, async (request, response) => {
    const { id } = request.params;

    // Validera ID parametrar
    if (!id || isNaN(id)) {
      return response.status(400).json({
        message: "Valid user ID is required."
      });
    }

    try {
      // Get user från databas
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

      // kolla om user exsisterar
      if (users.length === 0) {
        return response.status(404).json({
          message: "User not found."
        });
      }

      const user = users[0];

      // Returnera användardata (utan känslig information som lösenord)
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