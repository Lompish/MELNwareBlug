// den här koden gör en "soft delete" av en användare i users-tabellen i databasen
// både admin och användaren själv kan radera kontot i den här koden
// användarens forum, inlägg eller trådar påverkas, men endast att användarnamnet visas som "Deleted User ##"

export default function softDeleteUserByUorA(app, path, database) {
  app.patch(`${path}/users/softdelete/:id`, async (request, response) => {
    const userIdToDelete = parseInt(request.params.id);

    // ta bort detta för att testa med admin
    const loggedInUser = request.session.user;

    // Fejkadmin för testning 
    // const fakeAdmin = { id: 1, username: "admin tester", role: "admin" };

    // Gör inloggad admin (för testning)
    // const loggedInUser = fakeAdmin;

    if (!loggedInUser) {
      return response.status(401).json({ message: "Unauthorized: No user is logged in." });
    }

    try {
      // Kontrollera att användaren som ska tas bort finns
      const [users] = await database.execute("SELECT * FROM user WHERE id = ?", [userIdToDelete]);
      if (users.length === 0) {
        return response.status(404).json({ message: "User not found" });
      }

      const user = users[0];

      // Kontroll: är detta admin eller användaren själv
      const isSelf = loggedInUser.id === userIdToDelete;
      const isAdmin = loggedInUser.role === "admin";

      if (!isAdmin && !isSelf) {
        return response.status(403).json({
          message: "Forbidden: Only admin or the user themselves can delete this account.",
        });
      }

      // Skapa nytt unikt “DeletedUser#X”-namn
      const [deletedCountResult] = await database.execute(
        'SELECT COUNT(*) AS count FROM user WHERE username LIKE "DeletedUser%"'
      );
      const deletedNumber = (deletedCountResult[0].count || 0) + 1;
      const newName = `DeletedUser#${deletedNumber}`;

      // Utför soft delete i databasen
      await database.execute(
        `
        UPDATE user 
        SET username = ?, isBlocked = TRUE 
        WHERE id = ?
        `,
        [newName, userIdToDelete]
      );

      // Svar till klient om lyckad radering
      return response.status(200).json({
        message: isSelf
          ? `Your account has been soft-deleted and replaced with "${newName}".`
          : `User "${user.username}" has been soft-deleted and replaced with "${newName}" by admin.`,
        deletedBy: isAdmin ? loggedInUser.username : "self",
        newUsername: newName,
      });
    } catch (error) {
      console.error("Error soft deleting user:", error);
      return response.status(500).json({ message: "Internal server error", error });
    }
  });
}

