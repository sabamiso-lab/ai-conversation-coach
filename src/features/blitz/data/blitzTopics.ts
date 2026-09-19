import { BlitzTopic } from '../../../types';

/**
 * 瞬間英作文・パターンプラクティス用 プリセットトピック＆問題集データ
 */
export const PRESET_BLITZ_TOPICS: BlitzTopic[] = [
  {
    id: 'grammar-foundations',
    title: '基礎構文パターン（総合実力テスト）',
    titleJa: 'Grammar Foundations: Comprehensive',
    category: 'Grammar',
    difficulty: 'Intermediate',
    icon: 'Zap',
    description: '助動詞、関係代名詞、仮定法など、英語の核となる必須構文の総合即答腕試し',
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
    id: 'grammar-basic-patterns',
    title: '基礎構文① 基本文型＆時制',
    titleJa: 'Basic Sentence Patterns & Tenses',
    category: 'Grammar',
    difficulty: 'Beginner',
    icon: 'BookOpen',
    description: '第1〜第5文型（SVOO, SVOCなど）と基本時制（進行形・過去・未来）の基礎固め',
    questions: [
      {
        id: 'gbp-1',
        prompt: '彼女は私に素敵なプレゼントをくれました。',
        answer: 'She gave me a wonderful present.',
        acceptedAnswers: ['She gave me a nice present.', 'She gave a wonderful present to me.', 'She gave me a great gift.'],
        explanation: '<give + 人 + 物> (第4文型) または <give + 物 + to 人> (第3文型) を使います。',
        grammarPoint: '第4文型 (SVOO)'
      },
      {
        id: 'gbp-2',
        prompt: 'その知らせを聞いて私たちはとても嬉しくなりました。',
        answer: 'The news made us very happy.',
        acceptedAnswers: ['That news made us very happy.', 'The news made us so happy.', 'Hearing the news made us very happy.'],
        explanation: '<make + 目的語 + 形容詞> で「OをCの状態にさせる」(第5文型)。無生物主語の頻出パターンです。',
        grammarPoint: '第5文型 (make + O + C)'
      },
      {
        id: 'gbp-3',
        prompt: 'みんな彼のことをボブと呼んでいます。',
        answer: 'Everyone calls him Bob.',
        acceptedAnswers: ['Everybody calls him Bob.', 'People call him Bob.'],
        explanation: '<call + 目的語 + 補語(名詞)> で「OをCと呼ぶ」(第5文型)。主語がEveryoneの時は単数扱い(calls)になります。',
        grammarPoint: '第5文型 (call + O + C)'
      },
      {
        id: 'gbp-4',
        prompt: 'このスープはとてもいい匂いがします。',
        answer: 'This soup smells very good.',
        acceptedAnswers: ['This soup smells great.', 'This soup smells really good.', 'This soup smells delicious.'],
        explanation: '<smell + 形容詞> で「〜な匂いがする」(第2文型)。副詞(well)ではなく形容詞(good)が来ます。',
        grammarPoint: '第2文型 (SVC / 知覚動詞)'
      },
      {
        id: 'gbp-5',
        prompt: '父は私に新しい自転車を買ってくれました。',
        answer: 'My father bought me a new bicycle.',
        acceptedAnswers: ['My dad bought me a new bike.', 'My father bought a new bicycle for me.', 'My dad bought a new bicycle for me.'],
        explanation: '<buy + 人 + 物> または <buy + 物 + for 人>。buyは前置詞forを取ります。',
        grammarPoint: '第4文型 (buy 人 物)'
      },
      {
        id: 'gbp-6',
        prompt: 'あなたが電話してきたとき、私は夕食を作っていました。',
        answer: 'I was cooking dinner when you called me.',
        acceptedAnswers: ['I was making dinner when you called.', 'When you called me, I was cooking dinner.', 'I was preparing dinner when you called.'],
        explanation: '過去のある時点で進行中だった動作は過去進行形 <was/were + -ing> を使います。',
        grammarPoint: '過去進行形 (was/were + -ing)'
      },
      {
        id: 'gbp-7',
        prompt: '今週末は何をする予定ですか？',
        answer: 'What are you going to do this weekend?',
        acceptedAnswers: ['What are you doing this weekend?', 'What will you do this weekend?', 'What are your plans for this weekend?'],
        explanation: 'すでに決まっている予定や意図を尋ねるときは <be going to + 動詞原形> が自然です。',
        grammarPoint: '未来表現 (be going to)'
      },
      {
        id: 'gbp-8',
        prompt: '明日の午前中は雨が降るでしょう。',
        answer: 'It will rain tomorrow morning.',
        acceptedAnswers: ['It is going to rain tomorrow morning.', 'It\'ll rain tomorrow morning.', 'It\'s likely to rain tomorrow morning.'],
        explanation: '天気の予測や自然の成り行きには単純未来 <It will + 動詞> を使います。',
        grammarPoint: '単純未来 (will)'
      },
      {
        id: 'gbp-9',
        prompt: '彼は先週末、友達と映画を見に行きました。',
        answer: 'He went to see a movie with his friends last weekend.',
        acceptedAnswers: ['He went to the movies with his friends last weekend.', 'He went to see a film with his friends last weekend.'],
        explanation: '過去の完了した出来事は過去形 (went)。<go to see a movie> または <go to the movies>。',
        grammarPoint: '過去形 (Past Tense)'
      },
      {
        id: 'gbp-10',
        prompt: '部屋を暖かく保つようにしてください。',
        answer: 'Please keep the room warm.',
        acceptedAnswers: ['Make sure to keep the room warm.', 'Keep the room warm, please.'],
        explanation: '<keep + 目的語 + 形容詞> で「OをCの状態に保つ」(第5文型)。',
        grammarPoint: '第5文型 (keep + O + C)'
      }
    ]
  },
  {
    id: 'grammar-modals',
    title: '基礎構文② 助動詞＆推量・後悔',
    titleJa: 'Modal Verbs & Past Modals',
    category: 'Grammar',
    difficulty: 'Intermediate',
    icon: 'Zap',
    description: 'should have, could have, must have などの推量・後悔と、can/must等の助動詞マスター',
    questions: [
      {
        id: 'gm-1',
        prompt: 'もっと早く起きるべきでした。',
        answer: 'I should have woken up earlier.',
        acceptedAnswers: ['I should have gotten up earlier.', 'I ought to have woken up earlier.', 'I should have got up earlier.'],
        explanation: '「〜すべきだった（のにしなかった）」という過去への後悔・非難は <should have + 過去分詞>。',
        grammarPoint: 'should have + p.p. (後悔)'
      },
      {
        id: 'gm-2',
        prompt: 'そんなこと言わなければよかった。',
        answer: 'I shouldn\'t have said that.',
        acceptedAnswers: ['I shouldn\'t have said such a thing.', 'I should not have said that.', 'I ought not to have said that.'],
        explanation: '「〜すべきではなかった（のにしてしまった）」は <shouldn\'t have + 過去分詞>。',
        grammarPoint: 'shouldn\'t have + p.p.'
      },
      {
        id: 'gm-3',
        prompt: '彼は財布を家に忘れてきたに違いない。',
        answer: 'He must have left his wallet at home.',
        acceptedAnswers: ['He must have forgotten his wallet at home.', 'He must\'ve left his wallet at home.'],
        explanation: '過去の事実に対する確信度の高い推量は <must have + 過去分詞>「〜だったに違いない」。',
        grammarPoint: 'must have + p.p. (確信・推量)'
      },
      {
        id: 'gm-4',
        prompt: '手伝ってくれたってよかったのに。',
        answer: 'You could have helped me.',
        acceptedAnswers: ['You could\'ve helped me.', 'You might have helped me.'],
        explanation: '「〜することもできたのに（なぜしなかったのか）」という軽い非難は <could have + 過去分詞>。',
        grammarPoint: 'could have + p.p. (過去の可能性・非難)'
      },
      {
        id: 'gm-5',
        prompt: '彼女はその知らせをすでに知っていたかもしれない。',
        answer: 'She might have already known the news.',
        acceptedAnswers: ['She may have already known the news.', 'She might\'ve known the news already.'],
        explanation: '過去の不確実な推量は <might/may have + 過去分詞>「〜だったかもしれない」。',
        grammarPoint: 'might have + p.p. (推量)'
      },
      {
        id: 'gm-6',
        prompt: 'その噂が本当であるはずがありません。',
        answer: 'The rumor cannot be true.',
        acceptedAnswers: ['That rumor can\'t be true.', 'The rumor can\'t possibly be true.'],
        explanation: '現在の強い否定推量は <cannot be ~>「〜であるはずがない」。',
        grammarPoint: 'cannot be (強い否定推量)'
      },
      {
        id: 'gm-7',
        prompt: 'ここで写真を撮ってはいけません。',
        answer: 'You must not take pictures here.',
        acceptedAnswers: ['You must not take photos here.', 'You cannot take pictures here.', 'Don\'t take pictures here.'],
        explanation: '強い禁止は <must not + 動詞原形>。don\'t have to（〜しなくてもよい）との混同に注意。',
        grammarPoint: 'must not (禁止)'
      },
      {
        id: 'gm-8',
        prompt: '会議の前にこの資料を読まなければなりません。',
        answer: 'I have to read this document before the meeting.',
        acceptedAnswers: ['I must read this document before the meeting.', 'I have to check these materials before the meeting.'],
        explanation: '客観的な義務や必要性は <have to + 動詞原形> を使います。',
        grammarPoint: 'have to (義務・必要性)'
      },
      {
        id: 'gm-9',
        prompt: '彼は来週には仕事に復帰できるでしょう。',
        answer: 'He will be able to return to work next week.',
        acceptedAnswers: ['He will be able to come back to work next week.', 'He\'ll be able to return to work next week.'],
        explanation: '助動詞 will と can を重ねることはできないため、<will be able to> にします。',
        grammarPoint: 'will be able to'
      },
      {
        id: 'gm-10',
        prompt: '駅への行き方を教えていただけますか？',
        answer: 'Could you tell me how to get to the station?',
        acceptedAnswers: ['Could you tell me the way to the station?', 'Would you tell me how to get to the station?', 'Can you tell me how to get to the station?'],
        explanation: '丁寧な依頼には <Could you ~?> や <Would you ~?> を使います。',
        grammarPoint: 'Could you ~? (丁寧な依頼)'
      }
    ]
  },
  {
    id: 'grammar-infinitives',
    title: '基礎構文③ 不定詞の重要構文',
    titleJa: 'Infinitives & Essential Patterns',
    category: 'Grammar',
    difficulty: 'Beginner',
    icon: 'Sparkles',
    description: 'It is ~ for 人 to do, tell/ask 人 to do, too ~ to do, enough to do など不定詞の必須構文',
    questions: [
      {
        id: 'gi-1',
        prompt: '外国語を習得するのは簡単ではありません。',
        answer: 'It is not easy to master a foreign language.',
        acceptedAnswers: ['It is not easy to learn a foreign language.', 'It\'s not easy to learn a foreign language.', 'Learning a foreign language is not easy.'],
        explanation: '形式主語 It を置く <It is + 形容詞 + to do>「〜することは…だ」。',
        grammarPoint: 'It is + 形容詞 + to do'
      },
      {
        id: 'gi-2',
        prompt: '私たちを手伝ってくれるなんて、彼女はとても親切ですね。',
        answer: 'It is very kind of her to help us.',
        acceptedAnswers: ['It\'s very kind of her to help us.', 'She is very kind to help us.'],
        explanation: '人の性質・人柄を表す形容詞 (kind, nice, careless等) では for ではなく of 人 を使います。',
        grammarPoint: 'It is + 性質形容詞 + of 人 + to do'
      },
      {
        id: 'gi-3',
        prompt: '先生は私たちに毎日英語を話すように言いました。',
        answer: 'The teacher told us to speak English every day.',
        acceptedAnswers: ['Our teacher told us to speak English every day.', 'The teacher instructed us to speak English every day.'],
        explanation: '<tell + 人 + to do> で「人に〜するように言う/指示する」。',
        grammarPoint: 'tell 人 to do'
      },
      {
        id: 'gi-4',
        prompt: '母は私に部屋を片付けるよう頼みました。',
        answer: 'My mother asked me to clean my room.',
        acceptedAnswers: ['My mom asked me to clean up my room.', 'My mother asked me to tidy up my room.'],
        explanation: '<ask + 人 + to do> で「人に〜するよう頼む/お願いする」。',
        grammarPoint: 'ask 人 to do'
      },
      {
        id: 'gi-5',
        prompt: '彼はあまりに疲れていて、これ以上歩けませんでした。',
        answer: 'He was too tired to walk any further.',
        acceptedAnswers: ['He was too tired to walk anymore.', 'He was so tired that he couldn\'t walk anymore.'],
        explanation: '<too + 形容詞 + to do> で「あまりに…すぎて〜できない」。',
        grammarPoint: 'too ~ to do'
      },
      {
        id: 'gi-6',
        prompt: '彼女はその新しいパソコンを買うのに十分なお金を持っています。',
        answer: 'She has enough money to buy the new computer.',
        acceptedAnswers: ['She has enough money to buy that new laptop.', 'She has enough money to purchase the new computer.'],
        explanation: '<enough + 名詞 + to do>「〜するのに十分な名詞」。形容詞を修飾するときは <rich enough to buy> の語順です。',
        grammarPoint: 'enough (名詞) to do'
      },
      {
        id: 'gi-7',
        prompt: '何か温かい飲み物が欲しいです。',
        answer: 'I want something hot to drink.',
        acceptedAnswers: ['I\'d like something warm to drink.', 'I want something warm to drink.', 'Could I have something warm to drink?'],
        explanation: '<something + 形容詞 + to do>「〜するための何か…なもの」。語順に注意。',
        grammarPoint: 'something + 形容詞 + to do'
      },
      {
        id: 'gi-8',
        prompt: 'このコピー機の使い方を教えていただけますか？',
        answer: 'Could you tell me how to use this copy machine?',
        acceptedAnswers: ['Could you show me how to use this copier?', 'Can you tell me how to use this copy machine?', 'Could you show me how to use this photocopier?'],
        explanation: '<疑問詞 + to do>。how to do で「〜の仕方・使い方」。',
        grammarPoint: 'how to do (疑問詞 + 不定詞)'
      },
      {
        id: 'gi-9',
        prompt: '私は英語の発音を上達させるためにそのアプリをダウンロードしました。',
        answer: 'I downloaded the app to improve my English pronunciation.',
        acceptedAnswers: ['I downloaded the app in order to improve my English pronunciation.', 'I downloaded that app to improve my English pronunciation.'],
        explanation: '不定詞の副詞的用法（目的）「〜するために」。フォーマルには <in order to do>。',
        grammarPoint: '不定詞の副詞的用法 (目的)'
      },
      {
        id: 'gi-10',
        prompt: '明日のプレゼンに遅れないように気をつけてね。',
        answer: 'Be careful not to be late for tomorrow\'s presentation.',
        acceptedAnswers: ['Make sure not to be late for tomorrow\'s presentation.', 'Take care not to be late for the presentation tomorrow.'],
        explanation: '不定詞の否定は not を to の直前に置きます <not to do>。',
        grammarPoint: 'not to do (否定の不定詞)'
      }
    ]
  },
  {
    id: 'grammar-gerunds',
    title: '基礎構文④ 動名詞＆頻出イディオム',
    titleJa: 'Gerunds & Common Expressions',
    category: 'Grammar',
    difficulty: 'Beginner',
    icon: 'Smile',
    description: 'Would you mind -ing?, look forward to -ing, stop/remember等の動名詞の重要パターン',
    questions: [
      {
        id: 'gg-1',
        prompt: '窓を開けていただいてもよろしいですか？',
        answer: 'Would you mind opening the window?',
        acceptedAnswers: ['Do you mind opening the window?', 'Could you please open the window?', 'Would you mind if I opened the window?'],
        explanation: '<Would you mind + -ing?> は非常に丁寧な依頼。「〜することを気にしますか？」。',
        grammarPoint: 'Would you mind -ing?'
      },
      {
        id: 'gg-2',
        prompt: 'あなたとまた一緒にお仕事できるのを楽しみにしています。',
        answer: 'I am looking forward to working with you again.',
        acceptedAnswers: ['I look forward to working with you again.', 'I\'m looking forward to working with you again.'],
        explanation: '<look forward to + -ing / 名詞>。to は前置詞なので動詞原形ではなく動名詞が続きます。',
        grammarPoint: 'look forward to -ing'
      },
      {
        id: 'gg-3',
        prompt: '彼は健康のためにタバコを吸うのをやめました。',
        answer: 'He stopped smoking for his health.',
        acceptedAnswers: ['He gave up smoking for his health.', 'He quit smoking for his health.'],
        explanation: '<stop + -ing> は「〜するのをやめる」。<stop to do> だと「〜するために立ち止まる」になるので注意。',
        grammarPoint: 'stop -ing (中止)'
      },
      {
        id: 'gg-4',
        prompt: '家を出る前にエアコンを消したのを覚えています。',
        answer: 'I remember turning off the air conditioner before leaving home.',
        acceptedAnswers: ['I remember turning off the AC before leaving the house.', 'I remember shutting off the air conditioner before leaving home.'],
        explanation: '<remember + -ing> は「過去に〜したことを覚えている」。<remember to do> は「忘れずに〜する」。',
        grammarPoint: 'remember -ing (過去の記憶)'
      },
      {
        id: 'gg-5',
        prompt: '出かける前に忘れずに鍵をかけてね。',
        answer: 'Remember to lock the door before you leave.',
        acceptedAnswers: ['Don\'t forget to lock the door before leaving.', 'Remember to lock the door before leaving.'],
        explanation: '<remember to do> で「忘れずに〜する（これからの行動）」。',
        grammarPoint: 'remember to do (これからの行動)'
      },
      {
        id: 'gg-6',
        prompt: '私は毎朝早く起きることに慣れています。',
        answer: 'I am used to getting up early every morning.',
        acceptedAnswers: ['I\'m used to waking up early every morning.', 'I am accustomed to getting up early every morning.'],
        explanation: '<be used to + -ing>「〜することに慣れている」。<used to + 原形>「昔は〜したものだ」と混同しないよう注意。',
        grammarPoint: 'be used to -ing (慣れている)'
      },
      {
        id: 'gg-7',
        prompt: '今夜はピザを食べたい気分です。',
        answer: 'I feel like eating pizza tonight.',
        acceptedAnswers: ['I feel like having pizza tonight.', 'I\'d like to eat pizza tonight.'],
        explanation: '<feel like + -ing> で「〜したい気分だ」。',
        grammarPoint: 'feel like -ing'
      },
      {
        id: 'gg-8',
        prompt: '貴重なお時間を割いていただきありがとうございます。',
        answer: 'Thank you for taking the time to meet with me.',
        acceptedAnswers: ['Thank you for sparing your precious time.', 'Thanks for making time for me.', 'Thank you for your valuable time.'],
        explanation: '前置詞 for の後は動名詞 <Thank you for -ing>。',
        grammarPoint: 'Thank you for -ing'
      },
      {
        id: 'gg-9',
        prompt: '彼女は海外で働く夢をあきらめませんでした。',
        answer: 'She didn\'t give up her dream of working abroad.',
        acceptedAnswers: ['She did not give up on her dream of working overseas.', 'She didn\'t give up working abroad.'],
        explanation: '<give up + -ing> で「〜することをあきらめる」。',
        grammarPoint: 'give up -ing'
      },
      {
        id: 'gg-10',
        prompt: 'その本は何度も読む価値があります。',
        answer: 'That book is worth reading many times.',
        acceptedAnswers: ['The book is worth reading over and over.', 'That book is worth reading repeatedly.'],
        explanation: '<be worth + -ing> で「〜する価値がある」。',
        grammarPoint: 'be worth -ing'
      }
    ]
  },
  {
    id: 'grammar-perfect-tenses',
    title: '基礎構文⑤ 現在完了＆完了進行形',
    titleJa: 'Present Perfect & Continuous',
    category: 'Grammar',
    difficulty: 'Intermediate',
    icon: 'Clock',
    description: '継続(since/for)、経験(ever/never)、完了(already/yet)、完了進行形(have been -ing)の即答',
    questions: [
      {
        id: 'gp-1',
        prompt: 'ここに住んでどのくらいになりますか？',
        answer: 'How long have you lived here?',
        acceptedAnswers: ['How long have you been living here?', 'How many years have you lived here?'],
        explanation: '継続期間を尋ねる定番表現 <How long have you + 過去分詞 / been -ing?>。',
        grammarPoint: 'How long have you ...?'
      },
      {
        id: 'gp-2',
        prompt: '3時間ずっと雨が降り続いています。',
        answer: 'It has been raining for three hours.',
        acceptedAnswers: ['It\'s been raining for three hours.', 'It has rained for three hours.'],
        explanation: '過去から現在まで休みなく動作が続いている場合は現在完了進行形 <have/has been + -ing>。',
        grammarPoint: '現在完了進行形 (継続)'
      },
      {
        id: 'gp-3',
        prompt: '私は一度も外国へ行ったことがありません。',
        answer: 'I have never been abroad.',
        acceptedAnswers: ['I\'ve never been overseas.', 'I have never been to a foreign country.', 'I\'ve never been to another country.'],
        explanation: '経験の否定は <have never + 過去分詞>。<have been to 場所> で「〜へ行ったことがある」。',
        grammarPoint: 'have never been to (経験)'
      },
      {
        id: 'gp-4',
        prompt: 'もう宿題は終わりましたか？',
        answer: 'Have you finished your homework yet?',
        acceptedAnswers: ['Have you done your homework yet?', 'Did you finish your homework yet?'],
        explanation: '完了の疑問文での yet は文末に置き「もう」。<Have you + 過去分詞 ... yet?>。',
        grammarPoint: 'have + p.p. + yet (完了の疑問)'
      },
      {
        id: 'gp-5',
        prompt: '私はちょうど昼食を食べ終えたところです。',
        answer: 'I have just finished having lunch.',
        acceptedAnswers: ['I\'ve just finished eating lunch.', 'I have just eaten lunch.', 'I just finished lunch.'],
        explanation: '<have just + 過去分詞> で「ちょうど〜したところだ」。',
        grammarPoint: 'have just + p.p. (完了)'
      },
      {
        id: 'gp-6',
        prompt: '私たちは高校生の頃からの知り合いです。',
        answer: 'We have known each other since we were in high school.',
        acceptedAnswers: ['We\'ve known each other since high school.', 'We have been friends since high school.'],
        explanation: '起点を表す since「〜以来」。know は状態動詞なので完了進行形にせず完了形にします。',
        grammarPoint: 'have + p.p. + since (継続)'
      },
      {
        id: 'gp-7',
        prompt: '以前にその映画を見たことがありますか？',
        answer: 'Have you ever seen that movie before?',
        acceptedAnswers: ['Have you seen that movie before?', 'Have you ever watched that movie before?'],
        explanation: '経験を尋ねる <Have you ever + 過去分詞 ...?>「今までに〜したことがありますか？」。',
        grammarPoint: 'Have you ever + p.p.? (経験)'
      },
      {
        id: 'gp-8',
        prompt: '彼はまだオフィスに戻っていません。',
        answer: 'He hasn\'t returned to the office yet.',
        acceptedAnswers: ['He has not come back to the office yet.', 'He hasn\'t come back to the office yet.', 'He isn\'t back at the office yet.'],
        explanation: '完了の否定文での yet は「まだ」。<hasn\'t + 過去分詞 ... yet>。',
        grammarPoint: 'have not + p.p. + yet (未完了)'
      },
      {
        id: 'gp-9',
        prompt: '私は一日中このレポートを書き続けています。',
        answer: 'I have been writing this report all day.',
        acceptedAnswers: ['I\'ve been writing this report all day long.', 'I have been working on this report all day.'],
        explanation: '「一日中ずっと〜し続けている」という動作の継続は現在完了進行形が最適です。',
        grammarPoint: 'have been -ing + all day'
      },
      {
        id: 'gp-10',
        prompt: '部屋の鍵を失くしてしまって、家に入れません。',
        answer: 'I have lost my room key, so I can\'t get into the house.',
        acceptedAnswers: ['I\'ve lost my room key and cannot enter the house.', 'I lost my room key and I can\'t get in.'],
        explanation: '過去の出来事の結果が現在に及んでいる「結果」の現在完了形。',
        grammarPoint: 'have + p.p. (結果)'
      }
    ]
  },
  {
    id: 'grammar-passive',
    title: '基礎構文⑥ 受動態のバリエーション',
    titleJa: 'Passive Voice Patterns',
    category: 'Grammar',
    difficulty: 'Intermediate',
    icon: 'Layers',
    description: '基本受動態、進行形/完了形の受動態、助動詞付き、前置詞を伴う受動態 (covered with等)',
    questions: [
      {
        id: 'gpa-1',
        prompt: 'この建物は100年以上前に建てられました。',
        answer: 'This building was built more than 100 years ago.',
        acceptedAnswers: ['This building was constructed over 100 years ago.', 'This building was built over a hundred years ago.'],
        explanation: '過去の受動態 <was/were + 過去分詞>。',
        grammarPoint: 'was/were + p.p. (過去受動態)'
      },
      {
        id: 'gpa-2',
        prompt: 'その規則は全員によって守られなければなりません。',
        answer: 'The rules must be followed by everyone.',
        acceptedAnswers: ['The rule must be obeyed by everybody.', 'Those rules have to be followed by everyone.'],
        explanation: '<助動詞 + be + 過去分詞>「〜されなければならない」。',
        grammarPoint: 'must be + p.p. (助動詞の受動態)'
      },
      {
        id: 'gpa-3',
        prompt: 'その会議室は現在使われています。',
        answer: 'The meeting room is being used right now.',
        acceptedAnswers: ['The conference room is being used currently.', 'The meeting room is currently in use.'],
        explanation: '「今まさに〜されている最中だ」は進行形の受動態 <is/are being + 過去分詞>。',
        grammarPoint: 'be being + p.p. (進行形の受動態)'
      },
      {
        id: 'gpa-4',
        prompt: '私たちの車は今修理されているところです。',
        answer: 'Our car is being repaired at the moment.',
        acceptedAnswers: ['Our car is being fixed right now.', 'My car is being repaired right now.'],
        explanation: '<is being repaired / fixed> で「修理されている最中である」。',
        grammarPoint: 'is being + p.p.'
      },
      {
        id: 'gpa-5',
        prompt: 'その問題はすでに解決されました。',
        answer: 'The problem has already been solved.',
        acceptedAnswers: ['The issue has already been resolved.', 'That problem has already been solved.'],
        explanation: '「すでに〜されてしまった」は完了形の受動態 <have/has been + 過去分詞>。',
        grammarPoint: 'have been + p.p. (完了の受動態)'
      },
      {
        id: 'gpa-6',
        prompt: '富士山の頂上は美しい雪で覆われています。',
        answer: 'The top of Mt. Fuji is covered with beautiful snow.',
        acceptedAnswers: ['Mt. Fuji\'s summit is covered in beautiful snow.', 'The peak of Mt. Fuji is covered with snow.'],
        explanation: 'by以外の前置詞を取る受動態。<be covered with ~> で「〜で覆われている」。',
        grammarPoint: 'be covered with'
      },
      {
        id: 'gpa-7',
        prompt: '私たちはその予期せぬ知らせにとても驚きました。',
        answer: 'We were very surprised at the unexpected news.',
        acceptedAnswers: ['We were so surprised by the unexpected news.', 'We were amazed by the unexpected news.'],
        explanation: '感情を表す受動態。<be surprised at/by ~> で「〜に驚く」。',
        grammarPoint: 'be surprised at/by'
      },
      {
        id: 'gpa-8',
        prompt: '彼は道で見知らぬ人に話しかけられました。',
        answer: 'He was spoken to by a stranger on the street.',
        acceptedAnswers: ['He was spoken to by a stranger in the street.', 'A stranger spoke to him on the street.'],
        explanation: 'speak to 人 の受動態は前置詞 to を落とさず <be spoken to by ~> にします。',
        grammarPoint: '群動詞の受動態 (be spoken to)'
      },
      {
        id: 'gpa-9',
        prompt: '英語は世界中の多くの国で話されています。',
        answer: 'English is spoken in many countries around the world.',
        acceptedAnswers: ['English is spoken in a lot of countries around the world.', 'English is spoken all over the world.'],
        explanation: '話者が一般的な不特定多数の場合、by people は省略されます。',
        grammarPoint: 'is spoken in'
      },
      {
        id: 'gpa-10',
        prompt: 'この手紙は明日までに配達されなければなりません。',
        answer: 'This letter must be delivered by tomorrow.',
        acceptedAnswers: ['This letter has to be delivered by tomorrow.', 'This letter should be delivered by tomorrow.'],
        explanation: '期限の by「〜までに」と <must be delivered> の組み合わせ。',
        grammarPoint: 'must be + p.p. + by'
      }
    ]
  },
  {
    id: 'grammar-comparisons',
    title: '基礎構文⑦ 比較級・最上級・重要比較',
    titleJa: 'Comparisons & Correlative Clauses',
    category: 'Grammar',
    difficulty: 'Intermediate',
    icon: 'TrendingUp',
    description: 'as ~ as, much/way+比較級, The more..., the more..., as ~ as possible などの比較表現',
    questions: [
      {
        id: 'gc-1',
        prompt: '彼は私と同じくらい速く走ることができます。',
        answer: 'He can run as fast as I can.',
        acceptedAnswers: ['He can run as fast as me.', 'He runs as fast as I do.'],
        explanation: '<as + 原級 + as> で「…と同じくらい〜」。',
        grammarPoint: 'as + 原級 + as (同等比較)'
      },
      {
        id: 'gc-2',
        prompt: '富士山は日本で一番高い山です。',
        answer: 'Mt. Fuji is the highest mountain in Japan.',
        acceptedAnswers: ['Mt. Fuji is the tallest mountain in Japan.', 'Mount Fuji is the highest peak in Japan.'],
        explanation: '<the + 最上級 + in/of>「…の中で最も〜」。範囲が場所・単数名詞の時は in を使います。',
        grammarPoint: 'the + 最上級 + in'
      },
      {
        id: 'gc-3',
        prompt: '彼は私が思っていたよりずっと背が高い。',
        answer: 'He is much taller than I thought.',
        acceptedAnswers: ['He is way taller than I expected.', 'He is far taller than I thought.'],
        explanation: '比較級の差が大きいことを表す強調には much や way, far を使います（veryは不可）。',
        grammarPoint: 'much / way + 比較級 (差の強調)'
      },
      {
        id: 'gc-4',
        prompt: '練習すればするほど、上達します。',
        answer: 'The more you practice, the better you get.',
        acceptedAnswers: ['The more you practice, the better you will become.', 'The more you practice, the more you improve.'],
        explanation: '<The + 比較級 〜, the + 比較級 …> で「〜すればするほど、ますます…になる」。',
        grammarPoint: 'The + 比較級, the + 比較級'
      },
      {
        id: 'gc-5',
        prompt: 'できるだけ早く折り返しお電話いただけますか？',
        answer: 'Could you please call me back as soon as possible?',
        acceptedAnswers: ['Could you call me back as soon as possible?', 'Can you call me back as soon as possible?', 'Please call me back as soon as you can.'],
        explanation: '<as soon as possible> (ASAP)「できるだけ早く」。',
        grammarPoint: 'as soon as possible'
      },
      {
        id: 'gc-6',
        prompt: 'この町は東京ほど混雑していません。',
        answer: 'This town is not as crowded as Tokyo.',
        acceptedAnswers: ['This city is not as crowded as Tokyo.', 'This town is not so crowded as Tokyo.', 'This city isn\'t as crowded as Tokyo.'],
        explanation: '<not as/so + 原級 + as> で「…ほど〜ではない」。',
        grammarPoint: 'not as + 原級 + as'
      },
      {
        id: 'gc-7',
        prompt: '彼女は世界で最も人気のある歌手の一人です。',
        answer: 'She is one of the most popular singers in the world.',
        acceptedAnswers: ['She\'s one of the most popular singers in the world.', 'She is among the most popular singers in the world.'],
        explanation: '<one of the + 最上級 + 複数名詞> で「最も〜な…の中の1人/1つ」。複数名詞に注意。',
        grammarPoint: 'one of the + 最上級 + 複数名詞'
      },
      {
        id: 'gc-8',
        prompt: '早ければ早いほどいいです。',
        answer: 'The sooner, the better.',
        acceptedAnswers: ['The earlier, the better.', 'Sooner is better.'],
        explanation: '日常会話で超頻出の短縮比較構文「早いに越したことはない」。',
        grammarPoint: 'The sooner, the better'
      },
      {
        id: 'gc-9',
        prompt: '健康はお金よりもずっと大切です。',
        answer: 'Health is far more important than money.',
        acceptedAnswers: ['Health is much more important than money.', 'Good health is far more important than wealth.'],
        explanation: '2音節以上の形容詞の比較級は more を使い、強調には far や much を添えます。',
        grammarPoint: 'far more + 形容詞 + than'
      },
      {
        id: 'gc-10',
        prompt: '私の部屋は彼の部屋の2倍の広さです。',
        answer: 'My room is twice as large as his.',
        acceptedAnswers: ['My room is twice as big as his room.', 'My room is twice the size of his.'],
        explanation: '倍数表現は <倍数詞 + as + 原級 + as> (twice as big/large as ~)。',
        grammarPoint: '倍数詞 + as + 原級 + as'
      }
    ]
  },
  {
    id: 'grammar-relative-clauses',
    title: '基礎構文⑧ 関係代名詞＆関係副詞',
    titleJa: 'Relative Pronouns & Adverbs',
    category: 'Grammar',
    difficulty: 'Intermediate',
    icon: 'Compass',
    description: 'who/which/that（主格・目的格省略）、whose、where、why、先行詞を含むwhatの攻略',
    questions: [
      {
        id: 'gr-1',
        prompt: '隣に住んでいる女性は医者です。',
        answer: 'The woman who lives next door is a doctor.',
        acceptedAnswers: ['The lady who lives next door is a doctor.', 'The woman that lives next door is a doctor.'],
        explanation: '人を修飾する主格の関係代名詞 who。',
        grammarPoint: '関係代名詞 (主格 who)'
      },
      {
        id: 'gr-2',
        prompt: '昨日私が買った本はとても面白かったです。',
        answer: 'The book that I bought yesterday was very interesting.',
        acceptedAnswers: ['The book I bought yesterday was very interesting.', 'The book which I bought yesterday was very interesting.'],
        explanation: '目的格の関係代名詞 (that / which) は日常会話では省略されるのが一般的です。',
        grammarPoint: '関係代名詞 (目的格・接触節)'
      },
      {
        id: 'gr-3',
        prompt: '私は父親が有名な画家の友人がいます。',
        answer: 'I have a friend whose father is a famous painter.',
        acceptedAnswers: ['I have a friend whose father is a famous artist.', 'I\'ve got a friend whose dad is a famous painter.'],
        explanation: '「〜の」という所有関係を表す所有格の関係代名詞 whose。',
        grammarPoint: '関係代名詞 (所有格 whose)'
      },
      {
        id: 'gr-4',
        prompt: 'これは私が生まれ育った町です。',
        answer: 'This is the town where I was born and raised.',
        acceptedAnswers: ['This is the city where I was born and brought up.', 'This is the town I was born and raised in.'],
        explanation: '場所を表す先行詞を修飾する関係副詞 where。前置詞 in which の代わりになります。',
        grammarPoint: '関係副詞 (where)'
      },
      {
        id: 'gr-5',
        prompt: '彼が昨日会議に来なかった理由を知っていますか？',
        answer: 'Do you know the reason why he didn\'t come to the meeting yesterday?',
        acceptedAnswers: ['Do you know why he didn\'t come to the meeting yesterday?', 'Do you know the reason he didn\'t show up yesterday?'],
        explanation: '理由を表す the reason why。the reason または why の一方を省略することも多いです。',
        grammarPoint: '関係副詞 (why)'
      },
      {
        id: 'gr-6',
        prompt: 'あなたが言っていることが理解できません。',
        answer: 'I don\'t understand what you are saying.',
        acceptedAnswers: ['I cannot understand what you\'re saying.', 'I don\'t get what you mean.'],
        explanation: 'what は「〜すること/もの」(= the thing which)。先行詞を含んだ関係代名詞です。',
        grammarPoint: '関係代名詞 (what = the thing which)'
      },
      {
        id: 'gr-7',
        prompt: '私にとって最も大切なのは家族です。',
        answer: 'What is most important to me is my family.',
        acceptedAnswers: ['What matters most to me is my family.', 'The most important thing to me is my family.'],
        explanation: '<What is ~> が文全体の主語（名詞節）になっています。',
        grammarPoint: 'what節の主語'
      },
      {
        id: 'gr-8',
        prompt: '私たちが初めて会った日のことを覚えていますか？',
        answer: 'Do you remember the day when we first met?',
        acceptedAnswers: ['Do you remember the day we first met?', 'Do you remember the day that we first met?'],
        explanation: '時を表す先行詞 the day を修飾する関係副詞 when。',
        grammarPoint: '関係副詞 (when)'
      },
      {
        id: 'gr-9',
        prompt: '駅前にあるレストランはいつも混んでいます。',
        answer: 'The restaurant that is in front of the station is always crowded.',
        acceptedAnswers: ['The restaurant which is in front of the station is always crowded.', 'The restaurant in front of the station is always packed.'],
        explanation: '物・場所を修飾する主格の関係代名詞 that / which。',
        grammarPoint: '関係代名詞 (主格 that/which)'
      },
      {
        id: 'gr-10',
        prompt: '私に必要なのは、少しの休息だけです。',
        answer: 'All that I need is a little rest.',
        acceptedAnswers: ['All I need is a little rest.', 'What I need is just a little rest.', 'All I need is some rest.'],
        explanation: '<All that S V> で「SがVするすべてのこと（〜だけで十分だ）」。thatは省略可能です。',
        grammarPoint: 'All that S V (限定構文)'
      }
    ]
  },
  {
    id: 'grammar-conditionals',
    title: '基礎構文⑨ 仮定法過去＆願望表現',
    titleJa: 'Conditionals & Wishes',
    category: 'Grammar',
    difficulty: 'Advanced',
    icon: 'HelpCircle',
    description: 'If 過去形 would/could, If 過去完了 would have, I wish, Without~などの仮定法',
    questions: [
      {
        id: 'gcnd-1',
        prompt: 'もし時間があれば、一緒に行けるのに。',
        answer: 'If I had time, I could go with you.',
        acceptedAnswers: ['If I had free time, I could go with you.', 'If I had time, I would go with you.'],
        explanation: '現在の事実と異なる仮定は仮定法過去 <If + 主語 + 過去形, 主語 + would/could + 原形>。',
        grammarPoint: '仮定法過去 (If + 過去形, could + 原形)'
      },
      {
        id: 'gcnd-2',
        prompt: 'もし私があなたなら、そのオファーを引き受けるでしょう。',
        answer: 'If I were you, I would accept that offer.',
        acceptedAnswers: ['If I were in your shoes, I would take that offer.', 'If I was you, I would accept that offer.'],
        explanation: 'アドバイスの定番 <If I were you, I would ~>「もし私があなたなら〜するだろう」。',
        grammarPoint: 'If I were you, I would ...'
      },
      {
        id: 'gcnd-3',
        prompt: 'もしその電車に乗っていたら、時間に間に合っていただろうに。',
        answer: 'If I had taken that train, I would have been on time.',
        acceptedAnswers: ['If I had caught that train, I would have made it in time.', 'If I\'d taken that train, I would\'ve been on time.'],
        explanation: '過去の事実と異なる仮定は仮定法過去完了 <If + had + 過去分詞, would have + 過去分詞>。',
        grammarPoint: '仮定法過去完了 (had p.p. + would have p.p.)'
      },
      {
        id: 'gcnd-4',
        prompt: 'もっと英語が流暢に話せたらいいのになあ。',
        answer: 'I wish I could speak English more fluently.',
        acceptedAnswers: ['I wish I spoke English more fluently.', 'I wish I could speak English better.'],
        explanation: '現在実現していない願望は <I wish + 仮定法過去>「〜できればいいのに」。',
        grammarPoint: 'I wish + 仮定法過去 (現在の願望)'
      },
      {
        id: 'gcnd-5',
        prompt: 'あの時もっと一生懸命勉強しておけばよかった。',
        answer: 'I wish I had studied harder back then.',
        acceptedAnswers: ['I wish I had studied harder at that time.', 'I wish I\'d studied harder then.'],
        explanation: '過去の出来事に対する後悔は <I wish + had + 過去分詞>「〜しておけばよかったのに」。',
        grammarPoint: 'I wish + 過去完了 (過去の後悔)'
      },
      {
        id: 'gcnd-6',
        prompt: 'あなたの助けがなければ、私たちは成功できなかったでしょう。',
        answer: 'Without your help, we could not have succeeded.',
        acceptedAnswers: ['Without your help, we wouldn\'t have succeeded.', 'If it hadn\'t been for your help, we couldn\'t have succeeded.'],
        explanation: '<Without + 名詞> で仮定法を導きます。「〜がなかったら」。過去の内容なので後半は could have + 過去分詞。',
        grammarPoint: 'Without ~ (仮定構文)'
      },
      {
        id: 'gcnd-7',
        prompt: '彼はまるで何でも知っているかのように話します。',
        answer: 'He speaks as if he knew everything.',
        acceptedAnswers: ['He talks as if he knows everything.', 'He speaks as though he knew everything.'],
        explanation: '<as if + 仮定法> で「まるで〜であるかのように」。',
        grammarPoint: 'as if ~ (まるで…のように)'
      },
      {
        id: 'gcnd-8',
        prompt: 'もし明日雨が降ったら、私は家にいます。',
        answer: 'If it rains tomorrow, I will stay at home.',
        acceptedAnswers: ['If it rains tomorrow, I\'ll stay home.', 'If it\'s rainy tomorrow, I will stay home.'],
        explanation: '現実に起こり得る未来の条件は直接法。時・条件の副詞節内では未来のことでも現在形 (rains) にします。',
        grammarPoint: '条件の副詞節 (直接法 If)'
      },
      {
        id: 'gcnd-9',
        prompt: 'もし宝くじが当たったら、世界一周旅行をしたいです。',
        answer: 'If I won the lottery, I would travel around the world.',
        acceptedAnswers: ['If I won the lottery, I\'d like to travel around the world.', 'If I hit the jackpot, I would travel around the world.'],
        explanation: '可能性が低い想定は仮定法過去 (won ... would travel) を使います。',
        grammarPoint: '仮定法過去 (If + 過去形)'
      },
      {
        id: 'gcnd-10',
        prompt: 'もう寝る時間ですよ。',
        answer: 'It is time you went to bed.',
        acceptedAnswers: ['It\'s time for you to go to bed.', 'It\'s time you went to sleep.', 'It\'s high time you went to bed.'],
        explanation: '<It is time + 主語 + 過去形> で「もう〜してもよい時間だ（実際はまだしていない）」。',
        grammarPoint: 'It is time + 過去形'
      }
    ]
  },
  {
    id: 'grammar-conversational-structures',
    title: '基礎構文⑩ 頻出会話構文＆慣用表現',
    titleJa: 'Conversational Structures & Idioms',
    category: 'Grammar',
    difficulty: 'Intermediate',
    icon: 'MessageSquare',
    description: 'It takes, So do I / Neither do I, How about -ing, No matter what などの超頻出構文',
    questions: [
      {
        id: 'gcs-1',
        prompt: 'そのプロジェクトを完了するのに3日かかりました。',
        answer: 'It took me three days to complete the project.',
        acceptedAnswers: ['It took three days for me to complete the project.', 'It took me three days to finish the project.'],
        explanation: '<It takes + 人 + 時間 + to do> で「人が〜するのに時間がかかる」。',
        grammarPoint: 'It takes 人 時間 to do'
      },
      {
        id: 'gcs-2',
        prompt: '私もそう思います！（相手に賛同）',
        answer: 'So do I!',
        acceptedAnswers: ['I think so, too!', 'Same here!', 'Me too!'],
        explanation: '肯定文への同調は <So + 助動詞/be動詞/do + 主語>。I think so に対する「私も」は So do I。',
        grammarPoint: 'So do I (肯定への同調)'
      },
      {
        id: 'gcs-3',
        prompt: '私も辛いものは得意ではありません。（否定への同調）',
        answer: 'Neither do I.',
        acceptedAnswers: ['Nor do I.', 'I don\'t either.', 'Me neither.'],
        explanation: '否定文への同調は <Neither + 助動詞/do/be動詞 + 主語>「私も〜ない」。',
        grammarPoint: 'Neither do I (否定への同調)'
      },
      {
        id: 'gcs-4',
        prompt: '気分転換に少し散歩でもしませんか？',
        answer: 'How about going for a walk for a change?',
        acceptedAnswers: ['Why don\'t we take a walk for a change?', 'How about taking a walk for a change?', 'What about going for a walk for a change?'],
        explanation: '提案の定番 <How about + -ing?>。for a change は「気分転換に」。',
        grammarPoint: 'How about -ing? (提案)'
      },
      {
        id: 'gcs-5',
        prompt: '彼女が何と言おうと、私は自分のやり方でやります。',
        answer: 'No matter what she says, I will do it my way.',
        acceptedAnswers: ['Whatever she says, I\'ll do it my way.', 'No matter what she says, I\'m going to do it my way.'],
        explanation: '<No matter what ~> や <Whatever ~> で「何が/を〜しようとも（譲歩）」。',
        grammarPoint: '複合関係代名詞 (No matter what)'
      },
      {
        id: 'gcs-6',
        prompt: 'その問題について心配する必要はありません。',
        answer: 'There is no need to worry about that issue.',
        acceptedAnswers: ['You don\'t need to worry about that problem.', 'There\'s no need to worry about that.', 'You don\'t have to worry about that problem.'],
        explanation: '<There is no need to do> で「〜する必要はまったくない」。',
        grammarPoint: 'There is no need to do'
      },
      {
        id: 'gcs-7',
        prompt: '私は子供の頃、ここでよく遊んだものだ。',
        answer: 'I used to play here when I was a child.',
        acceptedAnswers: ['I used to play here when I was a kid.', 'I would often play here when I was young.'],
        explanation: '過去の習慣や状態（現在はしていないこと）を表す <used to + 動詞原形>。',
        grammarPoint: 'used to (過去の習慣)'
      },
      {
        id: 'gcs-8',
        prompt: '出かける前に必ず部屋の鍵を閉めてね。',
        answer: 'Make sure to lock the door before you leave.',
        acceptedAnswers: ['Be sure to lock the door before leaving.', 'Make sure you lock the door before you leave.'],
        explanation: '<Make sure to do> または <Make sure (that) S V> で「必ず〜するようにする」。',
        grammarPoint: 'Make sure to do'
      },
      {
        id: 'gcs-9',
        prompt: '新しいスマートフォンを買うのにいくらかかりましたか？',
        answer: 'How much did it cost you to buy the new smartphone?',
        acceptedAnswers: ['How much did the new smartphone cost you?', 'How much did it cost to get the new phone?'],
        explanation: '費用がかかる場合は <It costs + 人 + 費用 + to do>。',
        grammarPoint: 'It costs 人 費用 to do'
      },
      {
        id: 'gcs-10',
        prompt: '少し休憩を取ったらどうですか？',
        answer: 'Why don\'t you take a short break?',
        acceptedAnswers: ['Why don\'t you take a break?', 'How about taking a break?', 'You should take a short break.'],
        explanation: '相手への提案・アドバイスは <Why don\'t you + 動詞原形?>「〜したらどう？」。',
        grammarPoint: 'Why don\'t you do? (提案・助言)'
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

// Preset topic lists for random Instant Oral Translation scenario generation
export const RANDOM_BLITZ_TOPICS = [
  'カフェでのカスタム注文と支払交渉 (Custom coffee orders and payment)',
  '海外ホテルの部屋変更とトラブル依頼 (Requesting hotel room changes & troubleshooting)',
  'ITスクラム・デイリースタンドアップでの進捗報告 (Daily standup meeting & status updates in IT)',
  '空港での荷物遅延問い合わせ (Inquiring about delayed baggage at the airport)',
  'レストラン予約とアレルギーの確認 (Restaurant booking & dietary requirement check)',
  '同僚と週末の予定や趣味について語る (Discussing weekend plans & hobbies with coworkers)',
  '海外のクリニックで体調不良症状を伝える (Describing health symptoms at a clinic)',
  'タクシーで行き先とルートを指定する (Giving routing directions to a taxi driver)',
  '購入した不良品の返品・返金交渉 (Requesting a refund or exchange for a item)',
  'オンライン会議での音声・通信トラブル対応 (Handling audio and connection issues in online meetings)',
  'AIがもたらす将来の働き方の変化 (Discussing how AI changes future work styles)',
  '新しい同僚へのオフィス案内と挨拶 (Welcoming a new colleague and giving an office tour)'
];

export const POPULAR_BLITZ_TOPIC_CHIPS = [
  { label: '☕ カフェ注文', topic: 'カフェでのカスタム注文と支払い' },
  { label: '💻 ITスクラム', topic: 'ITスクラムでの進捗報告' },
  { label: '🏨 ホテル変更', topic: '海外ホテルの部屋変更とトラブル依頼' },
  { label: '✈️ 空港・トラブル', topic: '空港での荷物遅延問い合わせ' },
  { label: '🩺 病院受診', topic: '海外のクリニックで体調不良症状を伝える' },
  { label: '🤖 AIと働き方', topic: 'AIがもたらす将来の働き方の変化' }
];

export function getRandomBlitzTopic() {
  const randomIndex = Math.floor(Math.random() * RANDOM_BLITZ_TOPICS.length);
  return RANDOM_BLITZ_TOPICS[randomIndex];
}
