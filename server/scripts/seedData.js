import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Skill, District, TalentSupply } from '../models/Job.js';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the server .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const skillsData = [
    { skillId: 'javascript', canonical: 'JavaScript', synonyms: ['js', 'es6'], sector: 'it' },
    { skillId: 'python', canonical: 'Python', synonyms: ['py'], sector: 'it' },
    { skillId: 'react', canonical: 'React', synonyms: ['reactjs'], sector: 'it' },
    { skillId: 'nodejs', canonical: 'Node.js', synonyms: ['node'], sector: 'it' },
    { skillId: 'mongodb', canonical: 'MongoDB', synonyms: ['mongo'], sector: 'it' },
    { skillId: 'sql', canonical: 'SQL', synonyms: ['mysql', 'postgresql'], sector: 'it' },
    { skillId: 'aws', canonical: 'AWS', synonyms: ['amazon web services'], sector: 'it' },
    { skillId: 'data-analysis', canonical: 'Data Analysis', synonyms: ['analytics'], sector: 'it' },
    { skillId: 'sales', canonical: 'Sales', synonyms: ['business development'], sector: 'retail' },
    { skillId: 'accounting', canonical: 'Accounting', synonyms: ['bookkeeping', 'tally'], sector: 'finance' },
];

const districtsData = [
    { districtCode: 'KA01', districtName: 'Bangalore Urban', stateName: 'Karnataka', centroid: { lat: 12.97, lon: 77.59 }, cities: ['Bangalore', 'Bengaluru'] },
    { districtCode: 'MH01', districtName: 'Mumbai', stateName: 'Maharashtra', centroid: { lat: 19.07, lon: 72.87 }, cities: ['Mumbai'] },
    { districtCode: 'MH02', districtName: 'Pune', stateName: 'Maharashtra', centroid: { lat: 18.52, lon: 73.85 }, cities: ['Pune'] },
    { districtCode: 'DL01', districtName: 'Delhi', stateName: 'Delhi', centroid: { lat: 28.70, lon: 77.10 }, cities: ['Delhi', 'New Delhi'] },
    { districtCode: 'HR01', districtName: 'Gurugram', stateName: 'Haryana', centroid: { lat: 28.45, lon: 77.02 }, cities: ['Gurugram', 'Gurgaon'] },
];

const talentSupplyData = [
    { districtCode: 'KA01', skillId: 'react', candidatesTotal: 500, candidatesAboveScore70: 200 },
    { districtCode: 'KA01', skillId: 'nodejs', candidatesTotal: 450, candidatesAboveScore70: 180 },
    { districtCode: 'MH02', skillId: 'python', candidatesTotal: 300, candidatesAboveScore70: 150 },
    { districtCode: 'DL01', skillId: 'sales', candidatesTotal: 1000, candidatesAboveScore70: 400 },
];

const seedDatabase = async () => {
    if (!process.env.MONGODB_URI) {
        console.error('ERROR: MONGODB_URI not found. Make sure your .env file is in the root project folder.');
        process.exit(1);
    }
    
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected.');

        console.log('Seeding skills...');
        await Skill.deleteMany({});
        await Skill.insertMany(skillsData);

        console.log('Seeding districts...');
        await District.deleteMany({});
        await District.insertMany(districtsData);

        console.log('Seeding talent supply (sample data)...');
        await TalentSupply.deleteMany({});
        await TalentSupply.insertMany(talentSupplyData);
        
        console.log('✅ Seeding complete!');
    } catch (error) {
        console.error('Error during seeding:', error);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB disconnected.');
    }
};

seedDatabase();