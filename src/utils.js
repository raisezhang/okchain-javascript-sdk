export function formatNumber (num) {
    const str = String(num);
    let retStr = '';
    if (str.indexOf('.') >= 0) {
        let appendix = '';
        const len = 8 - str.split('.')[1].length;
        for (let i = 0; i < len; i++) {
            appendix += '0';
        }
        retStr = str + appendix;
    } else {
        retStr += `${str}.00000000`;
    }
    return retStr;
}