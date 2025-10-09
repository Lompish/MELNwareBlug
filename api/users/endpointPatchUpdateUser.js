export default function updateUser(app, path, database, hash) {
  // Update user by ID
  app.patch(`${path}/users/:id`, async (request, response) => {
    const user = request.session.user;
    const { id } = request.params;
    const { username, email, password } = request.body;

    // Check if user is logged in
    if (!user) {
      return response.status(401).json({
        message: "You must be logged in to update a user."
      });
    }

    // Validate ID parameter
    if (!id || isNaN(id)) {
      return response.status(400).json({
        message: "Valid user ID is required."
      });
    }

    // Check if user is updating their own profile
    if (user.id !== parseInt(id)) {
      return response.status(403).json({
        message: "You can only update your own profile."
      });
    }

    // Check if at least one field is provided
    if (!username && !email && !password) {
      return response.status(400).json({
        message: "At least one field (username, email, or password) must be provided."
      });
    }

    try {
      // Check if user exists
      const [users] = await database.execute(
        `SELECT id, isBlocked FROM user WHERE id = ?`,
        [id]
      );

      if (users.length === 0) {
        return response.status(404).json({
          message: "User not found."
        });
      }

      // Check if user is blocked
      if (users[0].isBlocked === 1) {
        return response.status(403).json({
          message: "This user account is blocked."
        });
      }

      // Build dynamic update query
      const updates = [];
      const values = [];

      if (username) {
        // Check if username already exists
        const [existingUsername] = await database.execute(
          `SELECT id FROM user WHERE username = ? AND id != ?`,
          [username, id]
        );
        if (existingUsername.length > 0) {
          return response.status(409).json({
            message: "Username already taken."
          });
        }
        updates.push('username = ?');
        values.push(username);
      }

      if (email) {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return response.status(400).json({
            message: "Invalid email format."
          });
        }

        // Check if email already exists
        const [existingEmail] = await database.execute(
          `SELECT id FROM user WHERE email = ? AND id != ?`,
          [email, id]
        );
        if (existingEmail.length > 0) {
          return response.status(409).json({
            message: "Email already in use."
          });
        }
        updates.push('email = ?');
        values.push(email);
      }

      if (password) {
        // Validate password length
        if (password.length < 6) {
          return response.status(400).json({
            message: "Password must be at least 6 characters long."
          });
        }
        // Hash password before storing
        const hashedPassword = hash(password);
        updates.push('password = ?');
        values.push(hashedPassword);
      }

      // Add user ID to values array
      values.push(id);

      // Execute update query
      const query = `UPDATE user SET ${updates.join(', ')} WHERE id = ?`;
      await database.execute(query, values);

      // Get updated user data
      const [updatedUser] = await database.execute(
        `SELECT id, username, email, isBlocked FROM user WHERE id = ?`,
        [id]
      );

      return response.status(200).json({
        message: "User updated successfully.",
        user: {
          id: updatedUser[0].id,
          username: updatedUser[0].username,
          email: updatedUser[0].email,
          isBlocked: updatedUser[0].isBlocked
        }
      });

    } catch (error) {
      console.log(error);
      return response.status(500).json({
        message: "Server error."
      });
    }
  });
}