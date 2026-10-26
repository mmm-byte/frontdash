const demoRestaurants = [
  {
    id: "demo-saffron-house",
    name: "Saffron House",
    cuisine: "Italian · Pizza",
    address: "118 Oak Ave, Dallas, TX 75201",
    image: "/images/pizza.jpg",
    open: true,
    tags: ["Pizza", "Burgers"],
    isDemo: true,
    menu: [
      { id: "saffron-margherita", name: "Garden Margherita", category: "Pizza", price: 14.5, description: "Roasted tomato, basil, and creamy mozzarella.", image: "/images/pizza.jpg" },
      { id: "saffron-smash", name: "Oak Street Smash Burger", category: "Burgers", price: 16, description: "Crisp edged beef, sharp cheddar, and house pickles.", image: "/images/burger.jpg" },
      { id: "saffron-tacos", name: "Market Street Tacos", category: "Tacos", price: 13, description: "Slow cooked filling, bright salsa, and lime.", image: "/images/taco.jpg" }
    ]
  },
  {
    id: "demo-lotus-kitchen",
    name: "Lotus Kitchen",
    cuisine: "Japanese · Sushi",
    address: "24 Main St, Dallas, TX 75202",
    image: "/images/sushi.jpg",
    open: true,
    tags: ["Sushi"],
    isDemo: true,
    menu: [
      { id: "lotus-crunch-roll", name: "Crispy Garden Roll", category: "Sushi", price: 15, description: "Avocado, cucumber, sesame, and a crisp finish.", image: "/images/sushi.jpg" },
      { id: "lotus-salmon", name: "Salmon Sunset Roll", category: "Sushi", price: 18, description: "Fresh salmon, avocado, and citrus ponzu.", image: "/images/sushi.jpg" },
      { id: "lotus-tacos", name: "Sesame Street Tacos", category: "Tacos", price: 14, description: "A playful fusion of sesame, greens, and chili.", image: "/images/taco.jpg" }
    ]
  },
  {
    id: "demo-casa-verde",
    name: "Casa Verde",
    cuisine: "Mexican · Tacos",
    address: "56 Cedar Lane, Dallas, TX 75204",
    image: "/images/taco.jpg",
    open: true,
    tags: ["Tacos", "Burgers"],
    isDemo: true,
    menu: [
      { id: "casa-birria", name: "Slow Braised Tacos", category: "Tacos", price: 15.5, description: "Tender birria, warm tortillas, and salsa verde.", image: "/images/taco.jpg" },
      { id: "casa-burger", name: "Green Chile Burger", category: "Burgers", price: 17, description: "Roasted green chile, pepper jack, and lime crema.", image: "/images/burger.jpg" },
      { id: "casa-pizza", name: "Street Corn Flatbread", category: "Pizza", price: 14, description: "Charred corn, herbs, and a little smoky heat.", image: "/images/pizza.jpg" }
    ]
  }
];

export const getDemoRestaurants = () => demoRestaurants;

export const getDemoMenu = (restaurantId) =>
  demoRestaurants.find((restaurant) => restaurant.id === restaurantId)?.menu.map((item) => ({ ...item, available: true })) || [];
