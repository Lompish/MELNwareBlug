import { Link } from "react-router";

export default function ForumCard({ forum }) {
    return <>
        <Link to={"/" + forum.name} className="card">{forum.name} - Threads: {forum.amount_of_threads}</Link>
    </>
}
