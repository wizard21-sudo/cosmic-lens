const date = document.querySelector("#datepicker").value;
const apiKey = import.meta.env.VITE_API_KEY;

fetch(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${date}`)
  .then((res) => res.json())
  .then((data) => {
    // Render your APOD image/title/explanation here
  });