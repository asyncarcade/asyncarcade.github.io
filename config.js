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
            id: 1,
            title: "Dash Blitz",
            description: "DashBlitz is an arcade fun dash-to-kill game. It is a survival game where you get the privilege of completing levels or play endlessly to see how far you can get without dying. Have fun and sharpen your dashing skills while passing your time.",
            thumbnail: "assets/dashblitz.png",
            status: "Released on Web",
            platforms: ["Web (Async Arcade)"],
            releaseDate: "2026",
            url: "https://asyncarcade.github.io/dashblitz",
            tags: ["Casual", "Arcade", "Survival"]
        },
        {
            id: 2,
            title: "SkyDrift",
            description: "SkyDrift is an arcade skydiving survival game. Control your falling diver by toggling your parachute and drifting sideways to dodge a relentless gauntlet of obstacles — spinning rocks, sliding doors, firing cannons, and deadly lasers. Collect powerups like shields, rockets, and dash charges to survive longer and fall further. How deep can you go?",
            thumbnail: "assets/skydrift.png",
            status: "Released on Web",
            platforms: ["Web (Async Arcade)"],
            releaseDate: "2026",
            url: "https://asyncarcade.github.io/skydrift",
            tags: ["Casual", "Arcade", "Survival"]
        },
        {
            id: 1,
            title: "Shoot.io",
            description: "Shoot.io is a portrait-mode space shooter built for web and mobile. Pilot a glowing ship through waves of escalating alien threats — fast-moving triangles, armored hexagons, massive diamonds, and screen-filling boss stars — by dragging left and right to dodge and reposition. Your ship fires automatically; collect powerups to multiply your fire rate, gain shields, earn extra lives, or arm yourself with area-damage bombs. Enemies grow faster and tougher with every wave. Synthesized sound effects, particle explosions with shockwave rings, and a soft nebula backdrop make every kill feel visceral. How long can you hold the cosmos?",
            thumbnail: "assets/shootio.png",
            status: "Released on Web",
            platforms: ["Web", "Mobile"],
            releaseDate: "2026",
            url: "https://asyncarcade.github.io/shoot.io",
            tags: ["Shooter", "Arcade", "Survival", "Mobile"]
        },
        {
            id: 3,
            title: "Grid.io",
            description: "Grid.io is a browser-based multiplayer territory game inspired by Paper.io. Control your colored player across a vast 2D grid arena, leaving trails to carve out loops and claim enclosed territory. Outmaneuver 7 AI rivals — each running intelligent expansion routines — by cutting off their trails while protecting your own. Captures trigger satisfying area-flood animations and synthesized sound effects. How much of the grid can you dominate?",
            thumbnail: "assets/gridio.png",
            status: "Released on Web",
            platforms: ["Web"],
            releaseDate: "2026",
            url: "https://asyncarcade.github.io/grid.io",
            tags: ["Multiplayer", "Arcade", "Strategy", "Survival"]
        },
        {
            id: 4,
            title: "Cricket Cube",
            description: "Cricket Cube is a fast-paced top-down cricket game featuring casual yet thrilling skill-based gameplay. Swipe to play dynamic cricket shots across the ground or aim precisely to knock down the stumps in action-packed challenges. With intuitive controls and competitive mechanics, every move tests your timing, reflexes, and strategic decision-making.",
            thumbnail: "assets/minicricket.png",
            status: "In Development",
            platforms: ["PlayStore"],
            releaseDate: "2026",
            tags: ["Sports", "Cricket", "Casual"]
        },
        {
            id: 5,
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

