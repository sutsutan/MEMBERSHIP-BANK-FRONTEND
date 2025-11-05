import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import AdminPanel from './pages/AdminPanel'
import CheckBalance from './pages/CheckBalance'
import RegisterMember from './pages/RegisterMember'
import UserList from './pages/UserList'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <AdminPanel />
      <CheckBalance />
      <RegisterMember />
      <UserList/>
      <div className="test">
        
      </div>
    </>
  )
}

export default App
