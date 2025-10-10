import { useContext } from "react"
import { GlobalContext } from "../context/Global.jsx"
import { IconLogout } from "@tabler/icons-react"
import logout from "../services/login/logout.js"

export default function LogoutBtn() {
    const { checkLogin } = useContext(GlobalContext)

    async function logoutUser() {
        const { response } = await logout()

        if (response.status == 200) {
            await checkLogin()
        } else {
            alert("Something gone wrong when logging out.")
        }

    }

    return <button className="p-2 btn btn-primary rounded-4xl mx-3" onClick={logoutUser}><IconLogout /></button>
}