import { Product, ProductOptionGroup, ProductRecord, PrintSizeOption } from "@/types/store";

export const printSizes = [
  { label: "No print", price: 0 },
  { label: "A6 print", price: 20 },
  { label: "A5 print", price: 35 },
  { label: "A4 print", price: 55 },
];

const polyesterTeeGallery = [
  "/store-products/clothing_tshirt_unisex_polyester(1).png",
  "/store-products/clothing_tshirt_unisex_polyester(2).png",
  "/store-products/clothing_tshirt_unisex_polyester(3).png",
  "/store-products/clothing_tshirt_unisex_polyester(4).png",
  "/store-products/clothing_tshirt_unisex_polyester(5).png",
  "/store-products/clothing_tshirt_unisex_polyester(6).png",
  "/store-products/clothing_tshirt_unisex_polyester(7).png",
];

const meshCapGallery = [
  "/store-products/accessories_cap_5panel_mesh(1).png",
  "/store-products/accessories_cap_5panel_mesh(2).png",
  "/store-products/accessories_cap_5panel_mesh(3).png",
  "/store-products/accessories_cap_5panel_mesh(4).png",
  "/store-products/accessories_cap_5panel_mesh(5).png",
  "/store-products/accessories_cap_5panel_mesh(6).png",
  "/store-products/accessories_cap_5panel_mesh(7).png",
];

const structuredCapGallery = [
  "/store-products/accessories_cap_5panel_structured(1).png",
  "/store-products/accessories_cap_5panel_structured(2).png",
  "/store-products/accessories_cap_5panel_structured(3).png",
  "/store-products/accessories_cap_5panel_structured(4).png",
  "/store-products/accessories_cap_5panel_structured(5).png",
  "/store-products/accessories_cap_5panel_structured(6).png",
  "/store-products/accessories_cap_5panel_structured(7).png",
  "/store-products/accessories_cap_5panel_structured(8).png",
  "/store-products/accessories_cap_5panel_structured(9).png",
];

const stoneSlabGallery = [
  "/store-products/decor_photo_stone_slab(1).png",
  "/store-products/decor_photo_stone_slab(2).png",
  "/store-products/decor_photo_stone_slab(3).png",
  "/store-products/decor_photo_stone_slab(4).png",
];

const categoryOrder = [
  "Clothing",
  "Caps",
  "Accessories",
  "Decor",
  "Drinkware",
  "Footwear",
  "Grooming",
  "Games",
  "Kitchen",
  "Premium",
  "Marketing Essentials",
  "Packaging",
  "Seasonal",
  "Stickers",
];

const readyMadeProductSlugs = new Set([
  "photo-stone-slab",
  "wood-mdf-frame",
  "wood-mdf-photo-display",
  "door-hanger-mdf",
  "jewellery-coaster-box-mdf",
  "custom-a4-puzzle",
  "wooden-puzzle-4pc",
  "custom-gift-bag",
  "wooden-bottle-box",
  "wooden-mug-cake-server",
  "wooden-cutting-board",
  "brandy-tumbler",
  "can-tumbler",
  "cappuccino-mug",
  "champagne-flute",
  "coffee-mug-325ml",
  "draught-tumbler",
  "dronkgat-tumbler",
  "elite-coffee-mug",
  "gin-tumbler",
  "latte-mug",
  "rum-tumbler",
  "wine-tumbler",
  "skinny-tumbler",
  "whiskey-tumbler",
  "ceramic-coffee-mug",
  "sippy-cup-300ml",
  "buddy-sippy-cup",
  "christmas-hat",
]);

const baseProducts: Omit<Product, "storeSection">[] = [
  {
    id: "adult-essential-tee",
    slug: "adult-essential-tee",
    name: "Unisex Essential T-Shirt",
    category: "Clothing",
    basePrice: 280,
    featured: true,
    description:
      "High-quality cotton T-shirt designed for everyday wear and custom printing, with long or short sleeve options.",
    summary: "Unisex essential tee in XS-2XL with black, white, navy, and core event colours.",
    leadTime: "2-4 business days",
    badges: ["Best Seller", "Custom Print Ready"],
    image: polyesterTeeGallery[0],
    galleryImages: polyesterTeeGallery,
    supportsGiftWrap: true,
    printSizes,
    variantOptions: [
      { label: "Sleeve", values: ["Long Sleeve", "Short Sleeve"] },
      { label: "Size", values: ["XS", "S", "M", "L", "XL", "2XL"] },
      {
        label: "Colour",
        values: [
          "Black",
          "White",
          "Navy",
          "Grey",
          "Blue",
          "Green",
          "Red",
          "Yellow",
          "Orange",
          "Pink",
        ],
      },
    ],
  },
  {
    id: "polyester-unisex-tee",
    slug: "polyester-unisex-tee",
    name: "Polyester Unisex Tee",
    category: "Clothing",
    basePrice: 280,
    description:
      "Lightweight, breathable polyester T-shirt made for vibrant full-colour printing and sportswear branding.",
    summary: "Short-sleeve sublimation tee in XS-3XL for events, teams, and promo wear.",
    leadTime: "2-4 business days",
    image: polyesterTeeGallery[2],
    galleryImages: polyesterTeeGallery,
    printSizes,
    supportsGiftWrap: true,
    variantOptions: [
      { label: "Size", values: ["XS", "S", "M", "L", "XL", "2XL", "3XL"] },
      {
        label: "Colour",
        values: ["White", "Black", "Lime", "Red", "Royal Blue", "Turquoise", "Yellow"],
      },
    ],
  },
  {
    id: "kids-tee",
    slug: "kids-essential-tee",
    name: "Kids Essential Tee",
    category: "Clothing",
    basePrice: 150,
    description: "Durable and playful tee for birthdays, school events, and matching sets.",
    summary: "Bright and core colour T-shirts for kids.",
    leadTime: "2-4 business days",
    image: polyesterTeeGallery[4],
    galleryImages: polyesterTeeGallery,
    printSizes,
    supportsGiftWrap: true,
    variantOptions: [
      { label: "Sleeve", values: ["Long Sleeve", "Short Sleeve"] },
      { label: "Size", values: ["1yr", "2yr", "3yr", "4yr", "5yr", "6yr", "7yr", "8yr", "10yr", "12yr"] },
      {
        label: "Colour",
        values: ["White", "Black", "Navy", "Grey", "Red", "Blue", "Pink", "Teal", "Yellow"],
      },
    ],
  },
  {
    id: "toddler-essential-tee",
    slug: "toddler-essential-tee",
    name: "Toddler Essential Tee",
    category: "Clothing",
    basePrice: 130,
    description: "Soft and gentle fabric designed for toddlers, with comfortable everyday movement and print-ready surfaces.",
    summary: "Toddler tee in 1yr-8yr sizes with basic and pastel colour options.",
    leadTime: "2-4 business days",
    printSizes,
    supportsGiftWrap: true,
    variantOptions: [
      { label: "Sleeve", values: ["Long Sleeve", "Short Sleeve"] },
      { label: "Size", values: ["1yr", "2yr", "3yr", "4yr", "5yr", "6yr", "7yr", "8yr"] },
      { label: "Colour", values: ["White", "Navy", "Grey", "Mint", "Lilac", "Soft Blue", "Peach"] },
    ],
  },
  {
    id: "baby-vest",
    slug: "baby-vest",
    name: "Infant Vest",
    category: "Clothing",
    basePrice: 100,
    description: "Soft baby vest for delicate skin and sweet personalized gifting.",
    summary: "Sleeveless, short sleeve, or long sleeve babywear.",
    leadTime: "2-4 business days",
    printSizes,
    supportsGiftWrap: true,
    variantOptions: [
      { label: "Style", values: ["Sleeveless", "Short Sleeve", "Long Sleeve"] },
      { label: "Size", values: ["Newborn", "0-3m", "3-6m", "6-12m", "12-18m", "18-24m"] },
      { label: "Colour", values: ["Pure White", "Pale Pink", "Baby Blue", "Stone", "Cream", "Sage Green", "Grey"] },
    ],
  },
  {
    id: "mesh-cap",
    slug: "mesh-back-cap",
    name: "5-Panel Mesh Back Cap",
    category: "Caps",
    basePrice: 170,
    description: "Breathable cap for outdoor wear, gifting, and branded events.",
    summary: "Ventilated mesh cap with solid, two-tone, and camo options.",
    leadTime: "3-5 business days",
    image: meshCapGallery[0],
    galleryImages: meshCapGallery,
    supportsGiftWrap: true,
    variantOptions: [
      {
        label: "Colour",
        values: ["Black", "White", "Red", "Blue", "Green", "Navy / White", "Royal / White", "Camo"],
      },
    ],
  },
  {
    id: "structured-cap",
    slug: "structured-polyester-cap",
    name: "Structured Polyester Cap",
    category: "Caps",
    basePrice: 170,
    description: "Firm front panel cap that shows off logos and names beautifully.",
    summary: "Clean cap silhouette for corporate, casual, and event branding.",
    leadTime: "3-5 business days",
    image: structuredCapGallery[0],
    galleryImages: structuredCapGallery,
    supportsGiftWrap: true,
    variantOptions: [
      { label: "Colour", values: ["White", "Black", "Navy", "Red", "Royal Blue", "Orange", "Pink", "Green"] },
    ],
  },
  {
    id: "vinyl-sticker",
    slug: "custom-vinyl-sticker",
    name: "Custom Vinyl Sticker",
    category: "Stickers",
    basePrice: 0,
    featured: true,
    description:
      "Custom-cut vinyl sticker priced by custom dimensions for branding, labels, and decor. Available in a wide range of vinyl colours.",
    summary: "Made-to-size vinyl sticker with live price calculation. Choose your vinyl colour.",
    leadTime: "2-3 business days",
    supportsCustomVinyl: true,
    supportsGiftWrap: false,
    badges: ["Custom Size"],
    variantOptions: [
      {
        label: "Vinyl Colour",
        values: ["Black", "White", "Yellow", "Blue", "Red", "Silver", "Rose Gold", "Gold", "Green"],
      },
    ],
  },
  {
    id: "waterproof-a4-sticker-sheet",
    slug: "waterproof-a4-sticker-sheet",
    name: "Waterproof A4 Sticker Sheet",
    category: "Stickers",
    basePrice: 20,
    description: "Durable waterproof sticker sheet built for outdoor use, labels, and longer-lasting branding.",
    summary: "Waterproof A4 sticker sheet for labels, packaging, and longer-lasting branding.",
    leadTime: "2-3 business days",
    supportsGiftWrap: false,
  },
  {
    id: "photo-stone-slab",
    slug: "photo-stone-slab",
    name: "Photo Stone Slab",
    category: "Decor",
    basePrice: 120,
    description: "High-quality stone surface for photo printing, designed as a premium and long-lasting display piece.",
    summary: "Size pricing: 120x220 R130 | 150x150 R120 | 150x200 R130 | 200x200 R140.",
    leadTime: "3-5 business days",
    image: stoneSlabGallery[0],
    galleryImages: stoneSlabGallery,
    supportsGiftWrap: true,
    variantOptions: [{ label: "Size", values: ["120x220", "150x150", "150x200", "200x200"] }],
  },
  {
    id: "wood-mdf-frame",
    slug: "wood-mdf-frame",
    name: "Wood (MDF) Frame",
    category: "Decor",
    basePrice: 24,
    description: "Budget-friendly MDF frame for simple photo prints, personalised messages, and lightweight decor gifts.",
    summary: "Size pricing: 120x120 R24 | 200x200 R58 | 150x150 R34 | A4 R83 | A5 R41.",
    leadTime: "2-4 business days",
    supportsGiftWrap: true,
    variantOptions: [{ label: "Size", values: ["120x120", "200x200", "150x150", "A4", "A5"] }],
  },
  {
    id: "wood-mdf-photo-display",
    slug: "wood-mdf-photo-display",
    name: "Wood (MDF) Photo Display",
    category: "Decor",
    basePrice: 35,
    description: "Freestanding MDF photo display for names, messages, photos, and small keepsake gifting.",
    summary: "Type pricing: 001 R36 | 002 R42 | 004 R35 | 005 R40.",
    leadTime: "2-4 business days",
    supportsGiftWrap: true,
    variantOptions: [{ label: "Type", values: ["001", "002", "004", "005"] }],
  },
  {
    id: "door-hanger-mdf",
    slug: "door-hanger-mdf",
    name: "Door Hanger (MDF)",
    category: "Decor",
    basePrice: 20,
    description: "Simple MDF door hanger for room signage, personalised names, and affordable custom gifting.",
    summary: "Affordable MDF hanger for rooms, events, and simple personalised signage.",
    leadTime: "2-4 business days",
    supportsGiftWrap: true,
  },
  {
    id: "jewellery-coaster-box-mdf",
    slug: "jewellery-coaster-box-mdf",
    name: "Jewellery/Coaster Box (MDF)",
    category: "Decor",
    basePrice: 49,
    description: "Compact MDF keepsake box suited to jewellery, coasters, and small presentation gifts.",
    summary: "Useful MDF keepsake box for small gifts, coasters, and personalised packaging.",
    leadTime: "2-4 business days",
    supportsGiftWrap: true,
  },
  {
    id: "a4-puzzle",
    slug: "custom-a4-puzzle",
    name: "Custom A4 Puzzle",
    category: "Decor",
    basePrice: 50,
    description: "Turn a favourite photo or message into an affordable keepsake puzzle.",
    summary: "Personalized puzzle for birthdays and family gifts.",
    leadTime: "2-4 business days",
    supportsGiftWrap: true,
  },
  {
    id: "wooden-puzzle",
    slug: "wooden-puzzle-4pc",
    name: "Wooden Puzzle (4pc)",
    category: "Games",
    basePrice: 40,
    description: "Simple and durable wooden puzzle that works well for children, learning gifts, and custom printed keepsakes.",
    summary: "Durable four-piece wooden puzzle for kids gifts and personalised keepsakes.",
    leadTime: "2-4 business days",
    supportsGiftWrap: true,
  },
  {
    id: "gift-bag",
    slug: "custom-gift-bag",
    name: "Custom Gift Bag",
    category: "Packaging",
    basePrice: 25,
    description: "Branded or personalized gift bag to finish each order beautifully.",
    summary: "Gift bags in A6 to A4 landscape sizes.",
    leadTime: "2-3 business days",
    variantOptions: [{ label: "Size", values: ["A6", "A5", "A4 Portrait", "A4 Landscape"] }],
  },
  {
    id: "lanyard",
    slug: "custom-lanyard",
    name: "Custom Lanyard",
    category: "Accessories",
    basePrice: 30,
    description: "Single-sided printed lanyard for events, staff tags, and promotions.",
    summary: "Simple branded essential for schools, teams, and events.",
    leadTime: "3-5 business days",
    image: "/store-products/accessories_lanyard.png",
    galleryImages: ["/store-products/accessories_lanyard.png"],
  },
  {
    id: "socks",
    slug: "custom-socks",
    name: "Socks",
    category: "Accessories",
    basePrice: 72,
    description: "Custom-printed socks in short (25cm) ankle length, perfect for gifting, teams, and personalized keepsakes.",
    summary: "Short printed socks (25cm) for easy gifting and everyday branded wear.",
    leadTime: "3-5 business days",
    image: "/store-products/accessories_socks_short_25cm.png",
    galleryImages: [
      "/store-products/accessories_socks_short_25cm.png",
      "/store-products/accessories_socks_long_40cm.png",
    ],
    supportsGiftWrap: true,
    variantOptions: [
      {
        label: "Length",
        values: ["Short Socks (25cm)"],
      },
    ],
  },
  {
    id: "mousepad",
    slug: "smooth-mousepad",
    name: "Smooth Mousepad",
    category: "Accessories",
    basePrice: 90,
    description: "Smooth print-ready surface for office gifts and promotional packs.",
    summary: "Desk-ready custom mousepad with photo or logo printing.",
    leadTime: "3-5 business days",
    image: "/store-products/accessories_mousepad.png",
    galleryImages: ["/store-products/accessories_mousepad.png"],
    supportsGiftWrap: true,
  },
  {
    id: "aluminium-keyring",
    slug: "aluminium-keyring",
    name: "Aluminium Keyring",
    category: "Accessories",
    basePrice: 25,
    description: "Durable and lightweight keyring perfect for branding, names, and affordable personalized gifts.",
    summary: "Compact branded keepsake for events, promos, and gift add-ons.",
    leadTime: "2-4 business days",
    image: "/store-products/accessories_keyring_aluminium.png",
    galleryImages: ["/store-products/accessories_keyring_aluminium.png"],
  },
  {
    id: "popsocket",
    slug: "custom-pop-socket",
    name: "Pop Socket",
    category: "Accessories",
    basePrice: 70,
    description: "Convenient phone grip and stand for names, logos, and artwork.",
    summary: "Everyday phone accessory in black or white.",
    leadTime: "2-4 business days",
    image: "/store-products/accessories_popsocket(1).png",
    galleryImages: [
      "/store-products/accessories_popsocket(1).png",
      "/store-products/accessories_popsocket(2).png",
    ],
    variantOptions: [{ label: "Colour", values: ["Black", "White"] }],
  },
  {
    id: "lighter",
    slug: "custom-lighter",
    name: "Custom Lighter",
    category: "Accessories",
    basePrice: 100,
    description: "Refillable lighter that can be branded or customized for promotional use.",
    summary: "Affordable branded lighter for promo packs and event gifting.",
    leadTime: "2-4 business days",
    image: "/store-products/accessories_lighter(1).png",
    galleryImages: [
      "/store-products/accessories_lighter(1).png",
      "/store-products/accessories_lighter(2).png",
    ],
  },
  {
    id: "hand-fan",
    slug: "custom-hand-fan",
    name: "Hand Fan",
    category: "Accessories",
    basePrice: 35,
    description: "Portable hand fan ideal for events, weddings, and branded giveaways.",
    summary: "Custom hand fan for event packs, weddings, and promo gifting.",
    leadTime: "2-4 business days",
    supportsGiftWrap: true,
    variantOptions: [{ label: "Shape", values: ["Round", "Square"] }],
  },
  {
    id: "hair-brush",
    slug: "custom-hair-brush",
    name: "Hair Brush",
    category: "Grooming",
    basePrice: 35,
    description: "Practical grooming item suitable for everyday use, with adult and kids options for gifting or branding.",
    summary: "Kids start at R35, with adult hair brushes available from R100.",
    leadTime: "2-4 business days",
    supportsGiftWrap: true,
    variantOptions: [{ label: "Type", values: ["Kids", "Adults"] }],
  },
  {
    id: "broad-rim-hat",
    slug: "broad-rim-hat",
    name: "Broad Rim Hat",
    category: "Accessories",
    basePrice: 225,
    description: "Stylish wide-brim hat offering sun protection and a strong branding surface for outdoor events.",
    summary: "Fashion-forward promotional hat for outdoor gifting and event wear.",
    leadTime: "3-5 business days",
    supportsGiftWrap: true,
  },
  {
    id: "adult-open-toe-slippers",
    slug: "adult-open-toe-slippers",
    name: "Hotel Slippers - Open Toe (Adult)",
    category: "Footwear",
    basePrice: 75,
    description: "Lightweight and comfortable slippers ideal for hospitality use, spa gifting, or personalized sets.",
    summary: "Adult open-toe slippers for branded hospitality and event gifting.",
    leadTime: "3-5 business days",
    image: "/store-products/footwear_slippers_adult_open_toe.png",
    galleryImages: ["/store-products/footwear_slippers_adult_open_toe.png"],
    supportsGiftWrap: true,
  },
  {
    id: "kids-closed-toe-slippers",
    slug: "kids-closed-toe-slippers",
    name: "Hotel Slippers - Closed Toe (Kids)",
    category: "Footwear",
    basePrice: 55,
    description: "Soft and warm slippers designed for children, suitable for indoor use and playful customization.",
    summary: "Kids indoor slippers for gifts, parties, and comfort sets.",
    leadTime: "3-5 business days",
    image: "/store-products/footwear_slippers_kids_closed_toe.png",
    galleryImages: ["/store-products/footwear_slippers_kids_closed_toe.png"],
    supportsGiftWrap: true,
  },
  {
    id: "wooden-cutting-board",
    slug: "wooden-cutting-board",
    name: "Wooden Cutting Board",
    category: "Premium",
    basePrice: 250,
    description: "Solid wood cutting board suitable for engraving and statement gifting.",
    summary: "Premium kitchen piece for home gifts and corporate hampers.",
    leadTime: "4-6 business days",
    supportsGiftWrap: true,
  },
  {
    id: "coasters",
    slug: "custom-coasters",
    name: "Coasters",
    category: "Kitchen",
    basePrice: 30,
    description: "Protective drink coasters available in durable polymer or cost-effective cardboard options for gifting and promotions.",
    summary: "Starts at R30 for cardboard 4-packs, with polymer options at R40.",
    leadTime: "2-4 business days",
    image: "/store-products/kitchen_coasters(1).png",
    galleryImages: [
      "/store-products/kitchen_coasters(1).png",
      "/store-products/kitchen_coasters(2).png",
    ],
    variantOptions: [
      { label: "Type", values: ["Cardboard (4 Pack)", "Polymer"] },
      { label: "Shape", values: ["Round", "Square"] },
    ],
    supportsGiftWrap: true,
  },
  {
    id: "fridge-magnets",
    slug: "custom-fridge-magnets",
    name: "Fridge Magnets",
    category: "Kitchen",
    basePrice: 25,
    description: "Decorative and functional magnets available in round, square, and heart shapes for branding or gifting.",
    summary: "Custom fridge magnets in multiple shapes for promos and keepsakes.",
    leadTime: "2-4 business days",
    image: "/store-products/kitchen_fridge_magnet(1).png",
    galleryImages: [
      "/store-products/kitchen_fridge_magnet(1).png",
      "/store-products/kitchen_fridge_magnet(2).png",
    ],
    variantOptions: [{ label: "Shape", values: ["Round", "Square", "Heart"] }],
  },
  {
    id: "chefs-cloth",
    slug: "custom-chefs-cloth",
    name: "Chef's Cloth",
    category: "Kitchen",
    basePrice: 55,
    description: "Multi-purpose kitchen cloth suitable for cleaning, handling warm items, and branded gift packs.",
    summary: "Kitchen cloth for practical gifting and branded homeware.",
    leadTime: "2-4 business days",
    image: "/store-products/kitchen_chefs_cloth.png",
    galleryImages: ["/store-products/kitchen_chefs_cloth.png"],
  },
  {
    id: "chefs-oven-glove",
    slug: "chefs-oven-glove",
    name: "Chef's Oven Glove",
    category: "Kitchen",
    basePrice: 170,
    description: "Heat-resistant glove designed for safe handling of hot cookware in custom homeware and gift sets.",
    summary: "Protective branded oven glove for kitchen gifting and promo sets.",
    leadTime: "2-4 business days",
    image: "/store-products/kitchen_oven_glove.png",
    galleryImages: ["/store-products/kitchen_oven_glove.png"],
    supportsGiftWrap: true,
  },
  {
    id: "wooden-bottle-box",
    slug: "wooden-bottle-box",
    name: "Wooden (Bottle) Box",
    category: "Premium",
    basePrice: 250,
    description: "Premium wooden presentation box ideal for gifting wine, spirits, and other bottle-shaped keepsakes.",
    summary: "Premium wooden bottle box for elegant gifting and branded presentation.",
    leadTime: "4-6 business days",
    supportsGiftWrap: true,
  },
  {
    id: "wooden-mug-cake-server",
    slug: "wooden-mug-cake-server",
    name: "Wooden Mug + Cake Server",
    category: "Premium",
    basePrice: 250,
    description: "Unique wooden gift set combining a mug and cake server for memorable gifting moments.",
    summary: "Premium wooden gift set for birthdays, hampers, and custom gifting.",
    leadTime: "4-6 business days",
    supportsGiftWrap: true,
  },
  {
    id: "brandy-tumbler",
    slug: "brandy-tumbler",
    name: "Brandy Tumbler (500ml)",
    category: "Drinkware",
    basePrice: 250,
    description: "Rounded tumbler style designed for premium personalised gifting and celebratory drinkware.",
    summary: "500ml brandy-style tumbler for gifting, events, and keepsakes.",
    leadTime: "3-5 business days",
    supportsGiftWrap: true,
  },
  {
    id: "can-tumbler",
    slug: "can-tumbler",
    name: "Can Tumbler",
    category: "Drinkware",
    basePrice: 165,
    description: "Popular can-shaped tumbler available in two sizes for casual gifting and bright custom designs.",
    summary: "Size pricing: 250ml R165 | 400ml R190.",
    leadTime: "3-5 business days",
    supportsGiftWrap: true,
    variantOptions: [{ label: "Size", values: ["250ml", "400ml"] }],
  },
  {
    id: "cappuccino-mug",
    slug: "cappuccino-mug",
    name: "Cappuccino Mug",
    category: "Drinkware",
    basePrice: 240,
    description: "Large cappuccino-style mug for custom printing, gift sets, and everyday use.",
    summary: "Cappuccino mug for cosy gifts and custom printed drinkware.",
    leadTime: "2-4 business days",
    supportsGiftWrap: true,
  },
  {
    id: "champagne-flute",
    slug: "champagne-flute",
    name: "Champagne Flute (170ml)",
    category: "Drinkware",
    basePrice: 215,
    description: "Slim celebration flute perfect for bridal gifting, events, and personalised party keepsakes.",
    summary: "170ml celebration flute for weddings, birthdays, and special events.",
    leadTime: "3-5 business days",
    supportsGiftWrap: true,
  },
  {
    id: "coffee-mug-325ml",
    slug: "coffee-mug-325ml",
    name: "Coffee Mug (325ml)",
    category: "Drinkware",
    basePrice: 225,
    description: "Custom coffee mug with a slightly elevated finish for everyday branding and gifting.",
    summary: "325ml printed coffee mug for names, logos, and photo gifts.",
    leadTime: "2-4 business days",
    supportsGiftWrap: true,
  },
  {
    id: "draught-tumbler",
    slug: "draught-tumbler",
    name: "Draught Tumbler (380ml)",
    category: "Drinkware",
    basePrice: 225,
    description: "Custom draught-style tumbler for events, promo packs, and standout personalised drinkware.",
    summary: "380ml draught tumbler for celebrations and branded gifting.",
    leadTime: "3-5 business days",
    supportsGiftWrap: true,
  },
  {
    id: "dronkgat-tumbler",
    slug: "dronkgat-tumbler",
    name: "Dronkgat Tumbler (475ml)",
    category: "Drinkware",
    basePrice: 320,
    description: "Bold statement tumbler for larger drinks, special occasion gifts, and premium personalised sets.",
    summary: "475ml statement tumbler for larger gift sets and special events.",
    leadTime: "3-5 business days",
    supportsGiftWrap: true,
  },
  {
    id: "elite-coffee-mug",
    slug: "elite-coffee-mug",
    name: "Elite Coffee Mug (340ml)",
    category: "Drinkware",
    basePrice: 250,
    description: "Premium coffee mug style for elevated corporate gifts, events, and personalised keepsakes.",
    summary: "340ml premium coffee mug for polished custom gifting.",
    leadTime: "2-4 business days",
    supportsGiftWrap: true,
  },
  {
    id: "gin-tumbler",
    slug: "gin-tumbler",
    name: "Gin Tumbler (340ml)",
    category: "Drinkware",
    basePrice: 230,
    description: "Elegant tumbler for gin-inspired gifting, event keepsakes, and stylish custom drinkware.",
    summary: "340ml gin-style tumbler for events, hampers, and celebrations.",
    leadTime: "3-5 business days",
    supportsGiftWrap: true,
  },
  {
    id: "latte-mug",
    slug: "latte-mug",
    name: "Latte Mug",
    category: "Drinkware",
    basePrice: 240,
    description: "Tall latte mug with a generous print area for premium coffee gifting and custom branding.",
    summary: "Latte mug for coffee lovers, gift sets, and branded drinkware.",
    leadTime: "2-4 business days",
    supportsGiftWrap: true,
  },
  {
    id: "rum-tumbler",
    slug: "rum-tumbler",
    name: "Rum Tumbler (500ml)",
    category: "Drinkware",
    basePrice: 250,
    description: "Rounded drinkware piece suited to premium gifting, celebrations, and bold personalised designs.",
    summary: "500ml rum-style tumbler for premium custom gifting.",
    leadTime: "3-5 business days",
    supportsGiftWrap: true,
  },
  {
    id: "wine-tumbler",
    slug: "wine-tumbler",
    name: "Wine Tumbler (340ml)",
    category: "Drinkware",
    basePrice: 230,
    featured: true,
    description: "Stylish insulated wine tumbler ready for names, bridal gifts, and gifting sets.",
    summary: "Elegant custom tumbler for gifting and celebrations.",
    leadTime: "3-5 business days",
    supportsGiftWrap: true,
    variantOptions: [{ label: "Colour", values: ["White", "Blush Pink", "Lilac", "Black"] }],
  },
  {
    id: "skinny-tumbler",
    slug: "skinny-tumbler",
    name: "Skinny Tumbler",
    category: "Drinkware",
    basePrice: 240,
    description: "Tall insulated tumbler available in two sizes for standout personalization.",
    summary: "Starts at R240 for 425ml, with 570ml sizing available from R250.",
    leadTime: "3-5 business days",
    supportsGiftWrap: true,
    variantOptions: [{ label: "Size", values: ["425ml", "570ml"] }],
  },
  {
    id: "whiskey-tumbler",
    slug: "whiskey-tumbler",
    name: "Whiskey Tumbler (340ml)",
    category: "Drinkware",
    basePrice: 230,
    description: "Classic whiskey-style tumbler ideal for premium gifting, events, and personalised celebratory sets.",
    summary: "340ml whiskey-style tumbler for keepsakes and premium gift boxes.",
    leadTime: "3-5 business days",
    supportsGiftWrap: true,
  },
  {
    id: "ceramic-mug",
    slug: "ceramic-coffee-mug",
    name: "Normal Coffee Mug",
    category: "Drinkware",
    basePrice: 60,
    description: "Standard ceramic mug suitable for everyday use, custom branding, and affordable gifting.",
    summary: "Classic coffee mug for names, logos, photos, and event gifting.",
    leadTime: "2-4 business days",
    supportsGiftWrap: true,
  },
  {
    id: "sippy-cup",
    slug: "sippy-cup-300ml",
    name: "Sippy Cup (300ml)",
    category: "Drinkware",
    basePrice: 225,
    description: "Baby and kids drinkware with a custom-print surface and shape options for gifting.",
    summary: "Starts at R225 with straight and egg-shape options.",
    leadTime: "2-4 business days",
    supportsGiftWrap: true,
    variantOptions: [{ label: "Type", values: ["Straight", "Egg Shape"] }],
  },
  {
    id: "buddy-sippy-cup",
    slug: "buddy-sippy-cup",
    name: "Buddy Sippy Cup",
    category: "Drinkware",
    basePrice: 170,
    description: "Compact kids drinkware option for everyday use, nursery gifts, and custom keepsakes. Available in blue or pink.",
    summary: "Affordable baby and kids cup with personalization-ready printing. Choose blue or pink.",
    leadTime: "2-4 business days",
    supportsGiftWrap: true,
    variantOptions: [
      { label: "Colour", values: ["Blue", "Pink"] },
    ],
  },
  {
    id: "business-cards-minimalist",
    slug: "minimalist-business-cards",
    name: "Business Cards (Single Sided Minimalist)",
    category: "Marketing Essentials",
    basePrice: 80,
    description: "Clean and simple single-sided card design printed on high-quality board for professional branding.",
    summary: "Quantity pricing: 50 R80 | 100 R150 | 500 R600.",
    leadTime: "2-4 business days",
    variantOptions: [{ label: "Quantity", values: ["50", "100", "500"] }],
  },
  {
    id: "business-cards-colour",
    slug: "colour-business-cards",
    name: "Business Cards (Single Sided Colour)",
    category: "Marketing Essentials",
    basePrice: 110,
    description: "Full-colour business cards that elevate small business branding.",
    summary: "Quantity pricing: 50 R110 | 100 R210 | 500 R350.",
    leadTime: "2-4 business days",
    variantOptions: [{ label: "Quantity", values: ["50", "100", "500"] }],
  },
  {
    id: "business-cards-double-minimalist",
    slug: "double-sided-minimalist-business-cards",
    name: "Business Cards (Double Sided Minimalist)",
    category: "Marketing Essentials",
    basePrice: 100,
    description: "Minimalist double-sided business cards printed on quality board for polished brand presentation.",
    summary: "Quantity pricing: 50 R100 | 100 R190 | 500 R800.",
    leadTime: "2-4 business days",
    variantOptions: [{ label: "Quantity", values: ["50", "100", "500"] }],
  },
  {
    id: "business-cards-double-colour",
    slug: "double-sided-colour-business-cards",
    name: "Business Cards (Double Sided Colour)",
    category: "Marketing Essentials",
    basePrice: 130,
    description: "Double-sided full-colour cards for vibrant brand identities and stronger promotional impact.",
    summary: "Quantity pricing: 50 R130 | 100 R250 | 500 R1150.",
    leadTime: "2-4 business days",
    variantOptions: [{ label: "Quantity", values: ["50", "100", "500"] }],
  },
  {
    id: "flyers-a6",
    slug: "a6-flyers",
    name: "A6 Flyers",
    category: "Marketing Essentials",
    basePrice: 200,
    description: "Compact promotional flyers for launches, promotions, and events.",
    summary: "Quantity 500: single sided R200 | double sided R300.",
    leadTime: "2-4 business days",
    variantOptions: [
      { label: "Sides", values: ["Single Sided", "Double Sided"] },
      { label: "Quantity", values: ["500"] },
    ],
  },
  {
    id: "christmas-hat",
    slug: "christmas-hat",
    name: "Christmas Hat",
    category: "Seasonal",
    basePrice: 45,
    description: "Festive hat for family sets, holiday events, and December gifting.",
    summary: "Kids start at R45, with adult hats available from R50.",
    leadTime: "2-3 business days",
    image: "/store-products/seasonal_christmas_hat(1).png",
    galleryImages: ["/store-products/seasonal_christmas_hat(1).png"],
    supportsGiftWrap: true,
    variantOptions: [{ label: "Type", values: ["Adults", "Kids"] }],
  },
];

export const defaultProducts: Product[] = baseProducts.map((product) => ({
  ...product,
  storeSection: readyMadeProductSlugs.has(product.slug) ? "ready-made" : "personalized",
}));

export const products = defaultProducts;

export const categories = getCategories(defaultProducts);

export const featuredProducts = defaultProducts.filter((product) => product.featured);

export const personalizedProducts = defaultProducts.filter((product) => product.storeSection === "personalized");

export const readyMadeProducts = defaultProducts.filter((product) => product.storeSection === "ready-made");

export const getProductBySlug = (slug: string) =>
  defaultProducts.find((product) => product.slug === slug);

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => String(entry).trim())
    .filter(Boolean);
}

function normalizeVariantOptions(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const option = entry as { label?: unknown; values?: unknown };
      const label = typeof option.label === "string" ? option.label.trim() : "";
      const values = Array.isArray(option.values)
        ? option.values.map((item) => String(item).trim()).filter(Boolean)
        : [];

      if (!label || !values.length) {
        return null;
      }

      return {
        label,
        values,
      } satisfies ProductOptionGroup;
    })
    .filter((entry): entry is ProductOptionGroup => Boolean(entry));
}

function resolveVariantOptions(slug: string, variantOptions?: ProductOptionGroup[]) {
  return variantOptions;
}

function normalizePrintSizes(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const option = entry as { label?: unknown; price?: unknown };
      const label = typeof option.label === "string" ? option.label.trim() : "";
      const price = Number(option.price);

      if (!label || Number.isNaN(price)) {
        return null;
      }

      return {
        label,
        price,
      } satisfies PrintSizeOption;
    })
    .filter((entry): entry is PrintSizeOption => Boolean(entry));
}

function getFallbackStoreSection(slug: string) {
  return readyMadeProductSlugs.has(slug) ? "ready-made" : "personalized";
}

function createProductFromRecord(record: ProductRecord): Product {
  const galleryImages = normalizeStringArray(record.gallery_images);
  const image = typeof record.image_url === "string" && record.image_url.trim() ? record.image_url.trim() : undefined;

  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    category: record.category,
    storeSection: record.store_section ?? getFallbackStoreSection(record.slug),
    basePrice: Number(record.base_price),
    description: record.description,
    summary: record.summary,
    leadTime: record.lead_time,
    featured: record.featured,
    badges: normalizeStringArray(record.badges),
    image,
    galleryImages: galleryImages.length ? galleryImages : image ? [image] : undefined,
    variantOptions: resolveVariantOptions(record.slug, normalizeVariantOptions(record.variant_options)),
    printSizes: normalizePrintSizes(record.print_sizes),
    supportsCustomVinyl: record.supports_custom_vinyl,
    supportsGiftWrap: record.supports_gift_wrap,
  };
}

function mergeProductWithRecord(product: Product, record: ProductRecord): Product {
  const galleryImages = record.gallery_images === null || record.gallery_images === undefined
    ? product.galleryImages
    : normalizeStringArray(record.gallery_images);
  const variantOptions = record.variant_options === null || record.variant_options === undefined
    ? product.variantOptions
    : resolveVariantOptions(product.slug, normalizeVariantOptions(record.variant_options));
  const resolvedPrintSizes = record.print_sizes === null || record.print_sizes === undefined
    ? product.printSizes
    : normalizePrintSizes(record.print_sizes);
  const badges = record.badges === null || record.badges === undefined
    ? product.badges
    : normalizeStringArray(record.badges);
  const image = record.image_url === null || record.image_url === undefined || record.image_url.trim() === ""
    ? product.image
    : record.image_url.trim();

  return {
    ...product,
    id: record.id,
    slug: record.slug,
    name: record.name,
    category: record.category,
    storeSection: record.store_section ?? product.storeSection,
    basePrice: Number(record.base_price),
    description: record.description,
    summary: record.summary,
    leadTime: record.lead_time,
    featured: record.featured,
    badges,
    image,
    galleryImages,
    variantOptions: resolveVariantOptions(product.slug, variantOptions),
    printSizes: resolvedPrintSizes,
    supportsCustomVinyl: record.supports_custom_vinyl,
    supportsGiftWrap: record.supports_gift_wrap,
  };
}

export function mergeStoreProducts(records: ProductRecord[] = []) {
  const recordsBySlug = new Map(records.map((record) => [record.slug, record]));
  const mergedProducts: Product[] = [];

  for (const product of defaultProducts) {
    const record = recordsBySlug.get(product.slug);

    if (!record) {
      mergedProducts.push(product);
      continue;
    }

    recordsBySlug.delete(product.slug);

    if (record.active === false) {
      continue;
    }

    mergedProducts.push(mergeProductWithRecord(product, record));
  }

  for (const record of recordsBySlug.values()) {
    if (record.active === false) {
      continue;
    }

    mergedProducts.push(createProductFromRecord(record));
  }

  return mergedProducts;
}

export function getCategories(items: Product[]) {
  const orderedCategories = categoryOrder.filter((category) =>
    items.some((product) => product.category === category),
  );
  const extraCategories = Array.from(
    new Set(
      items
        .map((product) => product.category)
        .filter((category) => !categoryOrder.includes(category)),
    ),
  );

  return [...orderedCategories, ...extraCategories];
}

export function buildStoreCollections(items: Product[]) {
  return {
    categories: getCategories(items),
    featuredProducts: items.filter((product) => product.featured),
    personalizedProducts: items.filter((product) => product.storeSection === "personalized"),
    readyMadeProducts: items.filter((product) => product.storeSection === "ready-made"),
  };
}
