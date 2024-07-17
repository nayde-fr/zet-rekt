const parseToMs = function (timeString) {
	const numericValue = Number(timeString.slice(0, -1));

	const unit = timeString.slice(-1);

	const conversionFactors = {
		s: 1000,
		m: 60000,
		h: 3600000,
		j: 86400000
	};

	if (!conversionFactors.hasOwnProperty(unit) || Number.isNaN(numericValue))
		throw new Error("Durée invalide. Format accepté : 1s,1m,1h,1j");

	return numericValue * conversionFactors[unit];
};

module.exports = { parseToMs };
