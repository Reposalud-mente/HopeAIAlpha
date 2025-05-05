import React, { useEffect, useRef } from 'react';
import TypeIt from 'typeit';
import { hasTypewriterAnimationPlayed } from '@/utils/typewriter-utils';

interface TypewriterProps {
  text?: string;
  speed?: number; // ms per character
  className?: string;
  cursor?: boolean;
  as?: keyof HTMLElementTagNameMap;
  alternatingWords?: string[];
  alternatingPrefix?: string;
  alternatingPostfix?: string;
  loop?: boolean;
  id?: string; // Unique identifier for this typewriter instance
}

export const Typewriter: React.FC<TypewriterProps> = ({
  text,
  speed = 100,
  className,
  cursor = true,
  as = "span",
  id = "default" // Default ID if none provided
}) => {
  const elRef = useRef<HTMLElement | null>(null);
  const instance = useRef<any>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const placeholderRef = useRef<HTMLElement | null>(null);
  // Generate a storage key based on the id prop
  const storageKey = `typeit-animated-${id}`;

  useEffect(() => {
    // Check if this animation has already been played
    const hasAlreadyAnimated = hasTypewriterAnimationPlayed(id);

    if (elRef.current && !hasAlreadyAnimated) {
      // Clean up any previous instance
      if (instance.current) {
        try {
          instance.current.destroy();
        } catch (error) {
          console.warn('Error cleaning up previous TypeIt instance:', error);
        }
      }

      // Create new instance
      instance.current = new TypeIt(elRef.current, {
        strings: [text || ''], // Ensure text is never undefined
        speed,
        cursor,
        waitUntilVisible: true,
        lifeLike: true,
        afterComplete: () => {
          // Mark this animation as completed
          localStorage.setItem(storageKey, 'true');
        }
      }).go();
    } else if (elRef.current && hasAlreadyAnimated) {
      // If already animated, just display the text without animation
      elRef.current.innerHTML = text || '';
    }

    // Cleanup on unmount
    return () => {
      if (instance.current) {
        try {
          // Check if the element still exists in the DOM before destroying
          if (elRef.current && document.body.contains(elRef.current)) {
            instance.current.destroy();
          } else {
            // If element is no longer in the DOM, just clean up the reference
            instance.current = null;
          }
        } catch (error) {
          console.warn('Error during TypeIt cleanup:', error);
          instance.current = null;
        }
      }
    };
  }, [text, speed, cursor, storageKey]);

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

  // Create a class name for the TypeIt element that preserves the original className
  // but doesn't include any margin/padding classes that would affect layout
  const typeItClassName = className;

  return (
    // The wrapper div inherits the original className to maintain styling
    <Element ref={wrapperRef} style={wrapperStyle} className={className}>
      {/* Invisible placeholder to reserve space */}
      <span ref={placeholderRef} style={placeholderStyle}>{text}</span>

      {/* Actual TypeIt element - positioned absolutely to avoid layout shifts */}
      <span
        ref={elRef}
        style={{
          position: 'relative',
          display: 'block',
        }}
        className={typeItClassName}
      />
    </Element>
  );
};
