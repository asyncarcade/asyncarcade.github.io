// Portfolio Configuration
const CONFIG = {
    // Studio Information
    studio: {
        name: "Async Arcade",
        tagline: "Crafting Unforgettable Indie Experiences",
        description: "Async Arcade is an independent game studio dedicated to creating skill-driven, memorable experiences. We blend classic gameplay foundations with modern design to build games that are easy to pick up, hard to master, and impossible to forget.",
        logo: "assets/logo.svg",
        email: "asyncarcade@gmail.com",
        social: {
            //twitter: "https://twitter.com/yourhandle",
            //discord: "https://discord.gg/yourserver",
            //playstore: "https://play.google.com/store/apps/dev?id=8683062841152944143",
            //itch: "https://yourstudio.itch.io"
        }
    },

    // Home Section
    home: {
        title: "Welcome to Async Arcade",
        subtitle: "Where Classic Gameplay Meets Modern Creativity",
        bannerImage: "assets/banner.jpg",
        ctaText: "Discover Our Games"
    },


  // Games Portfolio
    games: [
  {
    id: 2,
    title: "Cricket Cube",
    description: "Cricket Cube is a fast-paced top-down cricket game featuring casual yet thrilling skill-based gameplay. Swipe to play dynamic cricket shots across the ground or aim precisely to knock down the stumps in action-packed challenges. With intuitive controls and competitive mechanics, every move tests your timing, reflexes, and strategic decision-making.",
    thumbnail: "assets/minicricket.png",
    status: "In Development",
    platforms: ["PlayStore"],
    releaseDate: "2026",
    tags: ["Sports", "Cricket", "Casual"]
  },
  {
    id: 3,
    title: "Bounce Adventure : Pogo Mania",
    description: "Bounce Adventure: Pogo Mania is a fun and addictive vertical platformer focused on mastering jump timing and directional control. Carefully time each bounce, adjust your movement mid-air, and land perfectly on platforms as you climb higher and higher. Precision, rhythm, and smart positioning are the keys to reaching the top in this exciting pogo-powered adventure.",
    thumbnail: "assets/bounce.png",
    status: "In Development",
    platforms: ["PlayStore"],
    releaseDate: "2026",
    tags: ["Arcade", "Platformer", "Casual"]
  },
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

