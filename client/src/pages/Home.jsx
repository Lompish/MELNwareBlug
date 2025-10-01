import { useLoaderData, useNavigate } from "react-router";
import ForumList from "../components/ForumList.jsx";
import ThreadList from "../components/ThreadList.jsx";

export default function Home() {
    const { forums, threads } = useLoaderData();
    const navigate = useNavigate()

    return <>
        <h2 className="text-3xl text-center mt-5 mb-10">Forum</h2>
        <button onClick={() => navigate("/newForum")} className="btn btn-primary mb-10">New Forum</button>
        <ForumList forumList={forums.result} />

        <h2 className="text-3xl text-center mt-5 mb-10">Threads</h2>
        <ThreadList threadList={threads.result} />

    </>
}
