import { ApiResponse } from '../../shared/utils/api-response.js';

export class HealthController {
  static getHealth(req, res) {
    return ApiResponse.ok(res, {
      status: 'healthy',
      service: 'node-analytics-api (Express)',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  }
}
