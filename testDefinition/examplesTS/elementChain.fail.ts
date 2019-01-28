import {element, PROP} from '../../index';

const el = element({
    css: '.my-element',
});
el.onmousedown;
el.doesNot().matches(PROP.OPACITY, 1);
el.not().matchesJS('');
el.not().matchesBrightScript('');
el.not().matchesRepo(PROP.OPACITY);

el.matchesJS('').timeout(1).doesNot();
el.matchesBrightScript('').timeout(1).doesNot();
el.matches(PROP.OPACITY, 1).doesNot();
el.matchesJS('').timeout(1).not();
el.matchesBrightScript('').timeout(1).not();
el.matchBrightScript('').timeout(1).not();
el.matchesRepo(PROP.OPACITY).not();
el.matchesRepo(PROP.OPACITY).timeout(1).not();
