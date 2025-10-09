// Funktion för att skapa "slug" från namn
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/å/g, "a")
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, '-') // resten blir bindestreck
    .replace(/(^-|-$)/g, '');
}


export default function forumSlug(app, path, database) {
  // Statisk forumlista (senare kan man hämta från DB)
  const forums = [
    { id: 1, name: "Sport", amount_of_threads: 2 },
    { id: 2, name: "Spel", amount_of_threads: 4 },
    { id: 3, name: "Musik", amount_of_threads: 2 },
    { id: 4, name: "Sport & träning", amount_of_threads: 1 }
  ];

  // Generera slugs
  forums.forEach(f => f.slug = createSlug(f.name));


  // Alla forum
  app.get(`${path}/forums`, (req, res) => res.json(forums));

  // By-slug (specifik route först)
  app.get(`${path}/forums/by-slug/:slug`, (req, res) => {
    const { slug } = req.params;
    const forum = forums.find(f => f.slug === slug.toLowerCase());
    if (!forum) return res.status(404).json({ error: "Forum hittades inte" });
    res.json(forum);
  });

  // By-name
  app.get(`${path}/forums/by-name/:name`, (req, res) => {
    const { name } = req.params;
    const forum = forums.find(f => f.name.toLowerCase() === name.toLowerCase());
    if (!forum) return res.status(404).json({ error: "Forum hittades inte" });
    res.json(forum);
  });


  app.get(`${path}/forums/:id`, (req, res) => {
    const id = parseInt(req.params.id);
    const forum = forums.find(f => f.id === id);
    if (!forum) return res.status(404).json({ error: "Forum hittades inte" });
    res.json(forum);
  });
}
