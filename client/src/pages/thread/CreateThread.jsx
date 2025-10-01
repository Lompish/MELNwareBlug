import { useNavigate, useParams } from "react-router"
import postThread from "../../services/threads/postThread.js"

export default function CreateThread() {
    const navigate = useNavigate()
    const { forum } = useParams()

    async function submitForm(formData) {
        const title = formData.get("title").trim()
        const description = formData.get("description").trim()

        if (title == "newThread") {
            return alert("Title can't be 'newThread'")
        }

        const { response, result } = await postThread(title, description, forum)

        if (response.status == 201) {
            alert(result.message)
            return navigate(`/${forum}/${title}`)
        } else {
            alert(result.message)
        }
    }

    return <>
        <h1 className="text-3xl text-center mt-5 mb-10">Create new thread in {forum}</h1>

        <form action={submitForm} className="flex flex-col gap-5 items-center">
            <input name="title" className="p-2 bg-muted" type="text" placeholder="Title" autoComplete="title" required />
            <textarea name="description" className="w-96 h-60 p-2 bg-muted" type="text" placeholder="Description - Max 500 characters" autoComplete="description" max={500} />
            <button type="submit" className="w-32 p-2 rounded-xl font-semibold shadow-custom transition-colors 
            ease-in-out hover:bg-primary-hover hover:text-primary-foreground">Create new thread</button>
        </form>
    </>
}
