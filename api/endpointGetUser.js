export default function getUser(app, acl, path, database) {
//GET USERS
app.get(`${path}/users`, async (request, response) => {
  try {
    const [users] = await database.execute(
      "SELECT username FROM user"
    )

    return response.status(200).json({
      users: users
    })
  } catch (error) {
    console.error(error)
    return response.status(500).json({
      message: "Server error."
    })
  }
})
}