import React, { useLayoutEffect, useRef, useState } from "react";

// Measure wrapped lines so the limit also holds on narrow screens.
export default function HeaderLocationValue({ text, onViewMore }) {
  const valueRef = useRef(null);
  const [overflowing, setOverflowing] = useState(false);

  useLayoutEffect(() => {
    const element = valueRef.current;
    const measure = () => setOverflowing(element.scrollHeight > element.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [text]);

  return (
    <span className="category-info-location-preview">
      <span ref={valueRef} className="category-info-location-lines">{text}</span>
      {overflowing && (
        <button type="button" className="category-info-location-more" onClick={onViewMore}>
          View more
        </button>
      )}
    </span>
  );
}
