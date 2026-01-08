export type ThreadCategory = 'health' | 'lifestyle' | 'work' | 'food' | 'exercise' | 'other'
export type ArticleCategory = 'health' | 'lifestyle' | 'food' | 'exercise' | 'medical' | 'other'
export type DiabetesType = 'type1' | 'type2' | 'gestational' | 'prediabetes' | 'family' | null
export type TreatmentType = 'insulin' | 'oral_medication' | 'diet_only' | 'pump' | 'cgm'
export type UserRole = 'user' | 'admin'
export type ThreadStatus = 'normal' | 'hidden' | 'locked'
export type CommentStatus = 'visible' | 'hidden'

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
          view_count: number
          published_at: string | null
          created_at: string
          updated_at: string
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
          view_count?: number
          published_at?: string | null
          created_at?: string
          updated_at?: string
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
          view_count?: number
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      threads: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          category: ThreadCategory
          status: ThreadStatus
          comments_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          category: ThreadCategory
          status?: ThreadStatus
          comments_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          category?: ThreadCategory
          status?: ThreadStatus
          comments_count?: number
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
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: UserRole
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: UserRole
          display_name?: string | null
          avatar_url?: string | null
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
  health: '健康',
  lifestyle: '生活',
  work: '仕事',
  food: '食事',
  exercise: '運動',
  other: 'その他',
}

// Article category labels
export const ARTICLE_CATEGORY_LABELS: Record<ArticleCategory, string> = {
  health: '健康',
  lifestyle: '生活',
  food: '食事',
  exercise: '運動',
  medical: '医療',
  other: 'その他',
}

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
  oral_medication: '経口薬（飲み薬）',
  diet_only: '食事療法のみ',
  pump: 'インスリンポンプ',
  cgm: 'CGM/FGM使用',
}

// Legacy aliases
export const USER_TAG_LABELS = DIABETES_TYPE_SHORT_LABELS
export const TREATMENT_TAG_LABELS: Record<TreatmentType, string> = {
  insulin: 'インスリン',
  oral_medication: '経口薬',
  diet_only: '食事療法',
  pump: 'ポンプ',
  cgm: 'CGM',
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
