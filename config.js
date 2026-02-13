// Portfolio Configuration
const CONFIG = {
  // Studio Information
  studio: {
    name: "Async Arcade",
    tagline: "Crafting Unforgettable Indie Experiences",
    description: "We are a passionate indie game studio creating unique, handcrafted gaming experiences that push boundaries and make games all about fun.",
    logo: "assets/logo.svg", // Path to your logo
    email: "asyncarcade@gmail.com",
    social: {
      //twitter: "https://twitter.com/pixelforge",
      //discord: "https://discord.gg/pixelforge",
      //playstore: "https://play.google.com/store/apps/dev?id=8683062841152944143",
      //itch: "https://pixelforge.itch.io"
    }
  },

  // Home Section
  home: {
    title: "Welcome to Async Arcade",
    subtitle: "Where Ideas Become Adventures",
    bannerImage: "assets/banner.jpg", // Path to your banner image
    ctaText: "Explore Our Games"
  },

  // Games Portfolio
  games: [
    {
      id: 1,
      title: "Endless",
      description: "Endless flight arcade with nail-biting gameplay on dynamic environments.",
      thumbnail: "assets/endless.png",
      status: "Released",
      platforms: ["PlayStore"],
      releaseDate: "2025",
      tags: ["Adventure", "Flight", "Arcade"]
    },
    {
      id: 2,
      title: "Mini Cricket",
      description: "Hit all around cricket shots or break stumps with just one swipe.",
      thumbnail: "assets/minicricket.png",
      status: "In Development",
      platforms: ["PlayStore"],
      releaseDate: "2026",
      tags: ["Sports", "Cricket", "Casual"]
    },
    //{
    //  id: 3,
    //  title: "Void Runner",
    //  description: "Fast-paced roguelike shooter where you battle through procedurally generated space stations. Every run is unique.",
    //  thumbnail: "assets/game3.jpg",
    //  status: "Released",
    //  platforms: ["Steam", "Epic"],
    //  releaseDate: "2023",
    //  tags: ["Roguelike", "Action", "Sci-Fi"]
    //},
    //{
    //  id: 4,
    //  title: "Echoes of Tomorrow",
    //  description: "A time-bending puzzle game that challenges your perception of cause and effect. Manipulate time to solve impossible scenarios.",
    //  thumbnail: "assets/game4.jpg",
    //  status: "Coming Soon",
    //  platforms: ["Steam"],
    //  releaseDate: "2025",
    //  tags: ["Puzzle", "Time Manipulation", "Indie"]
    //}
  ],

  // Contact Information
  contact: {
    title: "Let's Create Together",
    description: "Have a project in mind? Want to collaborate? We'd love to hear from you!",
    email: "asyncarcade@gmail.com",
    socials: [
//      {
//        name: "PlayStore",
//        icon: "🎮",
//        url: "https://play.google.com/store/apps/dev?id=8683062841152944143"
//      },
//        name: "Twitter",
//        icon: "🐦",
//        url: "https://twitter.com/pixelforge"
//      },
//      {
//        name: "Discord",
//        icon: "💬",
//        url: "https://discord.gg/pixelforge"
//      },
//      {
//        name: "Itch.io",
//        icon: "🎮",
//        url: "https://pixelforge.itch.io"
//      }
    ]
  },

  // Space Shooter Game Settings
  spaceShooter: {
    canvasWidth: 800,
    canvasHeight: 600,
    playerSpeed: 8,
    bulletSpeed: 7,
    asteroidSpeed: 2,
    asteroidSpawnRate: 60, // frames between spawns
    scoreMultiplier: 10
  }
};
