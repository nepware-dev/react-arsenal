import React, { useEffect, useCallback, useState } from 'react';

import { useTabContext } from '../TabContext';
import type { TabContentProps } from '../types';

const TabContent: React.FC<TabContentProps> = (props) => {
    const {
        ref: tabsRef,
        active,
        mode,
        disableUnmount,
        selectTab,
        activeTab,
        index,
        scrollRootMarginPercent = 50,
    } = useTabContext(props);

    const [element, setElement] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
        if (element && mode === 'scroll') {
            const observerConfig = {
                rootMargin: `-${scrollRootMarginPercent}% 0px -${100 - scrollRootMarginPercent}% 0px`,
            };
            const handleIntersection: IntersectionObserverCallback = function (entries) {
                entries.forEach((entry) => {
                    if (entry.target.getAttribute('label') !== activeTab && entry.isIntersecting) {
                        selectTab(
                            {
                                currentTarget: entry.target,
                            },
                            index,
                        );
                    }
                });
            };
            const observer = new IntersectionObserver(handleIntersection, observerConfig);
            observer.observe(element);
            return () => observer.disconnect();
        }
    }, [selectTab, activeTab, mode, element, scrollRootMarginPercent]);

    const refCallback = useCallback(
        (el: HTMLDivElement | null) => {
            if (!el) return;

            tabsRef.current[index] = el;
            setElement(el);
        },
        [index],
    );

    if (mode !== 'scroll' && !active && !disableUnmount) {
        return null;
    }

    return (
        <div
            style={
                disableUnmount && !active && mode !== 'scroll'
                    ? {
                          display: 'none',
                      }
                    : {}
            }
            {...props}
            ref={refCallback}
        />
    );
};

TabContent.displayName = 'TabContent';

export default TabContent;
