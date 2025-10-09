import { readFileSync } from "fs"

export default function login(app, acl, path, database) {

// access control list middleware
export default function acl(request, response, next) {

  const userRoles = ["*"]
  if (request.session?.user) {
    userRoles.push("user")
  } else {
    userRoles.push("anonymous")
  }

  for (const route of accessList) {
    // Match exact path or paths that start with the route (for /api/threads/1, /api/threads/2, etc.)
    const pathMatches = request.path === route.url || request.path.startsWith(route.url + '/')

    if (pathMatches) {
      for (const access of route.accesses) {
        // matching the intersection between two arrays
        if (userRoles.some(userRole => access.roles.includes(userRole))
          && access.methods.includes(request.method)) {
          // call next now that we have access rights
          return next()
        }
      }
    }

    const { username, password } = request.body

  return response.status(403).json({ message: "Access forbidden" })

      if (result.length === 0) {
        return response.status(401).json({
          message: "No user found! Wrong username or password."
        })
      }

      const user = result[0]

      request.session.user = {
        id: user.id,
        username: user.username
      }

      return response.status(200).json({
        message: `Welcome ${request.session.user.username}!`
      })

    } catch (error) {
      console.log(error)
      return response.status(500).json({
        message: "Server error."
      })
    }
  })

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