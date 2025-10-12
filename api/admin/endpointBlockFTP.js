// Endpoint där admin kan blockera ett forum och alla dess trådar och inlägg
// som gör att forumet, trådarna och inläggen inte längre är synliga för vanliga användare
// och det inte ska kunna gå att interagera med dem
// admin kan fortfarande se dem och interagera med dem

// EJ TESTAD I POSTMAN

export function endpointBlockFTP(app, path, database) {
  app.patch(`${path}/admin/blockFTP/:id`, async (request, response) => {
    try {
      const admin = request.session.admin;

      // Kontrollera den som är inloggad är admin
      if (!admin) {
        return response.status(403).json({ message: "Admin access required." });
      }

      const forumId = parseInt(request.params.id);

      if (isNaN(forumId)) {
        return response.status(400).json({ message: "Invalid forum ID." });
      }

      // Kontrollera att forumet finns 
      const [forums] = await database.execute("SELECT * FROM forum WHERE id = ?", [forumId]);
      if (forums.length === 0) {
        return response.status(404).json({ message: "Forum not found." });
      }

      // uppdaterar så att databasen sätter isBlocked till TRUE för forumet
      await database.execute("UPDATE forum SET isBlocked = TRUE WHERE id = ?", [forumId]);

      // uppdaterar så att databasen sätter isBlocked till TRUE för forumets alla trådar
      await database.execute("UPDATE thread SET isBlocked = TRUE WHERE forumId = ?", [forumId]);

      // Hämta alla trådar för att blockera deras inlägg
      const [threads] = await database.execute("SELECT id FROM thread WHERE forumId = ?", [forumId]);
      const threadIds = threads.map((t) => t.id);

      if (threadIds.length > 0) {
        await database.execute(
          `UPDATE post SET isBlocked = TRUE WHERE threadId IN (${threadIds.map(() => "?").join(",")})`,
          threadIds
        );
      }

      return response.status(200).json({
        message: `Forum (ID: ${forumId}) and all related threads and posts have been blocked by admin ${admin.username || admin.id
          }.`,
      });
    } catch (error) {
      console.error("Error blocking forum and related content:", error);
      return response.status(500).json({ message: "Internal server error", error });
    }
  });
}
