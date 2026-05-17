"use client";

import { useState, useEffect, useCallback } from "react";
import { SUBJECTS, SUBJECT_COLOR, timeAgo } from "@/lib/constants";
import * as Store from "@/lib/store";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

export default function Home() {
  // === 앱 상태 ===
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  const [isStarted, setIsStarted] = useState(false);
  const [currentSubject, setCurrentSubject] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [questions, setQuestions] = useState([]);
  const [notices, setNotices] = useState([]);

  // 모달 상태
  const [modal, setModal] = useState(null); // null | 'newQuestion' | 'newNotice' | 'questionDetail' | 'noticeDetail'
  const [selectedId, setSelectedId] = useState(null);

  // === 로그인 상태 리스너 ===
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  // === 데이터 로드 ===
  const loadData = useCallback(async () => {
    if (!user) return;
    const qList = await Store.getAll("questions");
    const nList = await Store.getAll("notices");
    setQuestions(qList);
    setNotices(nList);
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 구글 로그인 핸들러
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("로그인 에러:", error);
      alert("로그인 중 오류가 발생했습니다.");
    }
  };

  // === 필터링된 질문 목록 ===
  const filteredQuestions = questions.filter((q) => {
    if (currentSubject !== "전체" && q.subject !== currentSubject) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        q.title.toLowerCase().includes(query) ||
        q.content.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getSubjectCount = (subjectName) => {
    if (subjectName === "전체") return questions.length;
    return questions.filter((q) => q.subject === subjectName).length;
  };

  const closeModal = () => {
    setModal(null);
    setSelectedId(null);
  };

  // 로딩 화면
  if (authChecking) {
    return (
      <div className="login-page">
        <div style={{ color: "white", fontSize: "18px" }}>로딩 중...</div>
      </div>
    );
  }

  // 로그인 화면
  if (!user) {
    return (
      <div className="login-page">
        <div className="login-container">
          <h1 className="login-title">ClassBoard</h1>
          <p className="login-subtitle">우리 반 Q&A 공간에 오신 것을 환영합니다!</p>
          <button className="btn-google" onClick={handleLogin}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="24" />
            Google 계정으로 시작하기
          </button>
        </div>
      </div>
    );
  }

  // 대문(랜딩) 페이지 화면
  if (!isStarted) {
    return (
      <div className="landing-page">
        <div className="landing-image-container">
          <img src="/hero-image.png" alt="학생들이 원형으로 모여 공부하는 모습" className="landing-bg" />
          <div className="landing-content">
            <h1 className="landing-title">ClassBoard</h1>
            <p className="landing-subtitle">우리 반 Q&A 공간</p>
            <button className="btn-start" onClick={() => setIsStarted(true)}>
              입장하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">📚</span>
          <span className="logo-text">ClassBoard</span>
        </div>
        <div className="header-center">
          <div className="storage-badge firebase">
            <span className="badge-dot" style={{ background: "var(--success)" }}></span>
            <span className="badge-text">클라우드 연동됨</span>
          </div>
        </div>
        <div className="user-info">
          {user.photoURL ? (
            <img src={user.photoURL} alt="avatar" className="user-avatar" style={{ border: 'none', objectFit: 'cover' }} />
          ) : (
            <div className="user-avatar">👤</div>
          )}
          <span className="user-name">{user.displayName || "학생"}</span>
          <button className="btn-logout" onClick={() => signOut(auth)}>로그아웃</button>
        </div>
      </header>

      <main className="app-body">
        <aside className="sidebar sidebar-left">
          <h2 className="sidebar-title">📂 과목</h2>
          <nav className="subject-list">
            {SUBJECTS.map((s) => (
              <button
                key={s.name}
                className={`subject-item${currentSubject === s.name ? " active" : ""}`}
                onClick={() => setCurrentSubject(s.name)}
              >
                <span
                  className="subject-dot"
                  style={{ background: s.color }}
                ></span>
                <span>
                  {s.icon} {s.name}
                </span>
                <span className="subject-count">
                  {getSubjectCount(s.name)}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        <section className="main-content">
          <div className="content-header">
            <h1 className="content-title">💬 질문 게시판</h1>
            <button
              className="btn btn-primary"
              onClick={() => setModal("newQuestion")}
            >
              <span>✍️</span> 질문하기
            </button>
          </div>
          <div className="search-bar">
            <input
              type="text"
              className="search-input"
              placeholder="🔍 질문 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {filteredQuestions.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🤔</span>
              <p>아직 등록된 질문이 없어요</p>
              <p className="empty-sub">첫 번째 질문을 작성해 보세요!</p>
            </div>
          ) : (
            <div className="question-list">
              {filteredQuestions.map((q) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  onClick={() => {
                    setSelectedId(q.id);
                    setModal("questionDetail");
                  }}
                />
              ))}
            </div>
          )}
        </section>

        <aside className="sidebar sidebar-right">
          <div className="sidebar-header">
            <h2 className="sidebar-title">📌 공지사항</h2>
            <button
              className="btn btn-small"
              onClick={() => setModal("newNotice")}
            >
              + 등록
            </button>
          </div>
          <div className="notice-list">
            {notices.length === 0 ? (
              <div className="notice-empty">📌 등록된 공지가 없습니다</div>
            ) : (
              notices.map((n) => (
                <div
                  key={n.id}
                  className="notice-card"
                  onClick={() => {
                    setSelectedId(n.id);
                    setModal("noticeDetail");
                  }}
                >
                  <div className="notice-title">📌 {n.title}</div>
                  <div className="notice-meta">
                    {n.userName} · {timeAgo(n.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </main>

      {modal && (
        <ModalOverlay onClose={closeModal}>
          {modal === "newQuestion" && (
            <NewQuestionModal
              onClose={closeModal}
              onSubmit={loadData}
              user={user}
            />
          )}
          {modal === "newNotice" && (
            <NewNoticeModal
              onClose={closeModal}
              onSubmit={loadData}
              user={user}
            />
          )}
          {modal === "questionDetail" && selectedId && (
            <QuestionDetailModal
              questionId={selectedId}
              onClose={closeModal}
              onUpdate={loadData}
              user={user}
            />
          )}
          {modal === "noticeDetail" && selectedId && (
            <NoticeDetailModal
              noticeId={selectedId}
              onClose={closeModal}
            />
          )}
        </ModalOverlay>
      )}
    </div>
  );
}

function QuestionCard({ question, onClick }) {
  const q = question;
  const color = SUBJECT_COLOR[q.subject] || "#8899aa";

  return (
    <div className="question-card" onClick={onClick}>
      <div className="question-card-header">
        <span className="subject-badge" style={{ background: color }}>
          {q.subject}
        </span>
        <span className="question-author">👤 {q.userName}</span>
        <span className="question-time">{timeAgo(q.createdAt)}</span>
      </div>
      <div className="question-card-title">{q.title}</div>
      <div className="question-card-preview">{q.content}</div>
      <div className="question-card-footer">
        <span className="card-stat">
          <span>👍</span> {q.likeCount || 0}
        </span>
        <span className={`card-stat${q.bestAnswerId ? " has-best" : ""}`}>
          <span>💬</span> 답변 {q.answerCount || 0}
        </span>
        {q.bestAnswerId && (
          <span className="card-stat has-best">
            <span>✅</span> 채택됨
          </span>
        )}
      </div>
    </div>
  );
}

function ModalOverlay({ children, onClose }) {
  return (
    <div className="modal-overlay active" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="modal">{children}</div>
    </div>
  );
}

function NewQuestionModal({ onClose, onSubmit, user }) {
  const [subject, setSubject] = useState("국어");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해 주세요!");
      return;
    }
    setIsSubmitting(true);
    await Store.add("questions", {
      subject,
      title: title.trim(),
      content: content.trim(),
      userId: user.uid,
      userName: user.displayName || "학생",
      createdAt: Date.now(),
      likeCount: 0,
      likedBy: [],
      answerCount: 0,
      bestAnswerId: null,
    });
    onSubmit();
    onClose();
  };

  return (
    <>
      <div className="modal-header">
        <h3 className="modal-title">✍️ 새 질문 작성</h3>
        <button className="modal-close" onClick={onClose} disabled={isSubmitting}>✕</button>
      </div>
      <div className="modal-body">
        <div className="form-group">
          <label className="form-label">과목</label>
          <select
            className="form-select"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            {SUBJECTS.filter((s) => s.name !== "전체").map((s) => (
              <option key={s.name} value={s.name}>
                {s.icon} {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">제목</label>
          <input
            type="text"
            className="form-input"
            placeholder="질문 제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">내용</label>
          <textarea
            className="form-textarea"
            placeholder="궁금한 내용을 자세히 적어주세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={onClose} disabled={isSubmitting}>취소</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "등록 중..." : "질문 등록"}
          </button>
        </div>
      </div>
    </>
  );
}

function QuestionDetailModal({ questionId, onClose, onUpdate, user }) {
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [answerText, setAnswerText] = useState("");

  const loadDetail = useCallback(async () => {
    const q = await Store.getById("questions", questionId);
    setQuestion(q);
    if (q) {
      const allAnswers = await Store.getAll("answers");
      const filteredAnswers = allAnswers
        .filter((a) => a.questionId === questionId)
        .sort((a, b) => a.createdAt - b.createdAt);
      setAnswers(filteredAnswers);
    }
  }, [questionId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  if (!question) return <div className="modal-body">로딩 중...</div>;

  const color = SUBJECT_COLOR[question.subject] || "#8899aa";
  const isLiked = (question.likedBy || []).includes(user.uid);
  const isOwner = question.userId === user.uid;

  const handleLikeQuestion = async () => {
    const likedBy = [...(question.likedBy || [])];
    const idx = likedBy.indexOf(user.uid);
    if (idx === -1) likedBy.push(user.uid);
    else likedBy.splice(idx, 1);
    
    await Store.update("questions", questionId, {
      likedBy,
      likeCount: likedBy.length,
    });
    loadDetail();
    onUpdate();
  };

  const handleSubmitAnswer = async () => {
    if (!answerText.trim()) {
      alert("답변 내용을 입력해 주세요!");
      return;
    }
    await Store.add("answers", {
      questionId,
      content: answerText.trim(),
      userId: user.uid,
      userName: user.displayName || "학생",
      createdAt: Date.now(),
      likeCount: 0,
      likedBy: [],
    });
    await Store.update("questions", questionId, {
      answerCount: (question.answerCount || 0) + 1,
    });
    setAnswerText("");
    loadDetail();
    onUpdate();
  };

  const handleLikeAnswer = async (answerId) => {
    const answer = await Store.getById("answers", answerId);
    if (!answer) return;
    const likedBy = [...(answer.likedBy || [])];
    const idx = likedBy.indexOf(user.uid);
    if (idx === -1) likedBy.push(user.uid);
    else likedBy.splice(idx, 1);
    
    await Store.update("answers", answerId, {
      likedBy,
      likeCount: likedBy.length,
    });
    loadDetail();
  };

  const handleBestAnswer = async (answerId) => {
    await Store.update("questions", questionId, { bestAnswerId: answerId });
    loadDetail();
    onUpdate();
  };

  return (
    <>
      <div className="modal-header">
        <h3 className="modal-title">질문 상세</h3>
        <button className="modal-close" onClick={onClose}>✕</button>
      </div>
      <div className="modal-body">
        <span className="detail-subject" style={{ background: color }}>
          {question.subject}
        </span>
        <h2 className="detail-title">{question.title}</h2>
        <div className="detail-meta">
          <span>👤 {question.userName}</span>
          <span>·</span>
          <span>{timeAgo(question.createdAt)}</span>
        </div>
        <div className="detail-content">{question.content}</div>
        <div className="detail-actions">
          <button
            className={`btn-like${isLiked ? " liked" : ""}`}
            onClick={handleLikeQuestion}
          >
            👍 도움돼요 {question.likeCount || 0}
          </button>
        </div>

        <div className="answers-section">
          <h3 className="answers-title">💬 답변 {answers.length}개</h3>
          {answers.map((a) => {
            const isBest = question.bestAnswerId === a.id;
            const aLiked = (a.likedBy || []).includes(user.uid);
            return (
              <div
                key={a.id}
                className={`answer-item${isBest ? " best-answer" : ""}`}
              >
                <div className="answer-header">
                  <span className="answer-author">
                    👤 {a.userName}
                    {isBest && (
                      <span className="best-badge">✅ 베스트</span>
                    )}
                  </span>
                  <span className="answer-time">{timeAgo(a.createdAt)}</span>
                </div>
                <div className="answer-content">{a.content}</div>
                <div className="answer-actions">
                  <button
                    className={`btn-like${aLiked ? " liked" : ""}`}
                    onClick={() => handleLikeAnswer(a.id)}
                  >
                    👍 {a.likeCount || 0}
                  </button>
                  {isOwner && !question.bestAnswerId && (
                    <button
                      className="btn-best"
                      onClick={() => handleBestAnswer(a.id)}
                    >
                      🏆 채택
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          <div className="answer-form">
            <textarea
              placeholder="답변을 작성해 주세요..."
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
            />
            <div className="answer-form-actions">
              <button className="btn btn-primary" onClick={handleSubmitAnswer}>
                답변 등록
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function NewNoticeModal({ onClose, onSubmit, user }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해 주세요!");
      return;
    }
    setIsSubmitting(true);
    await Store.add("notices", {
      title: title.trim(),
      content: content.trim(),
      userId: user.uid,
      userName: user.displayName || "선생님",
      createdAt: Date.now(),
    });
    onSubmit();
    onClose();
  };

  return (
    <>
      <div className="modal-header">
        <h3 className="modal-title">📌 공지사항 등록</h3>
        <button className="modal-close" onClick={onClose} disabled={isSubmitting}>✕</button>
      </div>
      <div className="modal-body">
        <div className="form-group">
          <label className="form-label">제목</label>
          <input
            type="text"
            className="form-input"
            placeholder="공지 제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">내용</label>
          <textarea
            className="form-textarea"
            placeholder="공지 내용을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={onClose} disabled={isSubmitting}>취소</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "등록 중..." : "등록"}
          </button>
        </div>
      </div>
    </>
  );
}

function NoticeDetailModal({ noticeId, onClose }) {
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await Store.getById("notices", noticeId);
      setNotice(data);
    }
    load();
  }, [noticeId]);

  if (!notice) return <div className="modal-body">로딩 중...</div>;

  return (
    <>
      <div className="modal-header">
        <h3 className="modal-title">📌 공지사항</h3>
        <button className="modal-close" onClick={onClose}>✕</button>
      </div>
      <div className="modal-body">
        <h2 className="notice-detail-title">{notice.title}</h2>
        <div className="notice-detail-meta">
          👤 {notice.userName} · {timeAgo(notice.createdAt)}
        </div>
        <div className="notice-detail-content">{notice.content}</div>
      </div>
    </>
  );
}
