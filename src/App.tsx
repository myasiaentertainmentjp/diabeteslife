import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { Layout } from './components/layout'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { ThreadList } from './pages/ThreadList'
import { ThreadDetail } from './pages/ThreadDetail'
import { ThreadNew } from './pages/ThreadNew'
import { ArticleList } from './pages/ArticleList'
import { ArticleDetail } from './pages/ArticleDetail'
import { MyPage } from './pages/MyPage'
import { Search } from './pages/Search'
import { UserProfile } from './pages/UserProfile'

// Static pages
import { Company } from './pages/Company'
import { Terms } from './pages/Terms'
import { Privacy } from './pages/Privacy'
import { Disclaimer } from './pages/Disclaimer'
import { Guidelines } from './pages/Guidelines'
import { Contact } from './pages/Contact'
import { FAQ } from './pages/FAQ'

// Error pages
import { NotFound, Forbidden, ServerError } from './pages/errors'

// Admin imports
import { ProtectedAdminRoute } from './components/admin/ProtectedAdminRoute'
import { AdminLayout } from './components/admin/AdminLayout'
import { Dashboard } from './pages/admin/Dashboard'
import { AdminArticleList } from './pages/admin/ArticleList'
import { ArticleForm } from './pages/admin/ArticleForm'
import { AdminThreadList } from './pages/admin/ThreadList'
import { AdminCommentList } from './pages/admin/CommentList'
import { AdminNgWordList } from './pages/admin/NgWordList'
import { AdminUserList } from './pages/admin/UserList'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="threads" element={<ThreadList />} />
              <Route path="threads/new" element={<ThreadNew />} />
              <Route path="threads/:id" element={<ThreadDetail />} />
              <Route path="articles" element={<ArticleList />} />
              <Route path="articles/:slug" element={<ArticleDetail />} />
              <Route path="mypage" element={<MyPage />} />
              <Route path="search" element={<Search />} />
              <Route path="users/:userId" element={<UserProfile />} />

              {/* Static pages */}
              <Route path="company" element={<Company />} />
              <Route path="terms" element={<Terms />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="disclaimer" element={<Disclaimer />} />
              <Route path="guidelines" element={<Guidelines />} />
              <Route path="contact" element={<Contact />} />
              <Route path="faq" element={<FAQ />} />

              {/* Error pages */}
              <Route path="403" element={<Forbidden />} />
              <Route path="500" element={<ServerError />} />

              {/* Catch-all 404 */}
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminLayout />
                </ProtectedAdminRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="articles" element={<AdminArticleList />} />
              <Route path="articles/new" element={<ArticleForm />} />
              <Route path="articles/:id/edit" element={<ArticleForm />} />
              <Route path="threads" element={<AdminThreadList />} />
              <Route path="comments" element={<AdminCommentList />} />
              <Route path="ng-words" element={<AdminNgWordList />} />
              <Route path="users" element={<AdminUserList />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
