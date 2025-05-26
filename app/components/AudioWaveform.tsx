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
  height = 60,
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

      // Clear canvas with fade effect
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

        // Calculate average only if we have valid samples
        const average = validSamples > 0 ? sum / validSamples : 0;
        
        // Calculate bar height (with some amplification for better visibility)
        // Ensure the height is finite and within bounds
        const barHeight = Math.min(
          canvas.height,
          Math.max(1, average * canvas.height * 1.5)
        );
        
        // Ensure y position is valid
        const y = Math.max(0, Math.min(canvas.height - barHeight, (canvas.height - barHeight) / 2));

        // Only create gradient if we have valid coordinates
        if (isFinite(y) && isFinite(barHeight) && barHeight > 0) {
          const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
          gradient.addColorStop(0, barColor);
          gradient.addColorStop(1, '#818CF8'); // Lighter shade for bottom
          ctx.fillStyle = gradient;

          // Add glow effect
          ctx.shadowBlur = 5;
          ctx.shadowColor = barColor;
          
          // Draw rounded bar
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 2);
          ctx.fill();
          
          // Reset shadow
          ctx.shadowBlur = 0;
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