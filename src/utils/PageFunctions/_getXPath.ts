// This is being used in several pageFunctions modules...
// Thanks to https://stackoverflow.com/questions/2661818/javascript-get-xpath-of-a-node
// Unfortunetly we cannot import it on runtime to the page.evaluate.
// Something is lost on compile/import and gets undefined on the puppeeter evaluation context.
// Anyway, the compressed version on pageFunctions is this exact function.
const _getXPath = (element) => {
    const idx = (sib, name) => sib 
        ? idx(sib.previousElementSibling, name || sib.localName) + (sib.localName == name)
        : 1;
    const segs = elm => !elm || elm.nodeType !== 1 
        ? ['']
        : elm.id && document.querySelector(`#${elm.id}`) === elm
            ? [`id("${elm.id}")`]
            : [...segs(elm.parentNode), `${elm.localName.toLowerCase()}[${idx(elm, undefined)}]`];
    return segs(element).join('/');
}

export default _getXPath
