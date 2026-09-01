import { useState } from 'react';
import type { Meta, StoryFn } from '@storybook/react-vite';

import PanelGroup, { Panel } from '@ra/components/ResizablePanel';

import styles from './ResizablePanel.stories.module.scss';

const Content = ({ title, children }: { title: string; children?: React.ReactNode }) => (
    <div className={styles.content}>
        <span className={styles.label}>{title}</span>
        {children}
    </div>
);

export const Story: StoryFn<typeof PanelGroup> = (storyArgs) => (
    <PanelGroup className={styles.group} {...storyArgs}>
        <Panel className={styles.sidebar}>
            <Content title="sidebar">clamp(160px, 20%, 320px), min 120px, max 380px</Content>
        </Panel>
        <Panel className={styles.main}>
            <Content title="main">flex: 1, min-width: 25ch</Content>
        </Panel>
        <Panel className={styles.inspector}>
            <Content title="inspector">calc(20% + 40px), min 180px, max 50%</Content>
        </Panel>
    </PanelGroup>
);

Story.storyName = 'ResizablePanel';

export const Vertical: StoryFn<typeof PanelGroup> = () => (
    <PanelGroup direction="vertical" className={styles.group}>
        <Panel className={styles.top}>
            <Content title="top">flex-basis: 30%, min-height: 48px</Content>
        </Panel>
        <Panel className={styles.bottom}>
            <Content title="bottom">flex: 1, min-height: 80px</Content>
        </Panel>
    </PanelGroup>
);

export const FixedPanel: StoryFn<typeof PanelGroup> = () => (
    <PanelGroup className={styles.group}>
        <Panel className={styles.main}>
            <Content title="resizable" />
        </Panel>
        <Panel className={styles.fixed}>
            <Content title="fixed 88px" />
        </Panel>
        <Panel className={styles.main}>
            <Content title="resizable" />
        </Panel>
    </PanelGroup>
);

export const Nested: StoryFn<typeof PanelGroup> = () => (
    <PanelGroup className={styles.group}>
        <Panel className={styles.sidebar}>
            <Content title="sidebar" />
        </Panel>
        <Panel className={styles.main}>
            <PanelGroup direction="vertical" className={styles.nestedGroup}>
                <Panel className={styles.top}>
                    <Content title="editor" />
                </Panel>
                <Panel className={styles.bottom}>
                    <Content title="terminal" />
                </Panel>
            </PanelGroup>
        </Panel>
    </PanelGroup>
);

export const Controlled: StoryFn<typeof PanelGroup> = () => {
    const [layout, setLayout] = useState<number[]>();

    return (
        <>
            <PanelGroup className={styles.group} layout={layout} onLayout={setLayout}>
                <Panel className={styles.sidebar}>
                    <Content title="sidebar" />
                </Panel>
                <Panel className={styles.main}>
                    <Content title="main" />
                </Panel>
            </PanelGroup>
            <p className={styles.label}>
                {layout
                    ? `layout: [${layout.map((size) => size.toFixed(1)).join(', ')}]`
                    : 'layout: undefined (sized by css). Drag a border, or double click one to reset.'}
            </p>
        </>
    );
};

export default {
    title: 'Components/ResizablePanel',
    component: PanelGroup,
} satisfies Meta<typeof PanelGroup>;
