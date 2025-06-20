export const validateBoatData = (req, res, next) => {
  const { name, type, year, length, capacity, price, isAvailable } = req.body;
  const errors = [];

  if (!name) errors.push("Le nom du bateau est requis");
  if (!type) errors.push("Le type de bateau est requis");
  if (!year) errors.push("L'année du bateau est requise");

  if (year && (isNaN(parseInt(year)) || parseInt(year) < 1900 || parseInt(year) > new Date().getFullYear() + 1)) {
    errors.push(`L'année doit être un nombre entre 1900 et ${new Date().getFullYear() + 1}`);
  }

  if (length && (isNaN(parseFloat(length)) || parseFloat(length) <= 0)) {
    errors.push("La longueur doit être un nombre positif");
  }

  if (capacity && (isNaN(parseInt(capacity)) || parseInt(capacity) <= 0)) {
    errors.push("La capacité doit être un nombre entier positif");
  }

  if (price && (isNaN(parseFloat(price)) || parseFloat(price) < 0)) {
    errors.push("Le prix doit être un nombre positif ou zéro");
  }

  if (capacity && length && parseInt(capacity) > parseFloat(length) * 3) {
    errors.push("La capacité semble trop élevée par rapport à la longueur du bateau");
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

export const validateBoatQueryParams = (req, res, next) => {
  const { minYear, maxYear, minPrice, maxPrice } = req.query;
  const errors = [];

  if (minYear && (isNaN(parseInt(minYear)) || parseInt(minYear) < 1900)) {
    errors.push("minYear doit être un nombre supérieur ou égal à 1900");
  }

  if (maxYear && (isNaN(parseInt(maxYear)) || parseInt(maxYear) > new Date().getFullYear() + 1)) {
    errors.push(`maxYear doit être un nombre inférieur ou égal à ${new Date().getFullYear() + 1}`);
  }

  if (minYear && maxYear && parseInt(minYear) > parseInt(maxYear)) {
    errors.push("minYear ne peut pas être supérieur à maxYear");
  }

  if (minPrice && (isNaN(parseFloat(minPrice)) || parseFloat(minPrice) < 0)) {
    errors.push("minPrice doit être un nombre positif ou zéro");
  }

  if (maxPrice && (isNaN(parseFloat(maxPrice)) || parseFloat(maxPrice) < 0)) {
    errors.push("maxPrice doit être un nombre positif ou zéro");
  }

  if (minPrice && maxPrice && parseFloat(minPrice) > parseFloat(maxPrice)) {
    errors.push("minPrice ne peut pas être supérieur à maxPrice");
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};
