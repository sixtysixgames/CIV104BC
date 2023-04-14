"use strict";
// update the value in js/settings/app-settings
function VersionData(major, minor, sub, mod) {
    this.major = major;
    this.minor = minor;
    this.sub = sub;
    this.mod = mod;
}
VersionData.prototype.toNumber = function () { return this.major * 1000 + this.minor + this.sub / 1000; };
VersionData.prototype.toString = function () {
    return String(this.major) + "." + String(this.minor) + "." + String(this.sub) + String(this.mod);
};

export { VersionData };
