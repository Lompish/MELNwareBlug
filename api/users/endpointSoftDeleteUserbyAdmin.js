// den här koden markerar en användare som "deleted user" i users-tabellen i databasen
// endast admin får radera användare i den här koden
// användarens forum, inlägg eller trådar påverkas, men endast att användarnamnet visas som "Deleted User ##"

export function softDeleteUser(app, path, database) {
  app.patch(`${path}/users/:id`, async (request, response) => {
    const userId = request.params.id;
    const admin = request.user && request.user.role === 'admin';

    if (!admin) {
      return response.status(403).json({ message: 'Forbidden: Admins only' });
    }

    try {
      // Här hämtar vi användaren för att verifiera att den finns
      const [users] = await database.execute('SELECT * FROM user WHERE id = ?', [userId]);
      if (users.length === 0) {
        return response.status(404).json({ message: 'User not found' });
      }

      const user = users[0];

      // Hitta nästa lediga Deleted User-nummer, så att vi inte får dubbletter
      const [deletedCountResult] = await database.execute(
        'SELECT COUNT(*) AS count FROM user WHERE username LIKE "Deleted User%"'
      );
      const deletedNumber = (deletedCountResult[0].count || 0) + 1;
      const newName = `Deleted User #${deletedNumber}`;

      // Uppdatera användaren (soft delete)
      await database.execute(
        `UPDATE user 
         SET username = ?, isBlocked = TRUE 
         WHERE id = ?`,
        [newName, userId]
      );

      // Svar till klienten
      return response.status(200).json({
        message: `User "${user.username}" has been soft-deleted and replaced with "${newName}".`,
        newUsername: newName,
      });

    } catch (error) {
      console.error('Error soft deleting user:', error);
      return response.status(500).json({ message: 'Internal server error', error });
    }
  });
}

