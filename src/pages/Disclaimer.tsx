import { Link } from 'react-router-dom'
import { AlertTriangle, Phone, Stethoscope, Users, FileWarning } from 'lucide-react'

export function Disclaimer() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">医療情報に関する免責事項</h1>

      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-8">
        <p className="text-rose-700 font-medium">
          Dライフをご利用いただく前に、必ずお読みください。
        </p>
      </div>

      <div className="space-y-4">
        {/* Section 1 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
              <Stethoscope size={20} className="text-rose-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">本サービスは医療機関ではありません</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            Dライフは、糖尿病患者とその家族が情報交換を行うコミュニティサイトです。
          </p>
          <p className="text-gray-700 leading-relaxed mt-2">
            本サービスで提供される情報は、<span className="font-bold text-rose-600">医師による診断・治療・医療アドバイスの代わりにはなりません。</span>
          </p>
        </div>

        {/* Section 2 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
              <Stethoscope size={20} className="text-rose-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">医療上の判断は必ず医師にご相談ください</h2>
          </div>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-rose-500 mt-1">•</span>
              <span>治療方法の変更</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 mt-1">•</span>
              <span>薬の服用・中止</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 mt-1">•</span>
              <span>食事療法・運動療法の開始</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 mt-1">•</span>
              <span>体調の異変</span>
            </li>
          </ul>
          <p className="text-gray-700 mt-4 font-medium">
            これらについては、必ず主治医または医療専門家にご相談ください。
          </p>
        </div>

        {/* Section 3 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-rose-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">投稿内容について</h2>
          </div>
          <p className="text-gray-700 mb-3">
            本サービスに投稿される情報は、ユーザー個人の体験や意見です。
          </p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-1">⚠</span>
              <span>医学的に正確でない情報が含まれる可能性があります</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-1">⚠</span>
              <span>個人の体験が他の方に当てはまるとは限りません</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-1">⚠</span>
              <span>投稿内容の正確性・有用性について、当社は保証しません</span>
            </li>
          </ul>
        </div>

        {/* Emergency Section */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
              <Phone size={20} className="text-white" />
            </div>
            <h2 className="text-lg font-bold text-amber-700">緊急時の対応</h2>
          </div>
          <p className="text-amber-700 leading-relaxed">
            低血糖、高血糖、その他緊急を要する症状がある場合は、本サービスではなく、
            <span className="font-bold">すぐに医療機関を受診するか、救急車（119番）を呼んでください。</span>
          </p>
        </div>

        {/* Disclaimer Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
              <FileWarning size={20} className="text-rose-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">免責</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            本サービスの利用により生じた損害について、当社は一切の責任を負いません。
          </p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link to="/" className="text-rose-500 hover:underline text-sm">
          トップページに戻る
        </Link>
      </div>
    </div>
  )
}
