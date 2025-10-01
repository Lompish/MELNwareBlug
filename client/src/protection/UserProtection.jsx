import { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { GlobalContext } from '../context/Global.jsx';

export default function UserProtection() {
    const { user } = useContext(GlobalContext);
    const location = useLocation();

    if (user === null) {
        return <p>Loading ...</p>
    } else if (!user) {
        const from = location.pathname + location.search + location.hash;
        return <Navigate to="/login" replace state={{ from }} />;
    } else if (user?.role != "user") {
        return <h1 className="text-3xl text-center my-5">No Access</h1>
    }

    return <Outlet />;
}
