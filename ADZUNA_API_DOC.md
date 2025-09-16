# Adzuna API Integration Documentation

## Overview
This document describes the integration of the Adzuna Jobs API into the Labour Market Radar system. The integration allows the system to fetch real-time job data from Adzuna and process it through the existing radar analytics pipeline.

## API Credentials
- **App ID**: `61f7a880`
- **App Key**: `ce3260610c8e57a7cc1a633998f2a7dd`
- **Country**: `in` (India)
- **Base URL**: `https://api.adzuna.com/v1/api/jobs`

## Rate Limits
- **Free Plan**: 500 calls/day
- **Rate Limiting**: 1 second delay between requests (implemented in service)
- **Max Results per Page**: 50

## Integration Architecture

### 1. Adzuna Service (`server/services/adzuna.js`)
The main service class that handles all Adzuna API interactions:

#### Key Methods:
- `fetchJobs(params)` - Fetch jobs with search parameters
- `fetchAllJobs(params, maxPages)` - Fetch multiple pages of jobs
- `normalizeJob(adzunaJob)` - Convert Adzuna job format to our Job model
- `fetchAndSaveJobs(searchTerm, location, maxPages)` - Complete fetch and save workflow

#### Features:
- Rate limiting to respect API limits
- Automatic skill extraction from job titles and descriptions
- Location mapping to district codes
- Salary parsing and normalization
- Employment type detection
- Duplicate prevention

### 2. API Routes (`server/routes/radar.js`)

#### Search Jobs
```
GET /api/radar/adzuna/search
```
**Query Parameters:**
- `what` - Job keyword (default: 'software developer')
- `where` - Location filter (optional)
- `page` - Page number (default: 1)
- `results_per_page` - Results per page (max 50, default: 20)
- `category` - Job category (optional)
- `salary_min` - Minimum salary filter (optional)
- `full_time` - Full-time jobs only (default: true)

**Example:**
```bash
GET /api/radar/adzuna/search?what=react%20developer&where=Bangalore&page=1&results_per_page=20
```

#### Fetch and Save Jobs
```
POST /api/radar/adzuna/fetch
```
**Request Body:**
```json
{
  "searchTerm": "software developer",
  "location": "Bangalore",
  "maxPages": 3
}
```

#### Get Job Categories
```
GET /api/radar/adzuna/categories
```
Returns predefined job categories for filtering.

#### Get Trending Skills
```
GET /api/radar/adzuna/trending-skills?district=KA01&time=30
```
**Query Parameters:**
- `district` - District code filter (optional)
- `time` - Time window in days (default: 30)

#### Get Job Statistics
```
GET /api/radar/adzuna/stats?district=KA01&time=30
```
Returns aggregated statistics from Adzuna data.

### 3. Scheduler Integration (`server/services/scheduler.js`)

#### Automated Jobs
The scheduler automatically fetches jobs every 2 hours for popular tech skills:

- Software Developer (Bangalore)
- Data Scientist (Mumbai)
- React Developer (Delhi)
- Python Developer (Pune)
- Node.js Developer (Hyderabad)
- Machine Learning Engineer (Chennai)

#### Manual Triggers
```
POST /api/admin/adzuna/trigger
```
**Request Body:**
```json
{
  "searchTerm": "javascript developer",
  "location": "Mumbai",
  "maxPages": 5
}
```

## Data Processing Pipeline

### 1. Data Fetching
- Jobs are fetched from Adzuna API with rate limiting
- Multiple pages are fetched based on configuration
- Raw data is stored in `RawJob` collection for traceability

### 2. Normalization
- Job titles, descriptions, and locations are standardized
- Skills are extracted using keyword matching
- Salary information is parsed and normalized
- Employment types are determined
- District codes are mapped from city names

### 3. Deduplication
- Jobs are checked against existing records
- Duplicates are identified by title, company, and location
- Only unique jobs are saved to the main `Job` collection

### 4. Analytics Integration
- Normalized jobs flow into the existing trend aggregation system
- Skills are counted and trended over time
- Demand-supply indices are calculated
- Heatmap data is updated

## Skill Extraction

The system extracts skills from job titles and descriptions using a comprehensive keyword list:

### Technical Skills
- **Frontend**: JavaScript, React, Angular, Vue, HTML, CSS, Bootstrap
- **Backend**: Node.js, Python, Java, PHP, TypeScript
- **Databases**: MongoDB, MySQL, PostgreSQL, Redis, Elasticsearch
- **Cloud**: AWS, Azure, GCP, Docker, Kubernetes
- **DevOps**: Jenkins, CI/CD, Git, GitHub, GitLab
- **Data Science**: Machine Learning, AI, Analytics, Big Data, TensorFlow, PyTorch

### Soft Skills
- Agile, Scrum, Leadership, Communication, Problem Solving

## Location Mapping

Major Indian cities are mapped to district codes:

| City | District Code | State |
|------|---------------|-------|
| Bangalore | KA01 | Karnataka |
| Mumbai | MH01 | Maharashtra |
| Delhi | DL01 | Delhi |
| Pune | MH02 | Maharashtra |
| Hyderabad | TG01 | Telangana |
| Chennai | TN01 | Tamil Nadu |
| Kolkata | WB01 | West Bengal |
| Gurugram | HR01 | Haryana |

## Error Handling

### API Errors
- Rate limit exceeded: Automatic retry with exponential backoff
- Invalid credentials: Logged and reported to admin
- Network errors: Retry with increasing delays

### Data Processing Errors
- Invalid job data: Logged and skipped
- Normalization failures: Raw data preserved for manual review
- Duplicate detection: Logged for monitoring

## Monitoring and Logging

### Key Metrics
- API calls per day
- Jobs fetched per hour
- Success/failure rates
- Duplicate detection rates
- Processing times

### Log Messages
- `Fetching Adzuna jobs: {url}` - API request logging
- `Successfully saved {count} jobs from Adzuna` - Success logging
- `Adzuna fetch job failed: {error}` - Error logging
- `Skipping duplicate job: {title} at {company}` - Duplicate logging

## Configuration

### Environment Variables
```bash
ADZUNA_APP_ID=61f7a880
ADZUNA_APP_KEY=ce3260610c8e57a7cc1a633998f2a7dd
ADZUNA_COUNTRY=in
ADZUNA_BASE_URL=https://api.adzuna.com/v1/api/jobs
```

### Scheduler Configuration
- **Fetch Interval**: Every 2 hours
- **Max Pages per Fetch**: 2-3 pages
- **Rate Limit Delay**: 1 second between requests
- **Concurrent Jobs**: Limited by API rate limits

## Best Practices

### 1. API Usage
- Respect rate limits (500 calls/day)
- Use appropriate page sizes (max 50)
- Implement proper error handling
- Cache results when possible

### 2. Data Quality
- Validate all incoming data
- Handle missing fields gracefully
- Implement comprehensive skill extraction
- Regular duplicate cleanup

### 3. Performance
- Use pagination for large datasets
- Implement proper indexing on database fields
- Monitor API response times
- Optimize skill extraction algorithms

## Troubleshooting

### Common Issues

1. **API Rate Limit Exceeded**
   - Check daily usage in Adzuna dashboard
   - Reduce fetch frequency
   - Implement better caching

2. **No Jobs Returned**
   - Verify search terms are appropriate
   - Check location spelling
   - Ensure API credentials are correct

3. **Skill Extraction Issues**
   - Review skill keyword list
   - Check for new technology terms
   - Update extraction patterns

4. **Duplicate Jobs**
   - Review deduplication logic
   - Check for variations in company names
   - Improve matching algorithms

### Debug Mode
Enable detailed logging by setting `NODE_ENV=development` to see:
- Full API requests and responses
- Detailed normalization steps
- Skill extraction process
- Duplicate detection logic

## Future Enhancements

### Planned Features
1. **Machine Learning Skill Extraction**
   - Use NLP models for better skill detection
   - Handle synonyms and variations
   - Improve confidence scoring

2. **Advanced Filtering**
   - Industry-specific filters
   - Experience level detection
   - Salary range analysis

3. **Real-time Updates**
   - WebSocket integration for live updates
   - Push notifications for new trends
   - Real-time dashboard updates

4. **Data Enrichment**
   - Company information lookup
   - Industry classification
   - Skill taxonomy mapping

## Support

For issues related to the Adzuna integration:
1. Check the logs for error messages
2. Verify API credentials and rate limits
3. Review the data processing pipeline
4. Contact the development team with specific error details

---

*Last Updated: December 2024*
*Version: 1.0*
