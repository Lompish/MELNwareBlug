export default function adminLogout(app, path, database) {
  app.delete(`${path}/admin/logout`, async (req, res) => {
    if (!req.session.admin) {
      return res.status(401).json({ message: "No admin is logged in." });
    }

    req.session.destroy((err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Something went wrong while logging out." });
      }

      return res.status(200).json({ message: "Admin has logged out." });
    });
  });
}

