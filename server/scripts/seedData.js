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
    { skillId: 'java', canonical: 'Java', synonyms: ['spring'], sector: 'it' },
    { skillId: 'typescript', canonical: 'TypeScript', synonyms: ['ts'], sector: 'it' },
    { skillId: 'vue', canonical: 'Vue.js', synonyms: ['vuejs'], sector: 'it' },
    { skillId: 'angular', canonical: 'Angular', synonyms: ['angularjs'], sector: 'it' },
    { skillId: 'docker', canonical: 'Docker', synonyms: ['containerization'], sector: 'it' },
    { skillId: 'kubernetes', canonical: 'Kubernetes', synonyms: ['k8s'], sector: 'it' },
    { skillId: 'machine-learning', canonical: 'Machine Learning', synonyms: ['ml', 'ai'], sector: 'it' },
    { skillId: 'data-science', canonical: 'Data Science', synonyms: ['analytics'], sector: 'it' },
    { skillId: 'ui-ux', canonical: 'UI/UX Design', synonyms: ['design', 'ux'], sector: 'design' },
    { skillId: 'product-management', canonical: 'Product Management', synonyms: ['pm'], sector: 'management' },
];

const districtsData = [
    { districtCode: 'KA01', districtName: 'Bangalore Urban', stateName: 'Karnataka', centroid: { lat: 12.97, lon: 77.59 }, cities: ['Bangalore', 'Bengaluru'] },
    { districtCode: 'MH01', districtName: 'Mumbai', stateName: 'Maharashtra', centroid: { lat: 19.07, lon: 72.87 }, cities: ['Mumbai'] },
    { districtCode: 'MH02', districtName: 'Pune', stateName: 'Maharashtra', centroid: { lat: 18.52, lon: 73.85 }, cities: ['Pune'] },
    { districtCode: 'DL01', districtName: 'Delhi', stateName: 'Delhi', centroid: { lat: 28.70, lon: 77.10 }, cities: ['Delhi', 'New Delhi'] },
    { districtCode: 'HR01', districtName: 'Gurugram', stateName: 'Haryana', centroid: { lat: 28.45, lon: 77.02 }, cities: ['Gurugram', 'Gurgaon'] },
    { districtCode: 'TN01', districtName: 'Chennai', stateName: 'Tamil Nadu', centroid: { lat: 13.08, lon: 80.27 }, cities: ['Chennai'] },
    { districtCode: 'TG01', districtName: 'Hyderabad', stateName: 'Telangana', centroid: { lat: 17.38, lon: 78.47 }, cities: ['Hyderabad'] },
    { districtCode: 'GJ01', districtName: 'Ahmedabad', stateName: 'Gujarat', centroid: { lat: 23.03, lon: 72.58 }, cities: ['Ahmedabad'] },
    { districtCode: 'WB01', districtName: 'Kolkata', stateName: 'West Bengal', centroid: { lat: 22.57, lon: 88.36 }, cities: ['Kolkata'] },
    { districtCode: 'RJ01', districtName: 'Jaipur', stateName: 'Rajasthan', centroid: { lat: 26.91, lon: 75.79 }, cities: ['Jaipur'] },
];

// Generate comprehensive talent supply data
const generateTalentSupplyData = () => {
    const data = [];
    const skills = skillsData.map(s => s.skillId);
    const districts = districtsData.map(d => d.districtCode);
    
    // Different skills have different demand patterns by district
    const skillDemandPatterns = {
        'javascript': { 'KA01': 800, 'MH01': 600, 'DL01': 500, 'MH02': 400, 'HR01': 350, 'TN01': 300, 'TG01': 250, 'GJ01': 200, 'WB01': 150, 'RJ01': 100 },
        'react': { 'KA01': 700, 'MH01': 500, 'DL01': 400, 'MH02': 350, 'HR01': 300, 'TN01': 250, 'TG01': 200, 'GJ01': 150, 'WB01': 100, 'RJ01': 80 },
        'python': { 'KA01': 600, 'MH01': 450, 'MH02': 400, 'DL01': 350, 'TN01': 300, 'TG01': 250, 'HR01': 200, 'GJ01': 150, 'WB01': 100, 'RJ01': 80 },
        'nodejs': { 'KA01': 500, 'MH01': 400, 'DL01': 350, 'MH02': 300, 'HR01': 250, 'TN01': 200, 'TG01': 150, 'GJ01': 100, 'WB01': 80, 'RJ01': 60 },
        'java': { 'KA01': 450, 'MH01': 400, 'DL01': 350, 'MH02': 300, 'TN01': 250, 'TG01': 200, 'HR01': 150, 'GJ01': 100, 'WB01': 80, 'RJ01': 60 },
        'aws': { 'KA01': 400, 'MH01': 350, 'DL01': 300, 'MH02': 250, 'HR01': 200, 'TN01': 150, 'TG01': 100, 'GJ01': 80, 'WB01': 60, 'RJ01': 40 },
        'data-science': { 'KA01': 350, 'MH01': 300, 'DL01': 250, 'MH02': 200, 'TN01': 150, 'TG01': 100, 'HR01': 80, 'GJ01': 60, 'WB01': 40, 'RJ01': 30 },
        'machine-learning': { 'KA01': 300, 'MH01': 250, 'DL01': 200, 'MH02': 150, 'TN01': 100, 'TG01': 80, 'HR01': 60, 'GJ01': 40, 'WB01': 30, 'RJ01': 20 },
        'ui-ux': { 'KA01': 250, 'MH01': 300, 'DL01': 200, 'MH02': 150, 'HR01': 100, 'TN01': 80, 'TG01': 60, 'GJ01': 40, 'WB01': 30, 'RJ01': 20 },
        'sales': { 'DL01': 800, 'MH01': 600, 'KA01': 400, 'HR01': 300, 'MH02': 250, 'TN01': 200, 'TG01': 150, 'GJ01': 100, 'WB01': 80, 'RJ01': 60 },
        'accounting': { 'DL01': 600, 'MH01': 500, 'KA01': 300, 'TN01': 250, 'TG01': 200, 'GJ01': 150, 'WB01': 100, 'MH02': 80, 'HR01': 60, 'RJ01': 40 },
    };
    
    skills.forEach(skillId => {
        districts.forEach(districtCode => {
            const baseCount = skillDemandPatterns[skillId]?.[districtCode] || Math.floor(Math.random() * 100) + 50;
            const candidatesTotal = baseCount + Math.floor(Math.random() * 50);
            const candidatesAboveScore70 = Math.floor(candidatesTotal * (0.3 + Math.random() * 0.2));
            
            data.push({
                districtCode,
                skillId,
                candidatesTotal,
                candidatesAboveScore70
            });
        });
    });
    
    return data;
};

const talentSupplyData = generateTalentSupplyData();

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