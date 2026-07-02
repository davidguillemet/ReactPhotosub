const _versions = new Map();

export function setImageVersion(src, version) {
    _versions.set(src, version);
}

export function getImageVersion(src) {
    return _versions.get(src);
}
