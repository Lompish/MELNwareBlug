// api/acl.js
// Access Control List - Kontrollerar vem som får göra vad

import { readFileSync } from "fs"

// Läs in access-list från JSON-fil
const accessList = JSON.parse(
  readFileSync(new URL("./access-list.json", import.meta.url))
)
// DEBUG: Logga vilka routes som laddas
console.log("ACL: Loaded", accessList.length, "routes from access-list.json");
console.log("First route:", accessList[0].url);

// Konverterar en route pattern som "/api/users/:id" till ett regex
// som matchar faktiska paths som "/api/users/123"
function routeToRegex(route) {
  // Escape special regex characters utom :
  const escapedRoute = route.replace(/[.+?^${}()|[\]\\]/g, '\\$&')

  // Ersätt :param med ett regex som matchar siffror eller strängar
  const pattern = escapedRoute.replace(/:[\w]+/g, '([^/]+)')

  // Se till att det är en exakt match (start till slut)
  return new RegExp(`^${pattern}$`)
}

// Kontrollerar om en request path matchar ett route pattern
function pathMatchesRoute(requestPath, routePattern) {
  // Först testa exakt match
  if (requestPath === routePattern) {
    return true
  }

  // Om route har parametrar, använd regex matching
  if (routePattern.includes(':')) {
    const regex = routeToRegex(routePattern)
    return regex.test(requestPath)
  }

  return false
}

// Access Control List (ACL) Middleware
// Kontrollerar om den nuvarande användaren har behörighet att komma åt den begärda routen
export default function acl(request, response, next) {
  console.log(" ACL Check:", request.method, request.path);
  // Bestäm användarroller
  const userRoles = ["*"] // Alla har wildcard-rollen

  if (request.session?.user) {
    userRoles.push("user") // Inloggade användare får "user"-roll
  } else {
    userRoles.push("anonymous") // Ej inloggade användare får "anonymous"-roll
  }

  // Hitta matchande route i access list
  for (const route of accessList) {
    if (pathMatchesRoute(request.path, route.url)) {
      // Kontrollera varje access-regel för denna route
      for (const access of route.accesses) {
        // Kontrollera om användaren har någon av de krävda rollerna OCH rätt metod
        const hasRole = userRoles.some(userRole => access.roles.includes(userRole))
        const hasMethod = access.methods.includes(request.method)

        if (hasRole && hasMethod) {
          // Åtkomst beviljad! Fortsätt till nästa middleware/endpoint
          return next()
        }
      }

      // Route matchade men ingen åtkomst beviljades
      return response.status(403).json({
        message: "Access forbidden. You don't have permission to perform this action."
      })
    }
  }

  // Ingen matchande route hittades i access list - neka som standard för säkerhet
  return response.status(403).json({
    message: "Access forbidden. Route not found in access control list."
  })
}