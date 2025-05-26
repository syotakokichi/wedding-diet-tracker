import { habitCategories, START_DATE, END_DATE, initialGoals } from '../constants/habitCategories';

// 日付のフォーマット
export const formatDate = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// 月の日数を取得
export const getDaysInMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

// 月の最初の曜日を取得（月曜日始まり）
export const getFirstDayOfMonth = (date) => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  return firstDay === 0 ? 6 : firstDay - 1;
};

// 特定の日付の目標ペース体重を計算
export const getTargetPaceWeight = (date, goals = initialGoals) => {
  // 期間外の日付は null を返す
  if (date < START_DATE || date > END_DATE) {
    return null;
  }
  
  const daysSinceStart = Math.floor((date - START_DATE) / (1000 * 60 * 60 * 24));
  const totalDays = Math.floor((END_DATE - START_DATE) / (1000 * 60 * 60 * 24));
  const totalWeightLoss = goals.startWeight - goals.targetWeight;
  
  // 線形に体重を減らす場合の目標体重
  const targetWeight = goals.startWeight - (totalWeightLoss * daysSinceStart / totalDays);
  return Math.round(targetWeight * 10) / 10; // 小数点1位まで
};

// ポイント計算（新システム用）
export const getPointsCount = (record) => {
  if (!record || !record.habits) return { points: 0, total: 3 };
  
  let points = 0;
  Object.keys(habitCategories).forEach(category => {
    if (record.habits[category] && record.habits[category].length > 0) {
      points++;
    }
  });
  
  return { points, total: 3 };
};

// カレンダーの日付配列を生成
export const generateCalendarDays = (currentDate) => {
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  // 前月の日付
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // 当月の日付
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return days;
};