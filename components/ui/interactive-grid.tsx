"use client";

import React, { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

interface AnimatedGridPatternProps extends ComponentPropsWithoutRef<"div"> {
  size?: number;
  spacing?: number;
  opacity?: number;
  speed?: number;
}

export const AnimatedGridPattern = React.memo(function AnimatedGridPattern({
  size = 4,
  spacing = 50,
  opacity = 0.3,
  speed = 20,
  className,
  ...props
}: AnimatedGridPatternProps) {
  const gridSize = Math.ceil(1000 / spacing);
  const lines = [];

  // Create horizontal lines
  for (let i = 0; i <= gridSize; i++) {
    lines.push({
      type: 'horizontal',
      y: i * spacing,
      delay: i * 0.1,
    });
  }

  // Create vertical lines
  for (let i = 0; i <= gridSize; i++) {
    lines.push({
      type: 'vertical',
      x: i * spacing,
      delay: i * 0.1,
    });
  }

  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none overflow-hidden",
        className
      )}
      {...props}
    >
      {/* Animated grid lines */}
      {lines.map((line, index) => (
        <div
          key={index}
          className="absolute bg-gradient-to-r from-primary/10 to-transparent animate-pulse-gentle"
          style={{
            left: line.type === 'vertical' ? `${line.x}px` : '0px',
            top: line.type === 'horizontal' ? `${line.y}px` : '0px',
            width: line.type === 'vertical' ? `${size}px` : '100%',
            height: line.type === 'horizontal' ? `${size}px` : '100%',
            opacity: opacity,
            animationDelay: `${line.delay}s`,
            animationDuration: `${speed}s`,
          }}
        />
      ))}
      
      {/* Animated dots at intersections */}
      {Array.from({ length: gridSize * gridSize }, (_, index) => {
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;
        return (
          <div
            key={`dot-${index}`}
            className="absolute animate-pulse-gentle"
            style={{
              left: `${col * spacing}px`,
              top: `${row * spacing}px`,
              width: `${size * 2}px`,
              height: `${size * 2}px`,
              opacity: opacity * 0.5,
              animationDelay: `${(row + col) * 0.05}s`,
              animationDuration: `${speed * 0.8}s`,
            }}
          >
            <div className="w-full h-full bg-primary/30 rounded-full" />
          </div>
        );
      })}
    </div>
  );
});

AnimatedGridPattern.displayName = "AnimatedGridPattern"; 