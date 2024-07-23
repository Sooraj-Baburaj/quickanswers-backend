export const transformTypesenseResult = (result) => {
  const fieldsToRemove = ["facet_counts", "request_params", "search_cutoff"];

  fieldsToRemove.forEach((field) => delete result[field]);

  if (result.hasOwnProperty("out_of")) {
    result.total_pages = result.out_of;
    delete result.out_of;
  }

  result.results = result.hits.map((hit) => {
    delete hit.document.embedding;
    delete hit.highlights;
    return hit;
  });

  delete result.hits;

  return result;
};
