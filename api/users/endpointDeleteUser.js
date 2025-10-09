export default function deleteUser(app, path, database) {

  app.delete(`${path}/users/:id`, async (request, response) => {
    const userId = request.params.id;
    const admin = request.user && request.user.role === 'admin';
    if (!admin) {
      return response.status(403).json({ message: 'Forbidden: Admins only' });
    }
    try {
      const [result] = await database.execute('DELETE FROM users WHERE id = ?', [userId]);
      if (result.affectedRows === 0) {
        return response.status(404).json({ message: 'User not found' });
      }
      return response.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ message: 'Server error' });
    }
  })
}

// ta bort trådar av användaren?
// ta bort inlägg av användaren?
// eller göra en soft delete (sätta active = false)
// och ersätta namn och email med anonym1234, anonym1235 etc?