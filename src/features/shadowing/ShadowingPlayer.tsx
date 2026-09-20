import React from 'react';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import MicButton from '../../components/common/MicButton';
import Alert from '../../components/common/Alert';
import ShadowingAudioControls from './ShadowingAudioControls';
import ShadowingEvaluationCard from './ShadowingEvaluationCard';
import ShadowingScriptViewer from './ShadowingScriptViewer';
import { useShadowingSession } from './useShadowingSession';
import { useSettings } from '../../hooks/useSettings';
import { CoachShadowingContext, ShadowingScript } from '../../types';

export interface ShadowingPlayerProps {
  script: ShadowingScript;
  onBack: () => void;
  apiKey?: string;
  model?: string;
  onOpenApiKeyModal?: () => void;
  onContextChange?: (context: CoachShadowingContext) => void;
}

export default function ShadowingPlayer({
  script,
  onBack,
  apiKey: propsApiKey,
  model: propsModel,
  onOpenApiKeyModal: propsOnOpenApiKeyModal,
  onContextChange
}: ShadowingPlayerProps) {
  const settings = useSettings();
  const apiKey = propsApiKey ?? settings.apiKey;
  const model = propsModel ?? settings.model;
  const onOpenApiKeyModal = propsOnOpenApiKeyModal ?? settings.openApiKeyModal;

  const {
    playbackSpeed,
    setPlaybackSpeed,
    isPlaying,
    isLooping,
    setIsLooping,
    isRecording,
    isSupported,
    userTranscript,
    errorMsg,
    isEvaluating,
    evalResult,
    handlePlayAudio,
    toggleRecording,
    handleEvaluate
  } = useShadowingSession({
    script,
    apiKey,
    model,
    onOpenApiKeyModal,
    onContextChange
  });

  return (
    <div className="shadowing-container animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      {/* Top Header & Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button className="btn btn-ghost" onClick={onBack} style={{ paddingLeft: 0 }}>
          <ArrowLeft size={18} /> 教材一覧に戻る
        </button>

        <span className="badge badge-purple" style={{ fontSize: '0.85rem' }}>
          {script.difficultyLabel || script.difficulty}
        </span>
      </div>

      {errorMsg && (
        <Alert variant="error" style={{ marginBottom: '16px' }}>
          {errorMsg}
        </Alert>
      )}

      {/* Main Practice Card */}
      <div className="chat-container" style={{ display: 'block', padding: '18px 16px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: 'clamp(1.15rem, 3.5vw, 1.4rem)', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
            {script.title}
          </h2>
          <div style={{ fontSize: '0.86rem', color: '#64748B', fontWeight: 600 }}>
            {script.titleJa}
          </div>
        </div>

        {/* Player Controls Bar */}
        <ShadowingAudioControls
          isPlaying={isPlaying}
          isLooping={isLooping}
          playbackSpeed={playbackSpeed}
          onPlayToggle={handlePlayAudio}
          onLoopToggle={() => setIsLooping(!isLooping)}
          onSpeedChange={setPlaybackSpeed}
        />

        {/* Script Content & Mode Toggles */}
        <ShadowingScriptViewer
          text={script.text}
          slashedText={script.slashedText}
          translation={script.translation}
          tipsJa={script.tipsJa}
        />

        {/* Recording Section */}
        <div className="shadowing-recording-section" style={{ borderTop: '1px solid #E2E8F0', paddingTop: '20px', textAlign: 'center' }}>
          <div style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#475569' }}>
              {isRecording ? '🎧 音声を聴きながら同時に発話中...' : 'マイクを押してシャドーイング（音読）開始'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <MicButton
              isRecording={isRecording}
              onClick={toggleRecording}
              disabled={!isSupported || isEvaluating}
              iconSize={24}
              title={isRecording ? "録音停止" : "シャドーイング録音開始"}
            />
          </div>

          {/* Transcript Feedback Live */}
          {userTranscript && (
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px 16px', margin: '0 auto 16px auto', maxWidth: '600px', textAlign: 'left' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                音声認識テキスト:
              </div>
              <p style={{ fontSize: '0.92rem', color: '#1E293B', fontStyle: 'italic', margin: 0 }}>
                "{userTranscript}"
              </p>
            </div>
          )}

          {/* Evaluation Trigger Button */}
          {userTranscript && !isRecording && (
            <button
              className="btn btn-primary"
              onClick={handleEvaluate}
              disabled={isEvaluating}
              style={{ padding: '10px 24px', fontSize: '0.95rem' }}
            >
              {isEvaluating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  AIが発音・流暢さを診断中...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Gemini AIで精度診断を受ける
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Evaluation Results Report */}
      {evalResult && (
        <ShadowingEvaluationCard
          evalResult={evalResult}
        />
      )}
    </div>
  );
}
