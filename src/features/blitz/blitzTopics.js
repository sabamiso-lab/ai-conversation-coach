/**
 * 瞬間英作文・パターンプラクティス用 プリセットトピック＆問題集データ
 */

export const PRESET_BLITZ_TOPICS = [
  {
    id: 'grammar-foundations',
    title: '基礎構文パターン',
    titleJa: 'Grammar Foundations',
    category: 'Grammar',
    difficulty: 'Intermediate',
    icon: 'Zap',
    description: '助動詞 (should/could)、関係代名詞、仮定法など、英会話の核となる構文の即答トレーニング',
    questions: [
      {
        id: 'gf-1',
        prompt: 'もっと早く起きるべきでした。',
        answer: 'I should have woken up earlier.',
        acceptedAnswers: ['I should have gotten up earlier.', 'I ought to have woken up earlier.'],
        explanation: '「〜すべきだった」は <should have + 過去分詞> を使います。',
        grammarPoint: 'should have + p.p.'
      },
      {
        id: 'gf-2',
        prompt: 'もし時間があれば、一緒に行けるのに。',
        answer: 'If I had time, I could go with you.',
        acceptedAnswers: ['If I have time, I could go with you.', 'If I had time, I would go with you.'],
        explanation: '現在の事実と異なる願望は仮定法過去 <If + 過去形, would/could + 動詞原形>。',
        grammarPoint: '仮定法過去'
      },
      {
        id: 'gf-3',
        prompt: '昨日私が買った本はとても面白かったです。',
        answer: 'The book that I bought yesterday was very interesting.',
        acceptedAnswers: ['The book I bought yesterday was very interesting.', 'The book which I bought yesterday was very interesting.'],
        explanation: '目的格の関係代名詞 that / which は省略可能です。',
        grammarPoint: '関係代名詞'
      },
      {
        id: 'gf-4',
        prompt: '彼は私が思っていたよりずっと背が高い。',
        answer: 'He is much taller than I thought.',
        acceptedAnswers: ['He is much taller than I expected.', 'He is way taller than I thought.'],
        explanation: '比較級の強調には much や way を使います。',
        grammarPoint: '比較級の強調 (much / way)'
      },
      {
        id: 'gf-5',
        prompt: '明日の会議に遅れないように気をつけてね。',
        answer: 'Be careful not to be late for tomorrow\'s meeting.',
        acceptedAnswers: ['Make sure not to be late for the meeting tomorrow.', 'Take care not to be late for tomorrow\'s meeting.'],
        explanation: '<be careful not to + 動詞原形> で「〜しないよう気をつける」。',
        grammarPoint: '否定の不定詞 (not to do)'
      },
      {
        id: 'gf-6',
        prompt: 'その問題について心配する必要はありません。',
        answer: 'You don\'t need to worry about that issue.',
        acceptedAnswers: ['You don\'t have to worry about that problem.', 'There is no need to worry about the problem.'],
        explanation: '<don\'t need to do / don\'t have to do> で「〜する必要はない」。',
        grammarPoint: '必要性の否定'
      },
      {
        id: 'gf-7',
        prompt: '彼女が何と言おうと、私は自分のやり方でやります。',
        answer: 'No matter what she says, I will do it my way.',
        acceptedAnswers: ['Whatever she says, I\'ll do it my way.', 'No matter what she says, I\'m going to do it my way.'],
        explanation: '<No matter what ~> や <Whatever ~> で「何が〜でも」。',
        grammarPoint: '複合関係代名詞'
      },
      {
        id: 'gf-8',
        prompt: 'プロジェクトを完了するのに3日かかりました。',
        answer: 'It took me three days to complete the project.',
        acceptedAnswers: ['It took three days for me to complete the project.', 'I took three days to finish the project.'],
        explanation: '<It takes 人 時間 to do> で「人が〜するのに時間がかかる」。',
        grammarPoint: 'It takes 人 時間 to do'
      },
      {
        id: 'gf-9',
        prompt: '窓を開けていただいてもよろしいですか？',
        answer: 'Would you mind opening the window?',
        acceptedAnswers: ['Could you open the window, please?', 'Would you mind if I opened the window?'],
        explanation: '<Would you mind + 動詞-ing?> は非常に丁寧な依頼です。',
        grammarPoint: 'Would you mind ~ing?'
      },
      {
        id: 'gf-10',
        prompt: '私は子供の頃、ここでよく遊んだものだ。',
        answer: 'I used to play here when I was a child.',
        acceptedAnswers: ['I would often play here when I was a kid.', 'I used to play here when I was young.'],
        explanation: '過去の規則的な習慣・状態を表す <used to + 動詞原形>。',
        grammarPoint: 'used to (過去の習慣)'
      }
    ]
  },
  {
    id: 'business-quick-response',
    title: 'ビジネス即レス会話',
    titleJa: 'Business Quick Response',
    category: 'Business',
    difficulty: 'Intermediate',
    icon: 'Briefcase',
    description: '仕事の進捗共有、提案、日程調整、確認で使える実践フレーズ',
    questions: [
      {
        id: 'bq-1',
        prompt: 'これについて明日までに確認していただけますか？',
        answer: 'Could you please check this by tomorrow?',
        acceptedAnswers: ['Could you check this by tomorrow?', 'Can you verify this by tomorrow?'],
        explanation: '<by tomorrow> は「明日までに（期限）」。<until tomorrow> との区別に注意。',
        grammarPoint: '期限の by'
      },
      {
        id: 'bq-2',
        prompt: '進捗状況を教えていただけますか？',
        answer: 'Could you give me an update on the progress?',
        acceptedAnswers: ['How is the progress going?', 'Could you update me on the progress?'],
        explanation: '<give someone an update on ~> はビジネスでの定番表現です。',
        grammarPoint: 'An update on ~'
      },
      {
        id: 'bq-3',
        prompt: 'ご質問がありましたら、お気軽にお問い合わせください。',
        answer: 'If you have any questions, please feel free to contact us.',
        acceptedAnswers: ['Please feel free to ask if you have any questions.', 'Don\'t hesitate to reach out if you have questions.'],
        explanation: '<feel free to do> は「遠慮なく〜する」。',
        grammarPoint: 'feel free to do'
      },
      {
        id: 'bq-4',
        prompt: '来週の火曜日にミーティングを延期することは可能ですか？',
        answer: 'Is it possible to postpone the meeting to next Tuesday?',
        acceptedAnswers: ['Could we reschedule the meeting for next Tuesday?', 'Is it possible to move the meeting to next Tuesday?'],
        explanation: '延期する: postpone / push back / move to',
        grammarPoint: 'Is it possible to ~?'
      },
      {
        id: 'bq-5',
        prompt: 'ご提案いただいた件、承知いたしました。',
        answer: 'Understood regarding your proposal.',
        acceptedAnswers: ['I understand your proposal.', 'Sounds good regarding your proposal.', 'We agree with your suggestion.'],
        explanation: '<Understood regarding ~> または <I understand your proposal.>',
        grammarPoint: 'ビジネスの承諾'
      },
      {
        id: 'bq-6',
        prompt: '折り返しお電話いたします。',
        answer: 'I will call you back shortly.',
        acceptedAnswers: ['I\'ll call you back soon.', 'I\'ll get back to you by phone.'],
        explanation: '<call back shortly> で「すぐに折り返し電話する」。',
        grammarPoint: 'call back'
      },
      {
        id: 'bq-7',
        prompt: '恐れ入りますが、そのスケジュールには対応できかねます。',
        answer: 'I am afraid I cannot accommodate that schedule.',
        acceptedAnswers: ['Unfortunately, I cannot accommodate that schedule.', 'I\'m sorry, but that schedule doesn\'t work for us.'],
        explanation: '「調整・対応する」には accommodate が適しています。',
        grammarPoint: 'accommodate (調整・対応)'
      },
      {
        id: 'bq-8',
        prompt: '予算の範囲内で進めるよう全力を尽くします。',
        answer: 'We will do our best to stay within budget.',
        acceptedAnswers: ['I\'ll do my best to keep it within the budget.', 'We will try our best to stay within budget.'],
        explanation: '<stay within budget> で「予算内に収める」。',
        grammarPoint: 'stay within budget'
      },
      {
        id: 'bq-9',
        prompt: '詳細を共有していただきありがとうございます。',
        answer: 'Thank you for sharing the details with us.',
        acceptedAnswers: ['Thank you for providing the details.', 'Thanks for sharing the details.'],
        explanation: '<Thank you for -ing> の形。',
        grammarPoint: 'Thank you for -ing'
      },
      {
        id: 'bq-10',
        prompt: 'この件について何か進展はありましたか？',
        answer: 'Has there been any progress on this matter?',
        acceptedAnswers: ['Is there any update on this?', 'Has there been any update on this issue?'],
        explanation: '現在完了形 <Has there been ~?> で継続中の進展を確認。',
        grammarPoint: 'Has there been ~?'
      }
    ]
  },
  {
    id: 'daily-casual-phrases',
    title: '日常会話・即応やり取り',
    titleJa: 'Daily Quick Response',
    category: 'Daily',
    difficulty: 'Beginner',
    icon: 'Smile',
    description: '相槌、感情表現、カフェ・レストラン、友人との会話での自然な即答',
    questions: [
      {
        id: 'dc-1',
        prompt: 'お待たせしてすみません！',
        answer: 'Sorry to keep you waiting!',
        acceptedAnswers: ['Sorry for keeping you waiting!', 'Apologies for making you wait!'],
        explanation: '<Sorry to keep you waiting!> は超頻出。',
        grammarPoint: 'Sorry to keep you waiting'
      },
      {
        id: 'dc-2',
        prompt: '今日はおごるよ！',
        answer: 'It\'s my treat today!',
        acceptedAnswers: ['It\'s on me today!', 'I\'ll pay for today!'],
        explanation: '<It\'s my treat.> や <It\'s on me.> で「私のおごりです」。',
        grammarPoint: 'my treat / on me'
      },
      {
        id: 'dc-3',
        prompt: 'なるほど、そういうことね！',
        answer: 'Ah, that makes sense!',
        acceptedAnswers: ['I see, that makes sense!', 'Oh, I get it now!'],
        explanation: '<That makes sense!> は「道理にかなっている・納得！」の定番。',
        grammarPoint: 'make sense'
      },
      {
        id: 'dc-4',
        prompt: '持ち帰りでアイスカフェラテをお願いします。',
        answer: 'Can I get an iced cafe latte to go, please?',
        acceptedAnswers: ['I\'d like an iced cafe latte for takeaway, please.', 'Can I have an iced latte to go?'],
        explanation: 'テイクアウトは <to go> (米) / <takeaway> (英)。',
        grammarPoint: 'to go / takeaway'
      },
      {
        id: 'dc-5',
        prompt: '気にしないで、大したことじゃないよ。',
        answer: 'Don\'t worry about it, it\'s no big deal.',
        acceptedAnswers: ['Never mind, it\'s no big deal.', 'No problem, it\'s not a big deal.'],
        explanation: '<no big deal> で「大したことない」。',
        grammarPoint: 'no big deal'
      },
      {
        id: 'dc-6',
        prompt: '本当に助かりました！感謝しきれません。',
        answer: 'You really saved me! I can\'t thank you enough.',
        acceptedAnswers: ['You\'re a lifesaver! Thank you so much.', 'I really appreciate it, I can\'t thank you enough.'],
        explanation: '<I can\'t thank you enough.> は深い感謝の表現。',
        grammarPoint: 'can\'t thank someone enough'
      },
      {
        id: 'dc-7',
        prompt: '最近どう？変わりない？',
        answer: 'What have you been up to lately?',
        acceptedAnswers: ['How have you been?', 'What\'s new with you?'],
        explanation: '<What have you been up to?> は親しい間柄での挨拶。',
        grammarPoint: 'What have you been up to?'
      },
      {
        id: 'dc-8',
        prompt: 'それは残念だったね。',
        answer: 'That\'s a bummer.',
        acceptedAnswers: ['That\'s too bad.', 'That\'s a shame.'],
        explanation: '<That\'s a bummer.> はガッカリしたときのカジュアル表現。',
        grammarPoint: 'That\'s a bummer'
      },
      {
        id: 'dc-9',
        prompt: '後で連絡するね！',
        answer: 'I\'ll catch up with you later!',
        acceptedAnswers: ['I\'ll talk to you later!', 'I\'ll text you later!'],
        explanation: '<catch up with you later> で「後で連絡する・話す」。',
        grammarPoint: 'catch up with'
      },
      {
        id: 'dc-10',
        prompt: '念のためもう一度確認しておこう。',
        answer: 'Let\'s double-check just in case.',
        acceptedAnswers: ['Let\'s check it again just to be sure.', 'We should double-check just in case.'],
        explanation: '<just in case> は「念のため」。<double-check> で「再確認する」。',
        grammarPoint: 'double-check / just in case'
      }
    ]
  }
];
