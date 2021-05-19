import { drawMap, drawWater, drawMarkers } from "./globe.js";

let appAccessToken;

$.ajax({
  type: "GET",
  url: "https://globebay.herokuapp.com/ebay",
  success: (data) => (appAccessToken = data),
  error: (jqXHR, exception) => console.log(jqXHR, exception),
});

let memo = {};

let geoJSON = {
  type: "FeatureCollection",
  features: [],
};

let badRequests;
let goodRequests;
let errors;

$("#numEntries").change(function (e) {
  $("#entriesDisplay")[0].innerText = `${e.currentTarget.value}`;
});

$("#searchForm").submit(ebayQuery);

function handleErrors() {
  $("#errors")[0].innerText = errors.join("\n\n");
  errors.length > 1
    ? $("#errorBox").removeClass("hidden")
    : $("#errorBox").addClass("hidden");
}

function ebayQuery(e) {
  e.preventDefault();

  let searchQuery = $("#searchQuery").val(),
    minPrice = $("#minPrice").val(),
    maxPrice = $("#maxPrice").val(),
    numResults = $("#numEntries").val(),
    globalId = $("#siteVersion").find(":selected").data("id"),
    countryIso = $("#siteVersion").find(":selected").data("iso");

  if (searchQuery !== "") {
    $("#loader").addClass("loader");
    errors = ["Sorry!"];
  } else {
    errors = ["Sorry!", "Invalid Search Terms."];
  }

  geoJSON = {
    type: "FeatureCollection",
    features: [],
  };
  badRequests = 0;
  goodRequests = 0;

  handleErrors();

  if (globalId !== "world") {
    $.ajax({
      type: "GET",
      // sandbox url:"https://api.sandbox.ebay.com/buy/browse/v1/item_summary/search?",
      url: "https://api.ebay.com/buy/browse/v1/item_summary/search?",
      dataType: "json",
      contentType: "application/json",
      headers: { Authorization: "Bearer " + appAccessToken },
      data: {
        q: `${searchQuery}`,
        fieldgroups: "EXTENDED",
        limit: numResults,
        filter: `itemLocationCountry:${countryIso}, price:[${minPrice}..${maxPrice}], priceCurrency:USD`,
      },
      success: geocoder,
      error: function (jqXHR, exception) {
        if (!errors.includes("eBay API returned an Internal Error")) {
          errors.push("eBay API returned an Internal Error");
        }
        $("#loader").removeClass("loader");
      },
    });
  } else {
    let countries = $("option").filter((idx, op) => op.dataset.id !== "world");
    if (numResults > 20) {
      numResults = 20;
      $("#numEntries").val("20");
      $("#entriesDisplay")[0].innerText = "20";
    }
    countries.each((idx, country) => {
      globalId = country.dataset.id;
      countryIso = country.dataset.iso;
      $.ajax({
        type: "GET",
        // sandbox url:"https://api.sandbox.ebay.com/buy/browse/v1/item_summary/search?",
        url: "https://api.ebay.com/buy/browse/v1/item_summary/search?",
        dataType: "json",
        contentType: "application/json",
        headers: { Authorization: "Bearer " + appAccessToken },
        data: {
          q: `${searchQuery}`,
          fieldgroups: "EXTENDED",
          limit: numResults,
          filter: `itemLocationCountry:${countryIso}, price:[${minPrice}..${maxPrice}], priceCurrency:USD`,
        },
        success: geocoder,
        error: function (jqXHR, exception) {
          if (!errors.includes("eBay API returned an Internal Error")) {
            errors.push("eBay API returned an Internal Error");
          }
          $("#loader").removeClass("loader");
        },
      });
    });
  }
  handleErrors();
}

function geocoder(listings) {
  let globalId = $("#siteVersion").find(":selected").data("id");
  let ebayListings = listings.itemSummaries;

  if (ebayListings) {
    let unfinishedRequests = [];
    ebayListings.forEach((listing) => {
      const country = isoConverter(listing.itemLocation.country);
      const city = listing.itemLocation.city;
      const location = city ? `${city}, ${country}` : country;
      if (memo[location]) {
        console.log(`Using coordinates for ${location} from memo`);
        featureBuilder(listing, memo[location]);
        drawMarkers(geoJSON);
      } else {
        unfinishedRequests.push(
          $.ajax({
            type: "GET",
            url: "https://maps.googleapis.com/maps/api/geocode/json",
            dataType: "json",
            data: {
              address: `${location}`,
              key: "AIzaSyDTm1L1_qGrte-G6T0AAasAVd90mp6Y9RA",
            },
            success: function (geocode) {
              if (geocode.error_message) {
                console.log(geocode.error_message);
                if (
                  !errors.includes(
                    "Exceeded per second limit on queries to Geocoding API."
                  )
                ) {
                  errors.push(
                    "Exceeded per second limit on queries to Geocoding API."
                  );
                }
              } else if (geocode.results[0]) {
                memo[location] = geocode.results[0].geometry.location;
                featureBuilder(listing, geocode.results[0].geometry.location);
              } else {
                console.log(
                  `Google Maps Geocoding API could not find coordinates for ${listing.location}`
                );
              }
              drawMarkers(geoJSON);
            },
            error: function (jqXHR, status, err) {
              console.log("Error from Google API", err);
              badRequests += 1;
            },
          })
        );
      }
    });

    $.when.apply($, unfinishedRequests).then(function () {
      handleErrors();
      goodRequests += 1;
      if (globalId === "world") {
        if (goodRequests + badRequests === 12) {
          $("#loader").removeClass("loader");
        }
      } else {
        $("#loader").removeClass("loader");
      }
    });
  } else {
    let searchQuery = $("#searchQuery").val();
    badRequests += 1;
    console.log("eBay Browse API returned zero results for a region");
    if (badRequests === 12 || globalId !== "world") {
      $("#loader").removeClass("loader");
      errors.push(`No results found for "${searchQuery}."`);
    } else if (goodRequests + badRequests === 12) {
      $("#loader").removeClass("loader");
    }
    handleErrors();
  }
}

function featureBuilder(listing, coords) {
  if (!listing.image?.imageUrl) {
    console.log(
      `eBay Finding API did not return an image for ${listing.title}`
    );
  }

  let geojsonFeature = {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [coords.lng, coords.lat],
    },
    properties: {
      title: listing.title,
      price: listing.price.convertedFromValue || listing.price.value,
      currency: listing.price.convertedFromCurrency || listing.price.currency,
      url: listing.itemWebUrl,
      img: listing.image?.imageUrl || "",
    },
  };
  geoJSON.features.push(geojsonFeature);
}

drawWater();
drawMap();

// window.onload = function () {
//   let i = 1;
//   let typist = setInterval(function () {
//     let letters = "Vintage Nintendo Console".split("");
//     $("#searchQuery").val(letters.slice(0, i).join(""));
//     if (i === letters.length) {
//       clearInterval(typist);
//       $("#searchForm").submit();
//     }
//     i += 1;
//   }, 80);
// };

const isoConverter = (iso) => {
  switch (iso) {
    case "US":
      return "United States";
    case "AT":
      return "Austria";
    case "AU":
      return "Australia";
    case "CH":
      return "Switzerland";
    case "CN":
      return "China";
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
    case "HK":
      return "Hong Kong";
    case "IE":
      return "Ireland";
    case "IN":
      return "India";
    case "IT":
      return "Italy";
    case "JP":
      return "Japan";
    case "MY":
      return "Malaysia";
    case "NL":
      return "Netherlands";
    case "PH":
      return "Philippines";
    case "PL":
      return "Poland";
    case "SG":
      return "Singapore";
  }
};
