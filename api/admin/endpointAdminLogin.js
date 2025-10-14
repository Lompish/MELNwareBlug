export default function adminLogin(app, path, database) {
  // Admin login
  app.post(`${path}/admin/login`, async (request, response) => {
    // Kontrollera om någon redan är inloggad
    if (request.session.admin) {
      return response.status(400).json({
        message: "Someone is already logged in."
      });
    }

    const { adminName, password } = request.body;

    // Validera att båda fälten finns
    if (!adminName || !password) {
      return response.status(400).json({
        message: "Admin name and password are required."
      });
    }

    try {
      // Hämta admin från databasen utan hash
      const [result] = await database.execute(
        "SELECT * FROM admin WHERE adminName = ? AND password = ?",
        [adminName, password]
      );

      if (result.length === 0) {
        return response.status(401).json({
          message: "No admin found! Wrong admin name or password."
        });
      }

      const admin = result[0];

      // Spara inloggad admin i sessionen
      request.session.admin = {
        id: admin.id,
        adminName: admin.adminName
      };

      return response.status(200).json({
        message: `Welcome ${request.session.admin.adminName}!`
      });

    } catch (error) {
      console.log(error);
      return response.status(500).json({
        message: "Server error."
      });
    }
  });
}
