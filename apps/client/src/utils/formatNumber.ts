export const formatCompactNumber = (num: number): string => {
    if (num === 0) return '0';

    if (num < 100) {
        return `${num}`;
    }

    if (num < 1000) {
        return `${Math.floor(num / 100) * 100}`;
    }

    if (num < 1000000) {
        const thousands = num / 1000;
        if (thousands < 10) {
            return `${thousands.toFixed(1)}K+`;
        }
        return `${Math.floor(thousands)}K+`;
    }

    if (num < 1000000000) {
        const millions = num / 1000000;
        if (millions < 10) {
            return `${millions.toFixed(1)}M+`;
        }
        return `${Math.floor(millions)}M+`;
    }

    const billions = num / 1000000000;
    if (billions < 10) {
        return `${billions.toFixed(1)}B+`;
    }
    return `${Math.floor(billions)}B+`;
};
