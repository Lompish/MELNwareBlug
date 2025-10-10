import { useNavigate } from "react-router"
import postForum from "../../services/forums/postForum.js"

export default function CreateForum() {
    const navigate = useNavigate()

    async function submitForm(formData) {
        const name = formData.get("name").trim()
        const description = formData.get("description").trim()

        if (name === "newForum") {
            return alert("Name can't be 'newForum'")
        }

        const { response, result } = await postForum(name, description)

        if (response.status === 201) {
            alert("Forum created successfully!")
            return navigate("/" + name)
        } else {
            alert(result.message || "Something went wrong creating the forum.")
        }
    }

    return (
        <>
            <h1 className="text-3xl text-center mt-5 mb-10">Create new forum</h1>

            <form action={submitForm} className="flex flex-col gap-5 items-center">
                <input
                    name="name"
                    className="p-2 bg-muted"
                    type="text"
                    placeholder="Forum name"
                    required
                />
                <textarea
                    name="description"
                    className="w-96 h-40 p-2 bg-muted"
                    placeholder="Forum description"
                ></textarea>
                <button
                    type="submit"
                    className="w-32 p-2 rounded-xl font-semibold shadow-custom transition-colors 
                    ease-in-out hover:bg-primary-hover hover:text-primary-foreground"
                >
                    Create
                </button>
            </form>
        </>
    )
}
