// api/acl.js
import { readFileSync } from "fs"

const accessList = JSON.parse(
  readFileSync(new URL("./access-list.json", import.meta.url))
)

console.log("ACL: Loaded", accessList.length, "routes from access-list.json");

function routeToRegex(route) {
  const escapedRoute = route.replace(/[.+?^${}()|[\]\\]/g, '\\$&')
  const pattern = escapedRoute.replace(/:[\w]+/g, '([^/]+)')
  return new RegExp(`^${pattern}$`)
}

function pathMatchesRoute(requestPath, routePattern) {
  if (requestPath === routePattern) {
    return true
  }

  if (routePattern.includes(':')) {
    const regex = routeToRegex(routePattern)
    return regex.test(requestPath)
  }

  return false
}

export default function acl(request, response, next) {
  console.log("\nACL CHECK");
  console.log("Method:", request.method);
  console.log("Path:", request.path);

  const pathWithoutApi = request.path.replace(/^\/api/, '')

  const userRoles = ["*"]

  if (request.session?.admin) {
    userRoles.push("admin")
    console.log("Admin logged in:", request.session.admin.id, request.session.admin.adminName)
  } else if (request.session?.user) {
    userRoles.push("user")
    console.log("User logged in:", request.session.user.id, request.session.user.email)
  } else {
    userRoles.push("anonymous")
    console.log("No user/admin in session")
  }

  console.log("User roles:", userRoles);

  for (const route of accessList) {
    if (pathMatchesRoute(pathWithoutApi, route.url)) {
      console.log("Route matched:", route.url);

      for (const access of route.accesses) {
        const hasRole = userRoles.some(userRole => access.roles.includes(userRole))
        const hasMethod = access.methods.includes(request.method)

        console.log("  Has role?", hasRole, "| Has method?", hasMethod);

        if (hasRole && hasMethod) {
          console.log("ACCESS GRANTED\n");
          return next()
        }
      }

      console.log("ACCESS DENIED\n");
      return response.status(403).json({
        message: "Access forbidden. You don't have permission to perform this action."
      })
    }
  }

  console.log("No matching route found in ACL\n");
  return response.status(403).json({
    message: "Access forbidden. Route not found in access control list."
  })
}