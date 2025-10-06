export default function forum(app, acl, path, database) {

  // En endpoint som hämtar data från forums-tabellen i databasen - gå till http://localhost:3000/api/forums
  app.get("/api/forums", async (request, response) => {
    const [result] = await database.execute("SELECT * FROM forum")
    return response.json(result)
  })

  // En endpoint lägger till en ny forum i forums-tabellen - I Postman, POST - http://localhost:3000/api/forums
  app.post("/api/forums", async (request, response) => {
    const { forumName, forumDescription, creationDate } = request.body
    try {
      const [result] = await database.execute("INSERT INTO forum (forumName, forumDescription, creationDate) VALUES (?, ?, NOW())",
        [forumName, forumDescription, creationDate])

      return response.status(201).json(result)
    } catch (error) {
      return response.status(409).json({ message: "Server error." })
    }
  })

  /*
    // En endpoint som tar bort en forum från forums-tabellen - I Postman, DELETE - http://localhost:3000/api/forums/:id
    app.delete(`${path}/forums/:id`, async (request, response) => {
      const forumId = request.params.id
      if 
      try {
        const [result] = await database.execute("DELETE FROM forums WHERE id = ?", [forumId])
        if (result.affectedRows === 0) {
          return response.status(404).json({ message: "Forum not found." })
        }
        return response.status(200).json({ message: "Forum deleted successfully." })
      } catch (error) {
        return response.status(500).json({ message: "Server error." })
      }
    })
  */
}

