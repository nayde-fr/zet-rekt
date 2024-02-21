const parseToMs = function (timeString) {
	const numericValue = Number(timeString.slice(0, -1));

	const unit = timeString.slice(-1);

	const conversionFactors = {
		s: 1000,
		h: 3600000,
		d: 86400000,
		w: 604800000,
	};

	if (!conversionFactors.hasOwnProperty(unit) || Number.isNaN(numericValue))
		throw new Error("Invalid time format. Supported: 1s,1h,1d,1w");

	return numericValue * conversionFactors[unit];
};

module.exports = { parseToMs };
