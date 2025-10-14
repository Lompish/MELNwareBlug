export default function postForums(app, path, database) {

  // Endpoint: skapa ett nytt forum
  app.post(`${path}/forums`, async (request, response) => {
    try {
      const { forumName, forumDescription } = request.body;
      const user = request.session.user;

      // Kontrollera att användaren är inloggad
      if (!user) {
        return response.status(401).json({ message: "You must be logged in to create a forum." });
      }

      // Kontrollera att forum-namnet finns
      if (!forumName || forumName.trim() === "") {
        return response.status(400).json({ message: "Forum name is required." });
      }

      // Kontrollera om forum-namnet redan finns (case-insensitive)
      const [existing] = await database.execute(
        "SELECT id FROM forum WHERE LOWER(forumName) = LOWER(?)",
        [forumName.trim()]
      );

      if (existing.length > 0) {
        return response.status(409).json({
          message: "A forum with that name already exists. Please choose another name."
        });
      }

      // Skapa forumet
      const [result] = await database.execute(
        "INSERT INTO forum (forumName, forumDescription, creationDate) VALUES (?, ?, CURDATE())",
        [forumName, forumDescription || null]
      );

      const forumId = result.insertId;

      // Koppla skaparen till forumet i user_x_forum
      await database.execute(
        "INSERT INTO user_x_forum (userId, forumId, isCreator) VALUES (?, ?, 1)",
        [user.id, forumId]
      );

      // Skicka svar
      return response.status(201).json({
        message: "Forum created successfully.",
        forumId,
        forumName,
        forumDescription
      });

    } catch (error) {
      console.error("Error creating forum:", error);
      return response.status(500).json({ message: "Server error." });
    }
  });
}
