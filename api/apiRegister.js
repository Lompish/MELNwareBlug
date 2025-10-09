//import acl from "./acl.js";
import login from "./endpointLogin.js";
import forum from "./endpointForum.js";
import postThread from "./endpointPostThread.js";
import thread from "./endpointThread.js";
import patchThread from "./endpointPatchThread.js";
import user from "./endpointUser.js";
import threadByTitle from "./endpointGetThreadByTitle.js";
import deleteThread from "./endpointDeleteThread.js";
import getUser from "./endpointGetUser.js";
//import threadByTitle from "./endpointThreadByTitle.js";
import userId from "./endpointGetUserId.js";
// import post from "./endpointPosts.js";
// import other from "./endpointOthers.js";
import userByEmail from './endpointGetUserByEmail.js'; // ← Lägg till denna
import userByUsername from "./endpointGetUserByUsername.js";
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
  postThread(server, path, database)
  thread(server, path, database)
  patchThread(server, path, database)
  threadByTitle(server, path, database)
  deleteThread(server, path, database)
  getUser(server, path, database)
  userByEmail(server, path, database); // ← Lägg till denna
  //threadByTitle(server, path, database)
  userId(server, path, database)
  // other(server, acl, path, database)
  // post(server, acl, path, database)
  userByUsername(server, path, database);
  updateUser(server, path, database, hash);

}