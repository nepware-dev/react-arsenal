import type { Meta, StoryFn } from '@storybook/react-vite';
import { action } from 'storybook/actions';

import Button from '@ra/components/Button';
import Tabs, { Tab } from '@ra/components/Tabs';

import styles from './styles.module.scss';

export const Story: StoryFn<typeof Tabs> = (storyArgs) => (
    <Tabs
        defaultActiveTab="profile"
        onChange={action('Tab Changed!')}
        tabItemClassName={styles.tabItem}
        activeTabItemClassName={styles.activeTabItem}
        {...storyArgs}
    >
        <Tab label="home" title="Home" className={styles.contentSection}>
            Home: lorem ipsum dolor sit amet.
        </Tab>
        <Tab
            label="profile"
            title="My Profile"
            className={styles.contentSection}
        >
            <div>
                Sed tristique neque vitae sapien ultricies, et sollicitudin nisl
                placerat. Donec rhoncus ut purus nec volutpat. Quisque luctus
                lacus augue, vitae ultrices orci hendrerit et. Fusce
                sollicitudin lectus vitae mi faucibus condimentum. Maecenas
                finibus facilisis metus et commodo. Proin vel velit non turpis
                blandit pellentesque eu sit amet nibh. Etiam tincidunt, tortor
                et fringilla vehicula, neque tellus hendrerit odio, ut
                pellentesque purus quam vitae dolor.
            </div>
        </Tab>
        <Tab
            label="contact"
            title="Contact Us"
            className={styles.contentSection}
        >
            <div>
                <p>
                    Praesent ac turpis elit. Aliquam condimentum aliquet
                    egestas. Nulla vehicula in risus non varius.
                </p>
                <Button>Contact Button</Button>
            </div>
        </Tab>
    </Tabs>
);

Story.storyName = 'Tabs';

export default {
    title: 'Components/Tabs',
    component: Tabs,
} satisfies Meta<typeof Tabs>;
