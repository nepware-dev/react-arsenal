import type { Meta, StoryFn } from '@storybook/react-vite';

import Button from '@ra/components/Button';

import styles from './styles.module.scss';

export const Story: StoryFn<typeof Button> = () => (
    <div className={styles.buttons}>
        <p>Active</p>
        <Button>Default</Button>
        <Button success>Success</Button>
        <Button warning>Warning</Button>
        <Button danger>Danger</Button>
        <Button success outline>
            Success
        </Button>
        <Button warning outline>
            Warning
        </Button>
        <Button danger outline>
            Danger
        </Button>
        <p>Disabled</p>
        <Button success disabled>
            Success
        </Button>
        <Button warning disabled>
            Warning
        </Button>
        <Button danger disabled>
            Danger
        </Button>
        <Button success outline disabled>
            Success
        </Button>
        <Button warning outline disabled>
            Warning
        </Button>
        <Button danger outline disabled>
            Danger
        </Button>
    </div>
);

Story.storyName = 'Button';

export default {
    title: 'Components/Button',
    component: Button,
} satisfies Meta<typeof Button>;
