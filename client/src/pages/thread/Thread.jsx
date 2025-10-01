import { useState, useEffect } from "react"
import { useParams } from "react-router"
import getThread from "../../services/threads/getThread"

export default function Thread() {
    const [threadInfo, setThreadInfo] = useState(null)
    const [messages, setMessages] = useState(null)
    const { thread } = useParams()

    async function loadThread() {
        const { response, result } = await getThread(thread)

        if (response.ok) {
            setThreadInfo(result.thread)
            setMessages(result.messages)
        } else {
            setMessages([])
        }
    }

    useEffect(() => {
        loadThread()
    }, [])

    return threadInfo == null ? <p>Loading thread...</p> : <>
        <h1 className="text-3xl text-center mt-5 mb-10">{threadInfo.title}</h1>

        <div className="flex flex-col gap-5">
            {
                messages == null ?
                    <p> Loading messages...</p>
                    :
                    messages.map(message => {
                        return <div className="bg-muted py-2 px-4 rounded-2xl">
                            <p className="text-lg mb-2 font-bold">{message.text}</p>
                            <p className="text-xs text-right"><i>Time:</i> {message.time.substring(0, 5)} | <i>Date:</i> {message.date.substring(0, 10)} </p>
                            <p className="text-xs text-right"><i>Posted by:</i> {message.user}</p>
                        </div>
                    })
            }
        </div>
    </>
}
