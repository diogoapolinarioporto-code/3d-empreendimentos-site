// ===== SUPABASE CONFIG =====
const SUPABASE_URL = 'https://pnmdhcjhyknmcfthcqcr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBubWRoY2poeWtubWNmdGhjcWNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNzk4NDcsImV4cCI6MjA5NDk1NTg0N30.Xq4wjeiCKu8isRnjwuLZRxY9YLH2ANh33MXCbLRSsIw';

// ===== HEADER SCROLL EFFECT =====
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// ===== MOBILE MENU =====
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');

menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    nav.classList.toggle('active');
    document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        nav.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = header.offsetHeight;
            const targetPosition = target.offsetTop - headerHeight - 20;
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }
    });
});

// ===== SCROLL ANIMATIONS =====
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.service-card, .diff-card, .gestao-card, .about-image-wrapper, .contact-info-card, .section-header').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

document.querySelectorAll('.services-grid, .diff-grid').forEach(grid => {
    const cards = grid.children;
    Array.from(cards).forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
    });
});

// ===== FORM - ENVIO PRO SUPABASE =====
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const btn = this.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Enviando...';
    btn.disabled = true;

    const formData = {
        nome: document.getElementById('name').value,
        email: document.getElementById('email').value,
        telefone: document.getElementById('phone').value,
        interesse: document.getElementById('interest').value,
        mensagem: document.getElementById('message').value
    };

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/contatos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            btn.textContent = 'Mensagem enviada ✓';
            btn.style.background = '#22c55e';
            contactForm.reset();
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
                btn.disabled = false;
            }, 4000);
        } else {
            throw new Error('Erro ao enviar');
        }
    } catch (error) {
        btn.textContent = 'Erro. Tente novamente.';
        btn.style.background = '#ef4444';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.disabled = false;
        }, 3000);
    }
});

// ===== PHONE MASK =====
const phoneInput = document.getElementById('phone');
if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        if (value.length > 7) {
            value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
        } else if (value.length > 2) {
            value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        } else if (value.length > 0) {
            value = `(${value}`;
        }
        e.target.value = value;
    });
}

// ===== ACTIVE NAV LINK ON SCROLL =====
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 100;
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// ===== IMÓVEIS =====
let imoveisData = [];
let modalCurrentImg = 0;
let modalImagens = [];

// Filter state
let activeFilters = {
    preco: 'todos',
    quartos: 'todos',
    tipo: 'todos'
};

async function loadImoveis() {
    try {
        const res = await fetch('imoveis.json?t=' + Date.now());
        imoveisData = await res.json();
        renderImoveis();
        initFilters();
    } catch(e) {
        document.getElementById('imoveisGrid').innerHTML = '<p class="no-imoveis">Nenhum imóvel disponível no momento.</p>';
    }
}

function initFilters() {
    // Price filter
    const filterPreco = document.getElementById('filterPreco');
    if (filterPreco) {
        filterPreco.addEventListener('change', (e) => {
            activeFilters.preco = e.target.value;
            renderImoveis();
        });
    }

    // Quartos filter buttons
    const filterQuartos = document.getElementById('filterQuartos');
    if (filterQuartos) {
        filterQuartos.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                filterQuartos.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeFilters.quartos = btn.dataset.value;
                renderImoveis();
            });
        });
    }

    // Tipo filter buttons
    const filterTipo = document.getElementById('filterTipo');
    if (filterTipo) {
        filterTipo.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                filterTipo.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeFilters.tipo = btn.dataset.value;
                renderImoveis();
            });
        });
    }
}

function parsePrice(valorStr) {
    if (!valorStr) return 0;
    return parseFloat(valorStr.replace(/\./g, '').replace(',', '.')) || 0;
}

function getFilteredImoveis() {
    let ativos = imoveisData.filter(im => im.ativo);

    // Filter by price
    if (activeFilters.preco !== 'todos') {
        const [min, max] = activeFilters.preco.split('-').map(Number);
        ativos = ativos.filter(im => {
            const price = parsePrice(im.valor_venda);
            return price >= min && price <= max;
        });
    }

    // Filter by quartos
    if (activeFilters.quartos !== 'todos') {
        const q = parseInt(activeFilters.quartos);
        ativos = ativos.filter(im => {
            const quartos = parseInt(im.quartos) || 0;
            if (q === 4) return quartos >= 4;
            return quartos === q;
        });
    }

    // Filter by tipo
    if (activeFilters.tipo !== 'todos') {
        ativos = ativos.filter(im => {
            return (im.tipo || 'venda') === activeFilters.tipo;
        });
    }

    return ativos;
}

function renderImoveis() {
    const grid = document.getElementById('imoveisGrid');
    const ativos = getFilteredImoveis();
    
    if (ativos.length === 0) {
        grid.innerHTML = '<p class="no-results">Nenhum imóvel encontrado com os filtros selecionados.</p>';
        return;
    }

    grid.innerHTML = ativos.map((im, i) => `
        <div class="imovel-card" onclick="openModal('${im.id}')">
            <img src="${im.imagens && im.imagens[0] ? im.imagens[0] : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80'}" alt="${im.titulo}" class="imovel-card-img" loading="lazy">
            <div class="imovel-card-body">
                <h3 class="imovel-card-title">${im.titulo}</h3>
                <p class="imovel-card-price">R$ ${im.valor_venda}</p>
                <div class="imovel-card-details">
                    ${im.quartos ? `<span class="imovel-detail"><strong>${im.quartos}</strong> quartos</span>` : ''}
                    ${im.suites ? `<span class="imovel-detail"><strong>${im.suites}</strong> suítes</span>` : ''}
                    ${im.banheiros ? `<span class="imovel-detail"><strong>${im.banheiros}</strong> banh.</span>` : ''}
                    ${im.vagas ? `<span class="imovel-detail"><strong>${im.vagas}</strong> vagas</span>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function openModal(id) {
    const im = imoveisData.find(i => i.id === id);
    if (!im) return;
    modalImagens = im.imagens || [];
    modalCurrentImg = 0;

    const gallery = document.getElementById('modalGallery');
    const info = document.getElementById('modalInfo');

    renderGallery(gallery);

    info.innerHTML = `
        <h2 class="modal-title">${im.titulo}</h2>
        <p class="modal-price">R$ ${im.valor_venda}</p>
        <div class="modal-costs">
            ${im.condominio ? `<span>Condomínio: <strong>R$ ${im.condominio}</strong></span>` : ''}
            ${im.iptu ? `<span>IPTU: <strong>R$ ${im.iptu}/ano</strong></span>` : ''}
        </div>
        <div class="modal-specs">
            ${im.quartos ? `<div class="modal-spec"><span class="modal-spec-value">${im.quartos}</span><span class="modal-spec-label">Quartos</span></div>` : ''}
            ${im.suites ? `<div class="modal-spec"><span class="modal-spec-value">${im.suites}</span><span class="modal-spec-label">Suítes</span></div>` : ''}
            ${im.banheiros ? `<div class="modal-spec"><span class="modal-spec-value">${im.banheiros}</span><span class="modal-spec-label">Banheiros</span></div>` : ''}
            ${im.vagas ? `<div class="modal-spec"><span class="modal-spec-value">${im.vagas}</span><span class="modal-spec-label">Vagas</span></div>` : ''}
            ${im.area ? `<div class="modal-spec"><span class="modal-spec-value">${im.area}</span><span class="modal-spec-label">m²</span></div>` : ''}
        </div>
        <p class="modal-desc">${im.descricao || ''}</p>
        <div class="modal-cta">
            <a href="https://wa.me/5521976331432?text=Olá! Tenho interesse no imóvel: ${encodeURIComponent(im.titulo)}" class="btn btn-primary" target="_blank">Tenho interesse</a>
        </div>
    `;

    document.getElementById('imovelModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function renderGallery(gallery) {
    if (modalImagens.length === 0) {
        gallery.innerHTML = '<img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80" alt="Imóvel">';
        return;
    }
    const dots = modalImagens.map((_, i) => `<div class="gallery-dot ${i === modalCurrentImg ? 'active' : ''}" onclick="goToImg(${i})"></div>`).join('');
    gallery.innerHTML = `
        <img src="${modalImagens[modalCurrentImg]}" alt="Foto do imóvel">
        ${modalImagens.length > 1 ? `<button class="gallery-nav prev" onclick="prevImg()">‹</button><button class="gallery-nav next" onclick="nextImg()">›</button>` : ''}
        ${modalImagens.length > 1 ? `<div class="gallery-dots">${dots}</div>` : ''}
    `;
}

function prevImg() {
    modalCurrentImg = (modalCurrentImg - 1 + modalImagens.length) % modalImagens.length;
    renderGallery(document.getElementById('modalGallery'));
}
function nextImg() {
    modalCurrentImg = (modalCurrentImg + 1) % modalImagens.length;
    renderGallery(document.getElementById('modalGallery'));
}
function goToImg(i) {
    modalCurrentImg = i;
    renderGallery(document.getElementById('modalGallery'));
}

function closeModal() {
    document.getElementById('imovelModal').classList.remove('active');
    document.body.style.overflow = '';
}

// Close modal on ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// Close modal on backdrop click
document.getElementById('imovelModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('imovelModal')) closeModal();
});

// ===== ADMIN SECRET TRIGGER =====
// Clique duplo no copyright do footer abre o painel admin
const footerTrigger = document.querySelector('.footer-bottom');
if (footerTrigger) {
    footerTrigger.addEventListener('dblclick', () => {
        window.open('admin.html', '_blank');
    });
    footerTrigger.style.cursor = 'default';
}

// Load imóveis on page load
loadImoveis();
