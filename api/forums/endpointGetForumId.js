export default function forumId(app, path, database) {
  // Hämta forum med id
  app.get(`${path}/forums/by-id/:id`, async (request, response) => {
    const forumId = request.params.id;

    // const [result] = await database.execute("SELECT * FROM products")
    // return response.json(result)

    try {
      const [forum] = await database.execute(
        "SELECT * FROM forum WHERE id = ?",
        [forumId]
      );

      if (forum.length === 0) {
        return response.status(404).json({
          message: "Forum not found."
        });
      }

      return response.status(200).json(forum[0]);

    } catch (error) {
      console.error(error);
      return response.status(500).json({
        message: "Server error."
      });
    }
  });
}

