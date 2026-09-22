import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../theme.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  themeService = inject(ThemeService);

  motivationalQuote = signal({ text: '', author: '', title: '' });

  quotes = [
    {
      text: 'First, solve the problem. Then, write the code.',
      author: 'John Johnson',
      title: 'Software Architect & Author',
    },
    {
      text: 'Simplicity is prerequisite for reliability.',
      author: 'Edsger W. Dijkstra',
      title: 'Turing Award Winner',
    },
    {
      text: 'Make it work, make it right, make it fast.',
      author: 'Kent Beck',
      title: 'Creator of Extreme Programming',
    },
    {
      text: 'Code is like humor. When you have to explain it, it’s bad.',
      author: 'Cory House',
      title: 'Software Educator',
    },
  ];

  currentQuoteIndex = signal(0);

  ngOnInit() {
    this.motivationalQuote.set(this.quotes[this.currentQuoteIndex()]);
  }

  nextQuote() {
    const nextIdx = (this.currentQuoteIndex() + 1) % this.quotes.length;
    this.currentQuoteIndex.set(nextIdx);
    this.motivationalQuote.set(this.quotes[nextIdx]);
  }

  activeFilter = signal('all');

  setFilter(filter: string) {
    this.activeFilter.set(filter);
  }

  roadmaps = [
    {
      id: 'javascript-fundamentals-all-in-one',
      title: 'Javascript Fundamentals All in One',
      subtitle: 'Core Mechanics & Deep Dive',
      description:
        'Master core JavaScript mechanics including scope, closures, execution context, prototypes, and asynchronous patterns.',
      tags: ['javascript', 'core', 'active', 'es6+', 'closures'],
      displayTags: ['JAVASCRIPT', 'ES6+', 'CLOSURES'],
      color: 'amber',
      icon: 'fa-brands fa-js',
      progress: 75,
      modules: '12/16',
      time: '~ 4 hrs left',
      isAvailable: true,
    },
    {
      id: 'job-ready-basic-to-advanced-javascript',
      title: 'Job Ready: Basic to Advanced JS',
      subtitle: 'Career-Focused Mastery Path',
      description:
        'Go from beginner to interview-ready with comprehensive coverage of JavaScript syntax, DOM manipulation, APIs, testing, and modern tooling.',
      tags: ['javascript', 'career', 'active'],
      displayTags: ['JAVASCRIPT', 'DOM APIS', 'TESTING'],
      color: 'orange',
      icon: 'fa-solid fa-briefcase',
      progress: 30,
      modules: '6/20',
      time: '~ 12 hrs left',
      isAvailable: true,
    },
    {
      id: 'angular-frontend-developer',
      title: 'Angular Frontend Developer',
      subtitle: 'Enterprise Web Application Architecture',
      description:
        'Master Angular, RxJS, Signals, state management, and modern frontend architecture to build production-grade Web Apps.',
      tags: ['angular', 'frontend', 'active'],
      displayTags: ['ANGULAR', 'TYPESCRIPT', 'RXJS'],
      color: 'rose',
      icon: 'fa-brands fa-angular',
      progress: 10,
      modules: '2/22',
      time: '~ 20 hrs left',
      isAvailable: true,
    },

    {
      id: 'Most_Asked_Questions_on_LangChain_for_RAG',
      title: 'Most Asked Questions on LangChain for RAG',
      subtitle: 'Core Mechanics & Deep Dive',
      description:
        'Master LangChain RAG fundamentals and advanced patterns, including LCEL internals, hybrid search, streaming, multi-step reasoning, and LangGraph state loops.',
      tags: ['langchain', 'rag', 'lcel', 'langgraph', 'vector-search', 'ai'],
      displayTags: ['LANGCHAIN', 'RAG', 'LCEL', 'LANGGRAPH'],
      color: 'amber',
      icon: 'fa-solid fa-cubes',
      progress: 75,
      modules: '10/10',
      time: '~ 2 hrs left',
      isAvailable: true,
    },
  ];

  openRoadmap(roadmap: any) {
    if (roadmap.isAvailable) {
      this.router.navigate(['/roadmap', roadmap.id]);
    } else {
      alert('This roadmap is coming soon!');
    }
  }
}
