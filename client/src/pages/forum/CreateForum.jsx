import { useNavigate } from "react-router"
import postForum from "../../services/forums/postForum.js"

export default function CreateForum() {
    const navigate = useNavigate()

    async function submitForm(formData) {
        const name = formData.get("name").trim()

        if (name == "newForum") {
            return alert("Name can't be 'newForum'")
        }

        const { response, result } = await postForum(name)

        if (response.status == 201) {
            alert(result.message)
            return navigate("/" + name)
        } else {
            alert(result.message)
        }
    }

    return <>
        <h1 className="text-3xl text-center mt-5 mb-10">Create new forum</h1>

        <form action={submitForm} className="flex flex-col gap-5 items-center">
            <input name="name" className="p-2 bg-muted" type="text" placeholder="Name" autoComplete="name" required />
            <button type="submit" className="w-32 p-2 rounded-xl font-semibold shadow-custom transition-colors 
            ease-in-out hover:bg-primary-hover hover:text-primary-foreground">Create new forum</button>
        </form>
    </>
}
