// Preset topic lists for random shadowing scenario generation
export const RANDOM_SHADOWING_TOPICS = [
  // Daily Life
  'カフェでの注文とカスタマイズ (Ordering and customizing a drink at a coffee shop)',
  'アパートの賃貸内見の問い合わせ (Inquiring about an apartment viewing)',
  'スーパーで珍しい食材の場所を尋ねる (Asking staff for items at a grocery store)',
  '同僚と週末の予定や趣味について語る (Chatting with a coworker about weekend plans)',
  '地元のジムに入会する際の手続き (Signing up for a local fitness gym)',
  '人気のレストランのテーブル予約 (Reserving a table at a popular restaurant)',
  'タクシーで行き先とルートを指定する (Giving routing directions to a taxi driver)',

  // Travel & Living Abroad
  '空港カウンターでのチェックインと荷物預け (Airport check-in and baggage drop)',
  '飛行機の遅延に関するカスタマーサポート対応 (Handling a flight delay at customer service)',
  'ホテルの部屋のアップグレードを交渉する (Requesting a hotel room upgrade at check-in)',
  '海外のレンタカー手続きと返却確認 (Renting and checking returning conditions for a car)',
  'ロスバゲ（ロストバゲージ）の捜索手続き (Filing a lost luggage report at the baggage claim)',
  '海外の駅で電車チケットと乗換を確認 (Buying train tickets and double-checking transfers)',

  // Business & Career
  '新製品の魅力とポイントを短いプレゼン (Pitching a new product feature in a short meeting)',
  'チームミーティングでの進捗報告 (Giving a quick weekly progress update to your team)',
  '英語での面接：自身の強みと実績のアピール (Answering job interview questions about key strengths)',
  'クライアントとのキックオフミーティング挨拶 (Opening a kickoff meeting with new clients)',
  'プロジェクトの締め切り延期を上司に相談 (Discussing deadline adjustments with your manager)',
  'オンライン会議のスケジュール調整 (Coordinating a multi-timezone conference call)',

  // Life Troubles & Support
  'アパートの水漏れ修理を管理人に依頼 (Reporting a water leak to the property manager)',
  '海外のクリニックで体調不良症状を伝える (Describing illness symptoms to a doctor at a clinic)',
  '購入した不良品の返品・返金交渉 (Requesting a refund or exchange for a damaged product)',
  '銀行口座の開設とデビットカード発行 (Opening a local bank account and requesting a debit card)',
  'インターネット接続トラブルの問い合わせ (Troubleshooting home WiFi issues with tech support)',

  // Trends, Culture & Topics
  'AIがもたらす将来の働き方の変化 (Discussing how AI is changing future workplaces)',
  'リモートワークの効率化と集中メソッド (Sharing tips for staying productive while working remotely)',
  '持続可能な環境配慮（エコ）ライフスタイル (Talking about sustainable habits and eco-friendly choices)',
  'お気に入りの映画・本のおすすめ理由 (Recommending a favorite movie or book with enthusiasm)',
  'コーヒーの美味しい淹れ方とこだわり (Explaining coffee brewing methods and bean preferences)',
  '今までで一番感動した旅の思い出 (Sharing unforgettable travel memories and discoveries)'
];

export const POPULAR_TOPIC_CHIPS = [
  { label: '☕ カフェ注文', topic: 'カフェでの注文とカスタマイズ' },
  { label: '✈️ 空港・旅行', topic: '空港カウンターでのチェックインと荷物預け' },
  { label: '💼 仕事のプレゼン', topic: '新製品の魅力とポイントを短いプレゼン' },
  { label: '🏨 ホテル手続き', topic: 'ホテルの部屋のアップグレードを交渉する' },
  { label: '🩺 病院受診', topic: '海外のクリニックで体調不良症状を伝える' },
  { label: '🤖 AIと働き方', topic: 'AIがもたらす将来の働き方の変化' }
];

export function getRandomShadowingTopic() {
  const randomIndex = Math.floor(Math.random() * RANDOM_SHADOWING_TOPICS.length);
  return RANDOM_SHADOWING_TOPICS[randomIndex];
}
