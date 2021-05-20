export const getToken = async (baseUrl) => {
  const token = await $.ajax({
    type: "GET",
    url: baseUrl + "ebay",
    success: (data) => data,
    error: (jqXHR, exception) => console.log(jqXHR, exception),
  });
  return token;
};