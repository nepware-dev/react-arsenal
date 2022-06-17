import {useEffect, useRef} from 'react';

const useInterval = (callback, delay, reset) => {
    const callbackRef = useRef();
    const savedReset = useRef();

    useEffect(() => {
      callbackRef.current = callback;
      savedReset.current = reset;
    }, [callback, reset]);

    useEffect(() => {
      const tick = () => {
        callbackRef.current();
      }
      if (delay !== null || reset !== savedReset.current) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay, reset]);
};

export default useInterval;
