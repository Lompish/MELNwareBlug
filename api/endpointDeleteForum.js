export default function deleteForum(app, acl, path, database) {

  app.delete(`api/forums/:id`, async (request, response) => {
    const forumId = request.params.id;
    try {
      const [result] = await database.execute('DELETE FROM forum WHERE id = ?', [forumId]);
      if (result.affectedRows === 0) {
        return response.status(404).json({ message: 'Forum not found' });
      }
      return response.status(200).json({ message: 'Forum deleted successfully' });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ message: 'Server error' });
    }
  })
}