import React, { useEffect, useContext } from 'react'
import UserPage from './UserPage'
import { AuthContext } from '../context/AuthContext'

function Home() {
  const { user, logout } = useContext(AuthContext);

  

  useEffect(() => {
    if (user) {
      logout({ redirect: false });
    }
  }, [user, logout]);

  return (
    <>
    <UserPage />

    </>
  )
}

export default Home
