export const SITUATIONS = [
  {
    id: 'cafe-order',
    title: 'Cafe Coffee Order',
    titleJa: 'カフェでの注文',
    category: 'Daily',
    icon: 'Coffee',
    difficulty: 'Beginner',
    systemRole: 'Friendly Barista at "Green Mountain Coffee"',
    userRole: 'Customer wanting to order a coffee and a pastry',
    description: 'Order your favorite drink, specify size/milk preference, and pay.',
    descriptionJa: 'お気に入りのドリンクの注文、ミルクやサイズの指定、会計を行います。',
    initialMessage: "Hi there! Welcome to Green Mountain Coffee. What can I get started for you today?",
    goals: [
      'Order a drink with specific modifications (e.g. oat milk, extra shot)',
      'Order something to eat',
      'Ask for the price and pay'
    ]
  },
  {
    id: 'airport-checkin',
    title: 'Airport Check-In',
    titleJa: '空港でのチェックイン',
    category: 'Travel',
    icon: 'Plane',
    difficulty: 'Beginner',
    systemRole: 'Airline Gate Agent at SkyWay Airlines',
    userRole: 'Passenger checking in for an international flight to New York',
    description: 'Show your passport, check your luggage, and request a window seat.',
    descriptionJa: 'パスポートの提示、受託手荷物の預け入れ、座席（窓側など）のリクエストを行います。',
    initialMessage: "Good morning! Welcome to SkyWay Airlines. May I see your passport and booking reference, please?",
    goals: [
      'Present passport and booking details',
      'Check in luggage',
      'Request seat preference (Window or Aisle)'
    ]
  },
  {
    id: 'hotel-checkin',
    title: 'Hotel Check-In & Request',
    titleJa: 'ホテルチェックインと要望',
    category: 'Travel',
    icon: 'Building',
    difficulty: 'Intermediate',
    systemRole: 'Front Desk Manager at Grand Horizon Hotel',
    userRole: 'Guest checking in and requesting a quiet high-floor room with extra towels',
    description: 'Complete check-in process, ask about breakfast time, and make special requests.',
    descriptionJa: 'チェックイン手続き、朝食時間・Wi-Fiパスワードの確認、高層階のリクエストを行います。',
    initialMessage: "Welcome to the Grand Horizon Hotel. How may I assist you this afternoon?",
    goals: [
      'Give reservation name & check-in',
      'Inquire about breakfast hours and Wi-Fi',
      'Request a high floor or quiet room'
    ]
  },
  {
    id: 'business-meeting',
    title: 'Project Status Update',
    titleJa: 'ビジネスプロジェクト進捗会議',
    category: 'Business',
    icon: 'Briefcase',
    difficulty: 'Intermediate',
    systemRole: 'Project Manager (Alex) reviewing quarterly milestone progress',
    userRole: 'Lead Developer reporting progress and raising a small budget issue',
    description: 'Give a brief update on your tasks, discuss roadblocks, and negotiate timeline.',
    descriptionJa: '担当タスクの進捗報告、課題・ボトルネックの共有、スケジュール交渉を行います。',
    initialMessage: "Thanks for joining, everyone. Let's start with our tech status. Could you give us a quick update on your team's milestone?",
    goals: [
      'Summarize recent accomplishments clearly',
      'Explain a current technical issue or delay',
      'Propose a practical timeline adjustment'
    ]
  },
  {
    id: 'job-interview',
    title: 'Job Interview Simulation',
    titleJa: '英語ジョブインタビュー（採用面接）',
    category: 'Business',
    icon: 'Award',
    difficulty: 'Advanced',
    systemRole: 'Senior Hiring Manager evaluating a candidate for a Global Marketing/Tech Role',
    userRole: 'Job Applicant highlighting experience, strengths, and handling behavioral questions',
    description: 'Answer background questions, explain a past challenge, and ask smart questions.',
    descriptionJa: '自己紹介、過去の困難の克服経験（STAR法）、逆質問に応答します。',
    initialMessage: "Thank you for coming in today. To kick things off, could you tell me a little bit about yourself and why you're interested in this position?",
    goals: [
      'Give a concise 1-minute self-introduction',
      'Describe a past challenge and how you solved it',
      'Ask 1-2 insightful questions about team culture or strategy'
    ]
  },
  {
    id: 'free-talk',
    title: 'Free Talk & Friendly Chat',
    titleJa: '自由なフリートーク',
    category: 'Casual',
    icon: 'MessageSquare',
    difficulty: 'Casual',
    systemRole: 'Friendly, encouraging conversational partner who loves travel, technology, movies, and food',
    userRole: 'Conversationalist sharing thoughts and asking questions',
    description: 'Enjoy open-ended conversation about your hobbies, weekend plans, or any topic.',
    descriptionJa: '趣味や旅行、映画、日常の出来事について自由にディスカッションします。',
    initialMessage: "Hey there! Great to chat with you today. How has your week been going so far?",
    goals: [
      'Share what you did recently or your weekend plans',
      'Ask the AI a question about a favorite topic',
      'Keep the conversation flowing smoothly'
    ]
  }
];

export const DIFFICULTY_COLORS = {
  Beginner: 'badge-green',
  Intermediate: 'badge-yellow',
  Advanced: 'badge-purple',
  Casual: 'badge-blue'
};
