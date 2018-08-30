import {element, PROP} from '../../index';

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
el.doesNot().exist();
el.timeout(1).doesNot().exist();
el.doesNot().exist().timeout(1);
el.matchesJS('');
