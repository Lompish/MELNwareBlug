import { Link } from "react-router"
import ThreadCard from "./ThreadCard.jsx"

export default function ThreadList({ threadList }) {
    return <div className="flex flex-col gap-5">
        {
            threadList.map((thread, key) => {
                return <ThreadCard key={thread.id} thread={thread} />
            })
        }
    </div>
}