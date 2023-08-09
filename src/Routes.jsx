import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import './index.css'

export default function App() {
  return (
    <Routes>
      <Route index path="/" element={<Home />} />
    </Routes>
  )
}
