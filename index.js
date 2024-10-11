const admin = require('firebase-admin');
const fs = require('fs').promises;
const path = require('path');
const { program } = require('commander');
const ProgressBar = require('progress');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const sharp = require('sharp');
const logger = require('./logger');

require('dotenv').config();

// Initialize Firebase Admin SDK
const serviceAccount = require('./rwservicekey.json'); // Replace with your Firebase service key json file
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'gs://  .appspot.com' // Replace with your Firebase Storage bucket
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Utility function to read JSON files
async function readJsonFile(filename) {
    try {
        const data = await fs.readFile(path.join(__dirname, 'data', filename), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filename}:`, error);
        return [];
    }
}

// Car data
const carModels = {
    'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Tacoma', 'Prius', 'Tundra', 'Sienna', '4Runner', 'Avalon'],
    'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot', 'Odyssey', 'Fit', 'HR-V', 'Ridgeline', 'Insight', 'Passport'],
    'Ford': ['F-150', 'Mustang', 'Explorer', 'Escape', 'Edge', 'Ranger', 'Expedition', 'Fusion', 'Bronco', 'Mach-E'],
    'Chevrolet': ['Silverado', 'Equinox', 'Malibu', 'Traverse', 'Tahoe', 'Trax', 'Blazer', 'Camaro', 'Corvette', 'Suburban'],
    'Nissan': ['Altima', 'Rogue', 'Sentra', 'Murano', 'Pathfinder', 'Maxima', 'Frontier', 'Kicks', 'Armada', 'Leaf'],
    'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'A-Class', 'CLA', 'GLA', 'G-Class', 'AMG GT'],
    'BMW': ['3 Series', '5 Series', 'X3', 'X5', '7 Series', 'X1', '4 Series', '8 Series', 'i3', 'M3'],
    'Audi': ['A4', 'Q5', 'A6', 'Q7', 'A3', 'Q3', 'e-tron', 'TT', 'R8', 'RS6 Avant'],
    'Volkswagen': ['Jetta', 'Tiguan', 'Passat', 'Atlas', 'Golf', 'ID.4', 'Arteon', 'Taos', 'GLI', 'GTI']
};

const categories = ['family', 'weekend trip', 'road trip', 'business', 'adventure', 'luxury', 'eco-friendly', 'group travel', 'city exploration', 'special occasion'];
const categoryImages = {
    'family': 'family.png',
    'weekend trip': 'weekend_trip.png',
    'road trip': 'road_trip.png',
    'business': 'business.png',
    'adventure': 'adventure.png',
    'luxury': 'luxury.png',
    'eco-friendly': 'eco_friendly.png',
    'group travel': 'group_travel.png',
    'city exploration': 'exploration.png',
    'special occasion': 'special_occasion.png'
};

const features = ['GPS Navigation', 'Bluetooth Connectivity', 'Backup Camera', 'Cruise Control', 'Heated Seats',
    'Leather Interior', 'Sunroof', 'Lane Departure Warning', 'Blind Spot Monitor', 'Apple CarPlay/Android Auto',
    'Keyless Entry', 'Push Button Start', 'Adaptive Cruise Control', 'Parking Sensors', 'Wireless Charging'];

const engineTypes = ['Inline-4', 'V6', 'V8', 'Hybrid', 'Electric', 'Turbocharged I4', 'Turbocharged V6'];
const transmissions = ['Automatic', 'Manual', 'CVT', 'Dual-Clutch', 'Semi-Automatic'];
const fuelTypes = ['Gasoline', 'Diesel', 'Hybrid', 'Electric', 'Plug-in Hybrid'];

async function generateRandomCar() {
    const brand = Object.keys(carModels)[Math.floor(Math.random() * Object.keys(carModels).length)];
    const model = carModels[brand][Math.floor(Math.random() * carModels[brand].length)];
    const year = 2018 + Math.floor(Math.random() * 7);
    const category = categories[Math.floor(Math.random() * categories.length)];

    let baseRate;
    if (['Mercedes-Benz', 'BMW', 'Audi'].includes(brand) || category === 'luxury') {
        baseRate = 150;
    } else if (category === 'eco-friendly' || category === 'special occasion') {
        baseRate = 120;
    } else {
        baseRate = 80;
    }
    const dailyRate = baseRate + Math.floor(Math.random() * 50);

    const averageAnnualMileage = 12000;
    const maxYearsOld = new Date().getFullYear() - year;
    const mileage = Math.floor(Math.random() * averageAnnualMileage * maxYearsOld);

    const numFeatures = Math.floor(Math.random() * 5) + 3;
    const carFeatures = features
        .sort(() => 0.5 - Math.random())
        .slice(0, numFeatures);

    const engineType = engineTypes[Math.floor(Math.random() * engineTypes.length)];
    const transmission = transmissions[Math.floor(Math.random() * transmissions.length)];
    const fuelType = fuelTypes[Math.floor(Math.random() * fuelTypes.length)];

    const imageUrl = await generateAndUploadCarImage(`${year} ${brand} ${model}`);

    const description = `Experience the ${year} ${brand} ${model}, perfect for your ${category} needs. This ${fuelType} vehicle features a ${engineType} engine with ${transmission} transmission, offering an exceptional blend of performance and comfort. With a daily rate of $${dailyRate}, it's an excellent choice for your rental needs.`;

    return {
        id: `car${Math.random().toString(36).substr(2, 9)}`,
        brand,
        model,
        year,
        category,
        dailyRate,
        mileage,
        features: carFeatures,
        imageUrl,
        description,
        engineType,
        transmission,
        fuelType
    };
}

async function generateAndUploadCarImage(prompt) {
    try {
        const imageModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        logger.info(`Generating image for: ${prompt}`);

        const result = await imageModel.generateContent([
            "Generate a photo-realistic image of a car with the following description:",
            prompt
        ]);
        const response = await result.response;

        if (!response.candidates || response.candidates.length === 0) {
            throw new Error("No candidates in the response");
        }

        const firstCandidate = response.candidates[0];
        if (!firstCandidate.content) {
            throw new Error("No content in the first candidate");
        }

        const imagePart = firstCandidate.content.parts.find(part =>
            part.inlineData && part.inlineData.mimeType && part.inlineData.mimeType.startsWith('image/')
        );

        if (!imagePart) {
            throw new Error("No image part found in the response");
        }

        const imageData = imagePart.inlineData.data;
        const buffer = Buffer.from(imageData, 'base64');

        const resizedBuffer = await sharp(buffer)
            .resize(800, 600)
            .toFormat('jpeg')
            .toBuffer();

        const fileName = `car_images/${prompt.replace(/\s+/g, '_')}_${Date.now()}.jpg`;
        const file = bucket.file(fileName);

        await file.save(resizedBuffer, {
            metadata: {
                contentType: 'image/jpeg',
            },
        });

        const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        logger.info(`Image uploaded: ${imageUrl}`);
        return imageUrl;
    } catch (error) {
        logger.error('Error generating or uploading image:', error);
        return 'https://example.com/placeholder-car-image.jpg';
    }
}

function generateRandomDeal(cars) {
    const car = cars[Math.floor(Math.random() * cars.length)];
    const discountPercentage = Math.floor(Math.random() * 30) + 10; // 10% to 40% discount
    const discountedRate = Math.round(car.dailyRate * (1 - discountPercentage / 100));

    return {
        id: `deal${Math.random().toString(36).substr(2, 9)}`,
        carId: car.id,
        title: `${discountPercentage}% off ${car.brand} ${car.model}`,
        description: `Get a ${discountPercentage}% discount on the ${car.year} ${car.brand} ${car.model}. Now only $${discountedRate} per day!`,
        discountPercentage,
        originalRate: car.dailyRate,
        discountedRate,
        validFrom: new Date().toISOString(),
        validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        imageUrl: car.imageUrl,
        carDescription: car.description,
        engineType: car.engineType,
        transmission: car.transmission,
        fuelType: car.fuelType
    };
}

async function uploadCategoryImage(category, imageName) {
    const imagePath = path.join(__dirname, 'assets', 'category_images', imageName);

    try {
        // Read the image file
        const imageBuffer = await fs.readFile(imagePath);

        // Resize and convert image to JPEG format
        const resizedBuffer = await sharp(imageBuffer)
            .resize(800, 600)
            .toFormat('jpeg')
            .toBuffer();

        const fileName = `category_images/${category.replace(/\s+/g, '_')}_${Date.now()}.jpg`;
        const file = bucket.file(fileName);

        await file.save(resizedBuffer, {
            metadata: {
                contentType: 'image/jpeg',
            },
        });

        const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        logger.info(`Category image uploaded: ${imageUrl}`);
        return imageUrl;
    } catch (error) {
        logger.error(`Error uploading category image for ${category}:`, error);
        throw error;
    }
}

async function generateCategories() {
    const categoryPromises = categories.map(async (category) => {
        const imageName = categoryImages[category];
        let imageUrl;
        try {
            imageUrl = await uploadCategoryImage(category, imageName);
        } catch (error) {
            logger.error(`Failed to upload image for category ${category}. Using placeholder.`);
            imageUrl = 'https://example.com/placeholder-category-image.jpg';
        }

        return {
            id: category.replace(/\s+/g, '-'),
            name: category.charAt(0).toUpperCase() + category.slice(1),
            description: `A collection of vehicles perfect for ${category}.`,
            imageUrl: imageUrl
        };
    });

    return Promise.all(categoryPromises);
}

async function populateCollection(collectionName, data, bar, dryRun = false) {
    if (dryRun) {
        logger.info(`Dry run: Would populate ${collectionName} with ${data.length} items`);
        data.forEach((item) => {
            logger.info(`Dry run: Would add item to ${collectionName}:`, item);
        });
        return;
    }

    const batch = db.batch();
    data.forEach((item) => {
        const docRef = db.collection(collectionName).doc(item.id);
        batch.set(docRef, item);
        if (bar) bar.tick();
    });

    try {
        await batch.commit();
        logger.info(`${collectionName} collection populated successfully`);
    } catch (error) {
        logger.error(`Error populating ${collectionName} collection:`, error);
        throw error;
    }
}

async function populateFirestore(options) {
    try {
        logger.info('Starting Firestore population...');

        // Generate random cars
        const randomCarsCount = options.randomCars;
        logger.info(`Generating ${randomCarsCount} random cars...`);
        const carBar = new ProgressBar('Generating cars [:bar] :percent :etas', { total: randomCarsCount });
        const randomCars = [];
        for (let i = 0; i < randomCarsCount; i++) {
            randomCars.push(await generateRandomCar());
            carBar.tick();
        }

        // Generate deals
        const dealsCount = options.randomDeals || Math.floor(randomCarsCount / 5); // Default to 20% of cars
        logger.info(`Generating ${dealsCount} random deals...`);
        const dealBar = new ProgressBar('Generating deals [:bar] :percent :etas', { total: dealsCount });
        const deals = [];
        for (let i = 0; i < dealsCount; i++) {
            deals.push(generateRandomDeal(randomCars));
            dealBar.tick();
        }

        // Generate categories
        logger.info('Generating and uploading category images...');
        const categoryData = await generateCategories();

        // Populate collections
        if (options.populateCars) {
            logger.info('Populating cars collection...');
            await populateCollection('cars', randomCars, null, options.dryRun);
        }
        if (options.populateCategories) {
            logger.info('Populating categories collection...');
            await populateCollection('categories', categoryData, null, options.dryRun);
        }
        if (options.populateDeals) {
            logger.info('Populating deals collection...');
            await populateCollection('deals', deals, null, options.dryRun);
        }

        logger.info('Firestore population completed successfully');
    } catch (error) {
        logger.error('Error in Firestore population:', error);
    } finally {
        // Close the Firebase Admin SDK connection
        admin.app().delete();
    }
}

function validateCarData(car) {
    const requiredFields = ['id', 'brand', 'model', 'year', 'category', 'dailyRate', 'engineType', 'transmission', 'fuelType', 'description', 'imageUrl'];
    for (const field of requiredFields) {
        if (!(field in car)) {
            throw new Error(`Invalid car data: Missing ${field}`);
        }
    }
    if (typeof car.year !== 'number' || car.year < 2000 || car.year > new Date().getFullYear() + 1) {
        throw new Error(`Invalid car data: Invalid year ${car.year}`);
    }
    // Add more validation as needed
}

async function cleanupCollection(collectionName) {
    logger.info(`Cleaning up ${collectionName} collection...`);
    const snapshot = await db.collection(collectionName).get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();
    logger.info(`Cleaned up ${collectionName} collection`);
}

async function exportCollectionToJson(collectionName) {
    logger.info(`Exporting ${collectionName} collection to JSON...`);
    const snapshot = await db.collection(collectionName).get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    await fs.writeFile(`${collectionName}_export.json`, JSON.stringify(data, null, 2));
    logger.info(`Exported ${collectionName} collection to ${collectionName}_export.json`);
}

// Command-line interface setup
program
    .option('-r, --random-cars <number>', 'Number of random cars to generate', parseInt)
    .option('-d, --random-deals <number>', 'Number of random deals to generate', parseInt)
    .option('--populate-cars', 'Populate cars collection')
    .option('--populate-categories', 'Populate categories collection')
    .option('--populate-deals', 'Populate deals collection')
    .option('--cleanup <collection>', 'Cleanup a specific collection')
    .option('--export <collection>', 'Export a specific collection to JSON')
    .option('--dry-run', 'Run the script without writing to Firestore')
    .parse(process.argv);

const options = program.opts();

// Run the script based on command-line options
if (options.cleanup) {
    cleanupCollection(options.cleanup).catch(console.error);
} else if (options.export) {
    exportCollectionToJson(options.export).catch(console.error);
} else {
    populateFirestore(options).then(() => {
        logger.info('Script execution completed');
    }).catch((error) => {
        logger.error('Script execution failed:', error);
    });
}