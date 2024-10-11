// tests/data-generation.test.js
const { generateRandomCar, generateRandomDeal, generateCategories } = require('../index');

describe('Data Generation Functions', () => {
    test('generateRandomCar produces valid car object', () => {
        const car = generateRandomCar();
        expect(car).toHaveProperty('id');
        expect(car).toHaveProperty('brand');
        expect(car).toHaveProperty('model');
        expect(car).toHaveProperty('year');
        expect(car).toHaveProperty('category');
        expect(car).toHaveProperty('dailyRate');
        expect(car).toHaveProperty('mileage');
        expect(car).toHaveProperty('features');
        expect(car).toHaveProperty('imageUrl');
        expect(car).toHaveProperty('description');
        expect(car).toHaveProperty('engineType');
        expect(car).toHaveProperty('transmission');
        expect(car).toHaveProperty('fuelType');
    });

    test('generateRandomDeal produces valid deal object', () => {
        const mockCars = [generateRandomCar()];
        const deal = generateRandomDeal(mockCars);
        expect(deal).toHaveProperty('id');
        expect(deal).toHaveProperty('carId');
        expect(deal).toHaveProperty('title');
        expect(deal).toHaveProperty('description');
        expect(deal).toHaveProperty('discountPercentage');
        expect(deal).toHaveProperty('originalRate');
        expect(deal).toHaveProperty('discountedRate');
        expect(deal).toHaveProperty('validFrom');
        expect(deal).toHaveProperty('validTo');
        expect(deal).toHaveProperty('imageUrl');
        expect(deal).toHaveProperty('carDescription');
        expect(deal).toHaveProperty('engineType');
        expect(deal).toHaveProperty('transmission');
        expect(deal).toHaveProperty('fuelType');
    });

    test('generateCategories produces valid category objects', () => {
        const categories = generateCategories();
        expect(categories.length).toBeGreaterThan(0);
        categories.forEach(category => {
            expect(category).toHaveProperty('id');
            expect(category).toHaveProperty('name');
            expect(category).toHaveProperty('description');
            expect(category).toHaveProperty('imageUrl');
        });
    });
});