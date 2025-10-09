export default function postForums(app, path, database) {

  // En endpoint lägger till en ny forum i forums-tabellen - I Postman, POST
  app.post("/api/forums", async (request, response) => {
    const { forumName, forumDescription, creationDate } = request.body
    try {
      const [result] = await database.execute(
        "INSERT INTO forum (forumName, forumDescription, creationDate) VALUES (?, ?, CURDATE())",
        [forumName, forumDescription]
      )
      return response.status(201).json(result)
    } catch (error) {
      return response.status(409).json({ message: "Server error." })
    }
  })
}