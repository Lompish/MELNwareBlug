import hash from "./encryption.js"

export default function user(app, acl, path, database) {
  // Lägg till en ny användare (user registration)
  app.post(`${path}/users`, async (request, response) => {
    const { username, password, email } = request.body

    // Validering
    if (!username || !password || !email) {
      return response.status(400).json({
        message: "Username, password, and email are required."
      })
    }


    try {
      const [result] = await database.execute(
        "INSERT INTO user (username, password, email) VALUES (?, ?, ?)",
        [username, hash(password), email]
      )

      return response.status(201).json({
        message: "User created successfully.",
        userId: result.insertId
      })
    } catch (error) {
      console.log(error)

      // Hantera duplicate username
      if (error.code === 'ER_DUP_ENTRY') {
        return response.status(409).json({
          message: "Username already exists."
        })
      }

      return response.status(500).json({
        message: "Server error."
      })
    }
  })
}