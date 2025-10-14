export default function patchForum(app, path, database) {

  app.patch(`${path}/forums/:id`, async (request, response) => {
    const forumId = request.params.id;
    const { forumName, forumDescription } = request.body;

    // Validering - minst ett fält måste finnas
    if (!forumName && !forumDescription) {
      return response.status(400).json({
        message: 'At least one field (forumName or forumDescription) must be provided'
      });
    }

    try {
      // Kontrollera om forumet finns
      const [existingForum] = await database.execute(
        'SELECT * FROM forum WHERE id = ?',
        [forumId]
      );

      if (existingForum.length === 0) {
        return response.status(404).json({
          message: 'Forum not found'
        });
      }

      // Bygg dynamisk SQL-query baserat på vad som skickas
      let updateFields = [];
      let values = [];

      if (forumName) {
        updateFields.push('forumName = ?');
        values.push(forumName);
      }

      if (forumDescription) {
        updateFields.push('forumDescription = ?');
        values.push(forumDescription);
      }

      // Lägg till ID sist i values array
      values.push(forumId);

      // Kör UPDATE query
      const query = `UPDATE forum SET ${updateFields.join(', ')} WHERE id = ?`;
      const [result] = await database.execute(query, values);

      if (result.affectedRows === 0) {
        return response.status(500).json({
          message: 'Failed to update forum'
        });
      }

      // Hämta det uppdaterade forumet
      const [updatedForum] = await database.execute(
        'SELECT * FROM forum WHERE id = ?',
        [forumId]
      );

      return response.status(200).json({
        message: 'Forum updated successfully',
        forum: updatedForum[0]
      });

    } catch (error) {
      console.error(error);

      // Hantera duplicate entry error (om forumName måste vara unikt)
      if (error.code === 'ER_DUP_ENTRY') {
        return response.status(409).json({
          message: 'Forum name already exists'
        });
      }

      return response.status(500).json({
        message: 'Server error'
      });
    }
  });
}