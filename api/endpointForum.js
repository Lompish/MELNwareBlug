export default function forum(app, acl, path, database) {
  app.get(`${path}/forums`, async (request, response) => {
    const [result] = await database.execute("SELECT * FROM forums")
    return response.json(result)
  })
}

