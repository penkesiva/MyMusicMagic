'use client';

import { useEffect, useRef, useState } from 'react';

interface AudioVisualizerProps {
  audioUrl: string;
  isPlaying: boolean;
  onDurationChange?: (duration: number) => void;
  audioElement?: HTMLAudioElement;
}

export default function AudioVisualizer({ audioUrl, isPlaying, onDurationChange, audioElement }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const animationFrameRef = useRef<number>();
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const [isOscillatorRunning, setIsOscillatorRunning] = useState(false);

  useEffect(() => {
    const setupAudio = async () => {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContext();
        const audioContext = audioContextRef.current;

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 512; // Smaller FFT size for smoother waveform
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;

        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        audioBufferRef.current = audioBuffer;

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        sourceRef.current = source;

        if (onDurationChange) {
          onDurationChange(audioBuffer.duration);
        }

        if (isPlaying) {
          source.start(0);
          draw();
        }
      } catch (error) {
        console.error('Error setting up audio:', error);
      }
    };

    setupAudio();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (sourceRef.current) {
        sourceRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioUrl, onDurationChange]);

  useEffect(() => {
    if (!audioContextRef.current || !sourceRef.current || !audioBufferRef.current) return;

    if (isPlaying) {
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBufferRef.current;
      source.connect(analyserRef.current!);
      sourceRef.current = source;
      source.start(0);
      draw();
    } else {
      sourceRef.current.stop();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!audioElement) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audioElement);
    const gainNode = audioContext.createGain();

    // Connect nodes
    source.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configure analyser
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    analyserRef.current = analyser;

    // Create oscillator for silent playback
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(0.1, audioContext.currentTime);
    oscillator.connect(gainNode);

    return () => {
      if (isOscillatorRunning && oscillator) {
        try {
          oscillator.stop();
          setIsOscillatorRunning(false);
        } catch (error) {
          console.log('Oscillator was not running, no need to stop');
        }
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      audioContext.close();
    };
  }, [audioElement, isOscillatorRunning]);

  useEffect(() => {
    if (!audioElement || !analyserRef.current) return;

    if (isPlaying) {
      try {
        if (!isOscillatorRunning) {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(0.1, audioContext.currentTime);
          oscillator.connect(analyserRef.current);
          oscillator.start();
          setIsOscillatorRunning(true);
        }
        analyserRef.current.getByteTimeDomainData(new Uint8Array(analyserRef.current.frequencyBinCount));
      } catch (error) {
        console.log('Error starting oscillator:', error);
      }
    } else {
      try {
        if (isOscillatorRunning) {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(0.1, audioContext.currentTime);
          oscillator.connect(analyserRef.current);
          oscillator.start();
          setIsOscillatorRunning(true);
        }
        analyserRef.current.getByteTimeDomainData(new Uint8Array(analyserRef.current.frequencyBinCount));
      } catch (error) {
        console.log('Error stopping oscillator:', error);
      }
    }
  }, [isPlaying, audioElement, isOscillatorRunning]);

  const draw = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    const drawFrame = () => {
      animationFrameRef.current = requestAnimationFrame(drawFrame);

      analyser.getByteTimeDomainData(dataArray);

      // Clear with slight fade effect
      canvasCtx.fillStyle = 'rgba(17, 24, 39, 0.1)';
      canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

      // Draw waveform
      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = 'rgb(99, 102, 241)'; // indigo-500
      canvasCtx.beginPath();

      const sliceWidth = (WIDTH * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * HEIGHT) / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.lineTo(WIDTH, HEIGHT / 2);
      canvasCtx.stroke();

      // Add glow effect
      canvasCtx.shadowBlur = 10;
      canvasCtx.shadowColor = 'rgb(99, 102, 241)';
      canvasCtx.stroke();
      canvasCtx.shadowBlur = 0;
    };

    drawFrame();
  };

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={60}
      className="w-full h-[60px] rounded-lg bg-transparent"
    />
  );
} 