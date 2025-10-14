//import acl from "./acl.js";
import login from "./login/endpointPostLogin.js";
import logout from "./login/endpointDeleteLoginLogout.js";
import checkLoggedIn from "./login/endpointGetLoginCheckLoggedIn.js";
import forum from "./forums/endpointGetForum.js";
import postThread from "./threads/endpointPostThread.js";
import thread from "./threads/endpointGetThread.js";
import patchThread from "./threads/endpointPatchThread.js";
import user from "./users/endpointGetUser.js";
import postForum from "./forums/endpointPostForum.js";
import deleteForum from "./forums/endpointDeleteForum.js";
import forumId from "./forums/endpointGetForumId.js";
import forumSlug from "./forums/endpointSlugForum.js";
import patchForum from "./forums/endpointPatchUpdateForum.js";
import threadByTitle from "./threads/endpointGetThreadByTitle.js";
import deleteThread from "./threads/endpointDeleteThread.js";
import getUser from "./users/endpointGetUser.js";
import userId from "./users/endpointGetUserId.js";
import userByEmail from './users/endpointGetUserByEmail.js';
import userByUsername from "./users/endpointGetUserByUsername.js";
import updateUser from './users/endpointPatchUpdateUser.js';
import hash from "./encryption.js";
import postUser from "./users/endpointPostUser.js";
import softDeleteUserByAdmin from "./admin/endpointAdminDeleteUser.js";
import endpointDeleteFTP from "./admin/endpointDeleteFTP.js";
import adminLogin from "./admin/endpointAdminLogin.js";
import softDeleteUserByU from "./users/endpointSoftDeleteUser.js";
// import post from "./endpointPosts.js";
import postPost from "./posts/endpointPostPost.js";
import patchPost from "./posts/endpontPatchPost.js";
// import other from "./endpointOthers.js";
import getPost from "./posts/endpointGetPost.js";
import deletePost from "./posts/endpointDeletePost.js";
import moderatorDeletePost from "./posts/endpointModeratorDeletePost.js";
import postThreadModerator from "./threads/moderators/endpointPostThreadModerator.js";
import deleteThreadModerator from "./threads/moderators/endpointDeleteThreadModerator.js";
import patchThreadOwner from "./threads/moderators/endpointPatchThreadOwner.js";
import deleteUserPrivateThread from "./threads/moderators/endpointDeleteUserPrivateThread.js";
import postUserPrivateThread from "./threads/moderators/endpointPostUserPrivateThread.js";
import patchBlockPost from "./threads/moderators/endpointPatchBlockPost.js";
import getPostsByThreadId from "./threads/endpointGetPostsByThreadId.js";


//////import { readFileSync } from "fs"

//////const accessList = JSON.parse(
//////  readFileSync(new URL("./access-list.json", import.meta.url))
///////)


export default function (server, database) {
  const path = "/api"

  login(server, path, database)
  logout(server, path, database)
  checkLoggedIn(server, path, database)
  user(server, path, database)
  forum(server, path, database)
  postThread(server, path, database)
  thread(server, path, database)
  postForum(server, path, database)
  deleteForum(server, path, database)
  forumId(server, path, database)
  forumSlug(server, path, database)
  patchForum(server, path, database)
  patchThread(server, path, database)
  threadByTitle(server, path, database)
  deleteThread(server, path, database)
  getUser(server, path, database)
  userByEmail(server, path, database);
  userId(server, path, database)
  userByUsername(server, path, database);
  updateUser(server, path, database, hash);
  postUser(server, path, database);
  softDeleteUserByAdmin(server, path, database);
  endpointDeleteFTP(server, path, database);
  adminLogin(server, path, database);
  softDeleteUserByU(server, path, database);
  // other(server, acl, path, database)
  postPost(server, path, database)
  getPost(server, path, database)
  patchPost(server, path, database)
  deletePost(server, path, database)
  moderatorDeletePost(server, path, database)
  // post(server, acl, path, database)
  postThreadModerator(server, path, database)
  deleteThreadModerator(server, path, database)
  patchThreadOwner(server, path, database)
  deleteUserPrivateThread(server, path, database)
  postUserPrivateThread(server, path, database)
  patchBlockPost(server, path, database)
  getPostsByThreadId(server, path, database)
}