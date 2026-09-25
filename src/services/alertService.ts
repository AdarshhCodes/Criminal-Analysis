import { Alert, AlertStatus } from '../types';
import { SYNTHETIC_ALERTS } from '../data';

class AlertService {
  private alerts: Alert[] = [...SYNTHETIC_ALERTS];

  public getAlerts(statusFilter?: AlertStatus | 'ALL'): Alert[] {
    if (!statusFilter || statusFilter === 'ALL') {
      return [...this.alerts];
    }
    return this.alerts.filter((a) => a.status === statusFilter);
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
