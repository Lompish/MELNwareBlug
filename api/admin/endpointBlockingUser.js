// i den här koden ska vi skapa en endpoint för att blockera en användare
// endast en admin ska kunna blockera en user
// forum och trådar ska inte påverkas

// EJ TESTAT I POSTMAN ÄNNU

export function blockUserEndpoint(app, path, database) {
  app.patch(`${path}/api/admin/block-user`, async (req, res) => {
    const forumId = req.params.id;
    const admin = req.admin;

    if (!admin) {
      return res.status(401).json({ error: 'Unauthorized: Admin only' });
    }

    const { userId, block } = req.body;

    if (typeof userId !== 'number' || typeof block !== 'boolean') {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    try {
      // Kontrollera att användaren finns i databasen
      const [users] = await database.execute('SELECT * FROM user WHERE id = ?', [userId]);
      if (users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Uppdatera blockstatus för användaren
      await database.execute('UPDATE user SET isBlocked = ? WHERE id = ?', [block, userId]);

      // Skicka svar till klienten
      const action = block ? 'blocked' : 'unblocked';
      return res.status(200).json({
        message: `User ${userId} has been ${action} by admin ${admin.adminName || admin.id}`,
        forumId,
      });
    } catch (error) {
      console.error('Error blocking user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
}
