'use client';

import { useEffect, useRef, useState } from 'react';
import AudioWaveform from './AudioWaveform';

interface AudioAnalyzerProps {
  audioElement?: HTMLAudioElement;
  isPlaying: boolean;
  onDurationChange?: (duration: number) => void;
}

// Keep track of audio elements that are already connected
const connectedAudioElements = new WeakMap<HTMLAudioElement, {
  context: AudioContext;
  analyzer: AnalyserNode;
  source: MediaElementAudioSourceNode;
}>();

export default function AudioAnalyzer({
  audioElement,
  isPlaying,
  onDurationChange
}: AudioAnalyzerProps) {
  const [audioData, setAudioData] = useState<Float32Array>(new Float32Array(0));
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number>();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize audio analyzer
  useEffect(() => {
    if (!audioElement || isInitialized) return;

    console.log('Initializing audio analyzer');
    
    // Check if this audio element is already connected
    const existingConnection = connectedAudioElements.get(audioElement);
    if (existingConnection) {
      console.log('Reusing existing audio connection');
      audioContextRef.current = existingConnection.context;
      analyzerRef.current = existingConnection.analyzer;
      sourceRef.current = existingConnection.source;
      setIsInitialized(true);
      return;
    }

    // Create new connection
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = context.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;

    try {
      const source = context.createMediaElementSource(audioElement);
      source.connect(analyser);
      // Connect to destination to allow playback
      source.connect(context.destination);
      
      // Store the connection
      connectedAudioElements.set(audioElement, {
        context,
        analyzer: analyser,
        source
      });
      
      audioContextRef.current = context;
      analyzerRef.current = analyser;
      sourceRef.current = source;
      setIsInitialized(true);

      if (onDurationChange) {
        onDurationChange(audioElement.duration);
      }
    } catch (error) {
      console.error('Error setting up audio analyzer:', error);
      if (error instanceof Error && error.message.includes('already connected')) {
        // If we get here, it means the audio element was connected between our check and the createMediaElementSource call
        // This is rare but can happen in concurrent scenarios
        console.log('Audio element was connected in between, attempting to find existing connection');
        const existingConnection = connectedAudioElements.get(audioElement);
        if (existingConnection) {
          audioContextRef.current = existingConnection.context;
          analyzerRef.current = existingConnection.analyzer;
          sourceRef.current = existingConnection.source;
          setIsInitialized(true);
        }
      }
    }

    return () => {
      console.log('Cleaning up audio analyzer');
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Don't disconnect or close the context here as it might be used by other components
      setIsInitialized(false);
    };
  }, [audioElement, onDurationChange, isInitialized]);

  // Analyze audio data
  useEffect(() => {
    if (!analyzerRef.current || !isPlaying || !isInitialized) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const analyzer = analyzerRef.current;
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);

    const analyze = () => {
      if (!analyzer) return;

      analyzer.getFloatTimeDomainData(dataArray);
      setAudioData(new Float32Array(dataArray));
      animationFrameRef.current = requestAnimationFrame(analyze);
    };

    analyze();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, isInitialized]);

  return (
    <AudioWaveform
      audioData={audioData}
      isPlaying={isPlaying}
      height={60}
      barWidth={2}
      barGap={1}
      barColor="#4F46E5"
      backgroundColor="rgba(17, 24, 39, 0.1)"
    />
  );
} 