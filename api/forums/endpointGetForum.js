export default function forum(app, acl, path, database) {

  // En endpoint som hämtar data från forums-tabellen i databasen - gå till http://localhost:3000/api/forums
  app.get("/api/forums", async (request, response) => {
    const [result] = await database.execute("SELECT * FROM forum")
    return response.json(result)
  })
}

