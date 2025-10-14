// den här koden gör en "soft delete" av en användare i users-tabellen i databasen
// både admin och användaren själv kan radera kontot i den här koden
// användarens forum, inlägg eller trådar påverkas, men endast att användarnamnet visas som "Deleted User ##"

// INTE TESTAD I POSTMAN
export default function softDeleteUserByUorA(app, path, database) {
  app.patch(`${path}/users/softdelete/:id`, async (request, response) => {
    const userIdToDelete = parseInt(request.params.id);

    // Testa båda alternativen så det fungerar oavsett hur sessionen är sparad
    const loggedInUser = request.session.user || request.session.loggedInUser || request.user;

    if (!loggedInUser) {
      return response.status(401).json({ message: 'Unauthorized: You must be logged in.' });
    }

    // Endast admin eller användaren själv
    const isAdmin = loggedInUser.role === 'admin';
    const isSelf = loggedInUser.id === userIdToDelete;

    if (!isAdmin && !isSelf) {
      return response.status(403).json({
        message: 'Forbidden: You can only delete your own account unless you are an admin.',
      });
    }

    try {
      // Hämta användaren
      const [users] = await database.execute('SELECT * FROM user WHERE id = ?', [userIdToDelete]);
      if (users.length === 0) {
        return response.status(404).json({ message: 'User not found' });
      }

      const user = users[0];

      // Skapa unikt namn
      const [deletedCountResult] = await database.execute(
        'SELECT COUNT(*) AS count FROM user WHERE username LIKE "DeletedUser%"'
      );
      const deletedNumber = (deletedCountResult[0].count || 0) + 1;
      const newName = `DeletedUser#${deletedNumber}`;

      // Soft delete
      await database.execute(
        `UPDATE user 
         SET username = ?, isBlocked = TRUE 
         WHERE id = ?`,
        [newName, userIdToDelete]
      );

      return response.status(200).json({
        message: isSelf
          ? `Your account has been soft-deleted and replaced with "${newName}".`
          : `User "${user.username}" has been soft-deleted and replaced with "${newName}".`,
        newUsername: newName,
      });

    } catch (error) {
      console.error('Error soft deleting user:', error);
      return response.status(500).json({ message: 'Internal server error', error });
    }
  });
}
