// inte riktigt hundra på att detta är rätt väg att göra
// koden ska kolla om användaren är blockerad eller inte
// vilket ska göra att användaren inte kan posta inlägg eller svar
// om användaren är blockerad ska ett felmeddelande skickas tillbaka

// EJ TESTAT I POSTMAN ÄNNU

export function checkIfBlocked(app, path, database) {

  app.get(`${path}/api/users/check-blocked`, async (req, res) => {
    try {
      const forumId = req.params.id;
      const user = req.user;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized: You must be logged in.' });
      }

      // Hämta status från databasen
      const [users] = await database.execute('SELECT isBlocked FROM user WHERE id = ?', [user.id]);
      if (users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const isBlocked = !!users[0].isBlocked;

      if (isBlocked) {
        return res.status(403).json({
          error: 'Your account is blocked. You cannot perform this action.',
          userId: user.id,
          forumId,
          isBlocked,
        });
      }

      // Om användaren INTE är blockerad
      return res.status(200).json({
        message: 'User is active and not blocked.',
        userId: user.id,
        forumId,
        isBlocked,
      });

    } catch (error) {
      console.error('Error checking blocked user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
}
