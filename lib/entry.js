import { drawMap, drawWater, drawMarkers } from "./globe.js";

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

  const token =
    "v^1.1#i^1#I^3#r^0#f^0#p^1#t^H4sIAAAAAAAAAOVYf2wTVRxf9wtXYESjQhbEetNEwbu+u7bX60mr3dZBWbeVdYxtiZnXu9f16P2o914ZBTRlKgkCCkGEYExQ0YTExBCFAEJC/NtAQmKUEMOviBgiCPxBjJp4dyujmwSQNbGJ/ad53/d93/f5fN73+967Bwr1DfPXL15/c6ZjWvXuAihUOxz0dNBQX7egsaa6qa4KlDg4dheeLtSO1lxaiARVyfI9EGV1DUHXKlXREG8bg0TO0HhdQDLiNUGFiMcinwh3xniGAnzW0LEu6grhirYFCQkGJI6lfUAEHiBxnGnVbsXs1YNEEnBsQAr4vX5RkmjGa/YjlINRDWFBw0GCAQxNAh9Jc700x3toHnCUx8cOEq4+aCBZ10wXChAhGy5vjzVKsN4dqoAQNLAZhAhFw+2J7nC0LdLVu9BdEitU1CGBBZxDE1utugRdfYKSg3efBtnefCInihAhwh0am2FiUD58C8wDwLel5vzAm6J9SY6mUx4v6ymLlO26oQr47jgsiyyRKduVhxqWcf5eippqJFdAERdbXWaIaJvL+luaExQ5JUMjSERawgPheJwIxYWcEtGGyUWKnoQtQp6M97SRLOBSrM8nBkjay3ggyzLFecaCFVWeNFGrrkmypRlydem4BZqg4WRpmBJpTKdurdsIp7AFqMSPAeMSMoPWmo4tYg6nNWtZoWrq4LKb916A8dEYG3Iyh+F4hMkdtkJBQshmZYmY3GmnYjF7VqEgkcY4y7vdIyMj1IiH0o1hNwMA7e7vjCXENFQFwvK1at32l+89gJRtKiI0RyKZx/msiWWVmaomAG2YCDFeL+Nli7pPhBWabP2HoYSze2JBlKtAGI4T/WKAhX5BSHJMshwFEirmqNvCAZNmaqqCkYE4qwgiJEUzz3IqNGSJ9/hSjIdLQVJiAynSG0ilyKRPYkk6BSGAMJkUA9z/qE7uN9MTUDQgLk+qlyvN8+GeJe2dq1/VO4xwICx0DEbbVzMDw0vplYJfaNc7+8WRwZivL9y9nAvebzHckXyrIpvK9JrzV16tL9YRhtKU6CVEPQvjuiKL+cpaYI8hxQUD5xNQUUzDlEiGs9lombbqctH7d7vEg9Eu4wn135xOd2SFrIytLFbWeGQGELIyZZ0/lKirbl3IWbWO05Z5yEY9Jd6yeW2tKNYmyTG2sjR236RMyjhNoZUiZUCk5wzzqk11W/evXj0DNfM4w4auKNDoo6dczqqaw0JSgZVW12VIcFmosLOWZhnawzIsy02Jl2ifpEOVtiWVaSeubX2AO7V74gd+qMr+0aOO/WDUsa/a4QBu8AzdDJ6qr1lWWzOjCckYUrKQopA8rJnfrQakMjCfFWSjut4xMvvwp0dLnhR2vwzmjD8qNNTQ00teGMDc2z119KzZMxka+GiO5jw04AZB8+3eWvrx2kdXXArRB2Z90Ti/hdg55+KCyzeHt2wCM8edHI66qtpRR9VDZ7vefTPx9TvfrL4wdHWoQ3t7uW+N88rAz+2NziP9f5xvgeu2Rq9WvdJcOHX417X92ozFhR+bu/cdcG741hkjX0v/dc6zd9amM03Esff2eJuNryLqms+3b/993sUfnvj40NZt3pOdSyIXfjnvDEaP7GCfdG5Ulx59bqBxkfr+tprTBzs2XJVjL6w9/mHsxDptf+Pmc4jesMV9bMbZmrnP/5lOnDoEpm26AWPJFz/66cYo3nFl7fRrXf6dc09HHhPOf7Jm2XdN6K05J347c+iNzr0fnP3+4An/8dMnI87X91w/s2feZxceXplpuLxuc2bXxvURvCvYkPky/sjll5KJZ90req4RmZMDR65f2jcwtnx/A8NUDWTsEQAA";

  if (globalId !== "world") {
    $.ajax({
      type: "GET",
      url: "https://api.ebay.com/buy/browse/v1/item_summary/search?",
      dataType: "json",
      contentType: "application/json",
      headers: { Authorization: "Bearer " + token },
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
        url: "https://api.ebay.com/buy/browse/v1/item_summary/search?",
        dataType: "json",
        contentType: "application/json",
        headers: { Authorization: "Bearer " + token },
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
      
      console.log(listing.itemLocation)
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
              key: "AIzaSyA0QnQQk7D3mtmaW5IQmxJCdIbMfoAsaOU",
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
        if (goodRequests + badRequests === 19) {
          $("#loader").removeClass("loader");
        }
      } else {
        $("#loader").removeClass("loader");
      }
    });
  } else {
    let searchQuery = $("#searchQuery").val();
    badRequests += 1;
    console.log("eBay Finding API returned zero results for a region");
    if (badRequests === 19 || globalId !== "world") {
      $("#loader").removeClass("loader");
      errors.push(`No results found for "${searchQuery}."`);
    } else if (goodRequests + badRequests === 19) {
      $("#loader").removeClass("loader");
    }
    handleErrors();
  }
}

function featureBuilder(listing, coords) {
  if (!listing.image.imageUrl) {
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
      img: listing.image.imageUrl || "",
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
