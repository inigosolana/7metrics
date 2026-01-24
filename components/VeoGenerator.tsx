import React, { useState } from 'react';
import { generateVideo, pollVideoOperation } from '../services/geminiService';

interface VeoGeneratorProps {
  onClose: () => void;
}

const VeoGenerator: React.FC<VeoGeneratorProps> = ({ onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<'idle' | 'generating' | 'polling' | 'complete' | 'error'>('idle');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setStatus('generating');

    try {
      let operation = await generateVideo(prompt);

      if (!operation) {
        // Typically means key selection was needed or failed
        setStatus('idle');
        return;
      }

      setStatus('polling');

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await pollVideoOperation(operation);
      }

      if (operation.response?.generatedVideos?.[0]?.video?.uri) {
        const downloadLink = operation.response.generatedVideos[0].video.uri;
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        const finalUrl = `${downloadLink}&key=${apiKey}`;
        setVideoUrl(finalUrl);
        setStatus('complete');
      } else {
        throw new Error("No video returned");
      }

    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#1C1612] w-full max-w-lg rounded-2xl border border-slate-200 dark:border-stone-700 shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-stone-800 flex justify-between items-center">
          <h3 className="text-xl font-bold font-display dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">video_spark</span>
            Veo Drill Generator
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><span className="material-symbols-outlined">close</span></button>
        </div>

        <div className="p-6 space-y-4">
          {status === 'complete' && videoUrl ? (
            <div className="space-y-4 animate-in fade-in">
              <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                <video src={videoUrl} controls autoPlay loop className="w-full h-full object-contain" />
              </div>
              <button onClick={() => { setStatus('idle'); setVideoUrl(null); }} className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold">Generate Another</button>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-bold text-slate-500 dark:text-stone-400 mb-2">Describe the drill or play</label>
                <textarea
                  className="w-full bg-slate-100 dark:bg-stone-900 border-none rounded-xl p-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary h-32 resize-none"
                  placeholder="e.g., A handball player performing a jump shot from the 9m line in slow motion, cinematic lighting."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              {status === 'error' && (
                <p className="text-red-500 text-sm">Failed to generate video. Please try again.</p>
              )}

              {status === 'generating' || status === 'polling' ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm font-medium text-slate-400 animate-pulse">
                    {status === 'generating' ? 'Initializing Veo Model...' : 'Rendering Video (this may take a minute)...'}
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleGenerate}
                  disabled={!prompt}
                  className="w-full py-4 bg-primary hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <span className="material-symbols-outlined">auto_awesome</span>
                  Generate with Veo
                </button>
              )}
            </>
          )}
        </div>

        <div className="p-4 bg-slate-50 dark:bg-stone-900/50 border-t border-slate-200 dark:border-stone-800 text-center">
          <p className="text-xs text-slate-500">Powered by Google Veo 3.1 • Generates 720p Preview</p>
        </div>
      </div>
    </div>
  );
};

export default VeoGenerator;