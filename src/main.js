const date = document.querySelector("#datepicker").value;
const apiKey = import.meta.env.VITE_API_KEY;

// Show loading state first
document.querySelector("#app").innerHTML = "<p>Loading...</p>";

fetch(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${date}`)
  .then((res) => res.json())
  .then((data) => {
    let media;

    // Handle image, Youtube iframe, and detect video file cases
    if (data.media_type === "image") {
        media = `<img src="${data.url}" alt="${data.title}" />`;
    } else if (data.url.includes("youtube")) {
      media = `<iframe src="${data.url}" frameborder="0" allowfullscreen></iframe>`;
    } else {
      media = `<video src="${data.url}" frameborder="0" controls></video>`;
    }

    // Set interHTML exactly once with all elements inside
    document.querySelector("#app").innerHTML = `
      <h1>${data.title}</h1>
      ${media}
      <p>${data.explanation}</p>
    `;
  });
  .catch((err) => {
    // Catch errors (network down, invalid API key, etc.) 
    document.querySelector("#app").innerHTML = `<p>Error: ${err}</p>`;
    });