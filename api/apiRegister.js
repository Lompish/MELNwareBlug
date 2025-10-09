//import acl from "./acl.js";
import login from "./endpointLogin.js";
import forum from "./endpointForum.js";
import postThread from "./endpointPostThread.js";
import thread from "./endpointThread.js";
import patchThread from "./endpointPatchThread.js";
import user from "./endpointUser.js";
import threadByTitle from "./endpointGetThreadByTitle.js";
// import post from "./endpointPosts.js";
// import other from "./endpointOthers.js";


//////import { readFileSync } from "fs"

//////const accessList = JSON.parse(
//////  readFileSync(new URL("./access-list.json", import.meta.url))
///////)


export default function (server, database) {
  const path = "/api"

  login(server, acl, path, database)
  user(server, acl, path, database)
  forum(server, acl, path, database)
  postThread(server, acl, path, database)
  thread(server, acl, path, database)
  patchThread(server, acl, path, database)
  threadByTitle(server, path, database)
  // other(server, acl, path, database)
  // post(server, acl, path, database)


}

