import { useEffect, useState } from "react"
import getForumThreads from "../../services/forums/getForumThreads"
import { useNavigate, useParams } from "react-router"
import ThreadList from "../../components/ThreadList"

export default function Forum() {
    const [forumInfo, setForumInfo] = useState(null)
    const [threads, setThreads] = useState(null)
    const { forum } = useParams()
    const navigate = useNavigate()

    async function loadThreads() {
        const { response, result } = await getForumThreads(forum)

        if (response.ok) {
            setForumInfo(result.forum)
            setThreads(result.threads)
        } else {
            setForumInfo({})
            setThreads([])
        }
    }

    useEffect(() => {
        loadThreads()
    }, [])

    return forumInfo == null ? <p>Loading forum...</p> : <>
        <h1 className="text-3xl text-center mt-5 mb-10">{forumInfo.name}</h1>
        <button onClick={() => navigate(`/${forumInfo.name}/newThread`)} className="btn btn-primary mb-10">New Thread</button>
        {
            threads == null ?
                <p>Loading threads...</p> :
                <ThreadList threadList={threads} />
        }
    </>
}
