export default function logout(app, path, database) {

  // Logga ut 
  app.delete(`${path}/login`, async (request, response) => {
    if (!request.session.user) {
      return response.status(401).json({
        message: "No one is logged in."
      })
    }

    request.session.destroy((err) => {
      if (err) {
        console.log(err)
        return response.status(500).json({
          message: "Something went wrong while logging out."
        })
      }

      return response.status(200).json({
        message: "You have logged out."
      })
    })
  })
}