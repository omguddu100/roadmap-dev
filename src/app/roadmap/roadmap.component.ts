import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ThemeService } from '../theme.service';

@Component({
  selector: 'app-roadmap',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './roadmap.component.html'
})
export class RoadmapComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  themeService = inject(ThemeService);

  // --- Core State (Signals) ---
  roadmapId = signal<string>('');
  pageTitle = signal<string>('Developer Roadmap');
  roadmapData = signal<any[]>([]);
  topicReferences = signal<any>({});
  
  searchQuery = signal<string>('');
  selectedPhaseFilter = signal<string>('All');
  selectedPriorityFilter = signal<string>('All');
  showFilters = signal<boolean>(false);
  currentTopicId = signal<string | null>(null);
  expandedPhases = signal<Set<string>>(new Set());

  // --- User Progress State ---
  completedTopics = signal<Record<string, boolean>>({});
  userNotes = signal<Record<string, string>>({});
  userRefs = signal<Record<string, any[]>>({});

  // --- Modals ---
  isNotesModalOpen = signal(false);
  isRefsModalOpen = signal(false);
  refFormVisible = signal(false);
  editRefIndex = signal(-1);
  refForm = signal({ title: '', url: '', description: '' });
  currentNoteText = signal('');
  noteTopicId = signal<string | null>(null);
  refTopicId = signal<string | null>(null);

  // --- Computed State ---
  allTopics = computed(() => {
    return this.roadmapData().flatMap(p => p.topics.map((t: any) => ({ ...t, phase: p })));
  });
  
  availablePriorities = computed(() => {
    const data = this.roadmapData();
    if (!data) return [];
    const priorities = new Set<string>();
    data.forEach(phase => phase.topics.forEach((t: any) => {
      if (t.priority) priorities.add(t.priority);
    }));
    return Array.from(priorities);
  });

  filteredRoadmap = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const phaseFilter = this.selectedPhaseFilter();
    const priorityFilter = this.selectedPriorityFilter();
    const data = this.roadmapData();
    if (!data) return [];
    
    return data.map(phase => {
      if (phaseFilter !== 'All' && phase.id !== phaseFilter) {
        return null;
      }
      
      const filteredTopics = phase.topics.filter((topic: any) => {
        if (priorityFilter !== 'All' && topic.priority !== priorityFilter) {
          return false;
        }
        return topic.title.toLowerCase().includes(query) || 
               (topic.theory && topic.theory.some((t: string) => t.toLowerCase().includes(query))) ||
               (topic.hands && topic.hands.some((t: string) => t.toLowerCase().includes(query))) ||
               (topic.interview && topic.interview.some((t: string) => t.toLowerCase().includes(query)));
      });
      return {
        ...phase,
        topics: filteredTopics
      };
    }).filter(phase => phase !== null && phase.topics.length > 0);
  });

  progressStats = computed(() => {
    const total = this.allTopics().length;
    if (total === 0) return { pct: 0, text: '0% (0/0)' };
    const done = this.allTopics().filter(t => this.completedTopics()[t.id]).length;
    const pct = Math.round((done / total) * 100);
    return { pct, text: `${pct}% (${done}/${total})` };
  });

  currentTopic = computed(() => {
    const id = this.currentTopicId();
    if (!id) return null;
    return this.allTopics().find(t => t.id === id) || null;
  });

  currentTopicRefs = computed(() => {
    const id = this.refTopicId();
    if (!id) return [];
    return this.userRefs()[id] || [];
  });

  constructor() {
    this.loadState();
    
    effect(() => {
      const state = {
        completed: this.completedTopics(),
        notes: this.userNotes(),
        references: this.userRefs()
      };
      localStorage.setItem('roadmap-state', JSON.stringify(state));
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.roadmapId.set(id);
        
        let title = 'Developer Roadmap';
        if (id === 'angular-frontend-developer') {
          title = 'Angular Frontend Developer';
        } else if (id === 'job-ready-basic-to-advanced-javascript') {
          title = 'Job Ready: Basic to Advanced JavaScript';
        } else if (id === 'javascript-fundamentals-all-in-one') {
          title = 'Javascript Fundamentals All in One';
        } else if (id) {
          // Fallback: Title Case the ID
          title = id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }
        this.pageTitle.set(title);

        this.http.get(`/assets/${id}.json`).subscribe((data: any) => {
          this.roadmapData.set(data.roadmap);
          this.topicReferences.set(data.topicReferences);
          
          const phases = new Set(data.roadmap.map((p: any) => p.id));
          this.expandedPhases.set(phases as Set<string>);

          if (Object.keys(this.userRefs()).length === 0) {
            this.userRefs.set(data.topicReferences);
          }
        });
      }
    });
  }

  // State Management
  loadState() {
    const saved = localStorage.getItem('roadmap-state');
    if (saved) {
      const state = JSON.parse(saved);
      this.completedTopics.set(state.completed || {});
      this.userNotes.set(state.notes || {});
      this.userRefs.set(state.references || {});
    }
  }

  resetProgress() {
    if (confirm("Reset your complete progress?")) {
      this.completedTopics.set({});
      this.userNotes.set({});
      this.userRefs.set(JSON.parse(JSON.stringify(this.topicReferences())));
    }
  }

  downloadRoadmapJson() {
    const data = this.roadmapData();
    if (!data || data.length === 0) return;
    
    // Create a deep copy to potentially strip out dynamic state if we wanted, 
    // but the raw JSON is just the phase data.
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    
    // Try to get roadmap id from URL
    const roadmapId = this.route.snapshot.paramMap.get('id') || 'roadmap';
    a.download = `${roadmapId}.json`;
    
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Interactions
  togglePhase(phaseId: string) {
    const expanded = new Set(this.expandedPhases());
    if (expanded.has(phaseId)) expanded.delete(phaseId);
    else expanded.add(phaseId);
    this.expandedPhases.set(expanded);
  }

  expandAll() {
    const phases = new Set(this.roadmapData().map(p => p.id));
    this.expandedPhases.set(phases);
  }

  collapseAll() {
    this.expandedPhases.set(new Set());
    this.searchQuery.set('');
  }

  toggleComplete(topicId: string, eventOrValue: any) {
    const checked = typeof eventOrValue === 'boolean' ? eventOrValue : eventOrValue.target.checked;
    this.completedTopics.update(state => ({ ...state, [topicId]: checked }));
  }
  
  viewTopic(topicId: string | null) {
    this.currentTopicId.set(topicId);
    if (topicId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Modals - Notes
  openNotes(topicId: string) {
    this.noteTopicId.set(topicId);
    this.currentNoteText.set(this.userNotes()[topicId] || '');
    this.isNotesModalOpen.set(true);
  }

  saveNotes() {
    const id = this.noteTopicId();
    if (!id) return;
    
    const text = this.currentNoteText().trim();
    this.userNotes.update(notes => {
      const newNotes = { ...notes };
      if (text) {
        newNotes[id] = text;
      } else {
        delete newNotes[id];
      }
      return newNotes;
    });
    this.isNotesModalOpen.set(false);
  }

  clearNotes() {
    this.currentNoteText.set('');
    this.saveNotes();
  }

  // Modals - Refs
  openReferences(topicId: string) {
    this.refTopicId.set(topicId);
    this.refFormVisible.set(false);
    this.isRefsModalOpen.set(true);
  }

  showReferenceForm(index = -1) {
    this.editRefIndex.set(index);
    const id = this.refTopicId();
    if (index >= 0 && id) {
      const ref = this.userRefs()[id][index];
      this.refForm.set({ ...ref });
    } else {
      this.refForm.set({ title: '', url: '', description: '' });
    }
    this.refFormVisible.set(true);
  }

  hideReferenceForm() {
    this.refFormVisible.set(false);
  }

  updateRefForm(field: 'title' | 'url' | 'description', value: string) {
    this.refForm.update(f => ({ ...f, [field]: value }));
  }

  saveReference() {
    const id = this.refTopicId();
    if (!id) return;
    
    const form = this.refForm();
    if (!form.title.trim() || !form.url.trim()) {
      alert("Title and URL are required.");
      return;
    }

    this.userRefs.update(refs => {
      const newRefs = { ...refs };
      if (!newRefs[id]) newRefs[id] = [];
      
      const idx = this.editRefIndex();
      if (idx >= 0) {
        newRefs[id][idx] = form;
      } else {
        newRefs[id].push(form);
      }
      return newRefs;
    });
    
    this.refFormVisible.set(false);
  }

  deleteReference(index: number) {
    const id = this.refTopicId();
    if (!id) return;
    
    if (confirm("Are you sure you want to delete this reference?")) {
      this.userRefs.update(refs => {
        const newRefs = { ...refs };
        newRefs[id].splice(index, 1);
        return newRefs;
      });
    }
  }

  toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  getPriorityColorClass(priority: string): string {
    if (!priority) return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    switch(priority) {
      case 'Advanced': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-900/50';
      case 'Intermediate': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900/50';
      case 'Basic': return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-900/50';
      default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  }

  formatPriority(priority: string): string {
     return priority || '';
  }

  closeModal() {
    this.isNotesModalOpen.set(false);
    this.isRefsModalOpen.set(false);
  }
}
