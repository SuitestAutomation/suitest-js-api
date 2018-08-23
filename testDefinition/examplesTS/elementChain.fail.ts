import {element, PROP} from '../../index';

const el = element({
    css: '.my-element',
});
el.onmousedown;
el.doesNot().matches(PROP.OPACITY, 1);
el.not().matchesJS('');
el.not().matchesRepo(PROP.OPACITY);
