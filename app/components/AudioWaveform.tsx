'use client';

import { useEffect, useRef, useState } from 'react';

interface AudioWaveformProps {
  audioData: Float32Array;
  isPlaying: boolean;
  width?: number;
  height?: number;
  barWidth?: number;
  barGap?: number;
  barColor?: string;
  backgroundColor?: string;
}

export default function AudioWaveform({
  audioData,
  isPlaying,
  width = 400,
  height = 30,
  barWidth = 2,
  barGap = 1,
  barColor = '#4F46E5',
  backgroundColor = 'rgba(17, 24, 39, 0.1)'
}: AudioWaveformProps) {
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
        width: Math.max(1, rect.width), // Ensure width is at least 1
        height: Math.max(1, height) // Ensure height is at least 1
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

      // Calculate number of bars that can fit
      const totalBars = Math.max(1, Math.floor(canvas.width / (barWidth + barGap)));
      const samplesPerBar = Math.max(1, Math.floor(audioData.length / totalBars));

      // Draw bars
      let x = 0;

      for (let i = 0; i < totalBars; i++) {
        // Calculate average amplitude for this bar
        let sum = 0;
        let validSamples = 0;
        
        for (let j = 0; j < samplesPerBar; j++) {
          const index = i * samplesPerBar + j;
          if (index < audioData.length) {
            const value = Math.abs(audioData[index]);
            if (isFinite(value)) {
              sum += value;
              validSamples++;
            }
          }
        }

        const average = validSamples > 0 ? sum / validSamples : 0;
        
        // Direct height calculation without smoothing
        const barHeight = Math.min(
          canvas.height,
          Math.max(1, average * canvas.height * 2.5) // Increased amplification
        );
        
        const y = Math.max(0, Math.min(canvas.height - barHeight, (canvas.height - barHeight) / 2));

        if (isFinite(y) && isFinite(barHeight) && barHeight > 0) {
          // Gradient
          const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
          gradient.addColorStop(0, barColor);
          gradient.addColorStop(0.5, '#818CF8');
          gradient.addColorStop(1, '#6366F1');
          ctx.fillStyle = gradient;

          // Glow effect
          ctx.shadowBlur = 8;
          ctx.shadowColor = barColor;
          
          // Draw bar
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 2);
          ctx.fill();
          
          // Add inner glow
          ctx.shadowBlur = 4;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.fill();
          
          // Reset shadow
          ctx.shadowBlur = 0;
          ctx.shadowColor = 'transparent';
        }
        
        x += barWidth + barGap;
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioData, isPlaying, canvasSize, barWidth, barGap, barColor, backgroundColor]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-lg bg-transparent"
      style={{ height: `${height}px` }}
    />
  );
} 