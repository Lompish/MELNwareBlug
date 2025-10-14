// den här koden gör en "soft delete" av en användare i users-tabellen i databasen
// både admin och användaren själv kan radera kontot i den här koden
// användarens forum, inlägg eller trådar påverkas, men endast att användarnamnet visas som "Deleted User ##"


export default function softDeleteUserByUorA(app, path, database) {
  app.patch(`${path}/users/softdelete/:id`, async (request, response) => {
    const userIdToDelete = parseInt(request.params.id);

    // Kolla sessionen — olika projekt sparar user-info olika
    const loggedInUser = request.session?.user || request.session?.loggedInUser || request.user;

    // Lägg till temporär fake admin för testning
    const fakeAdmin = { id: 999, username: "FakeAdminTester", role: "admin" };

    // Om ingen användare är inloggad → neka åtkomst
    if (!loggedInUser) {
      return response.status(401).json({ message: "Unauthorized: You must be logged in." });
    }

    // Kontrollera roller
    const isSelf = loggedInUser.id === userIdToDelete;
    const isAdmin =
      loggedInUser.role === "admin" ||
      loggedInUser.id === fakeAdmin.id ||
      loggedInUser.username === fakeAdmin.username;

    if (!isAdmin && !isSelf) {
      return response.status(403).json({
        message: "Forbidden: You can only delete your own account unless you are an admin.",
      });
    }

    try {
      // Kolla att användaren finns
      const [users] = await database.execute("SELECT * FROM user WHERE id = ?", [userIdToDelete]);
      if (users.length === 0) {
        return response.status(404).json({ message: "User not found" });
      }

      const user = users[0];

      // Generera nytt unikt DeletedUser-namn
      const [deletedCountResult] = await database.execute(
        'SELECT COUNT(*) AS count FROM user WHERE username LIKE "DeletedUser%"'
      );
      const deletedNumber = (deletedCountResult[0].count || 0) + 1;
      const newName = `DeletedUser#${deletedNumber}`;

      // Utför soft delete  
      await database.execute(
        `
        UPDATE user 
        SET username = ?, isBlocked = TRUE 
        WHERE id = ?
        `,
        [newName, userIdToDelete]
      );

      // Svar till klient med info om vad som hände
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
