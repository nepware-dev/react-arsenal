import { useEffect } from 'react';
import FocusLock from 'react-focus-lock';

import styles from './styles.module.scss';
import type { MaskProps } from './types';
import Portal from '../Portal';
import withVisibleCheck from '../WithVisibleCheck';
import useSize from '../../hooks/useSize';


//TODO: improve this so we can add more complex padding (e.g. percentage, comma separated, etc
const resolvePadding = (padding: MaskProps['padding']) => {
    const [x, y] = padding || [0, 0];
    return [x, y];
};

const DEFAULT_MASK_PROPS: MaskProps = {
    rect: {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
    },
    padding: [20, 20],
    scrollLock: true,
};

const Mask: React.FC<MaskProps> = (props) => {
    const { rect = DEFAULT_MASK_PROPS.rect, padding = DEFAULT_MASK_PROPS.padding } = props;

    const [xPad, yPad] = resolvePadding(padding);

    const top = rect.top - yPad / 2;
    const left = rect.left - xPad / 2;
    const width = rect.width + xPad;
    const height = rect.height + yPad;

    const { width: windowWidth, height: windowHeight } = useSize(window);

    useEffect(() => {
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    return (
        <Portal>
            <FocusLock>
                <div className={styles.wrapper}>
                    <svg
                        width={windowWidth}
                        height={windowHeight}
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            <mask id="mask">
                                <rect
                                    x={0}
                                    y={0}
                                    width={windowWidth}
                                    height={windowHeight}
                                    fill="white"
                                />
                                <rect
                                    x={left}
                                    y={top}
                                    width={width}
                                    height={height}
                                    fill="black"
                                    rx={1}
                                />
                                <clipPath id="clippath">
                                    <polygon
                                        points={`0 0, 0 ${windowHeight}, ${left} ${windowHeight}, ${left} ${top}, ${
                                            left + width
                                        } ${top}, ${left + width} ${top + height}, ${left} ${top + height},
                                            ${left} ${windowHeight}, ${windowWidth} ${windowHeight}, ${windowWidth} 0`}
                                    />
                                </clipPath>
                            </mask>
                        </defs>
                        <rect
                            className="maskrect"
                            x={0}
                            y={0}
                            width={windowWidth}
                            height={windowHeight}
                            fill="currentColor"
                            mask="url(#mask)"
                        />
                        <rect
                            className="clickarea"
                            x={0}
                            y={0}
                            width={windowWidth}
                            height={windowHeight}
                            fill="currentColor"
                            pointerEvents="auto"
                            clipPath="url(#clippath)"
                        />
                        <rect
                            className="highlightedarea"
                            x={left}
                            y={top}
                            width={width}
                            height={height}
                            pointerEvents="auto"
                            fill="transparent"
                            display="none"
                        />
                    </svg>
                </div>
            </FocusLock>
        </Portal>
    );
};

export default withVisibleCheck(Mask);

export type { MaskProps } from './types';
