# Indie Game Studio Portfolio

A minimalist, brutalist-style portfolio website for indie game studios featuring:
- Fully playable space shooter mini-game on landing page
- Configurable content via `config.js`
- Responsive design
- Smooth animations
- Black & white aesthetic with bold typography

## Project Structure

```
portfolio/
├── index.html          # Main HTML file
├── styles.css          # All styling
├── config.js           # Configuration file (edit this for your content)
├── game.js             # Space shooter game logic
├── main.js             # Main JavaScript for populating content
└── assets/             # Create this folder for your images
    ├── logo.svg
    ├── banner.jpg
    ├── game1.jpg
    ├── game2.jpg
    ├── game3.jpg
    └── game4.jpg
```

## How to Use

1. **Edit `config.js`** - This file contains all your content:
   - Studio name, tagline, description
   - Game information (title, description, status, etc.)
   - Contact information
   - Social media links
   - Space shooter game settings

2. **Add your images** to the `assets/` folder:
   - Game thumbnails
   - Logo
   - Banner image

3. **Open `index.html`** in a web browser

## Customization

### Changing Studio Information
Edit the `studio` object in `config.js`:
```javascript
studio: {
  name: "Your Studio Name",
  tagline: "Your Tagline",
  description: "Your description...",
  // ...
}
```

### Adding/Removing Games
Edit the `games` array in `config.js`:
```javascript
games: [
  {
    id: 1,
    title: "Game Title",
    description: "Game description",
    thumbnail: "assets/your-image.jpg",
    status: "Released", // or "In Development" or "Coming Soon"
    platforms: ["Steam", "Itch.io"],
    releaseDate: "2024",
    tags: ["Genre1", "Genre2"]
  },
  // Add more games...
]
```

### Adjusting Space Shooter Game
Edit the `spaceShooter` object in `config.js`:
```javascript
spaceShooter: {
  canvasWidth: 800,
  canvasHeight: 600,
  playerSpeed: 8,
  bulletSpeed: 7,
  asteroidSpeed: 2,
  asteroidSpawnRate: 60, // Lower = more frequent
  scoreMultiplier: 10
}
```

## Features

### Space Shooter Game
- Plays automatically when page loads
- Mouse controls spaceship movement
- Auto-shooting mechanics
- Asteroid destruction with score tracking
- Black and white minimalist graphics

### Responsive Design
- Works on desktop and mobile devices
- Adaptive typography
- Mobile-friendly navigation

### Animation
- Smooth scroll navigation
- Fade-in effects
- Hover interactions
- Card animations

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge
- Firefox
- Safari
- Opera

## Deployment

Simply upload all files to your web server or use services like:
- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages

## Credits

Built with vanilla HTML, CSS, and JavaScript.
Fonts: Space Mono (Google Fonts)

## License

Free to use and modify for your indie game studio portfolio.
