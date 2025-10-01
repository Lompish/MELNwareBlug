import { Link } from "react-router"
import ForumCard from "./ForumCard.jsx"

export default function ForumList({ forumList }) {
    return <div className="flex flex-col gap-5">
        {
            forumList.map((forum, key) => {
                return <ForumCard key={key} forum={forum} />
            })
        }
    </div>
}
