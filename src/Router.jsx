import { createBrowserRouter } from "react-router";

// Layout 
import Layout from "./Layout.jsx";

// Protection
import LoginProtection from "./protection/LoginProtection.jsx";
import UserProtection from "./protection/UserProtection.jsx";

// Pages
import Home from "./pages/Home.jsx";
import NoPage from "./pages/NoPage.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";
import Forum from "./pages/forum/Forum.jsx";
import Thread from "./pages/thread/Thread.jsx";
import CreateForum from "./pages/forum/CreateForum.jsx";
import CreateThread from "./pages/thread/CreateThread.jsx";

// Loaders
import getAllForum from "./services/forums/getAllForum.js";
import getAllThreads from "./services/threads/getAllThreads.js";

const Router = createBrowserRouter([
    {
        path: "/",
        Component: Layout,
        children: [
            {
                index: true,
                loader: async () => {
                    return {
                        forums: await getAllForum(),
                        threads: await getAllThreads()
                    }
                },
                Component: Home
            },
            { path: "login", Component: Login },
            { path: "register", Component: Register },
            {
                path: "newForum",
                Component: UserProtection,
                children: [
                    { index: true, Component: CreateForum }
                ]
            },
            {
                path: ":forum",
                children: [
                    { index: true, Component: Forum },
                    {
                        path: "newThread",
                        Component: UserProtection,
                        children: [
                            { index: true, Component: CreateThread }
                        ]
                    },
                    { path: ":thread", Component: Thread }
                ]
            },
            {
                path: "profile",
                Component: LoginProtection,
                children: [
                    { index: true, Component: Profile }
                ]
            },
            { path: "*", Component: NoPage }
        ]
    },
]);

export default Router