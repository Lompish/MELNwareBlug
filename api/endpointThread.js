export default function thread(app, acl, path, database) {
  app.get(`${path}/threads`, async (request, response) => {
    return response.json([])
  })
}