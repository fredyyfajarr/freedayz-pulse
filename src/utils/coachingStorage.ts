'use client';

import { 
  CoachTask, 
  SquadAthlete, 
  RABItem, 
  CoachingPackage, 
  CommercialFinancialSummary,
  AvailableCoach,
  AvailableCoachProgram,
  DIRECTORY_COACHES,
  INITIAL_COACH_TASKS,
  INITIAL_RAB_ITEMS,
  INITIAL_COACHING_PACKAGES
} from '@/domain/entities/CoachingRelationship';

const TASKS_STORAGE_KEY = 'fdz_pulse_coach_tasks_v3';
const RAB_STORAGE_KEY = 'fdz_pulse_rab_items_v2';
const PACKAGES_STORAGE_KEY = 'fdz_pulse_packages_v2';
const SQUAD_ATHLETES_KEY = 'fdz_pulse_squad_athletes_v2';
const REGISTERED_COACHES_KEY = 'fdz_pulse_registered_coaches_v2';
const COACH_PLANS_KEY = 'fdz_pulse_coach_programs_v2';

export class CoachingStorage {
  // --- SQUAD ATHLETES (DYNAMIC ROSTER) ---
  public static getSquadAthletes(coachId?: string): SquadAthlete[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(SQUAD_ATHLETES_KEY);
      if (!stored) {
        return [];
      }
      const athletes: SquadAthlete[] = JSON.parse(stored);
      // Clean out any legacy mock data referencing dummy coach names
      const cleaned = athletes.filter(a => {
        const c = (a.coachId || '').toLowerCase();
        return !c.includes('faisal') && !c.includes('dani');
      });

      if (coachId) {
        return cleaned.filter(a => !a.coachId || a.coachId.toLowerCase() === coachId.toLowerCase());
      }
      return cleaned;
    } catch {
      return [];
    }
  }

  public static addSquadAthlete(athleteData: Omit<SquadAthlete, 'id'>): SquadAthlete {
    const athletes = this.getSquadAthletes();
    // Prevent duplicate entries for same athlete email or name
    const cleanEmail = athleteData.email.toLowerCase().trim();
    const cleanName = athleteData.name.toLowerCase().trim();
    const filtered = athletes.filter(a => 
      a.email.toLowerCase().trim() !== cleanEmail && 
      a.name.toLowerCase().trim() !== cleanName
    );

    const newAthlete: SquadAthlete = {
      ...athleteData,
      id: `ath-${Date.now()}`,
      joinedAt: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
    };
    const updated = [newAthlete, ...filtered];
    if (typeof window !== 'undefined') {
      localStorage.setItem(SQUAD_ATHLETES_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('squad_athlete_updated'));
    }
    return newAthlete;
  }

  public static deleteSquadAthlete(id: string): boolean {
    const athletes = this.getSquadAthletes();
    const filtered = athletes.filter(a => a.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(SQUAD_ATHLETES_KEY, JSON.stringify(filtered));
      window.dispatchEvent(new Event('squad_athlete_updated'));
    }
    return true;
  }

  public static disconnectAthlete(athleteNameOrEmail: string): boolean {
    if (typeof window === 'undefined' || !athleteNameOrEmail) return false;
    const clean = athleteNameOrEmail.toLowerCase().trim();
    const athletes = this.getSquadAthletes();
    const filteredAthletes = athletes.filter(a => 
      !a.name.toLowerCase().includes(clean) && 
      !a.email.toLowerCase().includes(clean) &&
      !clean.includes(a.name.toLowerCase())
    );
    localStorage.setItem(SQUAD_ATHLETES_KEY, JSON.stringify(filteredAthletes));

    // Also remove pending coach tasks for this athlete
    const tasks = this.getTasks();
    const remainingTasks = tasks.filter(t => 
      !(t.athleteName.toLowerCase().includes(clean) && t.status === 'PENDING')
    );
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(remainingTasks));

    window.dispatchEvent(new Event('squad_athlete_updated'));
    window.dispatchEvent(new Event('coaching_task_updated'));
    return true;
  }

  // --- COACHES DIRECTORY (100% DYNAMIC, ZERO MOCK DATA) ---
  public static getAvailableCoaches(): AvailableCoach[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(REGISTERED_COACHES_KEY);
      if (!stored) {
        return [];
      }
      const coaches: AvailableCoach[] = JSON.parse(stored);
      // Remove any legacy mock coaches
      return coaches.filter(c => {
        const name = (c.name || '').toLowerCase();
        const email = (c.email || '').toLowerCase();
        return !name.includes('faisal') && !name.includes('dani') && !email.includes('faisal') && !email.includes('dani');
      });
    } catch {
      return [];
    }
  }

  public static registerCoachProfile(coachData: Partial<AvailableCoach> & { name: string; email?: string }): AvailableCoach {
    const current = this.getAvailableCoaches();
    const cleanEmail = (coachData.email || '').toLowerCase().trim();
    const cleanName = (coachData.name || '').trim();
    const cleanId = coachData.id || `coach-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    const existingIdx = current.findIndex(c => 
      (cleanEmail && c.email?.toLowerCase().trim() === cleanEmail) || 
      c.id === cleanId ||
      c.name.toLowerCase() === cleanName.toLowerCase()
    );

    const programs = this.getCoachPrograms(cleanEmail || cleanId);

    const coach: AvailableCoach = {
      id: cleanId,
      name: cleanName,
      email: coachData.email,
      role: coachData.role || 'Head Coach',
      club: coachData.club || 'Freedayzz Athletic Club',
      inviteCode: coachData.inviteCode || `FDZ-${cleanName.toUpperCase().slice(0, 4)}-${cleanId.slice(0, 4)}`,
      specialty: coachData.specialty || 'Marathon Periodization & Aerobic Base Building',
      avatarInitials: coachData.avatarInitials || (cleanName.slice(0, 2).toUpperCase() || 'CO'),
      programs: programs.length > 0 ? programs : (existingIdx >= 0 ? current[existingIdx].programs : []),
    };

    let updated: AvailableCoach[];
    if (existingIdx >= 0) {
      updated = [...current];
      updated[existingIdx] = { ...updated[existingIdx], ...coach };
    } else {
      updated = [coach, ...current];
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(REGISTERED_COACHES_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('coach_registered'));
    }
    return coach;
  }

  // --- DYNAMIC COACH PROGRAMS ---
  public static getCoachPrograms(coachIdOrEmail: string): AvailableCoachProgram[] {
    if (typeof window === 'undefined' || !coachIdOrEmail) return [];
    try {
      const key = `${COACH_PLANS_KEY}_${coachIdOrEmail.toLowerCase().trim()}`;
      const stored = localStorage.getItem(key);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  public static addCoachProgram(coachIdOrEmail: string, program: AvailableCoachProgram): void {
    if (typeof window === 'undefined' || !coachIdOrEmail) return;
    const current = this.getCoachPrograms(coachIdOrEmail);
    const updated = [program, ...current.filter(p => p.id !== program.id)];
    const key = `${COACH_PLANS_KEY}_${coachIdOrEmail.toLowerCase().trim()}`;
    localStorage.setItem(key, JSON.stringify(updated));

    // Also sync into registered coach entry
    const coaches = this.getAvailableCoaches();
    const cleanKey = coachIdOrEmail.toLowerCase().trim();
    const cIdx = coaches.findIndex(c => 
      c.id.toLowerCase() === cleanKey || 
      c.email?.toLowerCase().trim() === cleanKey ||
      c.name.toLowerCase() === cleanKey
    );
    if (cIdx >= 0) {
      coaches[cIdx].programs = updated;
      localStorage.setItem(REGISTERED_COACHES_KEY, JSON.stringify(coaches));
    }

    window.dispatchEvent(new Event('coach_programs_updated'));
  }

  public static deleteCoachProgram(coachIdOrEmail: string, programId: string): void {
    if (typeof window === 'undefined' || !coachIdOrEmail) return;
    const current = this.getCoachPrograms(coachIdOrEmail);
    const updated = current.filter(p => p.id !== programId);
    const key = `${COACH_PLANS_KEY}_${coachIdOrEmail.toLowerCase().trim()}`;
    localStorage.setItem(key, JSON.stringify(updated));

    const coaches = this.getAvailableCoaches();
    const cleanKey = coachIdOrEmail.toLowerCase().trim();
    const cIdx = coaches.findIndex(c => 
      c.id.toLowerCase() === cleanKey || 
      c.email?.toLowerCase().trim() === cleanKey ||
      c.name.toLowerCase() === cleanKey
    );
    if (cIdx >= 0) {
      coaches[cIdx].programs = updated;
      localStorage.setItem(REGISTERED_COACHES_KEY, JSON.stringify(coaches));
    }

    window.dispatchEvent(new Event('coach_programs_updated'));
  }

  public static findCoachByQuery(query: string): AvailableCoach | null {
    if (!query) return null;
    const clean = query.trim().toLowerCase();
    const coaches = this.getAvailableCoaches();

    // 1. Check exact or partial match in registered coaches
    const matched = coaches.find(c => 
      (c.inviteCode && c.inviteCode.toLowerCase().includes(clean)) ||
      (c.email && c.email.toLowerCase().includes(clean)) ||
      c.name.toLowerCase().includes(clean) ||
      clean.includes(c.name.toLowerCase()) ||
      c.id.toLowerCase().includes(clean)
    );

    if (matched) return matched;

    // 2. If user provided a custom code or valid email, dynamically create and register the coach
    if (clean.includes('@') || clean.startsWith('fdz-') || clean.length >= 3) {
      const generatedName = clean.includes('@') 
        ? clean.split('@')[0] 
        : clean.replace(/^fdz-/, '').split('-')[0] || 'Coach';
      const formattedName = generatedName.charAt(0).toUpperCase() + generatedName.slice(1);

      return this.registerCoachProfile({
        name: formattedName.startsWith('Coach') ? formattedName : `Coach ${formattedName}`,
        email: clean.includes('@') ? clean : undefined,
        inviteCode: query.toUpperCase(),
        role: 'Head Coach',
        club: 'Freedayzz Athletic Club',
        specialty: 'Marathon & Endurance Periodization',
      });
    }

    return null;
  }
  // --- COACH TASKS ---
  public static getTasks(): CoachTask[] {
    if (typeof window === 'undefined') return INITIAL_COACH_TASKS;
    try {
      const stored = localStorage.getItem(TASKS_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(INITIAL_COACH_TASKS));
        return INITIAL_COACH_TASKS;
      }
      const loaded: CoachTask[] = JSON.parse(stored);
      // Clean out any legacy mock tasks referencing dummy coaches
      return loaded.filter(t => {
        const c = (t.coachName || '').toLowerCase();
        return !c.includes('faisal') && !c.includes('dani');
      });
    } catch {
      return INITIAL_COACH_TASKS;
    }
  }

  public static getTasksForAthlete(athleteNameOrEmail: string): CoachTask[] {
    const all = this.getTasks();
    if (!athleteNameOrEmail) return [];
    const cleanSearch = athleteNameOrEmail.toLowerCase().trim();
    
    return all.filter(t => 
      t.athleteName.toLowerCase().includes(cleanSearch) || 
      t.athleteId.toLowerCase().includes(cleanSearch)
    );
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
