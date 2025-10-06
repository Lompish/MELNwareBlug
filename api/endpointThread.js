export default function thread(app, acl, path, database) {
  app.get(`${path}/threads`, async (request, response) => {
    const [result] = await database.execute("SELECT * FROM thread")
    return response.json(result)
  })
}