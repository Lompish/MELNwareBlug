import { Link, useLocation, useNavigate } from "react-router";
import login from "../services/login/login.js";
import { useContext } from "react";
import { GlobalContext } from "../context/Global.jsx";

export default function Login() {
    const { checkLogin } = useContext(GlobalContext)
    const navigate = useNavigate()
    const location = useLocation()
    const from = location.state?.from ?? '/'

    async function submitForm(formData) {
        const username = formData.get("username")
        const password = formData.get("password")

        const result = await login(username, password)

        if (result.response.status == 200) {
            await checkLogin()
            navigate(from, { replace: true })
        } else {
            alert("Wrong username or password.")
        }
    }

    return <>
        <h1 className="text-3xl text-center mt-5 mb-10">Login</h1>

        <form action={submitForm} className="flex flex-col gap-5 items-center">
            <input name="username" className="p-2 bg-muted" type="text" placeholder="Användarnamn" autoComplete="first-name" required />
            <input name="password" className="p-2 bg-muted" type="password" placeholder="Lösenord" autoComplete="current-password" required />
            <button type="submit" className="w-32 p-2 rounded-xl font-semibold shadow-custom transition-colors ease-in-out hover:bg-primary-hover hover:text-primary-foreground" >Logga in</button>
            <Link className="w-32 p-2 rounded-xl font-semibold shadow-custom text-center transition-colors ease-in-out hover:bg-primary-hover hover:text-primary-foreground" to="/register" >Skapa konto</Link>
        </form>
    </>
}
