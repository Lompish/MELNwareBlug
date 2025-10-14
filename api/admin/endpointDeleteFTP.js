// den här delen är för admin att kunna ta bort forum, trådar och inlägg
// detta är en HARD DELETE, allt raderas permanent

// TESTAD I POSTMAN OCH FUNGERAR
// men saknar autentisering och sessionshantering då admin inte kan logga in just nu

export default function endpointDeleteFTP(app, path, database) {
  app.delete(`${path}/admin/deleteFTP/:id`, async (request, response) => {
    try {
      const admin = { id: 1, username: "admin" }; // Temporär hårdkodad admin för testning
      // const admin = request.session.admin;

      // Endast admin får ta bort forum, därav kontroll på att admin är inloggad
      if (!admin) {
        return response.status(403).json({ message: "Admin access required." });
      }

      const forumId = parseInt(request.params.id);

      if (isNaN(forumId)) {
        return response.status(400).json({ message: "Invalid forum ID." });
      }

      // Vi kontrollerar att forumet finns
      const [forums] = await database.execute("SELECT * FROM forum WHERE id = ?", [forumId]);
      if (forums.length === 0) {
        return response.status(404).json({ message: "Forum not found." });
      }

      // Därefter hämtar vi alla trådar som tillhör forumet
      const [threads] = await database.execute("SELECT id FROM thread WHERE forumId = ?", [forumId]);
      const threadIds = threads.map((t) => t.id);

      // Ta bort alla inlägg som tillhör dessa trådar
      if (threadIds.length > 0) {
        await database.execute(`DELETE FROM post WHERE threadId IN (${threadIds.map(() => "?").join(",")})`, threadIds);
      }
      // Ta bort alla moderatorer kopplade till dessa trådar
      if (threadIds.length > 0) {
        await database.execute(
          `DELETE FROM threadModerator WHERE threadId IN (${threadIds.map(() => "?").join(",")})`,
          threadIds
        );
      }

      // Ta bort alla trådar som tillhör forumet
      await database.execute("DELETE FROM thread WHERE forumId = ?", [forumId]);

      // Ta bort alla användare kopplade till forumet
      await database.execute("DELETE FROM user_x_forum WHERE forumId = ?", [forumId]);

      // Ta bort forumet
      await database.execute("DELETE FROM forum WHERE id = ?", [forumId]);

      // Bekräftelse på att allt är borttaget
      return response.status(200).json({
        message: `Forum (ID: ${forumId}) and all related threads and posts have been deleted by admin ${admin.username || admin.id}.`,
      });
    } catch (error) {
      console.error("Error deleting forum and related content:", error);
      return response.status(500).json({ message: "Internal server error", error });
    }
  });
}
