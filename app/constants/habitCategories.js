export const habitCategories = {
  breakfast: {
    name: '朝食改善',
    habits: [
      { id: 'soup', label: 'スープを飲む' },
      { id: 'protein', label: 'タンパク質を摂る（卵、ヨーグルト、プロテインなど）' },
      { id: 'vegetables', label: '野菜を摂る' }
    ]
  },
  meal: {
    name: '食事全般',
    habits: [
      { id: 'portion', label: '腹八分目で止める' },
      { id: 'noSnack', label: '間食を控える' },
      { id: 'noLateNight', label: '21時以降食べない' },
      { id: 'chew', label: 'よく噛んで食べる' }
    ]
  },
  lifestyle: {
    name: '生活習慣',
    habits: [
      { id: 'sleep7h', label: '7時間以上睡眠' },
      { id: 'bath20m', label: '入浴でリラックス（20分以上）' },
      { id: 'water2L', label: '水を2L以上飲む' },
      { id: 'lessPhone', label: 'スマホ時間3時間以内' }
    ]
  }
};

export const initialGoals = {
  startWeight: 82,
  targetWeight: 68,
  height: 174,
  weeklyFeelcycle: 3,
  dailyGoals: {
    breakfast: ['スープ', '卵orヨーグルト'],
    dinner: ['タンパク質強化', 'スープ追加'],
    nightRoutine: ['ストレッチ', '読書']
  }
};

export const START_DATE = new Date('2025-05-25');
export const END_DATE = new Date('2025-12-11');