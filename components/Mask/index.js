import {useEffect, useCallback} from 'react';
import FocusLock from 'react-focus-lock';
import PropTypes from 'prop-types';

import Portal from '../Portal';
import withVisibleCheck from '../WithVisibleCheck';
import useSize from '../../hooks/useSize';
import styles from './styles.module.scss';

const propTypes = {
    /**
     * Rect object of the element/area to mask
     * @param {Object}
     */
    rect: PropTypes.object.isRequired,
    /*
     * Padding for the mask area
     * @param {Array.<{xPadding: Number, yPadding: Number}>}
     */
    padding: PropTypes.array,
    /**
     * Should lock the scroll when mask is active
     * @param {bool}
     */
    scrollLock: PropTypes.bool,
};

const defaultProps = {
    rect: {
        top:0,
        left:0,
        width: 0,
        height: 0,
    },
    padding: [20, 20],
    scrollLock: true,
};

const Mask = ({
    rect,
    padding,
}) => {

    //TODO: improve this so we can add more complex padding (e.g. percentage, comma separated, etc
    const resolvePadding = useCallback((padding) => {
        const [x, y] = padding;
        return [x, y];
    });

    const [xPad, yPad] = resolvePadding(padding);

    const top = rect.top - yPad/2;
    const left = rect.left - xPad/2;
    const width = rect.width + xPad;
    const height = rect.height + yPad;

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => document.body.style.overflow = '';
    });

    const {width: windowWidth, height: windowHeight} = useSize(window);

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
                            <mask id='mask'>
                                <rect 
                                    style={{
                                        x: 0,
                                        y: 0,
                                        width: windowWidth,
                                        height: windowHeight,
                                        fill: 'white',
                                    }}
                                />
                                <rect
                                    style={{
                                        x: left,
                                        y: top,
                                        width: width,
                                        height: height,
                                        fill: 'black',
                                    }}
                                    rx={1}
                                />
                                <clipPath id='clippath'>
                                    <polygon
                                    points={`0 0, 0 ${windowHeight}, ${left} ${windowHeight}, ${left} ${top}, ${left +
                                            width} ${top}, ${left + width} ${top + height}, ${left} ${top + height},
                                            ${left} ${windowHeight}, ${windowWidth} ${windowHeight}, ${windowWidth} 0`}
                                    />
                                </clipPath>
                            </mask>
                        </defs>
                        <rect
                            className='maskrect'
                            style={{
                                x: 0,
                                y: 0,
                                width: windowWidth,
                                height: windowHeight,
                                fill: 'currentColor',
                                mask: 'url(#mask)',
                            }}
                        />
                        <rect
                            className='clickarea'
                            style={{
                                x: 0,
                                y: 0,
                                width: windowWidth,
                                height: windowHeight,
                                fill: 'currentColor',
                                pointerEvents: 'auto',
                                clipPath: 'url(#clippath)',
                            }}
                        />
                        <rect
                            className='highlightedarea'
                            style={{
                                x: left,
                                y: top,
                                width: width,
                                height: height,
                                pointerEvents: 'auto',
                                fill: 'transparent',
                                display: 'none',
                            }}
                        />
                    </svg>
                </div>
            </FocusLock>
        </Portal>
     );
};

Mask.propTypes= propTypes;
Mask.defaultProps = defaultProps;

export default withVisibleCheck(Mask);
