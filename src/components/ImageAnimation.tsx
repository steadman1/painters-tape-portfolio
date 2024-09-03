import { useState, useEffect, useCallback, useRef } from 'react';
import { isMobile } from 'react-device-detect';

const ImageAnimation = ({ height, frames, msBetweenFrame = 15 }: { height: React.CSSProperties, frames: string[], msBetweenFrame?: number }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [highResLoaded, setHighResLoaded] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const animationInterval = useRef<number | undefined>(undefined);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const scale = () => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    const divisor = isMobile ? 350 : 300;
    const scaleFactorX = windowWidth / divisor;
    const scaleFactorY = windowHeight / divisor;

    return Math.min(Math.max(scaleFactorX, scaleFactorY, 1.2), isMobile ? 2.4 : 3);
  };

  const startAnimation = useCallback(() => {
    if (!isAnimating) {
      setIsAnimating(true);
    }
  }, [isAnimating]);

  const stopAnimation = useCallback(() => {
    if (isAnimating) {
      clearInterval(animationInterval.current);
      setIsAnimating(false);
    }
  }, [isAnimating]);

  const resetAnimation = useCallback(() => {
    setCurrentFrame(0);
    stopAnimation();
  }, [stopAnimation]);

  useEffect(() => {
    if (isAnimating) {
      animationInterval.current = setInterval(() => {
        setCurrentFrame((prevFrame) => {
          if (prevFrame + 1 === frames.length) {
            stopAnimation();
            return prevFrame;
          }
          return prevFrame + 1;
        });
      }, msBetweenFrame);
    }

    return () => clearInterval(animationInterval.current);
  }, [isAnimating, frames.length, msBetweenFrame, stopAnimation]);

  useEffect(() => {
    if (imageRef.current) {
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            startAnimation();
          } else {
            resetAnimation();
          }
        },
        { threshold: isMobile ? 0 : 0.1 }
      );

      observerRef.current.observe(imageRef.current);
    }

    return () => {
      stopAnimation();
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [currentFrame, isAnimating, resetAnimation, startAnimation, stopAnimation]);

  const offset = {
    x: 4,
    y: -30,
  };

  const lowResSrc = `/tape-falling-frames-placeholder/${frames[currentFrame]}`;
  const highResSrc = `/tape-falling-frames${ isMobile ? "-min" : "" }/${frames[currentFrame]}`;

  return (
    <div style={{ position: 'relative', ...height }}>
      {/* Low-resolution image */}
      <img
        className="tape-falling-frame"
        src={lowResSrc}
        alt={`low-res-frame-${currentFrame}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale()})`,
          transformOrigin: 'bottom',
          opacity: highResLoaded ? 0 : 1,
          zIndex: highResLoaded ? 4 : 3,
          ...height,
        }}
        ref={imageRef}
      />
      {/* High-resolution image */}
      <img
        loading='lazy'
        className="tape-falling-frame"
        src={highResSrc}
        alt={`frame-${currentFrame}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          transform: `translate(-50%, ${offset.y}px) scale(${scale()})`,
          transformOrigin: 'bottom',
          opacity: highResLoaded ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out',
          zIndex: 4,
          ...height
        }}
        
        onLoad={() => setHighResLoaded(true)}
      />
    </div>
  );
};

export default ImageAnimation;
