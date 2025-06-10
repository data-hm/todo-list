document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const list = document.getElementById('todo-list');
  const priorityInput = document.getElementById('priority-input');
  const dateInput = document.getElementById('date-input');
  const counts = document.getElementById('todo-counts');
  const doneList = document.getElementById('done-list');

  let todos = [];
  let dones = [];

  function updateCounts() {
    const remain = todos.length;
    const done = dones.length;
    counts.textContent = `남은 할 일: ${remain} | 완료: ${done}`;
  }

  // 급한 순 정렬: D-day(가까운 순), 같으면 중요도(높음>보통>낮음)
  function sortTodos() {
    todos.sort((a, b) => {
      const getDday = t => {
        const today = new Date();
        const due = new Date(t.date);
        return Math.ceil((due - today) / (1000*60*60*24));
      };
      const dA = getDday(a);
      const dB = getDday(b);
      if (dA !== dB) return dA - dB;
      const pOrder = { '높음': 0, '보통': 1, '낮음': 2 };
      return pOrder[a.priority] - pOrder[b.priority];
    });
  }

  function renderTodos() {
    sortTodos();
    list.innerHTML = '';
    todos.forEach((todo, idx) => {
      const li = document.createElement('li');
      li.className = 'todo-item';

      const span = document.createElement('span');
      span.className = 'todo-text';
      span.textContent = todo.text;

      // 우선순위 표시
      const priority = document.createElement('span');
      priority.className = 'todo-priority-label';
      if (todo.priority === '높음') priority.classList.add('high');
      else if (todo.priority === '낮음') priority.classList.add('low');
      else priority.classList.add('medium');
      priority.textContent = todo.priority;
      priority.style.fontSize = '0.92em';
      priority.style.padding = '0.1rem 0.7rem';

      // 마감일 D-day만 표시
      const date = document.createElement('span');
      date.className = 'todo-date-label';
      if (todo.date) {
        const today = new Date();
        const due = new Date(todo.date);
        const diff = Math.ceil((due - today) / (1000*60*60*24));
        let dText = '';
        if (!isNaN(diff)) {
          if (diff > 0) dText = `D-${diff}`;
          else if (diff === 0) dText = '오늘';
          else dText = '지남';
        }
        date.textContent = dText;
        date.style.marginLeft = '0.5rem';
        date.style.fontSize = '1.13em';
        date.style.padding = '0.18rem 1.2rem';
        date.style.fontWeight = 'bold';
      }

      const btns = document.createElement('div');
      btns.className = 'todo-btns';

      // 완료 버튼: 누르면 완료리스트로 이동
      const doneBtn = document.createElement('button');
      doneBtn.className = 'todo-done-btn';
      doneBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="9" stroke="#059669" stroke-width="2" fill="white"/><path d="M6 10.5L9 13L14 7" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      doneBtn.title = '완료';
      doneBtn.onclick = () => {
        // 완료리스트로 이동 (완료일 추가)
        dones.push({ ...todo, completedAt: new Date() });
        todos.splice(idx, 1);
        renderTodos();
        renderDones();
        updateCounts();
      };

      // 삭제 버튼: 누르면 확인 후 삭제
      const delBtn = document.createElement('button');
      delBtn.className = 'todo-del-btn';
      delBtn.textContent = '✖';
      delBtn.title = '삭제';
      delBtn.onclick = () => {
        if (confirm('정말 이 할 일을 삭제하시겠습니까?')) {
          todos.splice(idx, 1);
          renderTodos();
          updateCounts();
        }
      };

      btns.appendChild(doneBtn);
      btns.appendChild(delBtn);
      li.appendChild(span);
      li.appendChild(priority);
      if (todo.date) li.appendChild(date);
      li.appendChild(btns);
      list.appendChild(li);
    });
    updateCounts();
  }

  function renderDones() {
    doneList.innerHTML = '';
    dones.forEach((todo) => {
      const li = document.createElement('li');
      li.className = 'todo-item';
      const span = document.createElement('span');
      span.className = 'todo-text done';
      span.textContent = todo.text;
      // 우선순위
      const priority = document.createElement('span');
      priority.className = 'todo-priority-label';
      if (todo.priority === '높음') priority.classList.add('high');
      else if (todo.priority === '낮음') priority.classList.add('low');
      else priority.classList.add('medium');
      priority.textContent = todo.priority;
      priority.style.fontSize = '0.92em';
      priority.style.padding = '0.1rem 0.7rem';
      // 완료일 표시
      const date = document.createElement('span');
      date.className = 'todo-date-label';
      if (todo.completedAt) {
        const d = todo.completedAt;
        const y = String(d.getFullYear()).slice(2);
        const m = String(d.getMonth()+1).padStart(2,'0');
        const day = String(d.getDate()).padStart(2,'0');
        date.textContent = `완료: ${y}-${m}-${day}`;
        date.style.marginLeft = '0.5rem';
        date.style.fontSize = '1.13em';
        date.style.padding = '0.18rem 1.2rem';
        date.style.fontWeight = 'bold';
      }
      li.appendChild(span);
      li.appendChild(priority);
      if (todo.completedAt) li.appendChild(date);
      doneList.appendChild(li);
    });
  }

  // 전체 삭제 버튼 생성 및 이벤트 (할일 목록에서만)
  if (!document.getElementById('clear-all-btn')) {
    const clearBtn = document.createElement('button');
    clearBtn.id = 'clear-all-btn';
    clearBtn.textContent = '전체 삭제';
    clearBtn.className = 'todo-add-btn';
    clearBtn.style.margin = '0.1rem 0 0.7rem 0';
    clearBtn.style.width = '100%';
    clearBtn.onclick = () => {
      if (todos.length === 0) return;
      if (confirm('정말 모든 할 일을 삭제하시겠습니까?')) {
        todos = [];
        renderTodos();
        updateCounts();
      }
    };
    form.parentNode.insertBefore(clearBtn, form.nextSibling);
  }

  form.onsubmit = (e) => {
    e.preventDefault();
    const value = input.value.trim();
    const priority = priorityInput.value;
    const date = dateInput.value;
    if (!value || !date) {
      alert('할 일 내용과 날짜를 모두 입력해 주세요.');
      return;
    }
    todos.push({ text: value, done: false, priority, date });
    renderTodos();
    input.value = '';
    dateInput.value = '';
    priorityInput.value = '보통';
    input.focus();
  };

  renderTodos();
  renderDones();
});
