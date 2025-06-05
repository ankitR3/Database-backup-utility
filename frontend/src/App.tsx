import { BrowserRouter, Routes, Route, Outlet, useParams } from "react-router-dom"
import Main from "./component/main"
import Dashboard from "./component/dashboard"

const App = () => {
  return <BrowserRouter>
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/dashboard" element={<Dashboard />} />

    </Routes>
  </BrowserRouter>
}

export default App;