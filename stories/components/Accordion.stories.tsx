import type { Meta, StoryFn } from '@storybook/react-vite';

import Accordion from '@ra/components/Accordion';

import styles from './styles.module.scss';

export const Story: StoryFn<typeof Accordion> = (storyArgs) => (
    <Accordion titleClassName={styles.accordionTitle} {...storyArgs}>
        <div className={styles.accordionBody}>
            Sed tristique neque vitae sapien ultricies, et sollicitudin nisl
            placerat. Donec rhoncus ut purus nec volutpat. Quisque luctus lacus
            augue, vitae ultrices orci hendrerit et. Fusce sollicitudin lectus
            vitae mi faucibus condimentum. Maecenas finibus facilisis metus et
            commodo. Proin vel velit non turpis blandit pellentesque eu sit amet
            nibh. Etiam tincidunt, tortor et fringilla vehicula, neque tellus
            hendrerit odio, ut pellentesque purus quam vitae dolor.
        </div>
    </Accordion>
);

Story.args = {
    title: 'Accordion Title',
};

Story.storyName = 'Accordion';

export default {
    title: 'Components/Accordion',
    component: Accordion,
} satisfies Meta<typeof Accordion>;
