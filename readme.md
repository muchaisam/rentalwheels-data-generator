## RentalWheels Data Generator

🚗 Backend Data Population Tool for [RentalWheels](https://github.com/muchaisam/Rentalwheels) Android App
This project is a sophisticated backend data generation tool designed to populate a Firebase Firestore database with realistic car rental data for the [RentalWheels](https://github.com/muchaisam/Rentalwheels) Android application. It showcases advanced backend development skills, including data modeling, API integration, and cloud storage management.

### 🌟 Key Features

- Dynamic Data Generation: Creates realistic car, category, and deal data using advanced algorithms.
- Firebase Integration: Seamlessly populates Firestore collections and uploads images to Firebase Storage.
- AI-Powered Image Generation: Utilizes Google's Gemini AI to generate unique car images.
- Flexible Configuration: Command-line interface for customizable data generation.
- Robust Error Handling: Comprehensive logging and error management system.
- Data Validation: Ensures data integrity before uploading to Firestore.
- Dry Run Mode: Test data generation without affecting the production database.

### 🛠️ Technologies Used

* Node.js
* Firebase Admin SDK
* Google Generative AI (Gemini)
* Sharp (for image processing)
* Winston (for logging)
* Commander.js (for CLI)

### 📊 Data Models

- Cars: Detailed vehicle information including brand, model, features, and AI-generated images.
- Categories: Rental categories with custom uploaded images.
- Deals: Dynamic deal generation based on car data.

### 🚀 Getting Started

Clone the repository:

`git clone https://github.com/yourusername/rentalwheels-data-generator.git`

### Install dependencies:

`npm install`

### Set up your Firebase project and download the service account key.
### Create a .env file with your Google AI API key:

`API_KEY=your_google_ai_api_key_here`

Run the script:

`node index.js --random-cars 100 --populate-cars --populate-categories --populate-deals`

### Add --dry-run to test without writing to the database.

## 🔧 Configuration Options

* `--random-cars <number>: Number of random cars to generate`
* `--random-deals <number>: Number of random deals to generate`
* `--populate-cars: Populate cars collection`
* `--populate-categories: Populate categories collection`
* `--populate-deals: Populate deals collection`
* `--cleanup <collection>: Cleanup a specific collection`
* `--export <collection>: Export a specific collection to JSON`
* `--dry-run: Run without writing to Firestore`

📈 Future Enhancements

* Implement more sophisticated pricing models
* Add geographic distribution of vehicles
* Develop a user profile generation system
* Create a RESTful API for data access

🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check issues page.

📜 License
Distributed under the AGPL-3.0 License. See LICENSE for more information.

📞 Contact

- Sam - @smuchai10
- Project Link: https://github.com/muchaisam/rentalwheels-data-generator

Developed with ❤️ for [RentalWheels](https://github.com/muchaisam/Rentalwheels) Android App