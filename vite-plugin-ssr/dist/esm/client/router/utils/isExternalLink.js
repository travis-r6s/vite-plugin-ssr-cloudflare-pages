export { isExternalLink };
function isExternalLink(url) {
    return !url.startsWith('/') && !url.startsWith('.') && !url.startsWith('?') && url !== '';
}
//# sourceMappingURL=isExternalLink.js.map