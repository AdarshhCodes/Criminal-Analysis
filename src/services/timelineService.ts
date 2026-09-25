import { TimelineEvent, TimelineEventType } from '../types';
import { SYNTHETIC_TIMELINE } from '../data';

class TimelineService {
  private timelineEvents: TimelineEvent[] = [...SYNTHETIC_TIMELINE];

  public getTimeline(options?: {
    entityId?: string;
    typeFilter?: TimelineEventType | 'ALL';
    order?: 'asc' | 'desc';
  }): TimelineEvent[] {
    let result = [...this.timelineEvents];

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
