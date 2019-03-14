function cleanFacetDefinition(facetDefinition) {
  var newDefinition = Object.assign({}, facetDefinition);

  if (newDefinition.sticky !== null) delete newDefinition.sticky;

  if (newDefinition.currentValue !== null) delete newDefinition.currentValue;

  return newDefinition;
}

function filterFacets(facets, filterFunction) {
  return Object.entries(facets)
    .filter(filterFunction)
    .map(([field, facet]) => [field, cleanFacetDefinition(facet)])
    .reduce(function(acc, [field, facet]) {
      acc[field] = facet;
      return acc;
    }, {});
}

function isStickyFacet(facetDefinition) {
  return (
    facetDefinition.sticky === true && facetDefinition.currentValue !== null
  );
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
    return filterFacets(this.facetsJSON, ([field, facet]) =>
      isStickyFacet(facet)
    );
  }

  getBaseQueryFacets() {
    return filterFacets(
      this.facetsJSON,
      ([field, facet]) => !isStickyFacet(facet)
    );
  }

  getFacetFilters(exclude) {
    return Object.entries(this.facetsJSON ? this.facetsJSON : {})
      .filter(
        ([field, facet]) => facet.currentValue != null && field !== exclude
      )
      .map(([field, facet]) => {
        const filter = {};
        if (facet.sticky || !Array.isArray(facet.currentValue)) {
          filter[field] = facet.currentValue;
        } else {
          filter["all"] = facet.currentValue.map(currentValue => {
            const currentValueFilter = {};
            currentValueFilter[field] = currentValue;
            return currentValueFilter;
          });
        }
        return filter;
      });
  }

  addFacetFilters(baseFilters, exclude) {
    var filters = [];

    if (baseFilters && baseFilters["all"]) {
      filters = baseFilters["all"];
    } else if (baseFilters && baseFilters) {
      filters = [baseFilters];
    }

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
