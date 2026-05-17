/* ============================================
   과목 & 유저 설정
   ============================================ */

// 과목 목록 (아이콘, 이름, 색상)
export const SUBJECTS = [
  { name: '전체', color: '#8899aa', icon: '📋' },
  { name: '국어', color: '#ff6b8a', icon: '📖' },
  { name: '수학', color: '#5b9bff', icon: '🔢' },
  { name: '영어', color: '#ffb347', icon: '🔤' },
  { name: '과학', color: '#43d9ad', icon: '🔬' },
  { name: '사회', color: '#c47cff', icon: '🌍' },
  { name: '정보', color: '#5bc9ff', icon: '💻' },
];

// 과목 이름 → 색상 맵
export const SUBJECT_COLOR = {};
SUBJECTS.forEach(s => { SUBJECT_COLOR[s.name] = s.color; });

// 테스트 유저 (나중에 실제 인증으로 교체)
export const currentUser = {
  id: 'user_01',
  name: '테스트 유저',
  role: 'student',
};

// 시간 표시 (예: "3분 전")
export function timeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);

  if (sec < 60) return '방금 전';
  if (min < 60) return min + '분 전';
  if (hr < 24) return hr + '시간 전';
  if (day < 7) return day + '일 전';
  const d = new Date(timestamp);
  return (d.getMonth() + 1) + '/' + d.getDate();
}
