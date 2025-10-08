import { readFileSync } from "fs";
import { match } from "path-to-regexp";

// Ladda in access-listan från JSON
const accessList = JSON.parse(
  readFileSync(new URL("./access-list.json", import.meta.url))
);

// ACL middleware
export default function acl(request, response, next) {
  const userRoles = ["*"]; // super-public, alla kan försöka
  const sessionRole = request.session?.user?.role;

  // Om användaren har en roll via session, lägg till den
  if (sessionRole) {
    userRoles.push(sessionRole);
  } else {
    // Annars lägg till "anonymous" som roll
    userRoles.push("anonymous");
  }

  // Gå igenom varje route i access-listan
  for (const route of accessList) {
    const matcher = match(route.url, { decode: decodeURIComponent });
    const matched = matcher(request.path);

    if (!matched) continue; // Hoppa över om denna route inte matchar pathen

    // Kolla alla access-regler för den matchade route
    for (const access of route.accesses) {
      const roleMatch = userRoles.some(userRole => access.roles.includes(userRole));
      const methodMatch = access.methods.includes(request.method);

      // Om både roll och HTTP-metod matchar → tillåt access
      if (roleMatch && methodMatch) {
        return next();
      }
    }

    // Om route matchar men ingen access tillåter användaren → skicka 403
    return response.status(403).json({ message: "Access forbidden" });
  }

  // Om ingen route matchade i listan → tillåt (antag public route)
  return next();
}
