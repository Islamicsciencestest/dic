import React, { useState, useEffect, useMemo } from 'react';
import { WordEntry, SentenceEntry, SortOption, AppTab } from './types';
import { WordCard } from './components/WordCard';
import { SentenceCard } from './components/SentenceCard';
import { AddWordForm } from './components/AddWordForm';
import { AddSentenceForm } from './components/AddSentenceForm';
import { PlusIcon, SearchIcon, BookIcon, FolderIcon } from './components/Icons';

function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('WORDS');
  const [words, setWords] = useState<WordEntry[]>([]);
  const [sentences, setSentences] = useState<SentenceEntry[]>([]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.NEWEST);
  
  // Sentence specific filter
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Load Data
  useEffect(() => {
    const savedWords = localStorage.getItem('my-dictionary-words');
    const savedSentences = localStorage.getItem('my-dictionary-sentences');
    
    if (savedWords) {
      try { setWords(JSON.parse(savedWords)); } catch (e) { console.error(e); }
    }
    if (savedSentences) {
      try { setSentences(JSON.parse(savedSentences)); } catch (e) { console.error(e); }
    }
  }, []);

  // Save Data
  useEffect(() => {
    localStorage.setItem('my-dictionary-words', JSON.stringify(words));
  }, [words]);

  useEffect(() => {
    localStorage.setItem('my-dictionary-sentences', JSON.stringify(sentences));
  }, [sentences]);

  // Handlers
  const handleAddWord = (newWord: Omit<WordEntry, 'id' | 'createdAt'>) => {
    const entry: WordEntry = {
      ...newWord,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };
    setWords(prev => [entry, ...prev]);
  };

  const handleAddSentence = (newSentence: Omit<SentenceEntry, 'id' | 'createdAt'>) => {
    const entry: SentenceEntry = {
      ...newSentence,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };
    setSentences(prev => [entry, ...prev]);
  };

  const handleDeleteWord = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الكلمة؟')) {
      setWords(prev => prev.filter(w => w.id !== id));
    }
  };

  const handleDeleteSentence = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الجملة؟')) {
      setSentences(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleUpdateNote = (id: string, newNote: string) => {
    setWords(prev => prev.map(w => w.id === id ? { ...w, notes: newNote } : w));
  };

  // Derived Data
  const sentenceCategories = useMemo(() => {
    const cats = new Set(sentences.map(s => s.category));
    return Array.from(cats);
  }, [sentences]);

  const filteredContent = useMemo(() => {
    if (activeTab === 'WORDS') {
      let result = words.filter(w => 
        w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.translation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      );

      switch (sortOption) {
        case SortOption.ALPHABETICAL: result.sort((a, b) => a.word.localeCompare(b.word)); break;
        case SortOption.OLDEST: result.sort((a, b) => a.createdAt - b.createdAt); break;
        case SortOption.NEWEST: default: result.sort((a, b) => b.createdAt - a.createdAt); break;
      }
      return result;
    } else {
      // Sentences Filtering
      let result = sentences.filter(s => {
        const matchesSearch = 
          s.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.translation.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'ALL' || s.category === selectedCategory;
        return matchesSearch && matchesCategory;
      });
      // Sentences always newest first
      return result.sort((a, b) => b.createdAt - a.createdAt);
    }
  }, [activeTab, words, sentences, searchQuery, sortOption, selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-500 font-sans">
      {/* Background decoration */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
         <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary-300/20 blur-3xl"></div>
         <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] rounded-full bg-purple-300/20 blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white p-2 rounded-lg shadow-lg shadow-primary-500/20">
                  <BookIcon className="w-6 h-6" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-200">
                قاموسي الذكي
              </h1>
            </div>
            
            <button 
              onClick={() => setShowAddModal(true)}
              className="hidden md:flex items-center gap-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white hover:opacity-90 px-5 py-2 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95"
            >
              <PlusIcon className="w-5 h-5" />
              <span>{activeTab === 'WORDS' ? 'إضافة كلمة' : 'إضافة جملة'}</span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-6 mt-2 border-b border-transparent">
            <button 
              onClick={() => setActiveTab('WORDS')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'WORDS' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              القاموس (الكلمات)
            </button>
            <button 
              onClick={() => setActiveTab('SENTENCES')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'SENTENCES' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              الجمل والعبارات
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Controls Row */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
              <SearchIcon className="w-5 h-5" />
            </div>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'WORDS' ? "ابحث عن كلمة، ترجمة، أو وسم..." : "ابحث في الجمل..."}
              className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          
          {activeTab === 'WORDS' ? (
            <select 
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="md:w-48 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer"
            >
              <option value={SortOption.NEWEST}>الأحدث أولاً</option>
              <option value={SortOption.OLDEST}>الأقدم أولاً</option>
              <option value={SortOption.ALPHABETICAL}>أبجدياً</option>
            </select>
          ) : (
             // Sentence Categories Filter
             <div className="flex overflow-x-auto gap-2 pb-1 md:pb-0 no-scrollbar">
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className={`whitespace-nowrap px-4 py-3 rounded-xl border transition-colors ${selectedCategory === 'ALL' ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 border-transparent' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}
                >
                  الكل
                </button>
                {sentenceCategories.map(cat => (
                   <button
                   key={cat}
                   onClick={() => setSelectedCategory(cat)}
                   className={`whitespace-nowrap px-4 py-3 rounded-xl border transition-colors ${selectedCategory === cat ? 'bg-indigo-600 text-white border-transparent' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}
                 >
                   {cat}
                 </button>
                ))}
             </div>
          )}
        </div>

        {/* Empty State */}
        {filteredContent.length === 0 && !searchQuery && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-6 animate-pulse">
              <PlusIcon className="w-12 h-12 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-2">
              {activeTab === 'WORDS' ? 'القاموس فارغ' : 'لا توجد جمل محفوظة'}
            </h2>
            <p className="text-slate-500 max-w-md mb-8">
              {activeTab === 'WORDS' 
                ? 'ابدأ ببناء قاموسك. أضف كلمات جديدة مع ترجمتها واستمع لنطقها.' 
                : 'أضف جملاً وعبارات مفيدة ورتبها حسب الأقسام لتسهيل مراجعتها.'}
            </p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-full shadow-lg shadow-primary-500/30 font-medium transition-all transform hover:-translate-y-1"
            >
              {activeTab === 'WORDS' ? 'أضف أول كلمة' : 'أضف أول جملة'}
            </button>
          </div>
        )}

        {/* Grid / List View */}
        {activeTab === 'WORDS' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(filteredContent as WordEntry[]).map(entry => (
              <WordCard 
                key={entry.id} 
                entry={entry} 
                onDelete={handleDeleteWord}
                onUpdateNote={handleUpdateNote}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
             {(filteredContent as SentenceEntry[]).map(entry => (
               <SentenceCard
                 key={entry.id}
                 entry={entry}
                 onDelete={handleDeleteSentence}
               />
             ))}
          </div>
        )}

        {/* No Search Results */}
        {filteredContent.length === 0 && searchQuery && (
           <div className="text-center py-20">
              <p className="text-slate-500 text-lg">لا توجد نتائج بحث مطابقة لـ "{searchQuery}"</p>
           </div>
        )}
      </main>

      {/* Mobile Floating Action Button */}
      <button 
        onClick={() => setShowAddModal(true)}
        className={`md:hidden fixed bottom-6 left-6 z-40 text-white p-4 rounded-full shadow-xl active:scale-90 transition-transform ${activeTab === 'WORDS' ? 'bg-primary-600 shadow-primary-600/40' : 'bg-indigo-600 shadow-indigo-600/40'}`}
      >
        <PlusIcon className="w-6 h-6" />
      </button>

      {showAddModal && (
        activeTab === 'WORDS' ? (
          <AddWordForm 
            onAdd={handleAddWord} 
            onClose={() => setShowAddModal(false)} 
          />
        ) : (
          <AddSentenceForm
            onAdd={handleAddSentence}
            onClose={() => setShowAddModal(false)}
            existingCategories={sentenceCategories}
          />
        )
      )}
    </div>
  );
}

export default App;