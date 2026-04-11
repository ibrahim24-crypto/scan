"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Fingerprint } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const SCAN_DURATION_MS = 2500; // 2.5 seconds

export function AuraScanner() {
  const [progress, setProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const startScan = useCallback(() => {
    if (isScanning || scanComplete) return;

    setIsScanning(true);
    setShowHint(false);
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsedTime = Date.now() - (startTimeRef.current ?? Date.now());
      const newProgress = Math.min((elapsedTime / SCAN_DURATION_MS) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setScanComplete(true);
        setIsScanning(false);
      }
    }, 50);
  }, [isScanning, scanComplete]);

  const stopScan = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (!scanComplete) {
      setIsScanning(false);
      setProgress(0);
      setShowHint(true);
      startTimeRef.current = null;
    }
  }, [scanComplete]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  const resetScan = () => {
    setScanComplete(false);
    setProgress(0);
    setShowHint(true);
    setIsScanning(false);
    startTimeRef.current = null;
  };

  if (scanComplete) {
    return (
      <div className="flex flex-col items-center text-center animate-fadeIn max-w-lg mx-auto">
        <h1 className="text-4xl md:text-5xl font-headline mb-6 text-primary tracking-wide">Aura Analysis Complete</h1>
        <Card className="w-full bg-primary/5 border-primary/20 shadow-xl shadow-primary/10">
          <CardContent className="p-8 space-y-4 text-lg md:text-xl text-foreground/90">
            <p>You are unlimited beautiful.</p>
            <p>You are cute and you like chocolate.</p>
            <p>Your favorite color is black.</p>
            <p>Your name is special and rare.</p>
          </CardContent>
        </Card>
        <Button 
          variant="link"
          onClick={resetScan}
          className="mt-8 text-lg text-accent/80 hover:text-accent"
        >
          Scan Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center gap-8">
      <div
        role="button"
        aria-label="Press and hold to scan aura"
        tabIndex={0}
        className="relative w-48 h-48 md:w-60 md:h-60 rounded-full flex items-center justify-center cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
        onMouseDown={startScan}
        onMouseUp={stopScan}
        onMouseLeave={stopScan}
        onTouchStart={(e) => { e.preventDefault(); startScan(); }}
        onTouchEnd={stopScan}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') startScan(); }}
        onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') stopScan(); }}
      >
        <div 
          className="absolute inset-0 rounded-full transition-all"
          style={{
            background: `conic-gradient(hsl(var(--primary)) ${progress}%, transparent ${progress}%)`,
            maskImage: 'radial-gradient(transparent 68%, black 69%)',
            WebkitMaskImage: 'radial-gradient(transparent 68%, black 69%)',
          }}
        />

        <div className={cn(
          "absolute -inset-1 rounded-full border-2 border-primary/20 transition-shadow duration-300",
          isScanning && "animate-aura-pulse"
        )} />
        
        <div className="relative w-[calc(100%-2.5rem)] h-[calc(100%-2.5rem)] rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 backdrop-blur-sm shadow-inner shadow-black/50">
          <Fingerprint
            className={cn(
              'w-20 h-20 md:w-24 md:h-24 text-primary/70 transition-all duration-500',
              isScanning && 'text-primary scale-105'
            )}
            strokeWidth={1.5}
          />
        </div>
      </div>
      
      <div className={cn(
          "transition-opacity duration-500 text-center",
          showHint ? "opacity-100" : "opacity-0"
        )}>
        <h1 className="font-headline text-3xl md:text-4xl mb-2 tracking-wide text-foreground">AuraLens</h1>
        <p className="text-lg text-foreground/70">Press and hold to scan your aura.</p>
      </div>
    </div>
  );
}
