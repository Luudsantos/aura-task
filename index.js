// ===== CONFIGURAÇÃO DO SUPABASE =====
const SUPABASE_URL = 'https://jmddfsvfrwjxshkxzbun.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZGRmc3ZmcndqeHNoa3h6YnVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MzgyNjksImV4cCI6MjA4NDUxNDI2OX0.Aukxmn4O20Q6NQpF7QzAYRM4H2Whk4nCGNPNweA7VzM';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
    const toastContainer = document.querySelector('#toastContainer');

    // ===== FUNÇÃO TOAST =====
    function showToast(message, type = 'info') {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ===== SELETORES =====
    const loginScreen = document.querySelector('#loginScreen');
    const appWrapper = document.querySelector('#appWrapper');
    const loginBtn = document.querySelector('#loginBtn');
    const loginUser = document.querySelector('#loginUser');
    const loginPass = document.querySelector('#loginPass');
    const loginError = document.querySelector('#loginError');
    const logoutBtn = document.querySelector('#logoutBtn');
    const toggleLogin = document.querySelector('#toggleLogin');
    const loginTitle = document.querySelector('#loginTitle');
    const loginSubtitle = document.querySelector('#loginSubtitle');
    const switchText = document.querySelector('#switchText');
    
    let isLoginMode = true;
    let currentUser = null;
    let currentView = 'today';
    let currentFilter = 'all';
    let tasks = [];

    // ===== TOGGLE LOGIN/CADASTRO =====
    if (toggleLogin) {
        toggleLogin.onclick = (e) => {
            e.preventDefault();
            isLoginMode = !isLoginMode;
            if (loginError) loginError.textContent = '';
            
            if (isLoginMode) {
                loginTitle.textContent = 'Faça login';
                loginSubtitle.textContent = 'Organize suas tarefas de forma simples e eficaz.';
                loginBtn.textContent = 'Entrar';
                switchText.textContent = 'Não tem uma conta?';
                toggleLogin.textContent = 'Cadastre-se';
            } else {
                loginTitle.textContent = 'Criar conta';
                loginSubtitle.textContent = 'Comece a organizar sua rotina hoje mesmo.';
                loginBtn.textContent = 'Criar conta';
                switchText.textContent = 'Já tem uma conta?';
                toggleLogin.textContent = 'Fazer login';
            }
        };
    }

    // ===== VERIFICAR SESSÃO =====
    async function checkSession() {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
            currentUser = session.user;
            updateUserDisplay();
            loginScreen.style.display = 'none';
            appWrapper.style.display = 'flex';
            await loadTasks();
        } else {
            loginScreen.style.display = 'flex';
            appWrapper.style.display = 'none';
        }
    }

    function updateUserDisplay() {
        const userDisplayName = document.querySelector('#userDisplayName');
        const userAvatar = document.querySelector('.user-avatar');
        
        if (currentUser) {
            const email = currentUser.email;
            const name = email.split('@')[0];
            
            if (userDisplayName) userDisplayName.textContent = name;
            if (userAvatar) userAvatar.textContent = name.charAt(0).toUpperCase();
        }
    }

    // ===== LOGIN/CADASTRO =====
    if (loginBtn) {
        loginBtn.onclick = async () => {
            const email = loginUser.value.trim();
            const password = loginPass.value.trim();
            
            if (!email || !password) {
                if (loginError) loginError.textContent = 'Preencha todos os campos';
                return;
            }

            if (!isLoginMode) {
                // CADASTRO
                if (password.length < 6) {
                    if (loginError) loginError.textContent = 'Senha deve ter no mínimo 6 caracteres';
                    return;
                }

                const { data, error } = await supabase.auth.signUp({
                    email: email,
                    password: password,
                });

                if (error) {
                    if (loginError) loginError.textContent = error.message;
                    return;
                }

                showToast('Conta criada! Verifique seu email para confirmar.', 'success');
                isLoginMode = true;
                toggleLogin.click();
                loginUser.value = '';
                loginPass.value = '';
            } else {
                // LOGIN
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password,
                });

                if (error) {
                    if (loginError) loginError.textContent = 'Email ou senha inválidos';
                    return;
                }

                currentUser = data.user;
                showToast('Bem-vindo ao Aura Task!', 'success');
                await checkSession();
            }
        };
    }

    // ===== LOGOUT =====
    if (logoutBtn) {
        logoutBtn.onclick = async () => {
            await supabase.auth.signOut();
            currentUser = null;
            tasks = [];
            location.reload();
        };
    }

    // ===== CARREGAR TAREFAS =====
    async function loadTasks() {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao carregar tarefas:', error);
            showToast('Erro ao carregar tarefas', 'error');
            return;
        }

        tasks = data || [];
        render();
    }

    // ===== ADICIONAR TAREFA =====
    const taskInput = document.querySelector('#taskInput');
    const prioritySelect = document.querySelector('#prioritySelect');
    const categoryInput = document.querySelector('#categoryInput');
    const dateInput = document.querySelector('#dateInput');
    const addBtn = document.querySelector('#addBtn');
    const addTaskSidebarBtn = document.querySelector('#addTaskSidebarBtn');

    if (addBtn) {
        addBtn.onclick = async () => {
            const text = taskInput.value.trim();
            if (!text) {
                showToast('Digite o nome da tarefa!', 'error');
                return;
            }

            const taskDate = (currentView === 'nodate') ? null : (dateInput.value || null);

            const { data, error } = await supabase
                .from('tasks')
                .insert([{
                    text: text,
                    completed: false,
                    priority: parseInt(prioritySelect.value),
                    category: categoryInput.value.trim() || null,
                    due_date: taskDate,
                    user_id: currentUser.id
                }])
                .select();

            if (error) {
                console.error('Erro ao adicionar tarefa:', error);
                showToast('Erro ao adicionar tarefa', 'error');
                return;
            }

            taskInput.value = '';
            categoryInput.value = '';
            dateInput.value = '';
            showToast('Tarefa adicionada!', 'success');
            await loadTasks();
        };
    }

    if (taskInput) {
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addBtn.click();
        });
    }

    if (addTaskSidebarBtn) {
        addTaskSidebarBtn.addEventListener('click', () => taskInput.focus());
    }

    // ===== TOGGLE TAREFA =====
    async function toggleTask(id) {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const { error } = await supabase
            .from('tasks')
            .update({ completed: !task.completed })
            .eq('id', id);

        if (error) {
            console.error('Erro ao atualizar tarefa:', error);
            showToast('Erro ao atualizar tarefa', 'error');
            return;
        }

        showToast(task.completed ? 'Tarefa reaberta' : 'Tarefa concluída! 🎉', 'success');
        await loadTasks();
    }

    // ===== DELETAR TAREFA =====
    async function deleteTask(id) {
        if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;

        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Erro ao deletar tarefa:', error);
            showToast('Erro ao deletar tarefa', 'error');
            return;
        }

        showToast('Tarefa removida', 'info');
        await loadTasks();
    }

    // ===== EDITAR TAREFA =====
    function openEditModal(id) {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        document.querySelector('#editTaskId').value = task.id;
        document.querySelector('#editTaskText').value = task.text;
        document.querySelector('#editTaskDate').value = task.due_date || '';
        document.querySelector('#editTaskCategory').value = task.category || '';
        document.querySelector('#editTaskPriority').value = task.priority;

        document.querySelector('#editModal').style.display = 'flex';
    }

    window.closeEditModal = function() {
        document.querySelector('#editModal').style.display = 'none';
    };

    window.saveEditModal = async function() {
        const id = document.querySelector('#editTaskId').value;
        const text = document.querySelector('#editTaskText').value.trim();

        if (!text) {
            showToast('O nome não pode estar vazio!', 'error');
            return;
        }

        const { error } = await supabase
            .from('tasks')
            .update({
                text: text,
                due_date: document.querySelector('#editTaskDate').value || null,
                category: document.querySelector('#editTaskCategory').value.trim() || null,
                priority: parseInt(document.querySelector('#editTaskPriority').value)
            })
            .eq('id', id);

        if (error) {
            console.error('Erro ao editar tarefa:', error);
            showToast('Erro ao editar tarefa', 'error');
            return;
        }

        window.closeEditModal();
        showToast('Tarefa atualizada!', 'success');
        await loadTasks();
    };

    // ===== NAVEGAÇÃO SIDEBAR =====
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const view = item.dataset.view;
            const project = item.dataset.project;

            if (view) {
                currentView = view;
                currentFilter = 'all';
                updatePageTitle(view);

                if (dateInput) {
                    dateInput.style.display = view === 'nodate' ? 'none' : 'block';
                    if (view === 'nodate') dateInput.value = '';
                }

                render();
            } else if (project) {
                currentView = 'project';
                currentFilter = project;
                updatePageTitle('project', project);
                if (dateInput) dateInput.style.display = 'block';
                render();
            }
        });
    });

    function updatePageTitle(view, projectName = null) {
        const titles = {
            'today': 'Hoje',
            'inbox': 'Entrada',
            'nodate': 'Sem data',
            'completed': 'Concluído',
            'project': projectName || 'Projeto'
        };

        const pageTitle = document.querySelector('#pageTitle');
        if (pageTitle) pageTitle.textContent = titles[view] || 'Hoje';
    }

    // ===== RENDERIZAÇÃO =====
    function render() {
        const list = document.querySelector('#list');
        const searchInput = document.querySelector('#search');
        const sortSelect = document.querySelector('#sortSelect');
        const taskCountText = document.querySelector('#taskCountText');

        const q = searchInput ? searchInput.value.toLowerCase() : '';

        let filteredTasks = tasks.filter(t => {
            if (currentView === 'today') {
                if (t.completed) return false;
                if (!t.due_date) return false;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const taskDate = new Date(t.due_date);
                taskDate.setHours(0, 0, 0, 0);
                return taskDate.getTime() === today.getTime();
            }

            if (currentView === 'nodate') {
                return !t.completed && !t.due_date;
            }

            if (currentView === 'completed') {
                return t.completed;
            }

            if (currentView === 'project') {
                return t.category === currentFilter;
            }

            return true;
        });

        if (q) {
            filteredTasks = filteredTasks.filter(t => t.text.toLowerCase().includes(q));
        }

        const sortMode = sortSelect ? sortSelect.value : 'created_desc';
        filteredTasks.sort((a, b) => {
            if (sortMode === 'created_desc') return new Date(b.created_at) - new Date(a.created_at);
            if (sortMode === 'priority_desc') return b.priority - a.priority;
            return 0;
        });

        list.innerHTML = '';

        if (taskCountText) {
            const count = filteredTasks.length;
            taskCountText.textContent = `${count} ${count === 1 ? 'tarefa' : 'tarefas'}`;
        }

        if (filteredTasks.length === 0) {
            list.innerHTML = `<div class="empty-state"><p>Nenhuma tarefa encontrada 😊</p></div>`;
            updateProjects();
            updateTodayCount();
            updateLateBadge();
            return;
        }

        filteredTasks.forEach(t => {
            const item = document.createElement('div');
            item.className = `task ${t.completed ? 'completed' : ''}`;

            item.innerHTML = `
                <div class="task-left">
                    <input type="checkbox" ${t.completed ? 'checked' : ''} data-id="${t.id}" class="task-check">
                </div>
                <div class="task-content">
                    <strong>${t.text}</strong>
                    <div class="task-meta">
                        <span>📅 ${t.due_date ? new Date(t.due_date + 'T00:00:00').toLocaleDateString('pt-BR') : 'Sem data'}</span>
                        <span>🏷️ ${t.category || 'Geral'}</span>
                        <span>⚡ ${t.priority === 3 ? 'Alta' : t.priority === 1 ? 'Baixa' : 'Normal'}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="edit-btn" data-id="${t.id}">✏️</button>
                    <button class="delete-btn" data-id="${t.id}">🗑️</button>
                </div>
            `;
            list.appendChild(item);
        });

        document.querySelectorAll('.task-check').forEach(chk => {
            chk.onchange = () => toggleTask(parseInt(chk.dataset.id));
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.onclick = () => deleteTask(parseInt(btn.dataset.id));
        });

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.onclick = () => openEditModal(parseInt(btn.dataset.id));
        });

        updateProjects();
        updateTodayCount();
        updateLateBadge();
    }

    // ===== ATUALIZAR PROJETOS =====
    function updateProjects() {
        const projectsSection = document.querySelector('.projects-section');
        if (!projectsSection) return;

        const categories = [...new Set(tasks.map(t => t.category).filter(c => c && c.trim() !== ''))];

        const sectionHeader = projectsSection.querySelector('.section-header');
        projectsSection.innerHTML = '';
        if (sectionHeader) {
            projectsSection.appendChild(sectionHeader);
        } else {
            projectsSection.innerHTML = '<div class="section-header"><span>Meus projetos</span></div>';
        }

        if (categories.length === 0) return;

        const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];

        categories.forEach((cat, index) => {
            const count = tasks.filter(t => t.category === cat && !t.completed).length;
            const color = colors[index % colors.length];

            const navItem = document.createElement('div');
            navItem.className = 'nav-item';
            navItem.dataset.project = cat;
            navItem.innerHTML = `
                <span class="nav-icon" style="color: ${color};">●</span>
                <span>${cat}</span>
                ${count > 0 ? `<span class="task-count">${count}</span>` : ''}
            `;

            navItem.addEventListener('click', () => {
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                navItem.classList.add('active');
                currentView = 'project';
                currentFilter = cat;
                updatePageTitle('project', cat);
                render();
            });

            projectsSection.appendChild(navItem);
        });
    }

    // ===== CONTADOR HOJE =====
    function updateTodayCount() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayTasks = tasks.filter(t => {
            if (!t.due_date || t.completed) return false;
            const taskDate = new Date(t.due_date);
            taskDate.setHours(0, 0, 0, 0);
            return taskDate.getTime() === today.getTime();
        });

        const todayCountEl = document.querySelector('#todayCount');
        if (todayCountEl) todayCountEl.textContent = todayTasks.length;
    }

    // ===== TAREFAS ATRASADAS =====
    function updateLateBadge() {
        const lateBadge = document.querySelector('#lateBadge');
        const lateCount = document.querySelector('#lateCount');
        
        if (!lateBadge || !lateCount) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lateCountVal = tasks.filter(t => {
            if (t.completed || !t.due_date) return false;
            const taskDate = new Date(t.due_date);
            taskDate.setHours(0, 0, 0, 0);
            return taskDate < today;
        }).length;

        if (lateCountVal > 0) {
            lateBadge.style.display = 'inline-flex';
            lateCount.textContent = lateCountVal;
        } else {
            lateBadge.style.display = 'none';
        }
    }

    // ===== FILTROS E BUSCA =====
    document.querySelectorAll('.chip').forEach(c => {
        c.onclick = () => {
            document.querySelectorAll('.chip').forEach(chip => chip.classList.remove('active'));
            c.classList.add('active');
            currentFilter = c.dataset.filter;
            render();
        };
    });

    const sortSelect = document.querySelector('#sortSelect');
    const searchInput = document.querySelector('#search');

    if (sortSelect) sortSelect.onchange = render;
    if (searchInput) searchInput.oninput = render;

    // ===== MENU MOBILE =====
    const mobileMenuBtn = document.querySelector('#mobileMenuBtn');
    const sidebar = document.querySelector('#sidebar');
    const sidebarOverlay = document.querySelector('#sidebarOverlay');

    if (mobileMenuBtn && sidebar && sidebarOverlay) {
        // Abre sidebar
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
        });

        // Fecha sidebar ao clicar no overlay
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });

        // Fecha sidebar ao clicar em qualquer item do menu
        sidebar.addEventListener('click', (e) => {
            if (e.target.closest('.nav-item') || e.target.closest('.add-task-sidebar')) {
                sidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
            }
        });
    }

    // Inicia verificando a sessão
    await checkSession();
});