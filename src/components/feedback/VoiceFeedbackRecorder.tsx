import React, { useState, useRef } from 'react';
import { ApiService } from '../../services/api.js';
import { Mic, Square, Loader2, Sparkles, AlertCircle, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext.js';

interface VoiceFeedbackRecorderProps {
  onTranscriptionComplete: (transcript: string) => void;
}

export function VoiceFeedbackRecorder({ onTranscriptionComplete }: VoiceFeedbackRecorderProps) {
  const { addToast } = useApp();
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        await processAudio(audioBlob);
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Audio capture permission failed:', err);
      addToast({
        title: 'Microphone Permission Needed',
        message: 'Please allow microphone access in your browser to record voice feedback.',
        type: 'warning'
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const processAudio = async (blob: Blob) => {
    try {
      setIsTranscribing(true);
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        try {
          const res = await ApiService.transcribeVoice(base64Audio, 'audio/webm');
          if (res.transcript) {
            onTranscriptionComplete(res.transcript);
            addToast({
              title: 'Voice Transcribed by Gemini',
              message: `Language: ${res.detectedLanguage} (Confidence: ${Math.round((res.confidence || 0.95) * 100)}%)`,
              type: 'success'
            });
          }
        } catch (err) {
          console.error(err);
          addToast({
            title: 'Transcription Failed',
            message: 'Unable to parse audio stream with Gemini speech model.',
            type: 'error'
          });
        } finally {
          setIsTranscribing(false);
        }
      };
    } catch (err) {
      setIsTranscribing(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-800/40">
      {isTranscribing ? (
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold animate-pulse">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Gemini AI is transcribing audio...</span>
        </div>
      ) : isRecording ? (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-rose-600 font-bold">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-600 animate-ping" />
            <span>Recording ({formatTimer(recordingDuration)})</span>
          </div>
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1 text-white font-semibold shadow-2xs hover:bg-rose-700 transition"
          >
            <Square className="h-3 w-3 fill-white" />
            <span>Stop</span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={startRecording}
          className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 font-medium transition"
        >
          <Mic className="h-3.5 w-3.5 text-indigo-500" />
          <span>Record Voice Feedback</span>
        </button>
      )}
    </div>
  );
}
