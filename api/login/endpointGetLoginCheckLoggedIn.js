export default function checkLoggedIn(app, path, database) {

  // Kollar om någon är inloggad
  app.get(`${path}/login`, async (request, response) => {
    if (request.session.user) {
      return response.status(200).json({
        username: request.session.user.username
      })
    } else {
      return response.status(200).json({
        message: "No one is logged in."
      })
    }
  })
}