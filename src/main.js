const date = document.querySelector("#datepicker").value;
const apiKey = import.meta.env.VITE_API_KEY;

// Show loading state first
document.querySelector("#app").innerHTML = "<p>Loading...</p>";

fetch(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${date}`)
  .then((res) => res.json())
  .then((data) => {
    let media;
    if (data.media_type === "image") {
        media = `<img src="${data.url}" alt="${data.title}" />`;
    } else {
      media = `<iframe src="${data.url}" frameborder="0"></iframe>`;
    }

    document.querySelector("#app").innerHTML = `
      <h1>${data.title}</h1>
      ${media}
      <p>${data.explanation}</p>
    `;
  });