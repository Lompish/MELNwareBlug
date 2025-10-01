import { useNavigate } from "react-router"


export default function LoginBtn() {
    const navigate = useNavigate()

    return <button className="btn btn-primary" onClick={() => navigate("/login")}>Login</button>
}
