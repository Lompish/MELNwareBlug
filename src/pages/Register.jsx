import { Link, useNavigate } from "react-router";
import register from "../services/users/register.js";
import checkEmail from "../services/users/checkEmail.js";
import checkUsername from "../services/users/checkUsername.js";

export default function Register() {
    const navigate = useNavigate()

    async function submitForm(formData) {
        const email = formData.get("email")
        const username = formData.get("username")
        const password = formData.get("password").trim()
        const password2 = formData.get("password2").trim()

        const emailAvailable = await checkEmail(email)
        const usernameAvailable = await checkUsername(username)

        if (!emailAvailable.response.ok) {
            return alert(emailAvailable.result.message)
        } else if (!usernameAvailable.response.ok) {
            return alert(usernameAvailable.result.message)
        } else if (password.length <= 5) {
            return alert("Password must be longer than 5 characters.")
        } else if (password !== password2) {
            return alert("Password don't match.")
        }

        const { response, result } = await register(email, username, password)

        if (response.ok) {
            alert(result.message)
            return navigate("/login")
        } else {
            alert("Error when register new account.")
        }
    }

    return <>
        <h1 className="text-3xl text-center mt-5 mb-10">Create account</h1>

        <form action={submitForm} className="flex flex-col gap-5 items-center">
            <input name="email" className="p-2 bg-muted" type="email" placeholder="Email" autoComplete="email" required />
            <input name="username" className="p-2 bg-muted" type="text" placeholder="Användarnamn" autoComplete="username" required />
            <input name="password" className="p-2 bg-muted" type="password" placeholder="Lösenord" autoComplete="current-password" required />
            <input name="password2" className="p-2 bg-muted" type="password" placeholder="Lösenord igen" autoComplete="current-password" required />
            <button type="submit" className="w-32 p-2 rounded-xl font-semibold shadow-custom transition-colors ease-in-out hover:bg-primary-hover hover:text-primary-foreground" >Registrer</button>
            <Link className="w-32 p-2 rounded-xl font-semibold shadow-custom text-center transition-colors ease-in-out hover:bg-primary-hover hover:text-primary-foreground" to="/login" >Login</Link>
        </form>
    </>
}
