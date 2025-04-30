import React, { useEffect, useRef } from 'react';
import TypeIt from 'typeit';

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
}

export const Typewriter: React.FC<TypewriterProps> = ({
  text,
  speed = 100,
  className,
  cursor = true,
  as = "span"
}) => {
  const elRef = useRef<HTMLElement | null>(null);
  const instance = useRef<any>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const placeholderRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (elRef.current) {
      // Clean up any previous instance
      if (instance.current) {
        instance.current.destroy();
      }

      // Create new instance
      instance.current = new TypeIt(elRef.current, {
        strings: [text],
        speed,
        cursor,
        waitUntilVisible: true,
        lifeLike: true,
      }).go();
    }

    // Cleanup on unmount
    return () => {
      if (instance.current) {
        instance.current.destroy();
      }
    };
  }, [text, speed, cursor]);

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
