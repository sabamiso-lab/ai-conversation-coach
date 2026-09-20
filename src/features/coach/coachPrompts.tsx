import React from 'react';
import {
  Lightbulb,
  Globe,
  MessageCircleQuestion,
  HelpCircle,
  Volume2,
  Music,
  Zap
} from 'lucide-react';
import { Situation, CoachMode, CoachShadowingContext, CoachBlitzContext } from '../../types';

export interface CoachQuickPrompt {
  label: string;
  icon: React.ReactNode;
  query: string;
}

export const CONVERSATION_QUICK_PROMPTS: CoachQuickPrompt[] = [
  {
    label: '相手の発言のニュアンス',
    icon: <MessageCircleQuestion size={13} />,
    query: '直前の相手の発言の日本語訳とニュアンス、言外の意図を詳しく分かりやすく解説してください。'
  },
  {
    label: 'ここで使える自然な返答',
    icon: <Lightbulb size={13} />,
    query: 'この場面で相手に自然に返答できるおすすめの英語フレーズをいくつか教えてください。'
  },
  {
    label: '現地のマナー・文化のコツ',
    icon: <Globe size={13} />,
    query: 'このシチュエーションにおいて、海外（英語圏）で知っておくべき文化的なマナーやコミュニケーションの注意点はありますか？'
  },
  {
    label: '簡単・シンプルな言い回し',
    icon: <HelpCircle size={13} />,
    query: '中学英語レベルの簡単な単語を使って、言いたいことを相手に確実に伝えるシンプルな表現を教えてください。'
  }
];

export const SHADOWING_QUICK_PROMPTS: CoachQuickPrompt[] = [
  {
    label: 'リエゾン・発音のコツ',
    icon: <Volume2 size={13} />,
    query: 'この英文スクリプトで、音が繋がる部分（リエゾン/リンキング）や脱落・弱形になる発音の注意点を分かりやすく解説してください。'
  },
  {
    label: '構文・文法の分解解説',
    icon: <HelpCircle size={13} />,
    query: 'この英文の文法構造・スラッシュリーディングの区切り方と、重要な語彙のニュアンスを教えてください。'
  },
  {
    label: '抑揚・リズムのポイント',
    icon: <Music size={13} />,
    query: 'この英文を自然な英語らしく読むための、強く読む単語（強勢）とイントネーション（上げ下げ）のポイントを教えてください。'
  },
  {
    label: '舌が回らない時の練習法',
    icon: <Lightbulb size={13} />,
    query: 'シャドーイングでスピードについていけない、舌がもつれる時の効果的なステップ別練習法を教えてください。'
  }
];

export const BLITZ_QUICK_PROMPTS: CoachQuickPrompt[] = [
  {
    label: '別の自然な言い回し・表現',
    icon: <Lightbulb size={13} />,
    query: 'この日本語のお題に対して、標準の解答以外にネイティブがよく使う自然な別表現やカジュアルな言い方を教えてください。'
  },
  {
    label: 'なぜこの語順・文法になる？',
    icon: <HelpCircle size={13} />,
    query: 'この英文の語順や文法ルールの理由を初心者にも分かりやすく解説してください。'
  },
  {
    label: '瞬時に口から出すコツ',
    icon: <Zap size={13} />,
    query: 'この文型・パターンを頭で考え込まず、瞬時に0.5秒で口から発話できるようになるためのパターンプラクティスのコツを教えてください。'
  },
  {
    label: '日米のニュアンスの違い',
    icon: <Globe size={13} />,
    query: '直訳した日本語と、実際の英語表現が持つニュアンスの違いやシチュエーションでの使い分けを教えてください。'
  }
];

export const GENERAL_QUICK_PROMPTS: CoachQuickPrompt[] = [
  {
    label: '初心者におすすめの会話は？',
    icon: <Lightbulb size={13} />,
    query: '英会話初心者ですが、まずはどのシチュエーションから練習するのがおすすめですか？効果的な練習手順も教えてください。'
  },
  {
    label: '海外旅行で役立つ定番フレーズ',
    icon: <Globe size={13} />,
    query: '海外旅行（カフェ、空港、ホテル、タクシーなど）で絶対に役立つ重要フレーズを5つ教えてください。'
  },
  {
    label: '英会話が続く相槌のコツ',
    icon: <MessageCircleQuestion size={13} />,
    query: 'ネイティブとの会話で自然にリアクションできる「相槌（あいづち）」や繋ぎ言葉の使い分けを教えてください。'
  },
  {
    label: '言いたい言葉が出ないときの対処法',
    icon: <HelpCircle size={13} />,
    query: '英語を話す時に言いたい単語や表現が出てこない時、どう言い換えたり切り抜ければいいですか？'
  }
];

export interface ResolveCoachQuickPromptsOptions {
  mode?: CoachMode;
  situation?: Partial<Situation> | null;
  lastAiText?: string;
  isWaitingForUser?: boolean;
  shadowingContext?: CoachShadowingContext | null;
  blitzContext?: CoachBlitzContext | null;
}

export function resolveCoachQuickPrompts({
  mode = 'conversation',
  situation = null,
  lastAiText = '',
  isWaitingForUser = false,
  shadowingContext = null,
  blitzContext = null
}: ResolveCoachQuickPromptsOptions): CoachQuickPrompt[] {
  if (mode === 'shadowing') {
    return SHADOWING_QUICK_PROMPTS.map(p => {
      if (p.label === 'リエゾン・発音のコツ' && shadowingContext?.title) {
        return {
          ...p,
          query: `スクリプト「${shadowingContext.title}」について、音が繋がる部分（リエゾン/リンキング）や脱落の発音の注意点を詳しく解説してください。`
        };
      }
      return p;
    });
  }

  if (mode === 'blitz') {
    return BLITZ_QUICK_PROMPTS.map(p => {
      if (p.label === '別の自然な言い回し・表現' && blitzContext?.currentQuestion) {
        const questionPrompt = blitzContext.currentQuestion.japanese || blitzContext.currentQuestion.prompt || '';
        const sampleAnswer = blitzContext.currentQuestion.sampleAnswer || blitzContext.currentQuestion.answer || '';
        if (blitzContext.userSpeech) {
          return {
            ...p,
            query: `お題「${questionPrompt}」に対して自分は「${blitzContext.userSpeech}」と答えました。模範解答「${sampleAnswer}」と比較して、どこを直すとより自然か、別の表現も交えて教えてください。`
          };
        }
        return {
          ...p,
          query: `お題「${questionPrompt}」に対して、標準解答「${sampleAnswer}」以外の別の自然な表現を教えてください。`
        };
      }
      if (p.label === 'なぜこの語順・文法になる？' && blitzContext?.currentQuestion) {
        const questionPrompt = blitzContext.currentQuestion.japanese || blitzContext.currentQuestion.prompt || '';
        const sampleAnswer = blitzContext.currentQuestion.sampleAnswer || blitzContext.currentQuestion.answer || '';
        return {
          ...p,
          query: `お題「${questionPrompt}」（英語: "${sampleAnswer}"）の語順や文法の理由を初心者向けに解説してください。`
        };
      }
      return p;
    });
  }

  if (situation) {
    return CONVERSATION_QUICK_PROMPTS.map(p => {
      if (p.label === '相手の発言のニュアンス' && lastAiText) {
        return {
          ...p,
          query: `直前の相手の発言「${lastAiText}」の日本語訳とニュアンス、言外の意図を詳しく分かりやすく解説してください。`
        };
      }
      if (p.label === 'ここで使える自然な返答' && lastAiText) {
        if (isWaitingForUser) {
          return {
            ...p,
            query: `相手の直前の発言「${lastAiText}」に対してまだ返答していません。ここで自然に返答できるおすすめの英語フレーズの選択肢を教えてください。`
          };
        }
        return {
          ...p,
          query: `直前の相手の発言「${lastAiText}」に対して、ここで自然に返答できるおすすめの英語フレーズを教えてください。`
        };
      }
      return p;
    });
  }

  return GENERAL_QUICK_PROMPTS;
}
