import { generateSalt, hashWithSalt } from '../encryption.js';
import { validatePasswordSimple } from "../passwordValidation.js"

export default function updateUser(app, path, database) {
  app.patch(`${path}/users/:id`, async (request, response) => {
    const user = request.session.user;
    const { id } = request.params;
    const { username, email, password } = request.body;

    if (!user) {
      return response.status(401).json({
        message: "You must be logged in to update a user."
      });
    }

    if (!id || isNaN(id)) {
      return response.status(400).json({
        message: "Valid user ID is required."
      });
    }

    if (user.id !== parseInt(id)) {
      return response.status(403).json({
        message: "You can only update your own profile."
      });
    }

    if (!username && !email && !password) {
      return response.status(400).json({
        message: "At least one field (username, email, or password) must be provided."
      });
    }

    try {
      const [users] = await database.execute(
        `SELECT id, isBlocked FROM user WHERE id = ?`,
        [id]
      );

      if (users.length === 0) {
        return response.status(404).json({
          message: "User not found."
        });
      }

      if (users[0].isBlocked === 1) {
        return response.status(403).json({
          message: "This user account is blocked."
        });
      }

      const updates = [];
      const values = [];

      if (username) {
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
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return response.status(400).json({
            message: "Invalid email format."
          });
        }

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
        // Validera lösenordsstyrka
        const passwordCheck = validatePasswordSimple(password)
        if (!passwordCheck.isValid) {
          return response.status(400).json({
            message: "Password does not meet requirements.",
            errors: passwordCheck.errors
          });
        }

        // Generera nytt salt vid lösenordsbyte
        const newSalt = generateSalt();
        const hashedPassword = hashWithSalt(password, newSalt);

        updates.push('password = ?');
        updates.push('salt = ?');
        values.push(hashedPassword);
        values.push(newSalt);
      }

      values.push(id);

      const query = `UPDATE user SET ${updates.join(', ')} WHERE id = ?`;
      await database.execute(query, values);

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