/**
 * meal-images-mapping.json を Storage アップロード準備用に拡張
 *
 * 追加フィールド:
 * - storage_path: Storage内のパス
 * - public_url: アップロード後に埋める公開URL
 * - assigned_user_id: 割り当てユーザーID
 * - assigned_user_name: 割り当てユーザー名
 * - caption: 投稿キャプション
 * - tags: タグ配列
 * - posted_at: 投稿日時
 * - blood_sugar_after: 食後血糖値（任意）
 */

import fs from 'fs'

const SUPABASE_URL = 'https://josanlblwfjdaaezqbnw.supabase.co'
const STORAGE_BUCKET = 'images'
const STORAGE_PATH_PREFIX = 'meal-posts'

// 既存JSONを読み込み
const inputPath = '/Users/koji/diabeteslife-nextjs/scripts/meal-images-mapping.json'
const outputPath = '/Users/koji/diabeteslife-nextjs/scripts/meal-posts-ready.json'

const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'))

console.log('=== meal_posts 投入準備データ作成 ===\n')
console.log('元ファイル:', inputPath)
console.log('画像数:', data.images.length)

// ファイル名の正規化（スペースや特殊文字を処理）
function normalizeFileName(fileName) {
  // そのまま使う（Supabaseは日本語やスペースも対応）
  // ただし衝突回避のため連番は不要（ファイル名がユニーク）
  return fileName
}

// storage_path を生成
function generateStoragePath(fileName) {
  const normalized = normalizeFileName(fileName)
  return `${STORAGE_PATH_PREFIX}/${normalized}`
}

// public_url を生成（アップロード後に使用）
function generatePublicUrl(storagePath) {
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${storagePath}`
}

// 各画像エントリを拡張
const extendedImages = data.images.map((img, index) => {
  const storagePath = generateStoragePath(img.file_name)

  return {
    // 元データ
    id: index + 1,
    file_name: img.file_name,
    local_path: `/Users/koji/Desktop/Dライフ画像/${img.file_name}`,
    category: img.category,
    mood_style: img.mood_style,
    comment_pool: img.comment_pool,
    note: img.note,

    // Storage関連（アップロード前は null）
    storage_path: storagePath,
    public_url: null, // アップロード後に埋める
    uploaded: false,

    // meal_posts用（ユーザー割り当て後に埋める）
    assigned_user_id: null,
    assigned_user_name: null,
    caption: null,
    tags: [],
    blood_sugar_after: null,
    posted_at: null,

    // 投入状態管理
    inserted: false,
    meal_post_id: null
  }
})

// 拡張データを作成
const extendedData = {
  metadata: {
    ...data.metadata,
    extended_at: new Date().toISOString(),
    purpose: 'Dライフ meal_posts 投入準備データ',
    supabase_url: SUPABASE_URL,
    storage_bucket: STORAGE_BUCKET,
    storage_path_prefix: STORAGE_PATH_PREFIX,
    workflow: [
      '1. 画像を Supabase Storage にアップロード',
      '2. public_url を埋める',
      '3. ユーザー割り当て（assigned_user_id, assigned_user_name）',
      '4. caption, tags, posted_at を生成',
      '5. meal_posts に INSERT'
    ]
  },
  category_labels: data.category_labels,
  mood_styles: data.mood_styles,
  comment_pools: data.comment_pools,

  // 集計情報
  summary: {
    total_images: extendedImages.length,
    uploaded: 0,
    assigned: 0,
    inserted: 0,
    by_category: {}
  },

  images: extendedImages
}

// カテゴリ別集計
for (const img of extendedImages) {
  const cat = img.category
  extendedData.summary.by_category[cat] = (extendedData.summary.by_category[cat] || 0) + 1
}

// 保存
fs.writeFileSync(outputPath, JSON.stringify(extendedData, null, 2))

console.log('\n=== 拡張完了 ===')
console.log('出力ファイル:', outputPath)
console.log('\n【追加フィールド】')
console.log('  - storage_path: Storage内パス')
console.log('  - public_url: 公開URL（アップロード後）')
console.log('  - assigned_user_id: 割り当てユーザーID')
console.log('  - assigned_user_name: 割り当てユーザー名')
console.log('  - caption: キャプション')
console.log('  - tags: タグ配列')
console.log('  - posted_at: 投稿日時')
console.log('  - blood_sugar_after: 食後血糖値')

console.log('\n【サンプル】')
console.log(JSON.stringify(extendedImages[0], null, 2))

console.log('\n✅ 準備完了')
