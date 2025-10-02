import hash from "./encryption.js"

export default function user(app, acl, path, database) {
  // Lägg till en ny användare (user registration)
  app.post(`${path}/users`, async (request, response) => {
    const { username, password } = request.body

    // Validering
    if (!username || !password) {
      return response.status(400).json({
        message: "Username and password are required."
      })
    }

    try {
      const [result] = await database.execute(
        "INSERT INTO users (name, password, role) VALUES (?, ?, ?)",
        [username, hash(password), 'user']
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