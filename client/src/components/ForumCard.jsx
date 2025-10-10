import { Link } from "react-router"

export default function ForumCard({ forum }) {
    return (
        <Link
            to={`/forums/${forum.forumName}`}
            className="card p-3 border rounded-lg hover:bg-gray-800 transition"
        >
            <h3 className="text-lg font-bold">{forum.forumName}</h3>
            <p className="text-gray-400">{forum.forumDescription}</p>
        </Link>
    )
}