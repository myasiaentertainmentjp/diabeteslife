import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, Suspense, lazy } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { Layout } from './components/layout'
import { Loader2 } from 'lucide-react'

// Critical path - load immediately
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Register } from './pages/Register'

// Lazy load other pages
const RegisterComplete = lazy(() => import('./pages/RegisterComplete').then(m => ({ default: m.RegisterComplete })))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })))
const ResetPassword = lazy(() => import('./pages/ResetPassword').then(m => ({ default: m.ResetPassword })))
const ThreadList = lazy(() => import('./pages/ThreadList').then(m => ({ default: m.ThreadList })))
const ThreadDetail = lazy(() => import('./pages/ThreadDetail').then(m => ({ default: m.ThreadDetail })))
const ThreadNew = lazy(() => import('./pages/ThreadNew').then(m => ({ default: m.ThreadNew })))
const ArticleList = lazy(() => import('./pages/ArticleList').then(m => ({ default: m.ArticleList })))
const ArticleDetail = lazy(() => import('./pages/ArticleDetail').then(m => ({ default: m.ArticleDetail })))
const MyPage = lazy(() => import('./pages/MyPage').then(m => ({ default: m.MyPage })))
const ProfileSettings = lazy(() => import('./pages/mypage/ProfileSettings').then(m => ({ default: m.ProfileSettings })))
const HbA1cRecords = lazy(() => import('./pages/mypage/HbA1cRecords').then(m => ({ default: m.HbA1cRecords })))
const Search = lazy(() => import('./pages/Search').then(m => ({ default: m.Search })))
const UserProfile = lazy(() => import('./pages/UserProfile').then(m => ({ default: m.UserProfile })))
const Notifications = lazy(() => import('./pages/Notifications').then(m => ({ default: m.Notifications })))

// Static pages - lazy load
const Company = lazy(() => import('./pages/Company').then(m => ({ default: m.Company })))
const Terms = lazy(() => import('./pages/Terms').then(m => ({ default: m.Terms })))
const Privacy = lazy(() => import('./pages/Privacy').then(m => ({ default: m.Privacy })))
const Disclaimer = lazy(() => import('./pages/Disclaimer').then(m => ({ default: m.Disclaimer })))
const Guidelines = lazy(() => import('./pages/Guidelines').then(m => ({ default: m.Guidelines })))
const Guide = lazy(() => import('./pages/Guide').then(m => ({ default: m.Guide })))
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })))
const ContactComplete = lazy(() => import('./pages/ContactComplete').then(m => ({ default: m.ContactComplete })))
const FAQ = lazy(() => import('./pages/FAQ').then(m => ({ default: m.FAQ })))

// Help pages
const ThreadModes = lazy(() => import('./pages/help/ThreadModes').then(m => ({ default: m.ThreadModes })))

// Error pages
const NotFound = lazy(() => import('./pages/errors').then(m => ({ default: m.NotFound })))
const Forbidden = lazy(() => import('./pages/errors').then(m => ({ default: m.Forbidden })))
const ServerError = lazy(() => import('./pages/errors').then(m => ({ default: m.ServerError })))

// Components
import { NewUserWelcomeModal } from './components/NewUserWelcomeModal'

// Admin imports - lazy load entire admin section
const ProtectedAdminRoute = lazy(() => import('./components/admin/ProtectedAdminRoute').then(m => ({ default: m.ProtectedAdminRoute })))
const AdminLayout = lazy(() => import('./components/admin/AdminLayout').then(m => ({ default: m.AdminLayout })))
const Dashboard = lazy(() => import('./pages/admin/Dashboard').then(m => ({ default: m.Dashboard })))
const AdminArticleList = lazy(() => import('./pages/admin/ArticleList').then(m => ({ default: m.AdminArticleList })))
const ArticleForm = lazy(() => import('./pages/admin/ArticleForm').then(m => ({ default: m.ArticleForm })))
const AdminThreadList = lazy(() => import('./pages/admin/ThreadList').then(m => ({ default: m.AdminThreadList })))
const AdminCommentList = lazy(() => import('./pages/admin/CommentList').then(m => ({ default: m.AdminCommentList })))
const AdminNgWordList = lazy(() => import('./pages/admin/NgWordList').then(m => ({ default: m.AdminNgWordList })))
const AdminUserList = lazy(() => import('./pages/admin/UserList').then(m => ({ default: m.AdminUserList })))
const ReportList = lazy(() => import('./pages/admin/ReportList').then(m => ({ default: m.ReportList })))
const PopularKeywordList = lazy(() => import('./pages/admin/PopularKeywordList').then(m => ({ default: m.PopularKeywordList })))
const NotificationList = lazy(() => import('./pages/admin/NotificationList').then(m => ({ default: m.NotificationList })))
const DummyReply = lazy(() => import('./pages/admin/DummyReply').then(m => ({ default: m.DummyReply })))

// Loading spinner component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
    </div>
  )
}

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
            <NewUserWelcomeModal />
            <Suspense fallback={<PageLoader />}>
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
            </Suspense>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  )
}

export default App
