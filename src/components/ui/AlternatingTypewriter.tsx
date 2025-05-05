import React, { useEffect, useRef, useState } from 'react';
import TypeIt from 'typeit';

interface AlternatingTypewriterProps {
  prefix: string;
  alternatingWords: string[];
  postfix: string;
  speed?: number;
  className?: string;
  cursor?: boolean;
  as?: keyof HTMLElementTagNameMap;
  pauseTime?: number;
  loop?: boolean;
}

export const AlternatingTypewriter: React.FC<AlternatingTypewriterProps> = ({
  prefix,
  alternatingWords,
  postfix,
  speed = 100,
  className,
  cursor = true,
  as = "span",
  pauseTime = 2000,
  loop = true
}) => {
  const elRef = useRef<HTMLElement | null>(null);
  const instance = useRef<any>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const placeholderRef = useRef<HTMLElement | null>(null);

  // Calculate the maximum possible text length for space reservation
  const maxText = `${prefix} ${alternatingWords.reduce((a, b) => a.length > b.length ? a : b)} ${postfix}`;

  // Keep track of whether the component is mounted
  const isMounted = useRef(true);

  useEffect(() => {
    // Set mounted flag to true when the component mounts
    isMounted.current = true;

    // Only proceed if we have a valid reference
    if (elRef.current && isMounted.current) {
      // Safely clean up any previous instance
      try {
        if (instance.current) {
          instance.current.destroy();
        }
      } catch (error) {
        console.warn('Error cleaning up previous TypeIt instance:', error);
      }

      // Create new instance
      const typeItInstance = new TypeIt(elRef.current, {
        speed,
        cursor,
        waitUntilVisible: true,
        lifeLike: true,
        loop: false, // We'll handle looping manually for better control
      });

      // Chain the animation for each word
      let chain = typeItInstance.type(prefix);
      alternatingWords.forEach((word, index) => {
        const isLast = index === alternatingWords.length - 1;
        chain = chain.type(word).type(postfix).pause(pauseTime);
        if (!isLast) {
          const deleteCount = word.length + postfix.length;
          chain = chain.delete(deleteCount);
        }
      });

      // Only restart if loop is enabled and there is more than one word
      if (loop && alternatingWords.length > 1) {
        // After completing all words once, we'll manually restart
        typeItInstance.exec(() => {
          setTimeout(() => {
            if (elRef.current && isMounted.current) {
              try {
                if (instance.current) {
                  // Check if the element still exists in the DOM before destroying
                  if (elRef.current && document.body.contains(elRef.current)) {
                    instance.current.destroy();
                  }
                }
                // Create a new instance to restart the animation
                const newInstance = new TypeIt(elRef.current, {
                  speed,
                  cursor,
                  waitUntilVisible: true,
                  lifeLike: true,
                  loop: false,
                });
                newInstance.type(prefix);
                alternatingWords.forEach((word, index) => {
                  const isLast = index === alternatingWords.length - 1;
                  newInstance.type(word).type(postfix).pause(pauseTime);
                  if (!isLast) {
                    const deleteCount = word.length + postfix.length;
                    newInstance.delete(deleteCount);
                  }
                });
                newInstance.go();
                instance.current = newInstance;
              } catch (error) {
                console.warn('Error restarting TypeIt animation:', error);
              }
            }
          }, pauseTime);
        });
      }
      // If not looping, do nothing after the last word: just leave it displayed

      // Start the animation
      typeItInstance.go();
      instance.current = typeItInstance;
    }

    // Cleanup on unmount - with error handling
    return () => {
      // Set mounted flag to false to prevent further updates
      isMounted.current = false;

      try {
        if (instance.current) {
          // Check if the element still exists in the DOM before destroying
          if (elRef.current && document.body.contains(elRef.current)) {
            instance.current.destroy();
          }
          instance.current = null;
        }
      } catch (error) {
        console.warn('Error during TypeIt cleanup:', error);
        instance.current = null;
      }
    };
  }, [prefix, alternatingWords, postfix, speed, cursor, pauseTime]);

  // Create the element dynamically based on the 'as' prop
  const Element = as as any;

  // Create wrapper styles to maintain consistent dimensions
  const wrapperStyle: React.CSSProperties = {
    position: 'relative',
    minHeight: '1em', // Minimum height to prevent collapse
    display: 'block',
  };

  // Create a placeholder with the same text but invisible to reserve space
  const placeholderStyle: React.CSSProperties = {
    visibility: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    whiteSpace: 'pre-wrap',
    width: '100%',
    height: 'auto',
    display: 'block',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    fontWeight: 'inherit',
    lineHeight: 'inherit',
    margin: 0,
    padding: 0,
  };

  return (
    // The wrapper div inherits the original className to maintain styling
    <Element ref={wrapperRef} style={wrapperStyle} className={className}>
      {/* Invisible placeholder to reserve space */}
      <span ref={placeholderRef} style={placeholderStyle}>{maxText}</span>

      {/* Actual TypeIt element - positioned relatively to avoid layout shifts */}
      <span
        ref={elRef}
        style={{
          position: 'relative',
          display: 'block',
        }}
        className={className}
      />
    </Element>
  );
};
