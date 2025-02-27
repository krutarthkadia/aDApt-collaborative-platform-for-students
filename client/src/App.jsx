import React, { useEffect } from 'react'
import Navbar from './components/Navbar.jsx'
import {Routes, Route, Navigate, BrowserRouter} from "react-router-dom"
import HomePg from './pages/HomePg.jsx'
import SignUpPg from './pages/SignupPg.jsx'
import LoginPg from './pages/LoginPg.jsx'
import { useAuthStore } from './store/authStore.js'
import {Loader} from 'lucide-react'
import QnAPg from './pages/QnAPg.jsx'
import SharedlibPg from './pages/SharedlibPg.jsx'
import EmailPg from './pages/EmailPg.jsx'
import LostPg from './pages/LostPg.jsx'
import FoundPg from './pages/FoundPg.jsx'
import QnAForm from './components/QnAForm.jsx'
import LnFForm from './components/LnFForm.jsx'
import EmailForm from './components/EmailForm.jsx'
import SharedlibForm from './components/SharedlibForm.jsx'

const App = () => {
  const {authUser, checkAuth, isCheckingAuth} = useAuthStore()
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  console.log({authUser})

  // if(isCheckingAuth && !authUser) return (
  //   <div className='flex items-center justify-center h-screen'>
  //     <Loader className = "size-10 animate-spin"/>
  //   </div>
  // )

  return (
    <BrowserRouter>
      <div>
        <Navbar/>  
        <Routes>
          {/* <Route path='/' element = {authUser ? <HomePg/> : <Navigate to='/login'/>}/> */}
          <Route path='/' element = {<HomePg/>}/>
          <Route path='/signup' element = {!authUser? <SignUpPg/> : <Navigate to='/'/>}/>
          <Route path='/login' element = {!authUser? <LoginPg/> : <Navigate to='/'/>}/>
          <Route path='/qna' element = {authUser? <QnAPg/> : <Navigate to='/'/>}/>
          <Route path='/sharedlib' element = {authUser? <SharedlibPg/> : <Navigate to='/'/>}/>
          <Route path='/emails' element = {authUser? <EmailPg/> : <Navigate to='/'/>}/>
          <Route path='/lost' element = {authUser? <LostPg/> : <Navigate to='/'/>}/>
          <Route path='/found' element = {authUser? <FoundPg/> : <Navigate to='/'/>}/>
          <Route path='/qna_upload' element = {authUser? <QnAForm/> : <Navigate to='/'/>}/>
          <Route path='/lnf_upload' element = {authUser? <LnFForm/> : <Navigate to='/'/>}/>
          <Route path='/mail_upload' element = {authUser? <EmailForm/> : <Navigate to='/'/>}/>
          <Route path='/file_upload' element = {authUser? <SharedlibForm/> : <Navigate to='/'/>}/>
        </Routes>
      </div>
    </BrowserRouter>
    
  )
}

export default App

//zustand to use one state in multiple routes like homepage, signuppage ...