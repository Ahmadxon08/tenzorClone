export const isHTML = (str: string) => /<\/?[a-z][\s\S]*>/i.test(str);
// export const normalizeText = (str: string|undefined) => {
// 	if(str typeof === string)str.replace(/\\n/g, "\n")
// 	else{console.log("error")}
// 	};
export const normalizeText = (str?: string): string => {
	if (typeof str === "string") {
		return str.replace(/\\n/g, "\n");
	} else {
		// @ts-ignore
		return str;
	}
};

export const truncate = (str: string, length = 100) =>
	str.length > length ? str.slice(0, length) + "..." : str;

export const stripHtml = (html: string) => {
	const doc = new DOMParser().parseFromString(html, "text/html");
	return doc.body.textContent || "";
};
