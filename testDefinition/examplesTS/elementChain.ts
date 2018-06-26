import { element } from '../../index';

const el = element({
    css: '.my-element',
});
el.click();
el.exist();
el.moveTo();
el.sendText('');
el.timeout(1);
el.exists();
el.then(e => e.backgroundColor);
el.then(e => e.text);
el.then(e => e.id);

