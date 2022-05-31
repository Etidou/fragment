import { colord } from "colord";

export function inferFromParams(params) {
    if (params.options && Array.isArray(params.options)) {
        return "select";
    }

	if (params.type === "folder") {
		return "folder";
	}

    return null;
}

export function inferFromValue(value) {
    if (typeof value === "number") {
        return "number";
    } else if (typeof value === "function") {
        return "button";
    } else if (typeof value === "boolean") {
        return "checkbox";
    } else if (typeof value === "string") {
        if (colord(value).parsed) return "color";
        return "text";
    } else if (Array.isArray(value) && value.length === 2) {
        return "vec2";
    } else if (Array.isArray(value) && value.length === 3) {
        return "vec3";
    } else if (typeof value === "object" && Object.keys(value).length === 3) {
        return "vec3";
    } else if (typeof value === "object" && Object.keys(value).length === 2) {
        return "vec2";
    }
}