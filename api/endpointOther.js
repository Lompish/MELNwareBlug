export default function other(app, acl, path, database) {

  // En endpoint som hämtar data från product-tabellen i databasen - gå till http://localhost:3000/products
  app.get("/api/products", async (request, response) => {
    const [result] = await database.execute("SELECT * FROM products")
    return response.json(result)
  })

  // En endpoint lägger till en ny produkt i product-tabellen - I Postman, POST - http://localhost:3000/products
  app.post("/api/products", async (request, response) => {
    const { name, price } = request.body

    try {
      const [result] = await database.execute("INSERT INTO products (name, price) VALUES (?, ?)",
        [name, price])

      return response.status(201).json(result)
    } catch (error) {
      return response.status(409).json({ message: "Server error." })
    }
  })

}