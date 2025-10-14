import { generateSalt, hashWithSalt } from "../encryption.js"
import { validatePasswordSimple, validateUsername } from "../passwordUsernameValidation.js"

export default function postUser(app, path, database) {
  // Lägg till en ny användare (user registration)
  app.post(`${path}/users`, async (request, response) => {
    const { username, password, email } = request.body

    // Validering
    if (!username || !password || !email) {
      return response.status(400).json({
        message: "Username, password, and email are required."
      })
    }

    // Validera användarnamn
    const usernameCheck = validateUsername(username)
    if (!usernameCheck.isValid) {
      return response.status(400).json({
        message: "Username does not meet requirements.",
        errors: usernameCheck.errors
      })
    }

    // Validera lösenordsstyrka
    const passwordCheck = validatePasswordSimple(password)
    if (!passwordCheck.isValid) {
      return response.status(400).json({
        message: "Password does not meet requirements.",
        errors: passwordCheck.errors
      })
    }

    // Validera email-format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return response.status(400).json({
        message: "Invalid email format."
      })
    }

    try {
      // Kolla om username eller email redan finns (case-insensitive för username)
      const [existingUsers] = await database.execute(
        `SELECT id FROM user WHERE LOWER(username) = LOWER(?) OR email = ?`,
        [username, email]
      )

      if (existingUsers.length > 0) {
        return response.status(409).json({
          message: "Username or email already exists."
        })
      }

      // Generera unikt salt för denna användare
      const userSalt = generateSalt()

      // Hash lösenordet med användarens unika salt
      const hashedPassword = hashWithSalt(password, userSalt)

      // Spara användare MED salt
      const [result] = await database.execute(
        "INSERT INTO user (username, password, salt, email, isBlocked) VALUES (?, ?, ?, ?, 0)",
        [username, hashedPassword, userSalt, email]
      )

      return response.status(201).json({
        message: "User created successfully.",
        userId: result.insertId
      })
    } catch (error) {
      console.log(error)

      // Hantera duplicate username eller email
      if (error.code === 'ER_DUP_ENTRY') {
        return response.status(409).json({
          message: "Username or email already exists."
        })
      }

      return response.status(500).json({
        message: "Server error."
      })
    }
  })
}