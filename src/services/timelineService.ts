import { TimelineEvent, TimelineEventType } from '../types';
import { ALL_TIMELINE } from '../data';
import { investigationService } from './investigationService';

class TimelineService {
  private timelineEvents: TimelineEvent[] = [...ALL_TIMELINE];

  public getTimeline(options?: {
    caseId?: string;
    entityId?: string;
    typeFilter?: TimelineEventType | 'ALL';
    order?: 'asc' | 'desc';
  }): TimelineEvent[] {
    let result = [...this.timelineEvents];

    if (options?.caseId && options.caseId !== 'ALL' && options.caseId !== 'ALL-OPERATIONS') {
      const targetCase = investigationService.getCaseById(options.caseId);
      const caseEntityIds = new Set(targetCase?.entityIds || []);
      result = result.filter((event) => {
        if (event.caseId) return event.caseId === options.caseId;
        return event.entityIds.some((id) => caseEntityIds.has(id));
      });
    }

    if (options?.entityId) {
      result = result.filter((event) => event.entityIds.includes(options.entityId!));
    }

    if (options?.typeFilter && options.typeFilter !== 'ALL') {
      result = result.filter((event) => event.type === options.typeFilter);
    }

    const sortOrder = options?.order || 'asc';
    result.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });

    return result;
  }

  public getTimelineEventById(id: string): TimelineEvent | undefined {
    return this.timelineEvents.find((e) => e.id === id);
  }
}

export const timelineService = new TimelineService();
