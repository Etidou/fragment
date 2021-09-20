/**
 * 
 * @param {string} key 
 * @param {any} defaultValue 
 * @param {boolean} override 
 * @returns {any} result
 */
export const rehydrate = (key, defaultValue, override = false) => {
    const storedValue = localStorage.getItem(key);
    const value = (storedValue && !override) ? JSON.parse(storedValue) : defaultValue;

    try {
        const result = typeof value === "string" ? JSON.parse(value) : value;
        return result;
    } catch(error) {
        return defaultValue;
    }
};

/**
 * 
 * @param {string} key 
 * @param {any} value 
 */
export const save = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

/**
 * 
 * @param {string} key 
 * @returns 
 */
export const keepInSync = (key) => {
    return (value) => {
        save(key, value);
    };
};
