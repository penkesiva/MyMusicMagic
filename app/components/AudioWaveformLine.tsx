'use client';

import { useEffect, useRef, useState } from 'react';

interface AudioWaveformLineProps {
  audioData: Float32Array;
  isPlaying: boolean;
  width?: number;
  height?: number;
  lineColor?: string;
  backgroundColor?: string;
}

export default function AudioWaveformLine({
  audioData,
  isPlaying,
  width = 400,
  height = 30,
  lineColor = '#4F46E5',
  backgroundColor = 'rgba(17, 24, 39, 0.1)'
}: AudioWaveformLineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const [canvasSize, setCanvasSize] = useState({ width, height });

  // Update canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      setCanvasSize({
        width: Math.max(1, rect.width),
        height: Math.max(1, height)
      });
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [height]);

  // Draw visualization
  useEffect(() => {
    if (!canvasRef.current || !isPlaying || !audioData.length) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = Math.max(1, canvasSize.width);
    canvas.height = Math.max(1, canvasSize.height);

    const draw = () => {
      if (!ctx || !canvas) return;

      // Clear canvas
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw waveform
      ctx.beginPath();
      ctx.lineWidth = 2;

      const sliceWidth = canvas.width / audioData.length;
      let x = 0;

      // Create gradient for the line
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, lineColor);
      gradient.addColorStop(0.5, '#818CF8');
      gradient.addColorStop(1, '#6366F1');
      ctx.strokeStyle = gradient;

      // Add glow effect
      ctx.shadowBlur = 8;
      ctx.shadowColor = lineColor;

      // Draw main line
      ctx.beginPath();
      for (let i = 0; i < audioData.length; i++) {
        const v = audioData[i];
        const y = (v * canvas.height / 2) + canvas.height / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y); // Direct line without smoothing
        }

        x += sliceWidth;
      }
      ctx.stroke();

      // Add inner glow
      ctx.shadowBlur = 4;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.stroke();

      // Reset shadow
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioData, isPlaying, canvasSize, lineColor, backgroundColor]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-lg bg-transparent"
      style={{ height: `${height}px` }}
    />
  );
} 