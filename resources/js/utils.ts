export const formatNumber = (num: any): string => {
    const n = parseFloat(num);
    return isNaN(n) ? "0.00" : n.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};
