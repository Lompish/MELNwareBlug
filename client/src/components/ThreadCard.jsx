import { Link } from "react-router";

export default function ThreadCard({ thread }) {
    return <>
        <Link to={"/" + thread.forumName + "/" + thread.threadName} className="card">{thread.threadName}</Link>
    </>
}