// Funktion för att skapa "slug" från namn
function createSlug(name) {
  return name
    .trim()                   // ta bort mellanslag i början/slutet
    .toLowerCase()
    .replace(/å/g, "a")
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, '-') // ersätt resten med bindestreck
    .replace(/(^-|-$)/g, '');
}

// Hjälpfunktion: hämta forum från DB och generera slug
async function fetchForumsWithSlug(database) {
  const [forums] = await database.execute("SELECT id, forumName, isBlocked FROM forum");
  return forums.map(f => ({ ...f, name: f.forumName, slug: createSlug(f.forumName) }));
}

export default function forum(app, path, database) {

  // Forum via slug
  app.get(`${path}/forums/by-slug/:slug`, async (req, res) => {
    const { slug } = req.params;
    try {
      const forums = await fetchForumsWithSlug(database);
      const forum = forums.find(f => f.slug === slug.toLowerCase());
      if (!forum) return res.status(404).json({ error: "Forum hittades inte" });
      res.json(forum);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Serverfel" });
    }
  });

  // Forum via namn
  app.get(`${path}/forums/by-name/:name`, async (req, res) => {
    const { name } = req.params;
    try {
      const forums = await fetchForumsWithSlug(database);
      const forum = forums.find(f => f.name.toLowerCase() === name.toLowerCase());
      if (!forum) return res.status(404).json({ error: "Forum hittades inte" });
      res.json(forum);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Serverfel" });
    }
  });

}