import { Routes, Route } from 'react-router-dom'

function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white">
      <h1 className="text-3xl font-bold text-neutral-900">마감할인</h1>
    </main>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  )
}

export default App
