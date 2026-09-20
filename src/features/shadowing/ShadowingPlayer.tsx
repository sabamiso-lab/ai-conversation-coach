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
    <div className="shadowing-container animate-fade-in">
      {/* Top Header & Navigation */}
      <div className="shadowing-top-nav">
        <button className="btn btn-ghost" onClick={onBack}>
          <ArrowLeft size={18} /> 教材一覧に戻る
        </button>

        <span className="badge badge-purple">
          {script.difficultyLabel || script.difficulty}
        </span>
      </div>

      {errorMsg && (
        <Alert variant="error">
          {errorMsg}
        </Alert>
      )}

      {/* Main Practice Card */}
      <div className="shadowing-card">
        <div className="shadowing-header-meta">
          <h2 className="shadowing-title">
            {script.title}
          </h2>
          <div className="shadowing-subtitle">
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
        <div className="shadowing-recording-section">
          <div className="mb-3">
            <span className="shadowing-rec-status">
              {isRecording ? '🎧 音声を聴きながら同時に発話中...' : 'マイクを押してシャドーイング（音読）開始'}
            </span>
          </div>

          <div className="shadowing-mic-wrap">
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
            <div className="shadowing-transcript-box">
              <div className="shadowing-transcript-label">
                音声認識テキスト:
              </div>
              <p className="shadowing-transcript-text">
                "{userTranscript}"
              </p>
            </div>
          )}

          {/* Evaluation Trigger Button */}
          {userTranscript && !isRecording && (
            <button
              className="btn btn-primary shadowing-eval-btn"
              onClick={handleEvaluate}
              disabled={isEvaluating}
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
