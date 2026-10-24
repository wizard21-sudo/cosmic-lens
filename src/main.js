const datePicker = document.getElementById("datepicker");
const randomBtn = document.getElementById("randomBtn");
const app = document.getElementById("app");

const BASE_API = "https://science.nasa.gov/wp-json/wp/v2/apod-basic";

let seenRolls = new Set();
let isBusy = false;

function getCurrentDate() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function formatApiDate(dateStr) {
    const [y, m, d] = dateStr.split("-");
    return `${y.slice(2)}${m}${d}`;
}

function renderContent(payload) {
    if (!payload || !payload.date) {
        app.innerHTML = `<p class="error"> No APOD data found for this selection.</p>`;
        return;
    }

    let mediaHtml = "";

    if (payload.media_type === "video" && (payload.url.includes("youtube") || payload.url.includes("youtu.be"))) {
        let embedLink = payload.url;
        if (embedLink.includes("watch?v=")) {
            embedLink = embedLink.replace("watch?v=", "embed/");
        } else if (embedLink.includes("youtu.be/")) {
            embedLink = embedLink.replace("youtu.be/", "www.youtube.com/embed/");
        }

        mediaHtml = `
            <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 20px 0;">
                <iframe src="${embedLink}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" allowfullscreen></iframe>
            </div>
        `;
    } else if (payload.media_type === "audio" || payload.media_type === "other") {
        mediaHtml = `
            <div style="text-align: center; padding: 30px; background: rgba(255,255,255,0.05); border-radius: 8px; margin: 20px 0;">
                 <p style="font-size: 1.2rem; margin-bottom: 15px;"> This entry features an audio or sonification file.</p>
                 <a href="${payload.url}" target="_blank" style="color: #61dafb; text-decoration: underline;">Listen / Open NASA Link</a>
            </div>
        `;
    } else if (payload.media_type === "video") {
        mediaHtml = `
            <div style="text-align: center; padding: 30px; background: rgba(255,255,255,0.05); border-radius:8px; margin: 20px 0;">
                 <p style="font-size: 1.2rem; margin-bottom: 15px;"> This entry features a direct video file.</p>
                 <a href="${payload.url}" target="_blank" style="color: #61dafb; text-decoration: underline;">Watch Video / Open NASA Link</a>
            </div>
        `;
    } else {
        let visual = payload.hdurl || payload.url;

        const isInvalidAsset = visual && (
            visual.includes("news-thumbnail") ||
            visual.includes("nasa-logo") 
        );

        if (visual && !isInvalidAsset) {
            if (visual.startsWith("http://")) {
                visual = visual.replace("http://", "https://");
            }
             mediaHtml = `
                 <img src="${visual}" alt="${payload.title || 'Space Image'}" style="max-width: 100%; border-radius: 8px;"
                      onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <div style="display: none; text-align: center; padding: 30px; background: rgba(255,255,255,0.05); border-radius: 8px; margin: 20px 0;">
                     <p style="font-size: 1.2rem; margin-bottom: 15px;">Direct image access restricted by NASA server for this date.</p>
                     <a href="${payload.url}" target="_blank" style="color: #61dafb; text-decoration: underline;">Open Original NASA Page</a>
                </div>
            `;
        } else {
            mediaHtml = `
                <div style="text-align: center; padding: 30px; background: rgba(255,255,255,0.05); border-radius: 8px; margin: 20px 0;">
                     <p style="font-size: 1.2rem; margin-bottom: 15px;">Direct image file not available for this date.</p>
                     <a href="${payload.url}" target="_blank" style="color: #61dafb; text-decoration: underline;">Open Original NASA Page</a>
                </div>
            `;
        }
    }
    
    
    app.innerHTML = `
        <h1>${payload.title}</h1>
        ${mediaHtml}
        <p>${payload.explanation || ""}</p>
        <p><strong>Date:</strong> ${payload.date}</p>
    `;
}

async function fetchAPOD(targetDate) {
    app.innerHTML = `<p> Loading space data...</p>`;

    try {
        const path = formatApiDate(targetDate);
        const endpoint = `${BASE_API}/${path}`;

        const res = await fetch(endpoint, { cache: "no-store" });

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error("NASA hasn't published an update for this date yet. Try picking an earlier day!");
            }
            throw new Error(`Server returned status ${res.status}`);
        }
        
        const data = await res.json();
        if (!data.date) {
            throw new Error("Incomplete record returned from server.");
        }
        
        renderContent(data);
    } catch (err) {
        app.innerHTML = `<p class="error"> ${err.message}</p>`;
    }
}

function generateRandomDate() {
    const startTimestamp = new Date("1995-06-16T00:00:00").getTime();
    const nowTimestamp = Date.now();
    const randomTime = startTimestamp + Math.random() * (nowTimestamp - startTimestamp);
    const randObj = new Date(randomTime);

    const y = randObj.getFullYear();
    const m = String(randObj.getMonth() + 1).padStart(2, "0");
    const d = String(randObj.getDate()).padStart(2, "0"); 
    return `${y}-${m}-${d}`;
}

async function fetchRandomAPOD() {
    if (isBusy) return;
    isBusy = true;
    randomBtn.disabled = true;

    app.innerHTML = `<p> Rolling a random space date...</p>`;

    try {
        let found = null;
        let tries = 0;

        while (!found && tries < 10) {
            tries++;
            const candidate = generateRandomDate();

            if (seenRolls.has(candidate)) continue;

            const res = await fetch(`${BASE_API}/${formatApiDate(candidate)}`, { cache: "no-store" });
            if (!res.ok) continue;

            const info = await res.json();
            if (info && info.date && info.media_type === "image" && info.hdurl) {
                found = info;
                seenRolls.add(info.date);
            }
        }
        
        if (!found) {
            seenRolls.clear();
            throw new Error("Could not pull a unique random image. Try clicking again.");
        }
        
        datePicker.value = found.date;
        renderContent(found);
    } catch (err) {
        app.innerHTML = `<p class="error"> ${err.message}</p>`;
    } finally {
        isBusy = false;
        randomBtn.disabled = false;
    }
}

const todaysDate = getCurrentDate();
datePicker.min = "1995-06-16";
datePicker.max = todaysDate;
datePicker.value = todaysDate;

datePicker.addEventListener("change", function () {
    if (this.value) {
        fetchAPOD(this.value);
    }
});

randomBtn.addEventListener("click", fetchRandomAPOD);

fetchAPOD(todaysDate);