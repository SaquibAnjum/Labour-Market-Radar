import { Job, RadarDemand, TalentSupply, DemandSupplyIndex } from '../models/Job.js';

// This class performs the complex calculations to create trend data.
class TrendAggregator {
  constructor() {
    this.tauDays = 14; // Time decay constant for trend scoring
  }

  async recomputeAll() {
    console.log('Starting full aggregation recompute...');
    const windows = ['7d', '30d', '90d'];
    for (const window of windows) {
      await this.recomputeDemandWindow(window);
      await this.recomputeDSIWindow(window);
    }
    console.log('Full aggregation recompute completed.');
  }

  async recomputeDemandWindow(window) {
    const days = parseInt(window.replace('d', ''));
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    console.log(`Recomputing demand for ${window} window...`);

    const pipeline = [
      { $match: { postedAt: { $gte: startDate }, duplicateOf: { $exists: false } } },
      { $unwind: '$skills' },
      { $unwind: '$locations' },
      { $group: {
          _id: {
            districtCode: '$locations.districtCode',
            skillId: '$skills.skillId',
          },
          demandCount: { $sum: 1 },
          demandTrendScore: {
            $sum: {
              $exp: {
                $multiply: [ -1, { $divide: [{ $subtract: [new Date(), '$postedAt'] }, 1000 * 60 * 60 * 24 * this.tauDays] }]
              }
            }
          },
          employers: { $addToSet: '$company' },
        }
      },
      { $project: {
          _id: 0,
          window: window,
          districtCode: '$_id.districtCode',
          skillId: '$_id.skillId',
          demandCount: 1,
          demandTrendScore: 1,
          employers: { $size: '$employers' },
        }
      },
    ];

    const results = await Job.aggregate(pipeline);
    
    if (results.length > 0) {
      const bulkOps = results.map(doc => ({
        updateOne: {
          filter: { window: doc.window, districtCode: doc.districtCode, skillId: doc.skillId },
          update: { $set: doc },
          upsert: true,
        },
      }));
      await RadarDemand.bulkWrite(bulkOps);
    }
    console.log(`Updated ${results.length} radar demand records for ${window}.`);
  }
  
  async recomputeDSIWindow(window) {
    console.log(`Recomputing DSI for ${window} window...`);
    const demandRecords = await RadarDemand.find({ window }).lean();
    if (demandRecords.length === 0) return;

    const bulkOps = [];
    for (const demand of demandRecords) {
      const supply = await TalentSupply.findOne({
        districtCode: demand.districtCode,
        skillId: demand.skillId,
      }).lean();

      const supplyCount = supply ? supply.candidatesAboveScore70 : 0;
      const demandScore = demand.demandTrendScore;
      const dsi = (demandScore + 1) / (supplyCount + 1);

      bulkOps.push({
        updateOne: {
          filter: { window, districtCode: demand.districtCode, skillId: demand.skillId },
          update: { $set: { demand: demandScore, supply: supplyCount, dsi } },
          upsert: true,
        },
      });
    }

    if (bulkOps.length > 0) await DemandSupplyIndex.bulkWrite(bulkOps);
    console.log(`Updated ${bulkOps.length} DSI records for ${window}.`);
  }
}

export default TrendAggregator;