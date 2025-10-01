import { createContext, useEffect, useState } from "react";
import getLogin from "../services/login/getLogin.js";

const GlobalContext = createContext()

function GlobalProvider({ children }) {
    const [user, setUser] = useState(null)
    const [theme, setTheme] = useState("mocha")

    async function checkLogin() {
        const { response, result } = await getLogin()

        if (response.ok) {
            setUser(result)
        } else {
            setUser(false)
        }
    }

    function changeTheme() {
        setTheme(theme == "latte" ? "mocha" : "latte")
    }

    useEffect(() => {
        checkLogin()
    }, [])

    useEffect(() => {
        const site = document.documentElement
        site.setAttribute('data-theme', theme)
    }, [theme])

    return <GlobalContext.Provider value={{
        user,
        checkLogin,
        theme,
        changeTheme
    }}>
        {children}
    </GlobalContext.Provider>
}

export { GlobalContext, GlobalProvider }