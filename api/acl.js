import hash from "./encryption.js"

export default function login(app, acl, path, database) {

  // Kollar om någon är inloggad
  app.get(`${path}/login`, async (request, response) => {
    if (request.session.user) {
      return response.status(200).json({
        username: request.session.user.username
      })
    } else {
      return response.status(200).json({
        message: "No one is logged in."
      })
    }
  })

  // Logga in
  app.post(`${path}/login`, async (request, response) => {
    if (request.session.user) {
      return response.status(400).json({
        message: "Someone is already logged in."
      })
    }

    const { username, password } = request.body

    try {
      const [result] = await database.execute(
        "SELECT * FROM user WHERE username = ? AND password = ?",
        [username, hash(password)]
      )

      if (result.length === 0) {
        return response.status(401).json({
          message: "No user found! Wrong username or password."
        })
      }

      const user = result[0]

      request.session.user = {
        id: user.id,
        username: user.username
      }

      return response.status(200).json({
        message: `Welcome ${request.session.user.username}!`
      })

    } catch (error) {
      console.log(error)
      return response.status(500).json({
        message: "Server error."
      })
    }
  })

  // Logga ut 
  app.delete(`${path}/login`, async (request, response) => {
    if (!request.session.user) {
      return response.status(401).json({
        message: "No one is logged in."
      })
    }

    request.session.destroy((err) => {
      if (err) {
        console.log(err)
        return response.status(500).json({
          message: "Something went wrong while logging out."
        })
      }

      return response.status(200).json({
        message: "You have logged out."
      })
    })
  })
}