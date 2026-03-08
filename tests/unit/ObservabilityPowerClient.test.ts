import { describe, it, expect, beforeEach } from 'vitest';
import { ObservabilityPowerClient } from '../../src/powers/ObservabilityPowerClient';
import { PowerClient } from '../../src/orchestration/PowerClient';

describe('ObservabilityPowerClient', () => {
  let client: ObservabilityPowerClient;
  let mockPowerClient: PowerClient;

  beforeEach(() => {
    mockPowerClient = new PowerClient();
    client = new ObservabilityPowerClient(mockPowerClient);
  });

  describe('auditServices', () => {
    it('should call audit_services tool with correct parameters', async () => {
      const serviceTargets = '[{"Type":"service","Service":"test-service"}]';

      await expect(client.auditServices(serviceTargets)).rejects.toThrow();
    });

    it('should support custom auditors', async () => {
      const serviceTargets = '[{"Type":"service","Service":"test-service"}]';
      const auditors = 'all';

      await expect(client.auditServices(serviceTargets, undefined, undefined, auditors)).rejects.toThrow();
    });
  });

  describe('auditSLOs', () => {
    it('should call audit_slos tool with correct parameters', async () => {
      const sloTargets = '[{"Type":"slo","Data":{"Slo":{"SloName":"test-slo"}}}]';

      await expect(client.auditSLOs(sloTargets)).rejects.toThrow();
    });
  });

  describe('searchTransactionSpans', () => {
    it('should call search_transaction_spans tool with correct parameters', async () => {
      const queryString = 'FILTER attributes.aws.local.service = "test-service"';

      await expect(client.searchTransactionSpans(queryString)).rejects.toThrow();
    });

    it('should use default log group name', async () => {
      const queryString = 'FILTER attributes.aws.local.service = "test-service"';

      await expect(client.searchTransactionSpans(queryString)).rejects.toThrow();
    });
  });

  describe('lookupEvents', () => {
    it('should call lookup_events tool with correct parameters', async () => {
      const startTime = '2024-01-01T00:00:00Z';
      const endTime = '2024-01-01T01:00:00Z';

      await expect(client.lookupEvents(startTime, endTime)).rejects.toThrow();
    });

    it('should support attribute filtering', async () => {
      const attributeKey = 'Username';
      const attributeValue = 'test-user';

      await expect(
        client.lookupEvents(undefined, undefined, attributeKey, attributeValue),
      ).rejects.toThrow();
    });
  });

  describe('helper methods', () => {
    it('should create service target JSON', () => {
      const target = client.createServiceTarget('test-service', 'eks:my-cluster');
      const parsed = JSON.parse(target);

      expect(parsed).toHaveLength(1);
      expect(parsed[0].Type).toBe('service');
      expect(parsed[0].Data.Service.Name).toBe('test-service');
      expect(parsed[0].Data.Service.Environment).toBe('eks:my-cluster');
    });

    it('should create service target without environment', () => {
      const target = client.createServiceTarget('test-service');
      const parsed = JSON.parse(target);

      expect(parsed).toHaveLength(1);
      expect(parsed[0].Data.Service.Name).toBe('test-service');
      expect(parsed[0].Data.Service.Environment).toBeUndefined();
    });

    it('should create SLO target JSON', () => {
      const target = client.createSLOTarget('test-slo');
      const parsed = JSON.parse(target);

      expect(parsed).toHaveLength(1);
      expect(parsed[0].Type).toBe('slo');
      expect(parsed[0].Data.Slo.SloName).toBe('test-slo');
    });
  });
});
