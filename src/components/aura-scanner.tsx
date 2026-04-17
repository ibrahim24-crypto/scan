
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Fingerprint } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

const SCAN_DURATION_MS = 8000; // 8 seconds

export function AuraScanner() {
  const [progress, setProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [readingStep, setReadingStep] = useState(0);

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
    if (scanComplete) {
      let timeout: NodeJS.Timeout;
      if (readingStep === 0) {
        // "Analyzing..." -> "Beautiful"
        timeout = setTimeout(() => setReadingStep(1), 1500);
      }
      return () => { if (timeout) clearTimeout(timeout); };
    }
  }, [scanComplete, readingStep]);


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
    setReadingStep(0);
    startTimeRef.current = null;
  };

  const handleContinue = () => {
    if (readingStep > 0 && readingStep < 6) {
      setReadingStep(prev => prev + 1);
    }
  };

  if (scanComplete) {
    let content = null;

    switch(readingStep) {
      case 0:
        content = <p>Analyzing your aura...</p>;
        break;
      case 1:
        content = <p className="text-2xl animate-fadeIn">You are beautiful.</p>;
        break;
      case 2:
        content = <p className="text-2xl animate-fadeIn">You are cute.</p>;
        break;
      case 3:
        content = <p className="text-xl animate-fadeIn">Your favorite color is black.</p>;
        break;
      case 4:
        content = <p className="text-xl animate-fadeIn">Your name is Charifa and it is special and rare.</p>;
        break;
      case 5:
        content = (
            <div className="flex flex-col items-center justify-center animate-fadeIn space-y-4">
                <div className="flex items-center justify-center gap-4">
                    <Image
                        src="https://i.giphy.com/f9EmXxglhdhAj1bo28.webp"
                        alt="Aura GIF"
                        width={150}
                        height={150}
                        unoptimized
                        className="rounded-lg"
                    />
                </div>
                <p className="text-3xl font-bold text-primary">I Love You!</p>
            </div>
        );
        break;
      case 6:
        content = <p className="text-xl animate-fadeIn">Even if you don't, I'd bring you things I've never tasted... however, I love you.</p>;
        break;
    }

    const canContinue = readingStep > 0 && readingStep < 6;

    return (
      <div 
        className="flex flex-col items-center text-center animate-fadeIn max-w-lg mx-auto w-full cursor-pointer"
        onClick={handleContinue}
        style={{ cursor: canContinue ? 'pointer' : 'default' }}
      >
        <h1 className="text-4xl md:text-5xl font-headline mb-6 text-primary tracking-wide">Aura Analysis Complete</h1>
        <Card className="w-full bg-primary/5 border-primary/20 shadow-xl shadow-primary/10">
          <CardContent className="p-8 text-lg md:text-xl text-foreground/90 min-h-[400px] flex flex-col justify-center items-center gap-4">
            {content}
          </CardContent>
        </Card>
        {canContinue && (
          <p className="mt-4 text-sm text-foreground/60 animate-pulse">Click anywhere to continue</p>
        )}
        <Button 
          variant="link"
          onClick={(e) => {
            e.stopPropagation();
            resetScan();
          }}
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
