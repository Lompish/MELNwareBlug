import { IconUserCircle } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { GlobalContext } from "../context/Global.jsx";
import { useContext } from "react";

export default function ProfileBtn() {
    const { user } = useContext(GlobalContext)
    const navigate = useNavigate()

    return <button className="btn btn-primary"
        onClick={() => navigate("/profile")}>
        <IconUserCircle />
        <p>{user.username}</p>
    </button>
}
