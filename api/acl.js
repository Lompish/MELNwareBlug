//import {readFileSync} from "fs"

//const accessList = JSON.parse(
//  readFileSync(new URL("./access-list.json", import.meta.url))
//)

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

  }
  console.log("ACL check:", request.method, request.path, userRoles)

  return response.status(403).json({ message: "Access forbidden" })

}