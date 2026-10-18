import React, { useEffect, useState, useCallback } from 'react';
import Icon from './Icon';

const SCROLL_THRESHOLD = 420;

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleScrollTop = useCallback(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      className="scroll-to-top-btn"
      onClick={handleScrollTop}
      aria-label="Scroll back to top"
      title="Back to top"
    >
      <Icon name="up" size={18} />
      <span className="mono-font">TOP</span>
    </button>
  );
}
