import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { Layout } from './components/layout'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { RegisterComplete } from './pages/RegisterComplete'
import { ForgotPassword } from './pages/ForgotPassword'
import { ResetPassword } from './pages/ResetPassword'
import { ThreadList } from './pages/ThreadList'
import { ThreadDetail } from './pages/ThreadDetail'
import { ThreadNew } from './pages/ThreadNew'
import { ArticleList } from './pages/ArticleList'
import { ArticleDetail } from './pages/ArticleDetail'
import { MyPage } from './pages/MyPage'
import { ProfileSettings } from './pages/mypage/ProfileSettings'
import { HbA1cRecords } from './pages/mypage/HbA1cRecords'
import { Search } from './pages/Search'
import { UserProfile } from './pages/UserProfile'
import { Notifications } from './pages/Notifications'

// Static pages
import { Company } from './pages/Company'
import { Terms } from './pages/Terms'
import { Privacy } from './pages/Privacy'
import { Disclaimer } from './pages/Disclaimer'
import { Guidelines } from './pages/Guidelines'
import { Guide } from './pages/Guide'
import { Contact } from './pages/Contact'
import { ContactComplete } from './pages/ContactComplete'
import { FAQ } from './pages/FAQ'

// Help pages
import { ThreadModes } from './pages/help/ThreadModes'

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
import { ReportList } from './pages/admin/ReportList'
import { PopularKeywordList } from './pages/admin/PopularKeywordList'
import { NotificationList } from './pages/admin/NotificationList'
import { DummyReply } from './pages/admin/DummyReply'

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

// Wrapper for mypage subroutes
function MyPageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">マイページ</h1>
      <div className="bg-white rounded-lg shadow-sm p-6">
        {children}
      </div>
    </div>
  )
}

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <ToastProvider>
            <Routes>
            {/* Public routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="register/complete" element={<RegisterComplete />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password" element={<ResetPassword />} />
              <Route path="threads" element={<ThreadList />} />
              <Route path="threads/new" element={<ThreadNew />} />
              <Route path="threads/:threadNumber" element={<ThreadDetail />} />
              <Route path="articles" element={<ArticleList />} />
              <Route path="articles/:slug" element={<ArticleDetail />} />
              <Route path="mypage" element={<MyPage />} />
              <Route path="mypage/profile" element={<MyPageWrapper><ProfileSettings /></MyPageWrapper>} />
              <Route path="mypage/hba1c" element={<MyPageWrapper><HbA1cRecords /></MyPageWrapper>} />
              <Route path="search" element={<Search />} />
              <Route path="users/:userId" element={<UserProfile />} />
              <Route path="notifications" element={<Notifications />} />

              {/* Static pages */}
              <Route path="company" element={<Company />} />
              <Route path="terms" element={<Terms />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="disclaimer" element={<Disclaimer />} />
              <Route path="guidelines" element={<Guidelines />} />
              <Route path="guide" element={<Guide />} />
              <Route path="contact" element={<Contact />} />
              <Route path="contact/complete" element={<ContactComplete />} />
              <Route path="faq" element={<FAQ />} />
              <Route path="help/thread-modes" element={<ThreadModes />} />

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
              <Route path="reports" element={<ReportList />} />
              <Route path="keywords" element={<PopularKeywordList />} />
              <Route path="notifications" element={<NotificationList />} />
              <Route path="dummy-reply" element={<DummyReply />} />
            </Route>
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  )
}

export default App
