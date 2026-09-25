import { Alert, AlertStatus } from '../types';
import { ALL_ALERTS } from '../data';
import { investigationService } from './investigationService';

class AlertService {
  private alerts: Alert[] = [...ALL_ALERTS];

  public getAlerts(statusFilter?: AlertStatus | 'ALL', caseId?: string): Alert[] {
    let list = [...this.alerts];

    if (caseId && caseId !== 'ALL' && caseId !== 'ALL-OPERATIONS') {
      const targetCase = investigationService.getCaseById(caseId);
      const caseEntityIds = new Set(targetCase?.entityIds || []);
      list = list.filter((a) => {
        if (a.caseId) return a.caseId === caseId;
        return a.entityIds.some((id) => caseEntityIds.has(id));
      });
    }

    if (!statusFilter || statusFilter === 'ALL') {
      return list;
    }
    return list.filter((a) => a.status === statusFilter);
  }

  public getAlertById(id: string): Alert | undefined {
    return this.alerts.find((a) => a.id === id);
  }

  public getAlertsForEntity(entityId: string): Alert[] {
    return this.alerts.filter((a) => a.entityIds.includes(entityId));
  }

  public acknowledgeAlert(alertId: string): Alert | undefined {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert) return undefined;
    alert.status = 'ACKNOWLEDGED';
    return { ...alert };
  }

  public updateAlertStatus(alertId: string, status: AlertStatus): Alert | undefined {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert) return undefined;
    alert.status = status;
    return { ...alert };
  }
}

export const alertService = new AlertService();
