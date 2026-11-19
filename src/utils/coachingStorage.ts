'use client';

import { 
  CoachTask, 
  RABItem, 
  CoachingPackage, 
  CommercialFinancialSummary,
  INITIAL_COACH_TASKS,
  INITIAL_RAB_ITEMS,
  INITIAL_COACHING_PACKAGES
} from '@/domain/entities/CoachingRelationship';

const TASKS_STORAGE_KEY = 'fdz_pulse_coach_tasks_v2';
const RAB_STORAGE_KEY = 'fdz_pulse_rab_items_v2';
const PACKAGES_STORAGE_KEY = 'fdz_pulse_packages_v2';

export class CoachingStorage {
  // --- COACH TASKS ---
  public static getTasks(): CoachTask[] {
    if (typeof window === 'undefined') return INITIAL_COACH_TASKS;
    try {
      const stored = localStorage.getItem(TASKS_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(INITIAL_COACH_TASKS));
        return INITIAL_COACH_TASKS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_COACH_TASKS;
    }
  }

  public static getTasksForAthlete(athleteNameOrEmail: string): CoachTask[] {
    const all = this.getTasks();
    const cleanSearch = athleteNameOrEmail.toLowerCase().trim();
    
    // If searching for Fredy or empty or default user, return tasks matching Fredy or unassigned
    const filtered = all.filter(t => 
      t.athleteName.toLowerCase().includes(cleanSearch) || 
      t.athleteId.toLowerCase().includes(cleanSearch) ||
      cleanSearch.includes('fredy') && t.athleteName.toLowerCase().includes('fredy')
    );

    return filtered.length > 0 ? filtered : all.filter(t => t.athleteName.toLowerCase().includes('fredy'));
  }

  public static addTask(taskData: Omit<CoachTask, 'id'>): CoachTask {
    const tasks = this.getTasks();
    const newTask: CoachTask = {
      ...taskData,
      id: `task-${Date.now()}`,
    };
    const updated = [newTask, ...tasks];
    if (typeof window !== 'undefined') {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('coaching_task_updated'));
    }
    return newTask;
  }

  public static completeTask(
    taskId: string, 
    reportedRpe: number, 
    athleteFeedback: string
  ): boolean {
    const tasks = this.getTasks();
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx === -1) return false;

    tasks[idx] = {
      ...tasks[idx],
      status: 'COMPLETED',
      completedAt: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      reportedRpe,
      athleteFeedback,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
      window.dispatchEvent(new Event('coaching_task_updated'));
    }
    return true;
  }

  public static reviewTask(taskId: string, coachReviewNote: string): boolean {
    const tasks = this.getTasks();
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx === -1) return false;

    tasks[idx] = {
      ...tasks[idx],
      coachReviewNote,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
      window.dispatchEvent(new Event('coaching_task_updated'));
    }
    return true;
  }

  // --- RAB (RENCANA ANGGARAN BIAYA) ---
  public static getRABItems(): RABItem[] {
    if (typeof window === 'undefined') return INITIAL_RAB_ITEMS;
    try {
      const stored = localStorage.getItem(RAB_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(RAB_STORAGE_KEY, JSON.stringify(INITIAL_RAB_ITEMS));
        return INITIAL_RAB_ITEMS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_RAB_ITEMS;
    }
  }

  public static addRABItem(itemData: Omit<RABItem, 'id' | 'totalPriceIdr'>): RABItem {
    const items = this.getRABItems();
    const newItem: RABItem = {
      ...itemData,
      id: `rab-${Date.now()}`,
      totalPriceIdr: itemData.volume * itemData.unitPriceIdr,
    };
    const updated = [...items, newItem];
    if (typeof window !== 'undefined') {
      localStorage.setItem(RAB_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('coaching_rab_updated'));
    }
    return newItem;
  }

  // --- PACKAGES ---
  public static getCoachingPackages(): CoachingPackage[] {
    if (typeof window === 'undefined') return INITIAL_COACHING_PACKAGES;
    try {
      const stored = localStorage.getItem(PACKAGES_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(INITIAL_COACHING_PACKAGES));
        return INITIAL_COACHING_PACKAGES;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_COACHING_PACKAGES;
    }
  }

  // --- FINANCIAL CALCULATOR ---
  public static calculateFinancialSummary(
    rabItems: RABItem[], 
    packages: CoachingPackage[]
  ): CommercialFinancialSummary {
    const totalRabBudget = rabItems.reduce((acc, curr) => acc + curr.totalPriceIdr, 0);
    
    // Revenue from packages over a typical 4-month season
    const totalProjectedRevenue = packages.reduce((acc, curr) => {
      return acc + (curr.monthlyFeeIdr * curr.activeAthletesCount * curr.durationMonths);
    }, 0);

    const netMarginIdr = totalProjectedRevenue - totalRabBudget;
    const netMarginPercentage = totalProjectedRevenue > 0 
      ? Math.round((netMarginIdr / totalProjectedRevenue) * 100) 
      : 0;

    const realizedExpenseIdr = rabItems
      .filter(item => item.realizationStatus === 'PAID')
      .reduce((acc, curr) => acc + curr.totalPriceIdr, 0);

    const budgetUtilizationPercentage = totalRabBudget > 0
      ? Math.round((realizedExpenseIdr / totalRabBudget) * 100)
      : 0;

    const totalAthletes = packages.reduce((acc, curr) => acc + curr.activeAthletesCount, 0);
    const costPerAthleteIdr = totalAthletes > 0 ? Math.round(totalRabBudget / totalAthletes) : 0;

    return {
      totalRabBudget,
      totalProjectedRevenue,
      netMarginIdr,
      netMarginPercentage,
      realizedExpenseIdr,
      budgetUtilizationPercentage,
      costPerAthleteIdr,
    };
  }
}
