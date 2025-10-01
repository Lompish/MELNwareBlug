import { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { GlobalContext } from '../context/Global.jsx';

export default function LoginProtection() {
    const { user } = useContext(GlobalContext);
    const location = useLocation();

    if (user === null) {
        return <p>Loading ...</p>
    } else if (!user) {
        const from = location.pathname + location.search + location.hash;
        return <Navigate to="/login" replace state={{ from }} />;
    }

    return <Outlet />;
}
