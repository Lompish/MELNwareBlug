export default function thread(app, path, database) {
  app.get(`${path}/threads`, async (request, response) => {
    return response.json([])
  })
}
