import { renderToStaticMarkup } from 'react-dom/server';

import {defaultLocalizer} from './i18nContext';

test('Properly formats singular or plural text', () => {
    expect(defaultLocalizer(
        'There is one organization that oversees most of the work done here.',
        'There are {{ count }} organizations that oversee most of the work done here.',
        {
            translations: {},
            scope: {
                count: 4
            },
        }
    )).toBe('There are 4 organizations that oversee most of the work done here.');

    expect(defaultLocalizer(
        'There is one organization that oversees most of the work done here.',
        'There are {{ count }} organizations that oversee most of the work done here.',
        {
            translations: {},
            scope: {
                count: 1
            },
        }
    )).toBe('There is one organization that oversees most of the work done here.');
});

test('Properly injects links to text', () => {
    expect(renderToStaticMarkup(defaultLocalizer(
        'Click {{ link:here }}',
        undefined,
        {
            translations: {},
            scope: {
                link: <a href="https://example.com" />
            }
        }
    ))).toEqual('<span><span>Click </span><a href="https://example.com">here</a></span>');
});

test('Properly injects components to text', () => {
    expect(renderToStaticMarkup(defaultLocalizer(
        'The next sentence should be on the next line.{{ newline; }}This sentence is on the next line.',
        undefined,
        {
            translations: {},
            scope: {
                newline: <br />
            }
        }
    ))).toEqual('<span><span>The next sentence should be on the next line.</span><br/><span>This sentence is on the next line.</span></span>');
});
