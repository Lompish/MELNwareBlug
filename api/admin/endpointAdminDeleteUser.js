// Den här koden gör en "soft delete" av en användare i user-tabellen i databasen
// Endast (fejk)admin kan radera konton i denna version
// Användarens forum, trådar och inlägg påverkas inte – endast användarnamnet ändras till "DeletedUser_timestamp"

export default function softDeleteUserByAdmin(app, path, database) {
  app.patch(`${path}/admin/softdelete/:id`, async (request, response) => {
    const userIdToDelete = parseInt(request.params.id);

    // Fejkadmin för testning (ingen riktig inloggning krävs)
    const fakeAdmin = { id: 1, username: "admin tester", role: "admin" };

    // Kontrollera att admin finns (den är alltid satt här)
    if (!fakeAdmin || fakeAdmin.role !== "admin") {
      return response.status(403).json({
        message: "Forbidden: Only admins can perform this action."
      });
    }

    if (isNaN(userIdToDelete)) {
      return response.status(400).json({
        message: "Invalid user ID."
      });
    }

    try {
      // Kontrollera att användaren som ska tas bort finns
      const [users] = await database.execute(
        "SELECT * FROM user WHERE id = ?",
        [userIdToDelete]
      );

      if (users.length === 0) {
        return response.status(404).json({
          message: "User not found."
        });
      }

      const user = users[0];

      // Skapa nytt unikt namn med timestamp - garanterat unikt!
      const newName = `DeletedUser_${Date.now()}`;

      // Utför soft delete i databasen
      await database.execute(
        `UPDATE user 
         SET username = ?, isBlocked = TRUE 
         WHERE id = ?`,
        [newName, userIdToDelete]
      );

      // Svar till klient om lyckad radering
      return response.status(200).json({
        message: `User "${user.username}" has been soft-deleted and replaced with "${newName}" by admin.`,
        deletedBy: fakeAdmin.username,
        newUsername: newName,
      });

    } catch (error) {
      console.error("Error soft deleting user:", error);
      return response.status(500).json({
        message: "Internal server error",
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  });
}