'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Target, Calendar, Check, Minus, Bike } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDocs, query, orderBy } from 'firebase/firestore';

const DietTracker = () => {
  // 開始日と終了日の設定
  const START_DATE = new Date('2025-05-26');
  const END_DATE = new Date('2025-12-11');
  
  // 初期目標データ
  const initialGoals = {
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

  // State管理
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [records, setRecords] = useState({});
  const [goals, setGoals] = useState(initialGoals);
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
        recordsMap[data.date] = {
          weight: data.weight,
          sleep: data.sleep,
          breakfastSoup: data.breakfastSoup,
          breakfastProtein: data.breakfastProtein,
          dinnerProtein: data.dinnerProtein,
          dinnerSoup: data.dinnerSoup,
          nightStretch: data.nightStretch,
          nightReading: data.nightReading,
          feelcycle: data.feelcycle,
          otherExercise: data.otherExercise,
          memo: data.memo
        };
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

  // 日付のフォーマット
  const formatDate = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // 月の日数を取得
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // 月の最初の曜日を取得（月曜日始まり）
  const getFirstDayOfMonth = (date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  // カレンダーの日付配列を生成
  const generateCalendarDays = () => {
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

  // 前日の体重を取得
  const getPreviousDayWeight = (dateStr) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() - 1);
    const prevDateStr = formatDate(date);
    return records[prevDateStr]?.weight || null;
  };

  // チェック項目の達成数を計算
  const getCheckCount = (record) => {
    if (!record) return { completed: 0, total: 6 };
    
    let completed = 0;
    const checkItems = ['breakfastSoup', 'breakfastProtein', 'dinnerProtein', 'dinnerSoup', 'nightStretch', 'nightReading'];
    
    checkItems.forEach(item => {
      if (record[item] === true) completed++;
    });
    
    return { completed, total: 6 };
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
        sleep: data.sleep ? parseFloat(data.sleep) : null,
        breakfastSoup: data.breakfastSoup || false,
        breakfastProtein: data.breakfastProtein || false,
        dinnerProtein: data.dinnerProtein || false,
        dinnerSoup: data.dinnerSoup || false,
        nightStretch: data.nightStretch || false,
        nightReading: data.nightReading || false,
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

  const DailyRecordModal = () => {
    const dateStr = formatDate(selectedDate);
    const existingRecord = records[dateStr] || {};
    
    const [formData, setFormData] = useState({
      weight: existingRecord.weight || '',
      sleep: existingRecord.sleep || '',
      breakfastSoup: existingRecord.breakfastSoup || null,
      breakfastProtein: existingRecord.breakfastProtein || null,
      dinnerProtein: existingRecord.dinnerProtein || null,
      dinnerSoup: existingRecord.dinnerSoup || null,
      nightStretch: existingRecord.nightStretch || null,
      nightReading: existingRecord.nightReading || null,
      feelcycle: existingRecord.feelcycle || false,
      otherExercise: existingRecord.otherExercise || '',
      memo: existingRecord.memo || ''
    });

    const toggleCheck = (field) => {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field] === true ? null : true
      }));
    };

    const getCheckIcon = (value) => {
      if (value === true) return <Check className="w-5 h-5 text-green-600" />;
      return <Minus className="w-5 h-5 text-gray-400" />;
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
        <div className="min-h-screen px-4 py-4 flex items-start justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full my-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 rounded-t-lg">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {selectedDate.toLocaleDateString('ja-JP')}の記録
              </h3>
            </div>
            <div className="p-4">

            <div className="space-y-4">
              {/* 基本項目 */}
              <div>
                <label className="block text-sm font-medium mb-1">体重 (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md text-base"
                  placeholder="82.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">睡眠時間 (時間)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.sleep}
                  onChange={(e) => setFormData({...formData, sleep: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md text-base"
                  placeholder="7.5"
                />
              </div>

              {/* 朝食改善 */}
              <div>
                <h4 className="font-medium mb-2">朝食改善</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => toggleCheck('breakfastSoup')}
                    className="flex items-center justify-between w-full p-3 border rounded hover:bg-gray-50"
                  >
                    <span>スープ</span>
                    {getCheckIcon(formData.breakfastSoup)}
                  </button>
                  <button
                    onClick={() => toggleCheck('breakfastProtein')}
                    className="flex items-center justify-between w-full p-3 border rounded hover:bg-gray-50"
                  >
                    <span>卵orヨーグルト</span>
                    {getCheckIcon(formData.breakfastProtein)}
                  </button>
                </div>
              </div>

              {/* 夕食改善 */}
              <div>
                <h4 className="font-medium mb-2">夕食改善</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => toggleCheck('dinnerProtein')}
                    className="flex items-center justify-between w-full p-3 border rounded hover:bg-gray-50"
                  >
                    <span>タンパク質強化</span>
                    {getCheckIcon(formData.dinnerProtein)}
                  </button>
                  <button
                    onClick={() => toggleCheck('dinnerSoup')}
                    className="flex items-center justify-between w-full p-3 border rounded hover:bg-gray-50"
                  >
                    <span>スープ追加</span>
                    {getCheckIcon(formData.dinnerSoup)}
                  </button>
                </div>
              </div>

              {/* 夜習慣 */}
              <div>
                <h4 className="font-medium mb-2">夜習慣</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => toggleCheck('nightStretch')}
                    className="flex items-center justify-between w-full p-3 border rounded hover:bg-gray-50"
                  >
                    <span>ストレッチ</span>
                    {getCheckIcon(formData.nightStretch)}
                  </button>
                  <button
                    onClick={() => toggleCheck('nightReading')}
                    className="flex items-center justify-between w-full p-3 border rounded hover:bg-gray-50"
                  >
                    <span>読書</span>
                    {getCheckIcon(formData.nightReading)}
                  </button>
                </div>
              </div>

              {/* 運動 */}
              <div>
                <h4 className="font-medium mb-2">運動</h4>
                <label className="flex items-center gap-2 p-2">
                  <input
                    type="checkbox"
                    checked={formData.feelcycle}
                    onChange={(e) => setFormData({...formData, feelcycle: e.target.checked})}
                    className="w-5 h-5"
                  />
                  <span>feelcycle</span>
                </label>
                <input
                  type="text"
                  value={formData.otherExercise}
                  onChange={(e) => setFormData({...formData, otherExercise: e.target.value})}
                  className="w-full mt-2 px-3 py-2 border rounded-md text-base"
                  placeholder="その他の運動（散歩、階段など）"
                />
              </div>

              {/* メモ */}
              <div>
                <label className="block text-sm font-medium mb-1">メモ</label>
                <textarea
                  value={formData.memo}
                  onChange={(e) => setFormData({...formData, memo: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md text-base"
                  rows="3"
                  placeholder="夜食：我慢できた！"
                />
              </div>
            </div>

            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 rounded-b-lg">
              <div className="flex gap-2">
                <button
                  onClick={() => saveDailyRecord(formData)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  保存
                </button>
                <button
                  onClick={() => setShowDailyModal(false)}
                  className="flex-1 bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
          <Target className="w-5 sm:w-6 h-5 sm:h-6" />
          結婚式ダイエットトラッカー
        </h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <p className="text-xs sm:text-sm opacity-80">目標</p>
            <p className="text-lg sm:text-xl font-bold">{goals.startWeight}kg → {goals.targetWeight}kg</p>
            <p className="text-xs sm:text-sm opacity-80">（-{goals.startWeight - goals.targetWeight}kg）</p>
          </div>
          
          {progress && (
            <>
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
            </>
          )}
        </div>

        {progress && (
          <div className="mt-4">
            <div className="flex justify-between text-xs sm:text-sm mb-1">
              <span>進捗</span>
              <span>{progress.progressPercent.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all"
                style={{ width: `${progress.progressPercent}%` }}
              />
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
          {generateCalendarDays().map((day, index) => (
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
                  {records[formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))] && (
                    <>
                      {records[formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))].feelcycle && (
                        <div className="absolute top-1 right-1">
                          <Bike className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                        </div>
                      )}
                      <div className="text-xs space-y-1">
                        {records[formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))].weight && (
                          <div className="text-blue-600 font-medium text-xs">
                            {records[formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))].weight}kg
                          </div>
                        )}
                        {(() => {
                          const checkData = getCheckCount(records[formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))]);
                          if (checkData.completed > 0) {
                            return (
                              <div className="text-xs text-gray-600">
                                {checkData.completed}/{checkData.total}
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </>
                  )}
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
      {showDailyModal && <DailyRecordModal />}
    </div>
  );
};

export default function Home() {
  return <DietTracker />;
}