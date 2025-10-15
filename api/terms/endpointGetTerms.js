// Hämta aktuella terms
export default function getTerms(app, path, database) {

  // Hämta endast den aktiva Terms & Conditions-texten
  app.get(`${path}/terms`, async (request, response) => {
    try {
      const [activeTerms] = await database.execute(`
        SELECT termsContent, version, fromDate
        FROM terms
        WHERE isActive = 1
        LIMIT 1
      `);

      if (activeTerms.length === 0) {
        return response.status(404).json({
          message: "No active Terms & Conditions found."
        });
      }

      // Returnera endast texten som string
      return response.status(200).json({
        termsContent: activeTerms[0].termsContent
      });

    } catch (error) {
      console.error("Error fetching active Terms & Conditions:", error);
      return response.status(500).json({
        message: "Server error while fetching active Terms & Conditions."
      });
    }
  });
}
