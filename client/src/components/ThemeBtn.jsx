import { useContext } from "react";
import { GlobalContext } from "../context/Global.jsx";
import { IconMoonStars, IconSun } from '@tabler/icons-react'

export default function ThemeBtn() {
    const { theme, changeTheme } = useContext(GlobalContext)

    return <button
        onClick={changeTheme}
        className="p-2 btn rounded-4xl mx-3"
    >{theme == "latte" ? <IconMoonStars /> : <IconSun />}</button>
}
