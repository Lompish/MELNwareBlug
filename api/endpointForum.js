export default function forum(app, acl, path, database) {

  app.get(`${path}/forums`, async (request, response) => {
    return response.json([
      {
        "id": 1,
        "name": "Sport",
        "amount_of_threads": 2
      },
      {
        "id": 2,
        "name": "Spel",
        "amount_of_threads": 4
      },
      {
        "id": 3,
        "name": "Musik",
        "amount_of_threads": 2
      }
    ])
  })


}