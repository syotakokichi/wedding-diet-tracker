'use client';

import React, { useState } from 'react';
import { Calendar, Check, Minus, Bike } from 'lucide-react';

export default function DailyRecordModal({ 
  selectedDate, 
  existingRecord, 
  targetPaceWeight,
  habitCategories,
  onSave,
  onClose 
}) {
  const [formData, setFormData] = useState({
    weight: existingRecord.weight || '',
    habits: existingRecord.habits || {
      breakfast: [],
      meal: [],
      lifestyle: []
    },
    feelcycle: existingRecord.feelcycle || false,
    otherExercise: existingRecord.otherExercise || '',
    memo: existingRecord.memo || ''
  });

  const toggleHabit = (category, habitId) => {
    setFormData(prev => {
      const currentHabits = prev.habits[category] || [];
      const newHabits = currentHabits.includes(habitId)
        ? currentHabits.filter(id => id !== habitId)
        : [...currentHabits, habitId];
      
      return {
        ...prev,
        habits: {
          ...prev.habits,
          [category]: newHabits
        }
      };
    });
  };

  const getCheckIcon = (isChecked) => {
    if (isChecked) return <Check className="w-5 h-5 text-green-600" />;
    return <Minus className="w-5 h-5 text-gray-400" />;
  };

  // カテゴリーごとの達成ポイントを計算
  const getCategoryPoints = () => {
    let points = 0;
    Object.keys(habitCategories).forEach(category => {
      if (formData.habits[category] && formData.habits[category].length > 0) {
        points++;
      }
    });
    return points;
  };

  // 励ましメッセージを取得
  const getMotivationalMessage = () => {
    const points = getCategoryPoints();
    const hasWeight = formData.weight && targetPaceWeight;
    const isOnPace = hasWeight && parseFloat(formData.weight) <= targetPaceWeight;
    
    if (points === 3 && formData.feelcycle) {
      return "🎉 パーフェクト！この調子で明日も頑張りましょう！";
    } else if (points === 3) {
      return "✨ 素晴らしい！全カテゴリー達成です！";
    } else if (points === 2) {
      return "👍 いい感じ！あと1カテゴリーで完璧です！";
    } else if (points === 1) {
      return "💪 良いスタート！もう少し頑張ってみましょう！";
    } else if (isOnPace) {
      return "📊 体重は順調！習慣も意識してみましょう！";
    } else {
      return "🌟 今日も一歩ずつ。小さな習慣から始めましょう！";
    }
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
          
          {/* 達成状況サマリー */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              <div className="flex justify-between items-center">
                <span>今日の達成ポイント</span>
                <span className="font-medium text-lg">
                  {getCategoryPoints()} / 3 ポイント
                </span>
              </div>
              <div className="mt-2 text-xs">
                {Object.entries(habitCategories).map(([category, data]) => (
                  <div key={category} className="flex justify-between items-center mt-1">
                    <span>{data.name}</span>
                    <span className={formData.habits[category]?.length > 0 ? 'text-green-600' : 'text-gray-400'}>
                      {formData.habits[category]?.length > 0 ? '✓ 達成' : '未達成'}
                    </span>
                  </div>
                ))}
              </div>
              {formData.feelcycle && (
                <div className="mt-2 text-green-600">
                  <Bike className="inline w-4 h-4 mr-1" />
                  feelcycle実施済み
                </div>
              )}
              <div className="mt-3 pt-3 border-t text-center text-sm font-medium">
                {getMotivationalMessage()}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* 基本項目 */}
            <div>
              <label className="block text-sm font-medium mb-1">
                体重 (kg)
                {targetPaceWeight && (
                  <span className="ml-2 text-gray-500 font-normal">
                    目標ペース: {targetPaceWeight}kg
                  </span>
                )}
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                className="w-full px-3 py-2 border rounded-md text-base"
                placeholder="82.0"
              />
              {formData.weight && targetPaceWeight && (
                <div className={`mt-1 text-sm ${
                  parseFloat(formData.weight) <= targetPaceWeight ? 'text-green-600' : 'text-red-600'
                }`}>
                  {parseFloat(formData.weight) <= targetPaceWeight 
                    ? `✓ 目標ペースを達成しています (${(targetPaceWeight - parseFloat(formData.weight)).toFixed(1)}kg余裕)`
                    : `目標ペースより ${(parseFloat(formData.weight) - targetPaceWeight).toFixed(1)}kg 超過`
                  }
                </div>
              )}
            </div>


            {/* カテゴリー別習慣 */}
            {Object.entries(habitCategories).map(([category, data]) => (
              <div key={category}>
                <h4 className="font-medium mb-2">
                  {data.name}
                  <span className="text-sm text-gray-500 ml-2">
                    ({formData.habits[category]?.length || 0}個選択中)
                  </span>
                </h4>
                <div className="space-y-2">
                  {data.habits.map(habit => (
                    <button
                      key={habit.id}
                      onClick={() => toggleHabit(category, habit.id)}
                      className="flex items-center justify-between w-full p-3 border rounded hover:bg-gray-50 text-left"
                    >
                      <span className="text-sm">{habit.label}</span>
                      {getCheckIcon(formData.habits[category]?.includes(habit.id))}
                    </button>
                  ))}
                </div>
              </div>
            ))}

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
                onClick={() => onSave(formData)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                保存
              </button>
              <button
                onClick={onClose}
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
}