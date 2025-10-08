//import acl from "./acl.js";
import login from "./endpointLogin.js";
import forum from "./endpointForum.js";
import thread from "./endpointThread.js";
import user from "./endpointUser.js";
// import post from "./endpointPosts.js";
// import other from "./endpointOthers.js";

import hash from "./encryption.js";
import updateUser from './endpointPatchUpdateUser.js'; // ← Lägg till denna


//////import { readFileSync } from "fs"

//////const accessList = JSON.parse(
//////  readFileSync(new URL("./access-list.json", import.meta.url))
///////)


export default function (server, database) {
  const path = "/api"

  login(server, path, database)
  user(server, path, database)
  forum(server, path, database)
  thread(server, path, database)
  // other(server, acl, path, database)
  // post(server, acl, path, database)

  updateUser(server, path, database, hash);

}

