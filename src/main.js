const date = document.querySelector("#datepicker"). value;
const apiKey = import.meta.env.VITE_API_KEY || "DEMO_KEY"; 

// Function to fetch APOD data safely
function fetchAPOD(selectedDate) {
// Show loading state first
document.querySelector("#app").innerHTML = "<p>Loading...</p>";

fetch(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${selectedDate}`)
  .then((res) => res.json())
  .then((data) => {
    // Check if API returned an error object
    if (data.code || !data.media_type) {
      document.querySelector("#app").innerHTML = `<p>Error: ${data.msg || "No media found for this date."}</p>`;
      return;
    }
    
    let media = "";

    // Handle image, Youtube iframe, and detect video file cases safely
    if (data.media_type === "image") {
      media = `<img src="${data.url}" alt="${data.title}" />`;
    } else if (data.url.includes("youtube")) {
      media = `<iframe src="${data.url}" frameborder="0" allowfullscreen></iframe>`;
    } else if (data.url) {
      media = `<video src="${data.url}" frameborder="0" controls></video>`;
    }

    // Set innerHTML exactly once with all elements inside
    document.querySelector("#app").innerHTML = `
      <h1>${data.title}</h1>
      ${media}
      <p>${data.explanation}</p>
    `;
  })
  .catch((err) => {
    // Catch errors (network down, invalid API key, etc.)
    document.querySelector("#app").innerHTML = `<p>Error: ${err}</p>`;
  });
}

// 1. Fetch APOD for today when page loads first time
if (datePicker) {
  // Set default date picker value to today (YYYY-MM-DD format)
  const today = new Date().toISOString().split("T")[0];
  datePicker.value = today;
  fetchAPOD(today);

  // 2. Fetch new APOD whenever user changes the date input
  datePicker.addEventListener("change", (e) => {
    if (e.target.value) {
      fetchAPOD(e.target.value);
    }
  });
}