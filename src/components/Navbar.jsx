import { useContext } from "react";
import Logo from "../assets/Blug-B.svg?react";
import LoginBtn from "./LoginBtn.jsx";
import Searchbar from "./Searchbar.jsx";
import ThemeBtn from "./ThemeBtn.jsx";
import { GlobalContext } from "../context/Global.jsx";
import ProfileBtn from "./ProfileBtn.jsx";
import LogoutBtn from "./LogoutBtn.jsx";

export default function Navbar() {
    const { user } = useContext(GlobalContext)

    return <nav className="bg-card text-card-foreground border-b border-border sticky top-0
    h-16 max-h-1/12 flex justify-between items-center">
        <div className="w-1/5">
            <a href="/" className="flex text-4xl w-fit">
                <Logo className="size-9 text-primary [&_*]:stroke-current" />
                <span>LUG</span>
            </a>
        </div>
        <Searchbar />
        <div className="w-1/5 flex justify-end mr-0">
            {user ? <div className="flex gap-2">
                <ProfileBtn />
                <LogoutBtn />
            </div>
                : <LoginBtn />}
            <ThemeBtn />
        </div>
    </nav>
}
