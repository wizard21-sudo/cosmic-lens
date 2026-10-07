# 🌌 Cosmic Lens

> Explore the universe through NASA's Astronomy Picture of the Day (APOD).

Cosmic Lens is an interactive space-exploration website that uses NASA's Astronomy Picture of the Day API to bring fascinating images and stories from the universe directly to the browser.

Users can explore NASA's APOD archive by selecting a date or discover a different space image using the Random NASA Image feature.

## 🚀 Live Demo

🔗 **Live Website:**  
https://YOUR-USERNAME.github.io/YOUR-REPOSITORY-NAME/

## ✨ Features

### 📅 Explore by Date
Select any available date from the date picker to explore NASA's Astronomy Picture of the Day for that day.

### 🎲 Random NASA Image
The Random NASA Image button lets users discover a different NASA space image with every click.

### 🖼️ NASA Images
Images are loaded directly from NASA's Astronomy Picture of the Day archive.

### 📖 Image Descriptions
Each APOD includes NASA's explanation and information about the astronomical object or event shown.

### 🌌 Custom Space-Themed UI
The website includes:

- Animated star background
- Space-themed typography
- Cyan glowing headings
- Custom red-and-white side borders
- Responsive layout
- Interactive buttons and date picker
- Image hover effects

## 🛠️ Technologies Used

- HTML5
- CSS3
- JavaScript
- Vite
- NASA Astronomy Picture of the Day API
- GitHub Pages
- GitHub Actions

## 🔭 How It Works

Cosmic Lens communicates with NASA's APOD API to retrieve astronomical images and information.

The user can either:

1. Select a date.
2. Request a random NASA image.

The JavaScript application then retrieves the corresponding APOD data and dynamically displays:

- Image
- Title
- Description
- Date

## 📂 Project Structure

cosmic-lens/
│
├── .github/
│   └── workflows/
│       └── deploy.yml
│
├── public/
│   ├── favicon.svg
│   └── icons.svg
│
├── src/
│   ├── main.js
│   └── style.css
│
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
