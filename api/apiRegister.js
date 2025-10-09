//import acl from "./acl.js";
import login from "./endpointLogin.js";
import forum from "./endpointForum.js";
import postThread from "./endpointPostThread.js";
import thread from "./endpointThread.js";
import patchThread from "./endpointPatchThread.js";
import user from "./endpointUser.js";
import threadByTitle from "./endpointGetThreadByTitle.js";
import deleteThread from "./endpointDeleteThread.js";
// import post from "./endpointPosts.js";
// import other from "./endpointOthers.js";


//////import { readFileSync } from "fs"

//////const accessList = JSON.parse(
//////  readFileSync(new URL("./access-list.json", import.meta.url))
///////)


export default function (server, database) {
  const path = "/api"

  login(server, path, database)
  user(server, path, database)
  forum(server, path, database)
  postThread(server, path, database)
  thread(server, path, database)
  patchThread(server, path, database)
  threadByTitle(server, path, database)
  deleteThread(server, acl, path, database)
  // other(server, acl, path, database)
  // post(server, acl, path, database)


}