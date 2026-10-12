import { Route, Routes, Link } from 'react-router-dom'
import { X } from 'lucide-react'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import BrowsePage from './pages/BrowsePage'
import ListingDetailPage from './pages/ListingDetailPage'
import MyListingsPage from './pages/MyListingsPage'
import PostListingPage from './pages/PostListingPage'
import ProfilePage from './pages/ProfilePage'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'

function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="text-6xl font-extrabold text-primary-700">404</p>
      <p className="mt-3 text-neutral-600">This page wandered off campus.</p>
      <Link to="/" className="btn-primary mt-6">Back to the bazaar</Link>
    </div>
  )
}

export default function App() {
  const { notice, clearNotice } = useAuth()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {notice && (
        <div className="animate-slide-up border-b border-primary-200 bg-primary-50">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 text-sm font-medium text-primary-900 sm:px-6">
            {notice}
            <button onClick={clearNotice} aria-label="Dismiss" className="rounded p-1 hover:bg-primary-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<BrowsePage />} />
          <Route path="/listing/:id" element={<ListingDetailPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/sell" element={<ProtectedRoute><PostListingPage /></ProtectedRoute>} />
          <Route path="/my-listings" element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="border-t border-neutral-200/70 py-8 text-center text-xs text-neutral-500">
        Made by students, for students of NIT Srinagar · Meet in public spots on campus when trading
      </footer>
    </div>
  )
}
