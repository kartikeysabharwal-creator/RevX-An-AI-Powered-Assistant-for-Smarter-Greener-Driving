import request from 'supertest';
import { app } from '../app';

describe('RevX REST API End-to-End Test Suite', () => {
  let authToken = 'demo-token';
  let createdVehicleId = '';
  let activeTripId = '';

  it('GET /api/v1/health should return UP status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.version).toBe('1.4.0');
  });

  it('POST /api/v1/auth/login should return valid token and user profile', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'anjul@revx.ai', password: 'securepassword123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('anjul@revx.ai');
    authToken = res.body.data.token;
  });

  it('GET /api/v1/auth/profile should fetch current user profile', async () => {
    const res = await request(app)
      .get('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.fullName).toBe('Anjul Sharma');
    expect(res.body.data.preferredUnits).toBe('METRIC');
  });

  it('GET /api/v1/vehicles should list user vehicles', async () => {
    const res = await request(app)
      .get('/api/v1/vehicles')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    createdVehicleId = res.body.data[0].id;
  });

  it('POST /api/v1/vehicles should create a new vehicle', async () => {
    const res = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        make: 'BMW',
        model: 'i4 eDrive40',
        year: 2024,
        fuelType: 'ELECTRIC',
        engineSizeL: 2.0,
        transmission: 'AUTOMATIC',
        fuelTankCapacityL: 80,
        odometerKm: 5000,
        nickname: 'Electron Starlight',
        isPrimary: false,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.model).toBe('i4 eDrive40');
  });

  it('POST /api/v1/trips/start should start a new trip in Phone-Only mode', async () => {
    const res = await request(app)
      .post('/api/v1/trips/start')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        vehicleId: createdVehicleId,
        mode: 'PHONE_ONLY',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('ACTIVE');
    activeTripId = res.body.data.id;
  });

  it('POST /api/v1/trips/telemetry should ingest high-frequency points and detect events', async () => {
    const now = Date.now();
    const res = await request(app)
      .post('/api/v1/trips/telemetry')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        tripId: activeTripId,
        points: [
          {
            timestamp: now,
            latitude: 12.9716,
            longitude: 77.5946,
            accuracy: 4,
            speedKmh: 10,
            longitudinalAccelMs2: 1.2,
            lateralAccelMs2: 0,
            verticalAccelMs2: 9.8,
            sourceMode: 'PHONE_ONLY',
            isStationary: false,
          },
          {
            timestamp: now + 2000,
            latitude: 12.973,
            longitude: 77.596,
            accuracy: 4,
            speedKmh: 45,
            longitudinalAccelMs2: 3.5, // Harsh accel
            lateralAccelMs2: 0.2,
            verticalAccelMs2: 9.8,
            sourceMode: 'PHONE_ONLY',
            isStationary: false,
          },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.data.detectedEventsCount).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/v1/trips/end should finalize calculations and store metrics', async () => {
    const res = await request(app)
      .post('/api/v1/trips/end')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        tripId: activeTripId,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('COMPLETED');
    expect(res.body.data.ecoScore.score).toBeGreaterThanOrEqual(0);
    expect(res.body.data.safetyScore.score).toBeGreaterThanOrEqual(0);
    expect(res.body.data.fuelEmissions.fuelUsedLitres).toBeDefined();
  });

  it('POST /api/v1/ai/analyze-trip should return structured AI coaching insights', async () => {
    const res = await request(app)
      .post('/api/v1/ai/analyze-trip')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        tripId: activeTripId,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.summary).toBeDefined();
    expect(Array.isArray(res.body.data.positivePoints)).toBe(true);
    expect(Array.isArray(res.body.data.recommendations)).toBe(true);
    expect(res.body.data.priorityRecommendation).toBeDefined();
  });

  it('GET /api/v1/analytics/dashboard should return command center data', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/dashboard')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.greeting).toContain('GOOD EVENING');
    expect(res.body.data.quickCards.ecoScore).toBeGreaterThanOrEqual(50);
  });

  it('GET /api/v1/analytics/weekly should return day series and trend comparisons', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/weekly')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.daySeries)).toBe(true);
    expect(res.body.data.headlineTrend).toBeDefined();
  });

  it('GET /api/v1/gamification/achievements should return achievements catalog and unlocks', async () => {
    const res = await request(app)
      .get('/api/v1/gamification/achievements')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.catalog.length).toBeGreaterThanOrEqual(5);
    expect(res.body.data.unlocked.length).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/v1/simulators/run should execute complete realistic simulated drive', async () => {
    const res = await request(app)
      .post('/api/v1/simulators/run')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        scenario: 'SMOOTH_ECO',
        mode: 'OBD_II',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.trip.status).toBe('COMPLETED');
    expect(res.body.data.pointsSampled).toBeGreaterThan(100);
    expect(res.body.data.trip.ecoScore.score).toBeGreaterThanOrEqual(80);
  });

  it('GET /api/v1/admin/stats should return Green Computing metrics', async () => {
    const res = await request(app).get('/api/v1/admin/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.greenComputing.averageLocalProcessingRatio).toBeGreaterThan(90);
    expect(res.body.data.models.fuelModel).toBeDefined();
  });
});
