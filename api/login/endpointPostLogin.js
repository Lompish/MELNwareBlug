import { hashWithSalt } from "../encryption.js"
import hash from "../encryption.js" // Fallback för gamla användare utan salt

export default function login(app, path, database) {

  // Logga in
  app.post(`${path}/login`, async (request, response) => {
    if (request.session.user) {
      return response.status(400).json({
        message: "Someone is already logged in."
      })
    }

    const { username, password } = request.body

    // Validering
    if (!username || !password) {
      return response.status(400).json({
        message: "Username and password are required."
      })
    }

    try {
      // Hämta användare MED salt
      const [result] = await database.execute(
        "SELECT id, username, email, password, salt, isBlocked FROM user WHERE username = ?",
        [username]
      )

      if (result.length === 0) {
        return response.status(401).json({
          message: "No user found! Wrong username or password."
        })
      }

      const user = result[0]

      // Kolla om användaren är blockerad
      if (user.isBlocked === 1) {
        return response.status(403).json({
          message: "This account is blocked."
        })
      }

      let hashedPassword

      // Backwards compatibility: Om användaren inte har salt (gammal användare)
      if (!user.salt) {
        hashedPassword = hash(password) // Gammal metod
      } else {
        hashedPassword = hashWithSalt(password, user.salt) // Ny metod med salt
      }

      // Jämför lösenord
      if (hashedPassword !== user.password) {
        return response.status(401).json({
          message: "No user found! Wrong username or password."
        })
      }

      // Spara användare i session
      request.session.user = {
        id: user.id,
        username: user.username,
        email: user.email
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
}