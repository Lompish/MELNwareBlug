import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from "react-router";
import './app.css'
import router from './Router.jsx';
import { GlobalProvider } from './context/Global.jsx';

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <StrictMode>
    <GlobalProvider>
      <RouterProvider router={router} />
    </GlobalProvider>
  </StrictMode>
);