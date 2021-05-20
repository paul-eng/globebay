export const autocomplete = async (iso, addr, baseUrl) => {
  let res;
  try {
    res = await $.ajax({
      type: "GET",
      url: baseUrl + `google/place/${iso}/${addr}`,
    });
    return res;
  } catch (err) {
    console.log(err);
  }
};

export const isoConverter = (iso) => {
  switch (iso) {
    case "US":
      return "United States";
    case "AT":
      return "Austria";
    case "AU":
      return "Australia";
    case "DE":
      return "Germany";
    case "CA":
      return "Canada";
    case "ES":
      return "Spain";
    case "FR":
      return "France";
    case "BE":
      return "Belgium";
    case "GB":
      return "United Kingom";
    case "IE":
      return "Ireland";
    case "IN":
      return "India";
    case "IT":
      return "Italy";
    case "JP":
      return "Japan";
    case "NL":
      return "Netherlands";
    case "SE":
      return "Sweden";
    default:
      return;
  }
};
