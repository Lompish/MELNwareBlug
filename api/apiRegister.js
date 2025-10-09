//import acl from "./acl.js";
import login from "./endpointLogin.js";
import forum from "./endpointGetForum.js";
import thread from "./endpointThread.js";
import user from "./endpointUser.js";
import postForum from "./endpointPostForum.js";
import deleteForum from "./endpointDeleteForum.js";
import forumId from "./endpointGetForumId.js";
import forumSlug from "./endpointSlug.js";
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
  thread(server, path, database)
  postForum(server, path, database)
  deleteForum(server, path, database)
  forumId(server, path, database)
  forumSlug(server, path, database)
  // other(server, acl, path, database)
  // post(server, acl, path, database)


}

