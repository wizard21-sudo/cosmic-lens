const datePicker = document.getElementById("datepicker");
const randomBtn = document.getElementById("randomBtn");
const app = document.getElementById("app");

const API_URL = "https://science.nasa.gov/wp-json/wp/v2/apod-basic";

let usedRandomDates = new Set();
let randomLoading = false;


// Gets today's date so we can load the default picture

function getToday() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}



// NASA's API wants the date formatted weirdly, fix that here

function convertToNASAPath(date) {
    const [year, month, day] = date.split("-");

    return `${year.slice(2)}${month}${day}`;
}



// Throws the image onto the page

function displayAPOD(data) {

    if (!data || !data.date) {
        app.innerHTML = `
            <p class="error">
                ❌ No APOD found for this date.
            </p>
        `;
        return;
    }

    let media = "";

    if (data.media_type == "video" && (data.url.includes("youtube") || data.url.includes("youtu.be"))) {
        let videoUrl = data.url;
        if (videoUrl.includes("watch?v=")) {
            videoUrl = videoUrl.replace("watch?v=", "embed/");
        } else if (videoUrl.includes("youtu.be/")) {
            videoUrl = videoUrl.replace("youtu.be/", "www.youtube.com/embed/");
        }

        media = `
            <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 20px 0;">
                <iframe
                    src="${videoUrl}"
                    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
                    allowfullscreen>
                </iframe>
            </div>
        `;
    } else if (data.media_type === "audio" || data.media_type === "other" || data.media_type === "video") {
        media = `
            <div style="text-align: center; padding: 30px; background: rgba(255,255,255,0.05); border-radius: 8px; margin: 20px 0;">
                 <p style="font-size: 1.2rem; margin-bottom: 15px;"> This day features a space audio / sonification file.</p>
                 <a href="${data.url}" target="_blank" style="color: #61dafb; text-decoration: underline;">Listen to Audio / Open NASA Link</a>
            </div>
        `;
    } else {
        const imageUrl = data.hdurl || data.url;
        if (imageUrl) {
            media = `<img src="${imageUrl}" alt="${data.alt || data.title}" style="max-width: 100%; border-radius: 8px;">`;
        } else {
            media = `<p>No visual media available for this APOD date.</p>`;
        }
        
           
    }

    app.innerHTML = `
        <h1>${data.title}</h1>

        ${media}

        <p>${data.explanation || ""}</p>

        <p>
            <strong>Date:</strong> ${data.date}
        </p>
    `;
}


// Talks to NASA's server to grab data for specific day


async function fetchAPOD(selectedDate) {

    app.innerHTML = `
        <p>🚀 Loading NASA image...</p>
    `;

    try {

        const nasaDate = convertToNASAPath(selectedDate);

        const url = `${API_URL}/${nasaDate}`;

        console.log("Selected date:", selectedDate);
        console.log("NASA URL:", url);

        const response = await fetch(url, {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(`NASA returned ${response.status}`);
        }

        const data = await response.json();

        console.log("NASA response:", data);

        if (!data.date) {
            throw new Error("No APOD found for this date.");
        }

        displayAPOD(data);

    } catch (error) {

        console.error("Date error:", error);

        app.innerHTML = `
            <p class="error">
                ❌ ${error.message}
            </p>
        `;
    }
}



// Rolls a random date between back when NASA started and today


function getRandomDate() {

    // APOD started on June 16, 1995
    const start = new Date("1995-06-16T00:00:00");

    const end = new Date();

    const difference =
        end.getTime() - start.getTime();

    const randomTime =
        start.getTime() +
        Math.random() * difference;

    const randomDate = new Date(randomTime);

    const year = randomDate.getFullYear();
    const month = String(
        randomDate.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        randomDate.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// Stops spam-clicking the random button while it loads

async function fetchRandomAPOD() {

    // Prevent multiple clicks while loading
    if (randomLoading) {
        return;
    }

    randomLoading = true;
    randomBtn.disabled = true;

    app.innerHTML = `
        <p>🎲 Finding a different NASA image...</p>
    `;

    try {

        let attempts = 0;
        let apod = null;

        while (!apod && attempts < 10) {

            attempts++;

            const randomDate = getRandomDate();

            // Don't immediately show a date we've already used
            if (usedRandomDates.has(randomDate)) {
                continue;
            }

            const nasaDate = convertToNASAPath(randomDate);

            const url = `${API_URL}/${nasaDate}`;

            console.log(
                `Random attempt ${attempts}:`,
                randomDate
            );

            const response = await fetch(url, {
                cache: "no-store"
            });

            if (!response.ok) {
                continue;
            }

            const data = await response.json();

            // Only accept actual images
            if (
                data &&
                data.date &&
                data.media_type === "image" &&
                data.hdurl
            ) {

                apod = data;

                usedRandomDates.add(data.date);
            }
        }


        // If we somehow couldn't find one
        if (!apod) {

            // Start a fresh random history
            usedRandomDates.clear();

            throw new Error(
                "Could not find a new random NASA image. Try again."
            );
        }


        // Change date picker
        datePicker.value = apod.date;

        // Display image
        displayAPOD(apod);

        console.log(
            "NEW RANDOM IMAGE:",
            apod.date,
            apod.title
        );

    } catch (error) {

        console.error("Random error:", error);

        app.innerHTML = `
            <p class="error">
                ❌ ${error.message}
            </p>
        `;

    } finally {

        randomLoading = false;
        randomBtn.disabled = false;
    }
}


// Handles when someone picks a date from the calender


const today = getToday();

datePicker.min = "1995-06-16";
datePicker.max = today;
datePicker.value = today;


// When date changes
datePicker.addEventListener("change", function () {

    const selectedDate = this.value;

    console.log(
        "DATE PICKER CHANGED:",
        selectedDate
    );

    if (selectedDate) {
        fetchAPOD(selectedDate);
    }
});


// Random button
randomBtn.addEventListener(
    "click",
    fetchRandomAPOD
);


// Load today's APOD
fetchAPOD(today);

