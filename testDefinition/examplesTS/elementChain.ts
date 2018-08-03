import { element } from '../../index';

let el = element({
    css: '.my-element',
});

// element can accept strings
el = element('.my-element');

el.click();
el.exist();
el.moveTo();
el.sendText('');
el.timeout(1);
el.exists();
el.then(e => e && e.backgroundColor);
el.then(e => e && e.text);
el.then(e => e && e.id);

