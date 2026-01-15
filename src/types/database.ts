export type ThreadCategory = 'todays_meal' | 'food_recipe' | 'treatment' | 'exercise_lifestyle' | 'mental_concerns' | 'complications_prevention' | 'chat_other'
export type ArticleCategory = ThreadCategory
export type DiabetesType = 'type1' | 'type2' | 'gestational' | 'prediabetes' | 'family' | null
export type TreatmentType = 'insulin' | 'insulin_pump' | 'oral_medication' | 'glp1' | 'diet_therapy' | 'exercise_therapy' | 'observation'
export type UserRole = 'user' | 'admin'
export type ThreadStatus = 'normal' | 'hidden' | 'locked'
export type ThreadMode = 'normal' | 'diary'
export type CommentStatus = 'visible' | 'hidden'
export type AgeGroup = '10s' | '20s' | '30s' | '40s' | '50s' | '60s' | '70s_plus' | 'private'
export type Gender = 'male' | 'female' | 'other' | 'private'
export type IllnessDuration = 'less_than_1' | '1_to_3' | '3_to_5' | '5_to_10' | '10_plus'
export type DeviceType = 'libre' | 'dexcom' | 'insulin_pump' | 'meter_only' | 'none' | 'other'
export type YesNoPrivate = 'yes' | 'no' | 'private'
export type ReportReason = 'spam' | 'harassment' | 'medical_misinformation' | 'other'
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed'
export type ReportTargetType = 'thread' | 'comment' | 'diary_entry' | 'user'
export type AdminNotificationType = 'new_comment' | 'new_thread' | 'report'

// Legacy aliases
export type UserTag = DiabetesType
export type TreatmentTag = TreatmentType

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          username: string
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          role: UserRole
          diabetes_type: DiabetesType
          treatments: TreatmentType[] | null
          diagnosis_year: number | null
          is_pregnant: boolean
          is_on_dialysis: boolean
          has_complications: boolean
          is_tags_public: boolean
          is_frozen: boolean
          is_dummy: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: UserRole
          diabetes_type?: DiabetesType
          treatments?: TreatmentType[] | null
          diagnosis_year?: number | null
          is_pregnant?: boolean
          is_on_dialysis?: boolean
          has_complications?: boolean
          is_tags_public?: boolean
          is_frozen?: boolean
          is_dummy?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: UserRole
          diabetes_type?: DiabetesType
          treatments?: TreatmentType[] | null
          diagnosis_year?: number | null
          is_pregnant?: boolean
          is_on_dialysis?: boolean
          has_complications?: boolean
          is_tags_public?: boolean
          is_frozen?: boolean
          is_dummy?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      hba1c_records: {
        Row: {
          id: string
          user_id: string
          record_month: string
          value: number
          memo: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          record_month: string
          value: number
          memo?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          record_month?: string
          value?: number
          memo?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      articles: {
        Row: {
          id: string
          slug: string
          title: string
          excerpt: string | null
          content: string
          thumbnail_url: string | null
          category: ArticleCategory
          tags: string[] | null
          is_published: boolean
          is_featured: boolean
          featured_order: number
          view_count: number
          published_at: string | null
          created_at: string
          updated_at: string
          author_id: string | null
        }
        Insert: {
          id?: string
          slug: string
          title: string
          excerpt?: string | null
          content: string
          thumbnail_url?: string | null
          category: ArticleCategory
          tags?: string[] | null
          is_published?: boolean
          is_featured?: boolean
          featured_order?: number
          view_count?: number
          published_at?: string | null
          created_at?: string
          updated_at?: string
          author_id?: string | null
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          excerpt?: string | null
          content?: string
          thumbnail_url?: string | null
          category?: ArticleCategory
          tags?: string[] | null
          is_published?: boolean
          is_featured?: boolean
          featured_order?: number
          view_count?: number
          published_at?: string | null
          created_at?: string
          updated_at?: string
          author_id?: string | null
        }
      }
      threads: {
        Row: {
          id: string
          thread_number: number
          user_id: string
          title: string
          content: string
          category: ThreadCategory
          status: ThreadStatus
          comments_count: number
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          thread_number?: number
          user_id: string
          title: string
          content: string
          category: ThreadCategory
          status?: ThreadStatus
          comments_count?: number
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          thread_number?: number
          user_id?: string
          title?: string
          content?: string
          category?: ThreadCategory
          status?: ThreadStatus
          comments_count?: number
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      thread_comments: {
        Row: {
          id: string
          thread_id: string
          user_id: string
          content: string
          status: CommentStatus
          comment_number: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          thread_id: string
          user_id: string
          content: string
          status?: CommentStatus
          comment_number?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          thread_id?: string
          user_id?: string
          content?: string
          status?: CommentStatus
          comment_number?: number
          created_at?: string
          updated_at?: string
        }
      }
      ng_words: {
        Row: {
          id: string
          word: string
          created_at: string
        }
        Insert: {
          id?: string
          word: string
          created_at?: string
        }
        Update: {
          id?: string
          word?: string
          created_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          category: 'daily' | 'recipe' | 'exercise' | 'medical' | 'question' | 'other'
          likes_count: number
          comments_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          category: 'daily' | 'recipe' | 'exercise' | 'medical' | 'question' | 'other'
          likes_count?: number
          comments_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          category?: 'daily' | 'recipe' | 'exercise' | 'medical' | 'question' | 'other'
          likes_count?: number
          comments_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          role: UserRole
          display_name: string | null
          avatar_url: string | null
          is_dummy: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: UserRole
          display_name?: string | null
          avatar_url?: string | null
          is_dummy?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: UserRole
          display_name?: string | null
          avatar_url?: string | null
          is_dummy?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      thread_category: ThreadCategory
      article_category: ArticleCategory
      diabetes_type: DiabetesType
      treatment_type: TreatmentType
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type AppUser = Database['public']['Tables']['users']['Row']
export type HbA1cRecord = Database['public']['Tables']['hba1c_records']['Row']
export type Article = Database['public']['Tables']['articles']['Row']
export type Thread = Database['public']['Tables']['threads']['Row']
export type ThreadComment = Database['public']['Tables']['thread_comments']['Row']
export type NgWord = Database['public']['Tables']['ng_words']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type Like = Database['public']['Tables']['likes']['Row']

// Search log for popular keywords
export interface SearchLog {
  id: string
  keyword: string
  user_id: string | null
  created_at: string
}

// Popular keywords (manual)
export interface PopularKeyword {
  id: string
  keyword: string
  display_order: number
  is_active: boolean
  created_at: string
}

// Thread with user profile
export interface ThreadWithUser extends Thread {
  profiles: Pick<Profile, 'display_name' | 'diabetes_type' | 'treatments'>
}

// Thread comment with user profile
export interface ThreadCommentWithUser extends ThreadComment {
  profiles: Pick<Profile, 'display_name' | 'diabetes_type' | 'treatments'>
  threads?: Pick<Thread, 'id' | 'title'>
}

// Category labels
export const THREAD_CATEGORY_LABELS: Record<ThreadCategory, string> = {
  todays_meal: '🔥 今日のごはん',
  food_recipe: '食事・レシピ',
  treatment: '治療・通院',
  exercise_lifestyle: '運動・生活',
  mental_concerns: 'メンタル・悩み',
  complications_prevention: '合併症・予防',
  chat_other: '雑談・その他',
}

// Category colors for badges
export const THREAD_CATEGORY_COLORS: Record<ThreadCategory, string> = {
  todays_meal: 'bg-amber-100 text-amber-700',
  food_recipe: 'bg-orange-100 text-orange-700',
  treatment: 'bg-blue-100 text-blue-700',
  exercise_lifestyle: 'bg-green-100 text-green-700',
  mental_concerns: 'bg-pink-100 text-pink-700',
  complications_prevention: 'bg-red-100 text-red-700',
  chat_other: 'bg-gray-100 text-gray-700',
}

// Article category labels
export const ARTICLE_CATEGORY_LABELS: Record<ArticleCategory, string> = THREAD_CATEGORY_LABELS

// Diabetes type labels
export const DIABETES_TYPE_LABELS: Record<NonNullable<DiabetesType>, string> = {
  type1: '1型糖尿病',
  type2: '2型糖尿病',
  gestational: '妊娠糖尿病',
  prediabetes: '糖尿病予備群',
  family: '家族・サポーター',
}

// Short diabetes type labels
export const DIABETES_TYPE_SHORT_LABELS: Record<NonNullable<DiabetesType>, string> = {
  type1: '1型',
  type2: '2型',
  gestational: '妊娠糖尿病',
  prediabetes: '予備群',
  family: '家族',
}

// Treatment type labels
export const TREATMENT_TYPE_LABELS: Record<TreatmentType, string> = {
  insulin: 'インスリン注射',
  insulin_pump: 'インスリンポンプ',
  oral_medication: '経口薬（飲み薬）',
  glp1: 'GLP-1受容体作動薬（注射）',
  diet_therapy: '食事療法',
  exercise_therapy: '運動療法',
  observation: '経過観察中',
}

// Legacy aliases
export const USER_TAG_LABELS = DIABETES_TYPE_SHORT_LABELS
export const TREATMENT_TAG_LABELS: Record<TreatmentType, string> = {
  insulin: 'インスリン',
  insulin_pump: 'ポンプ',
  oral_medication: '経口薬',
  glp1: 'GLP-1',
  diet_therapy: '食事療法',
  exercise_therapy: '運動療法',
  observation: '経過観察',
}

// Thread status labels
export const THREAD_STATUS_LABELS: Record<ThreadStatus, string> = {
  normal: '通常',
  hidden: '非表示',
  locked: 'ロック',
}

// Comment status labels
export const COMMENT_STATUS_LABELS: Record<CommentStatus, string> = {
  visible: '表示中',
  hidden: '非表示',
}

// User role labels
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  user: 'ユーザー',
  admin: '管理者',
}

// Thread mode labels
export const THREAD_MODE_LABELS: Record<ThreadMode, string> = {
  normal: '通常モード',
  diary: '日記モード',
}

// Age group labels
export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  '10s': '10代',
  '20s': '20代',
  '30s': '30代',
  '40s': '40代',
  '50s': '50代',
  '60s': '60代',
  '70s_plus': '70代以上',
  'private': '非公開',
}

// Gender labels
export const GENDER_LABELS: Record<Gender, string> = {
  male: '男性',
  female: '女性',
  other: 'その他',
  private: '非公開',
}

// Illness duration labels
export const ILLNESS_DURATION_LABELS: Record<IllnessDuration, string> = {
  less_than_1: '1年未満',
  '1_to_3': '1〜3年',
  '3_to_5': '3〜5年',
  '5_to_10': '5〜10年',
  '10_plus': '10年以上',
}

// Device type labels
export const DEVICE_TYPE_LABELS: Record<DeviceType, string> = {
  libre: 'FreeStyleリブレ',
  dexcom: 'Dexcom',
  insulin_pump: 'インスリンポンプ',
  meter_only: '血糖測定器のみ',
  none: '使用していない',
  other: 'その他',
}

// Yes/No/Private labels
export const YES_NO_PRIVATE_LABELS: Record<YesNoPrivate, string> = {
  yes: 'あり',
  no: 'なし',
  private: '非公開',
}

// Report reason labels
export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  spam: 'スパム・宣伝',
  harassment: '誹謗中傷',
  medical_misinformation: '不適切な医療情報',
  other: 'その他',
}

// Report status labels
export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  pending: '未対応',
  reviewed: '確認中',
  resolved: '対応済み',
  dismissed: '却下',
}

// Prefecture list
export const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
] as const

// Diary entry interface
export interface DiaryEntry {
  id: string
  thread_id: string
  user_id: string
  content: string
  image_url: string | null
  image_urls: string[]
  created_at: string
  updated_at: string
}

// Report interface
export interface Report {
  id: string
  reporter_id: string
  target_type: ReportTargetType
  target_id: string
  reason: ReportReason
  description: string | null
  status: ReportStatus
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}

// External link interface
export interface ExternalLink {
  title: string
  url: string
}

// Admin notification interface
export interface AdminNotification {
  id: string
  type: AdminNotificationType
  thread_id: string
  comment_id: string | null
  user_id: string
  message: string
  is_read: boolean
  created_at: string
  // Joined data
  threads?: Pick<Thread, 'id' | 'title'>
  users?: { display_name: string | null; is_dummy: boolean }
}

// Extended user profile interface
export interface ExtendedUserProfile {
  user_id: string
  diabetes_type: DiabetesType
  diagnosis_year: number | null
  bio: string | null
  age_group: AgeGroup | null
  gender: Gender | null
  prefecture: string | null
  illness_duration: IllnessDuration | null
  treatment_methods: TreatmentType[] | null
  device: DeviceType | null
  has_complications: YesNoPrivate
  on_dialysis: YesNoPrivate
  is_pregnant: YesNoPrivate
  external_links: ExternalLink[]
  // Public flags - default values noted in comments
  age_group_public: boolean      // default: false
  gender_public: boolean         // default: false
  prefecture_public: boolean     // default: false
  illness_duration_public: boolean // default: true
  treatment_public: boolean      // default: true
  device_public: boolean         // default: true
  bio_public: boolean            // default: true
  hba1c_public: boolean          // default: false
  links_public: boolean          // default: true
}

// User block interface
export interface UserBlock {
  id: string
  blocker_id: string
  blocked_id: string
  created_at: string
}

// Notification types
export type NotificationType = 'thread_comment' | 'reply' | 'like' | 'profile_comment'

// User notification interface
export interface UserNotification {
  id: string
  user_id: string
  from_user_id: string | null
  from_user_name: string | null
  type: NotificationType
  title: string
  message: string | null
  link: string | null
  is_read: boolean
  created_at: string
}

// Notification settings interface
export interface NotificationSettings {
  user_id: string
  thread_comment: boolean
  reply: boolean
  likes: boolean
  profile_comment: boolean
  email_enabled: boolean
}
