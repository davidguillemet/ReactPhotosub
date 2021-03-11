export function formatDate(tripDate, locale) {
	const options = { year: 'numeric', month: 'long' };
	const formatedDate = tripDate.toLocaleDateString(locale, options);
	return formatedDate.charAt(0).toUpperCase() + formatedDate.slice(1);
}