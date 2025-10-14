// Endpoint som hämtar posts från databasen - http://localhost:3000/api/posts
export default function getPost(app, path, database) {
  app.get(`${path}/posts`, async (request, response) => {
    const [result] = await database.execute("SELECT * FROM post")
    return response.json(result)
  })
}