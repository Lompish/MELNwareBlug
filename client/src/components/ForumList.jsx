import { Link } from "react-router"
import ForumCard from "./ForumCard.jsx"

export default function ForumList({ forumList }) {
    console.log(forumList)
    return <div className="flex flex-col gap-5">
        {
            forumList.map((forum) => {
                return <ForumCard key={forum.id} forum={forum} />
            })
        }
    </div>
}