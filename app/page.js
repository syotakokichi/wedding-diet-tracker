'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Target, Bike } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDocs, query, orderBy } from 'firebase/firestore';
import DailyRecordModal from './components/DailyRecordModal';
import { habitCategories, initialGoals, START_DATE, END_DATE } from './constants/habitCategories';
import { formatDate, generateCalendarDays, getTargetPaceWeight, getPointsCount } from './utils/helpers';

const DietTracker = () => {

  // State管理
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [records, setRecords] = useState({});
  const [goals] = useState(initialGoals);
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // データ読み込み
  const loadRecords = async () => {
    try {
      const recordsRef = collection(db, 'daily_records');
      const q = query(recordsRef, orderBy('date', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const recordsMap = {};
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // 新旧両方のデータ形式に対応
        if (data.habits) {
          // 新形式
          recordsMap[data.date] = {
            weight: data.weight,
            habits: data.habits,
            feelcycle: data.feelcycle,
            otherExercise: data.otherExercise,
            memo: data.memo
          };
        } else {
          // 旧形式を新形式に変換
          const habits = { breakfast: [], meal: [], lifestyle: [] };
          if (data.breakfastSoup) habits.breakfast.push('soup');
          if (data.breakfastProtein) habits.breakfast.push('protein');
          if (data.dinnerProtein) habits.meal.push('portion');
          if (data.dinnerSoup) habits.meal.push('noSnack');
          if (data.nightStretch) habits.lifestyle.push('sleep7h');
          if (data.nightReading) habits.lifestyle.push('lessPhone');
          
          recordsMap[data.date] = {
            weight: data.weight,
            habits: habits,
            feelcycle: data.feelcycle,
            otherExercise: data.otherExercise,
            memo: data.memo
          };
        }
      });

      setRecords(recordsMap);
    } catch (error) {
      console.error('Error loading records:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初回読み込み
  useEffect(() => {
    loadRecords();
  }, []);


  // 前日の体重を取得
  const getPreviousDayWeight = (dateStr) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() - 1);
    const prevDateStr = formatDate(date);
    return records[prevDateStr]?.weight || null;
  };


  // 日付セルのクラス名を取得
  const getDayCellClass = (day) => {
    if (!day) return '';
    
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = formatDate(date);
    const record = records[dateStr];

    let classes = 'p-1 sm:p-2 h-16 sm:h-24 border border-gray-200 cursor-pointer transition-all hover:bg-gray-50 relative';

    // 体重の前日比較で色付け
    if (record && record.weight) {
      const previousWeight = getPreviousDayWeight(dateStr);
      if (previousWeight) {
        const diff = parseFloat(record.weight) - parseFloat(previousWeight);
        if (diff < 0) {
          classes += ' bg-blue-50'; // 減った
        } else if (diff > 0) {
          classes += ' bg-red-50'; // 増えた
        } else {
          classes += ' bg-gray-50'; // 変化なし
        }
      }
    }

    if (dateStr === formatDate(selectedDate)) {
      classes += ' ring-2 ring-blue-500';
    }

    return classes;
  };

  // 日次記録を保存
  const saveDailyRecord = async (data) => {
    const dateStr = formatDate(selectedDate);
    
    try {
      const recordData = {
        date: dateStr,
        weight: data.weight ? parseFloat(data.weight) : null,
        habits: data.habits || { breakfast: [], meal: [], lifestyle: [] },
        feelcycle: data.feelcycle || false,
        otherExercise: data.otherExercise || '',
        memo: data.memo || '',
        updatedAt: new Date().toISOString()
      };

      // Firestoreに保存（ドキュメントIDは日付を使用）
      await setDoc(doc(db, 'daily_records', dateStr), recordData);

      // ローカル状態も更新
      setRecords(prev => ({
        ...prev,
        [dateStr]: data
      }));

      setShowDailyModal(false);
    } catch (error) {
      console.error('Error saving record:', error);
      alert('保存に失敗しました。もう一度お試しください。');
    }
  };


  // 進捗計算
  const calculateProgress = () => {
    const recordDates = Object.keys(records);
    if (recordDates.length === 0) return null;

    const weights = recordDates
      .map(date => records[date].weight)
      .filter(w => w)
      .sort((a, b) => new Date(a) - new Date(b));

    if (weights.length === 0) return null;

    const latestWeight = weights[weights.length - 1];
    const weightLost = goals.startWeight - latestWeight;
    const totalTarget = goals.startWeight - goals.targetWeight;
    const progressPercent = (weightLost / totalTarget) * 100;

    const today = new Date();
    const elapsed = Math.floor((today - START_DATE) / (1000 * 60 * 60 * 24));
    const total = Math.floor((END_DATE - START_DATE) / (1000 * 60 * 60 * 24));
    const daysRemaining = total - elapsed;

    return {
      latestWeight,
      weightLost,
      progressPercent: Math.min(100, Math.max(0, progressPercent)),
      daysRemaining,
      totalDays: total,
      elapsedDays: elapsed
    };
  };


  const progress = calculateProgress();

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 flex items-center justify-center h-screen">
        <div className="text-xl">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-2 sm:p-4">
      {/* タイトル */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full mb-3">
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          結婚式ダイエットトラッカー
        </h1>
        <p className="text-sm text-gray-600 mt-2">2025.12.11まで、理想の体型へ</p>
      </div>

      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
        <div>
          <p className="text-xs sm:text-sm opacity-80">目標</p>
          <p className="text-lg sm:text-xl font-bold">{goals.startWeight}kg → {goals.targetWeight}kg</p>
          <p className="text-xs sm:text-sm opacity-80">（-{goals.startWeight - goals.targetWeight}kg）</p>
        </div>
        
        {progress && (
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4 mt-3">
            <div>
              <p className="text-xs sm:text-sm opacity-80">現在の体重</p>
              <p className="text-lg sm:text-xl font-bold">{progress.latestWeight}kg</p>
              <p className="text-xs sm:text-sm opacity-80">（-{progress.weightLost.toFixed(1)}kg）</p>
            </div>
            
            <div>
              <p className="text-xs sm:text-sm opacity-80">残り日数</p>
              <p className="text-lg sm:text-xl font-bold">{progress.daysRemaining}日</p>
              <p className="text-xs sm:text-sm opacity-80">（{progress.elapsedDays}/{progress.totalDays}日経過）</p>
            </div>
          </div>
        )}
      </div>

      {/* カレンダーナビゲーション */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
          className="p-2 hover:bg-gray-100 rounded"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <h2 className="text-lg sm:text-xl font-bold">
          {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
        </h2>
        
        <button
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
          className="p-2 hover:bg-gray-100 rounded"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* カレンダー */}
      <div className="bg-white rounded-lg shadow-md p-2 sm:p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['月', '火', '水', '木', '金', '土', '日'].map(day => (
            <div key={day} className="text-center font-medium text-xs sm:text-sm p-1 sm:p-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {generateCalendarDays(currentDate).map((day, index) => (
            <div
              key={index}
              className={day ? getDayCellClass(day) : ''}
              onClick={() => {
                if (day) {
                  setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
                  setShowDailyModal(true);
                }
              }}
            >
              {day && (
                <>
                  <div className="font-medium text-xs sm:text-sm mb-0 sm:mb-1">{day}</div>
                  {(() => {
                    const currentDateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    const dateStr = formatDate(currentDateObj);
                    const record = records[dateStr];
                    const targetPaceWeight = getTargetPaceWeight(currentDateObj, goals);
                    
                    return (
                      <>
                        {record?.feelcycle && (
                          <div className="absolute top-1 right-1">
                            <Bike className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                          </div>
                        )}
                        <div className="text-xs space-y-0">
                          {record?.weight ? (
                            <>
                              <div className="text-blue-600 font-medium text-xs">
                                {record.weight}kg
                              </div>
                              {targetPaceWeight && (
                                <div className="text-gray-400 text-xs">
                                  (目標{targetPaceWeight})
                                </div>
                              )}
                            </>
                          ) : (
                            targetPaceWeight && (
                              <div className="text-gray-400 text-xs">
                                目標{targetPaceWeight}kg
                              </div>
                            )
                          )}
                          {(() => {
                            const pointsData = getPointsCount(record);
                            if (pointsData.points > 0) {
                              return (
                                <div className="text-xs text-gray-600">
                                  {pointsData.points}pt
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </>
                    );
                  })()}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 凡例 */}
      <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-3 sm:w-4 h-3 sm:h-4 bg-blue-50 border border-gray-300"></div>
          <span>体重減少</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-3 sm:w-4 h-3 sm:h-4 bg-red-50 border border-gray-300"></div>
          <span>体重増加</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-3 sm:w-4 h-3 sm:h-4 bg-gray-50 border border-gray-300"></div>
          <span>変化なし</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Bike className="w-3 sm:w-4 h-3 sm:h-4 text-green-600" />
          <span>feelcycle実施</span>
        </div>
      </div>

      {/* モーダル */}
      {showDailyModal && (
        <DailyRecordModal
          selectedDate={selectedDate}
          existingRecord={records[formatDate(selectedDate)] || {}}
          targetPaceWeight={getTargetPaceWeight(selectedDate, goals)}
          habitCategories={habitCategories}
          onSave={saveDailyRecord}
          onClose={() => setShowDailyModal(false)}
        />
      )}
    </div>
  );
};

export default function Home() {
  return <DietTracker />;
}