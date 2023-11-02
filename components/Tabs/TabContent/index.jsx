import React, {useEffect, useMemo, useCallback, useState} from 'react';
import {useTabContext} from '../TabContext';

const TabContent = React.forwardRef((props, ref) => {
    const {
        active,
        mode,
        disableUnmount,
        selectTab,
        activeTab,
        label,
        index,
        scrollRootMarginPercent = 50
    } = useTabContext(props);

    const [element, setElement] = useState(null);

    useEffect(() => {
        if(element && mode === 'scroll') {
            const observerConfig = {
                rootMargin: `-${scrollRootMarginPercent}% 0px -${100 - scrollRootMarginPercent}% 0px`,
            };
            const handleIntersection = function(entries) {
                entries.forEach((entry) => {
                    if(entry.target.getAttribute('label') !== activeTab && entry.isIntersecting) {
                        selectTab({
                            currentTarget: entry.target,
                        });
                    }
                });
            };
            const observer = new IntersectionObserver(handleIntersection, observerConfig);
            observer.observe(element);
            return () => observer.disconnect();
        }
    }, [selectTab, activeTab, mode, element, scrollRootMarginPercent]);

    const refCallback = useCallback((el) => {
        ref.current[index] = el;
        setElement(el);
    }, [index]);

    if(mode !== 'scroll' && !active && !disableUnmount) {
        return null;
    }

    return (
        <div
            style={disableUnmount && !active && mode!=='scroll' ? {
                display: 'none'
            } : {}}
            ref={refCallback}
            {...props}
        />
    );
});

TabContent.displayName = 'TabContent';

export default TabContent;
