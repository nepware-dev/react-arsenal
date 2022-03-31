import { useState, useEffect } from 'react';

export default (node) => {
  const [rect, setRect] = useState({});

  const calculate = () => setRect(node? node.getBoundingClientRect() : {});

    useEffect(() => {
      calculate();
      window.addEventListener('resize', calculate);
      window.addEventListener('scroll', calculate, true);
        return () => {
            window.removeEventListener('resize', calculate);
            //true at last catches the event in dispatch so it is captured even if it doesn't bubble
            window.removeEventListener('scroll', calculate, true);
        };
    }, [node]);

  return rect;
};
