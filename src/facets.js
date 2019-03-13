function removeInvalidPropertyFromFacetDefinition(facetDefinition) {
  var newDefinition = Object.assign({}, facetDefinition);

  if (newDefinition.sticky !== null) delete newDefinition.sticky;

  if (newDefinition.currentValue !== null) delete newDefinition.currentValue;

  return newDefinition;
}

/**
 * A helper for working with the JSON structure which represent
 * facets in API requests.
 */
export default class Facets {
  constructor(facetsJSON = {}) {
    this.facetsJSON = facetsJSON;
  }

  getStickyFacets() {
    return Object.entries(this.facetsJSON ? this.facetsJSON : {})
      .filter(([facetName, facetDefinition]) => facetDefinition.sticky === true)
      .map(([facetName, facetDefinition]) => [
        facetName,
        removeInvalidPropertyFromFacetDefinition(facetDefinition)
      ])
      .reduce(function(acc, [facetName, facetDefinition]) {
        acc[facetName] = facetDefinition;
        return acc;
      }, {});
  }

  getBaseQueryFacets() {
    return Object.entries(this.facetsJSON ? this.facetsJSON : {})
      .filter(([facetName, facetDefinition]) => facetDefinition.sticky !== true)
      .map(([facetName, facetDefinition]) => [
        facetName,
        removeInvalidPropertyFromFacetDefinition(facetDefinition)
      ])
      .reduce(function(acc, [facetName, facetDefinition]) {
        acc[facetName] = facetDefinition;
        return acc;
      }, {});
  }

  getFacetFilters(exclude) {
    return Object.entries(this.facetsJSON ? this.facetsJSON : {})
      .filter(
        ([facetName, facetDefinition]) =>
          facetDefinition.currentValue !== null && facetName !== exclude
      )
      .map(([facetName, facetDefinition]) => {
        const filter = {};
        if (
          facetDefinition.sticky ||
          !Array.isArray(facetDefinition.currentValue)
        ) {
          filter[facetName] = facetDefinition.currentValue;
        } else {
          filter["all"] = facetDefinition.currentValue.map(currentValue => {
            const currentValueFilter = {};
            currentValueFilter[facetName] = currentValue;
            return currentValueFilter;
          });
        }
        return filter;
      });
  }

  addFacetFilters(baseFilters, exclude) {
    var filters =
      baseFilters && baseFilters["all"]
        ? baseFilters["all"]
        : baseFilters
          ? [baseFilters]
          : [];
    var facetsFilters = this.getFacetFilters(exclude);

    if (filters || facetsFilters.length > 0) {
      var filters = facetsFilters.concat(filters);
    }

    return filters.length > 1
      ? { all: filters }
      : filters.length > 0
        ? filters[0]
        : null;
  }
}
