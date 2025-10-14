// den här koden gör en "soft delete" av en användare i users-tabellen i databasen
// både admin och användaren själv kan radera kontot i den här koden
// användarens forum, inlägg eller trådar påverkas, men endast att användarnamnet visas som "Deleted User ##"


export default function softDeleteUserByU(app, path, database) {
  app.patch(`${path}/users/softdelete/:id`, async (request, response) => {
    const userIdToDelete = parseInt(request.params.id);
    const loggedInUser = request.session.user;

    if (!loggedInUser) {
      return response.status(401).json({ message: "Unauthorized: No user is logged in." });
    }

    if (isNaN(userIdToDelete)) {
      return response.status(400).json({ message: "Invalid user ID." });
    }

    try {
      // Kontrollera att användaren finns
      const [users] = await database.execute("SELECT * FROM user WHERE id = ?", [userIdToDelete]);
      if (users.length === 0) {
        return response.status(404).json({ message: "User not found." });
      }

      const user = users[0];

      // Kontrollera att det är användaren själv
      const isSelf = loggedInUser.id === userIdToDelete;
      if (!isSelf) {
        return response.status(403).json({
          message: "Forbidden: Only the user themselves can delete this account.",
        });
      }

      // Skapa nytt unikt “DeletedUser#X”-namn
      const [deletedCountResult] = await database.execute(
        'SELECT COUNT(*) AS count FROM user WHERE username LIKE "DeletedUser%"'
      );
      const deletedNumber = (deletedCountResult[0].count || 0) + 1;
      const newName = `DeletedUser#${deletedNumber}`;

      // Soft delete
      await database.execute(
        `
        UPDATE user 
        SET username = ?, isBlocked = TRUE 
        WHERE id = ?
        `,
        [newName, userIdToDelete]
      );

      // Skicka svar
      return response.status(200).json({
        message: `Your account has been soft-deleted and replaced with "${newName}".`,
        deletedBy: "self",
        newUsername: newName,
      });

    } catch (error) {
      console.error("Error soft deleting user:", error);
      return response.status(500).json({ message: "Internal server error", error });
    }
  });
}
