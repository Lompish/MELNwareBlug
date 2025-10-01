import { Link } from "react-router";

export default function ThreadCard({ thread }) {
    return <>
        <Link to={"/" + thread.forum + "/" + thread.title} className="card">{thread.title}</Link>
    </>
}
