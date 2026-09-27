/**
 * SAIDOXX PORTFOLIO — app.js (Version épurée & pro)
 */
'use strict';

/* 1. ANIMATED CANVAS BACKGROUND (Nuances douces & sobres) */
class ParticleCanvas {
  constructor(id) {
    this.canvas = document.getElementById(id);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.dots = [];
    this.mouse = { x: -1000, y: -1000 };
    this.raf = null;
    this.resize();
    this.spawnDots();
    this.bind();
    this.loop();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  spawnDots() {
    const n = Math.min(45, Math.floor(window.innerWidth / 30));
    this.dots = Array.from({ length: n }, () => ({
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      vx: (Math.random() - .5) * .3,
      vy: (Math.random() - .5) * .3,
      r: Math.random() * 1.5 + .6,
    }));
  }

  bind() {
    window.addEventListener('resize', () => { this.resize(); this.spawnDots(); });
    window.addEventListener('mousemove', e => { this.mouse.x = e.clientX; this.mouse.y = e.clientY; });
  }

  loop() {
    this.raf = requestAnimationFrame(() => this.loop());
    this.draw();
  }

  draw() {
    const { ctx, canvas, dots, mouse } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fond dégradé calme et neutre
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#E2E8F0');
    grad.addColorStop(1, '#CBD5E1');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Particules
    dots.forEach(d => {
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0) d.x = canvas.width;
      if (d.x > canvas.width) d.x = 0;
      if (d.y < 0) d.y = canvas.height;
      if (d.y > canvas.height) d.y = 0;

      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(71, 85, 105, 0.25)';
      ctx.fill();
    });

    // Lignes discrètes
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x;
        const dy = dots[i].y - dots[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.strokeStyle = `rgba(71, 85, 105, ${0.1 * (1 - dist / 110)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }

      // Connexion curseur
      const mdx = dots[i].x - mouse.x;
      const mdy = dots[i].y - mouse.y;
      const md = Math.sqrt(mdx * mdx + mdy * mdy);
      if (md < 140) {
        ctx.beginPath();
        ctx.moveTo(dots[i].x, dots[i].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = `rgba(29, 78, 216, ${0.18 * (1 - md / 140)})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }
  }
}

/* 2. TYPING EFFECT */
class TypingEffect {
  constructor(el, texts, cfg = {}) {
    this.el = el;
    this.texts = texts;
    this.speed = cfg.speed || 50;
    this.del = cfg.del || 30;
    this.pause = cfg.pause || 2000;
    this.idx = 0;
    this.ch = 0;
    this.going = false;
    this.timer = null;
    this._run();
  }
  _run() {
    const txt = this.texts[this.idx];
    this.el.textContent = this.going ? txt.slice(0, --this.ch) : txt.slice(0, ++this.ch);
    let d = this.going ? this.del : this.speed;
    if (!this.going && this.ch === txt.length) { d = this.pause; this.going = true; }
    else if (this.going && this.ch === 0) { this.going = false; this.idx = (this.idx + 1) % this.texts.length; d = 400; }
    this.timer = setTimeout(() => this._run(), d);
  }
  destroy() { clearTimeout(this.timer); }
}

/* 3. ROUTER (Sans vie perso) */
class Router {
  constructor() {
    this.pages = {};
    this.navs = {};
    this.curr = 'home';
    this._init();
  }
  _init() {
    document.querySelectorAll('.page').forEach(p => {
      this.pages[p.id.replace('page-', '')] = p;
    });
    document.querySelectorAll('.nav-item').forEach(btn => {
      const t = btn.dataset.page;
      if (t) { this.navs[t] = btn; btn.addEventListener('click', () => this.go(t)); }
    });
    this._activate('home');
  }
  go(id) {
    if (!this.pages[id] || id === this.curr) return;
    const out = this.pages[this.curr];
    if (out) { out.classList.remove('active'); out.classList.add('exit'); setTimeout(() => out.classList.remove('exit'), 300); }
    setTimeout(() => this._activate(id), 20);
    this._title(id);
  }
  _activate(id) {
    if (!this.pages[id]) return;
    Object.values(this.pages).forEach(p => p.classList.remove('active', 'exit'));
    Object.values(this.navs).forEach(n => n.classList.remove('active'));
    this.pages[id].classList.add('active');
    if (this.navs[id]) this.navs[id].classList.add('active');
    this.pages[id].scrollTop = 0;
    this.curr = id;
  }
  _title(id) {
    const map = { home: '~/saidoxx/accueil', about: '~/saidoxx/a-propos', skills: '~/saidoxx/competences', projects: '~/saidoxx/projets', contact: '~/saidoxx/contact' };
    const el = document.getElementById('winPath');
    if (el) el.textContent = map[id] || '~/saidoxx/portfolio';
  }
}

/* 4. MODAL MANAGER */
class ModalMgr {
  constructor() {
    this.overlay = document.getElementById('modalOverlay');
    this.wins = {};
    this.curr = null;
    this._index();
    this._bind();
  }
  _index() {
    this.overlay.querySelectorAll('.modal-win').forEach(w => {
      this.wins[w.id.replace('modal-', '')] = w;
    });
  }
  _bind() {
    this.overlay.addEventListener('click', e => { if (e.target === this.overlay) this.close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') this.close(); });
  }
  open(id) {
    if (!this.wins[id]) return;
    if (this.curr) this._hide(this.curr);
    this.curr = id;
    this.overlay.classList.add('open');
    setTimeout(() => this.wins[id].classList.add('visible'), 50);
    document.body.style.overflow = 'hidden';
  }
  close() {
    if (!this.curr) return;
    this._hide(this.curr);
    this.overlay.classList.remove('open');
    this.curr = null;
    document.body.style.overflow = '';
  }
  _hide(id) { if (this.wins[id]) this.wins[id].classList.remove('visible'); }
}

/* 5. DATA PROJETS */
const GITHUB_URL = 'https://github.com/SaidSANGARE';

const PROJECTS = {
  devsecops: {
    title: 'Automatisation DevSecOps : Déploiement d\'un SOC Hybride et Réponse Automatisée aux Incidents avec Vagrant, Ansible et Wazuh',
    badge: 'DevSecOps & SOC',
    bgClass: 'devsecops-bg',
    github: GITHUB_URL,
    desc: 'Conception et orchestration d\'un environnement de cybersécurité de type entreprise combinant Infrastructure as Code, gestion de configuration, surveillance SOC et réponse automatisée aux incidents.',
    tags: ['Vagrant', 'VMware', 'Ansible', 'Wazuh', 'MITRE ATT&CK', 'Nmap', 'Hydra', 'Kali Linux', 'IPTables'],
    stack: [
      { label: 'Infrastructure as Code', text: 'Provisionnement déclaratif et reproductible d\'un environnement multi-VM avec Vagrant sur VMware, incluant les machines virtuelles, les ressources et l\'adressage réseau statique.' },
      { label: 'Configuration Management', text: 'Déploiement automatisé et durcissement des systèmes avec Ansible à travers des playbooks idempotents, validés avec un Play Recap sans échec.' },
      { label: 'Surveillance et SIEM/XDR', text: 'Déploiement de Wazuh pour la collecte de télémétrie, la corrélation des événements, la détection des menaces et l\'analyse selon le référentiel MITRE ATT&CK.' },
      { label: 'Simulation offensive', text: 'Mise en œuvre de scénarios contrôlés de reconnaissance réseau avec Nmap et de tests de force brute SSH avec Hydra depuis un nœud Kali Linux dédié.' },
      { label: 'Défense active', text: 'Mise en œuvre d\'Active Response permettant d\'isoler automatiquement des adresses IP identifiées comme malveillantes via IPTables.' },
    ],
    highlightsTitle: 'Résultats',
    highlights: [
      'Infrastructure provisionnée automatiquement à partir du code',
      'Centralisation et analyse des événements de sécurité avec Wazuh',
      'Détection et visibilité sur les activités suspectes',
      'Automatisation de la réponse à certains événements de sécurité',
      'Réduction des interventions manuelles lors des scénarios simulés',
    ],
    conclusion: 'Le projet démontre la mise en pratique de compétences en administration système, automatisation, réseau, SOC, détection et réponse aux incidents.',
    previewContent: `<div style="padding:16px;font-family:'JetBrains Mono',monospace;font-size:11px;line-height:2;color:#94A3B8">
      <div><span style="color:#60A5FA">$</span> vagrant up</div>
      <div style="color:#34D399">► PLAY RECAP : failed=0</div>
      <div style="color:#94A3B8">Wazuh : collecte et corrélation</div>
      <div style="color:#FBBF24">● Active Response : IPTables</div>
    </div>`,
  },
  cloud: {
    title: 'Infrastructure Cloud d\'Entreprise : Segmentation Réseau Sécurisée, Hybridation Linux/Windows et Déploiement 100 % IaC avec Terraform sur AWS',
    badge: 'Cloud & IaC',
    bgClass: 'aws-bg',
    github: GITHUB_URL,
    desc: 'Conception, automatisation et validation d\'une infrastructure cloud d\'entreprise sur AWS, avec une architecture réseau segmentée, des environnements Linux et Windows et un déploiement entièrement automatisé avec Terraform.',
    tags: ['Terraform', 'AWS', 'VPC', 'IAM', 'Route 53', 'Systems Manager', 'Windows Server', 'Active Directory', 'Apache'],
    stack: [
      { label: 'Infrastructure as Code', text: 'Déclaration et orchestration de l\'infrastructure AWS avec Terraform, incluant VPC, sous-réseaux, tables de routage, IAM, Security Groups et DNS.' },
      { label: 'Architecture et segmentation réseau', text: 'Conception d\'un VPC segmenté en plusieurs zones : DMZ publique, zone serveurs privée et zone postes utilisateurs privée.' },
      { label: 'Optimisation des coûts et routage', text: 'Mise en œuvre d\'une instance NAT Linux pour assurer le trafic sortant des réseaux privés tout en maîtrisant les coûts d\'infrastructure.' },
      { label: 'Services d\'infrastructure', text: 'Déploiement d\'une zone DNS privée Route 53, d\'un serveur Windows Server avec services Active Directory et partage de fichiers, ainsi que d\'un serveur applicatif Linux sous Apache.' },
      { label: 'Gestion des accès', text: 'Utilisation d\'IAM et d\'AWS Systems Manager pour l\'administration sécurisée des ressources sans exposition directe des ports d\'administration sur Internet.' },
    ],
    highlightsTitle: 'Résultats',
    highlights: [
      'Déploiement reproductible d\'une infrastructure cloud complète avec Terraform',
      'Segmentation des réseaux publics et privés',
      'Intégration d\'environnements Linux et Windows',
      'Mise en place de services d\'infrastructure et de contrôle des accès',
      'Administration sécurisée via les services AWS',
    ],
    conclusion: 'Le projet met en pratique des compétences en Cloud, réseau, administration système, sécurité et Infrastructure as Code.',
    previewContent: `<div style="padding:16px;font-family:'JetBrains Mono',monospace;font-size:11px;line-height:2;color:#94A3B8">
      <div><span style="color:#60A5FA">$</span> terraform apply</div>
      <div style="color:#94A3B8">DMZ · Serveurs · Postes</div>
      <div style="color:#94A3B8">Route 53 · IAM · Systems Manager</div>
      <div style="color:#34D399">► Apply complete!</div>
    </div>`,
  },
  soc: {
    title: 'SOC + Zero Trust — Wazuh',
    badge: 'SOC & SIEM',
    bgClass: 'soc-bg',
    github: GITHUB_URL,
    desc: 'Conception et déploiement d\'une infrastructure SOC complète avec SIEM Wazuh et réseau Zero Trust.',
    tags: ['Wazuh', 'SIEM', 'Zero Trust', 'SOC', 'Elastic Stack', 'Python'],
    highlightsTitle: 'Points clés',
    highlights: [
      'Détection d\'intrusion et corrélation d\'alertes en temps réel',
      'Règles d\'ingestion sur mesure basées sur les logs réseau',
      'Tableaux de bord d\'incidents synthétiques',
      ,
    ],
    previewContent: `<div style="padding:16px;font-family:'JetBrains Mono',monospace;font-size:11px;line-height:2.2;color:#94A3B8">
      <div><span style="color:#EF4444">CRITICAL</span>: SSH Brute force (192.168.1.45)</div>
      <div><span style="color:#F59E0B">WARNING</span>: Port scan identifié</div>
      <div><span style="color:#34D399">SUCCESS</span>: IP 192.168.1.45 mise sur liste noire</div>
      <div><span style="color:#60A5FA">INFO</span>: Incident corrélé - Ticket #0047</div>
    </div>`,
  },
};

function buildProjectModal(pid) {
  const p = PROJECTS[pid];
  if (!p) return;

  document.getElementById('projMTitle').textContent = p.title.length > 60 ? p.title.split(' : ')[0] : p.title;
  const gh = document.getElementById('projMGH');
  gh.textContent = 'Voir sur GitHub';
  if (p.github) { gh.href = p.github; gh.style.display = ''; }
  else gh.style.display = 'none';

  const highlightItems = p.highlights.map(h => `<li>• ${h}</li>`).join('');
  const tagSpans = p.tags.map(t => `<span>${t}</span>`).join('');
  const stackBlock = p.stack ? `
        <div class="detail-highlights">
          <h4>Stack technique</h4>
          <ul style="list-style:none;padding:0">${p.stack.map(x => `<li><strong>${x.label}</strong><span>${x.text}</span></li>`).join('')}</ul>
        </div>` : '';
  const conclusion = p.conclusion ? `<p class="detail-conclusion">${p.conclusion}</p>` : '';

  document.getElementById('projMBody').innerHTML = `
    <div class="proj-detail-grid">
      <div class="detail-preview ${p.bgClass}">
        ${p.previewContent}
      </div>
      <div class="detail-info">
        <span class="pbadge" style="margin-bottom:8px;display:inline-block">${p.badge}</span>
        <h2 class="detail-title">${p.title}</h2>
        <p class="detail-desc">${p.desc}</p>
        <div class="detail-tags">${tagSpans}</div>
        ${stackBlock}
        <div class="detail-highlights">
          <h4>${p.highlightsTitle || 'Points clés'}</h4>
          <ul style="list-style:none;padding:0">${highlightItems}</ul>
        </div>
        ${conclusion}
      </div>
    </div>`;
}

/* 6. FORMULAIRE (Formspree) */
class FormHandler {
  constructor() {
    this.form = document.getElementById('contactForm');
    this.status = document.getElementById('formStatus');
    this.btn = document.getElementById('submitBtn');
    this.btnTxt = document.getElementById('submitText');
    this.btnLdr = document.getElementById('submitLoader');
    this.timer = null;
    if (this.form) this.form.addEventListener('submit', e => this._submit(e));
  }
  async _submit(e) {
    e.preventDefault();
    if (!this._validate()) return;
    this._loading(true);
    try {
      const res = await fetch(this.form.action, {
        method: 'POST',
        body: new FormData(this.form),
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        this._msg('Message transmis avec succès. Je reviens vers vous rapidement.', '#10B981');
        this.form.reset();
      } else {
        let detail = '';
        try {
          const data = await res.json();
          if (data && Array.isArray(data.errors)) detail = data.errors.map(x => x.message).join(' ');
        } catch { /* réponse non JSON */ }
        throw new Error(detail || 'send_failed');
      }
    } catch {
      this._msg('L\'envoi a échoué. Réessayez ou écrivez directement à saidsangare10@gmail.com.', '#EF4444');
    } finally { this._loading(false); }
  }
  _validate() {
    const name = this.form.querySelector('[name="name"]');
    const mail = this.form.querySelector('[name="email"]');
    const msg = this.form.querySelector('[name="message"]');
    if (!name.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail.value.trim()) || msg.value.trim().length < 10) {
      this._msg('Veuillez remplir correctement tous les champs requis.', '#F59E0B');
      return false;
    }
    this._msg('', '');
    return true;
  }
  _loading(on) {
    if (this.btn) this.btn.disabled = on;
    if (this.btnTxt) this.btnTxt.style.display = on ? 'none' : 'inline';
    if (this.btnLdr) this.btnLdr.style.display = on ? 'inline' : 'none';
  }
  _msg(txt, color) {
    if (!this.status) return;
    clearTimeout(this.timer);
    this.status.textContent = txt;
    this.status.style.color = color;
    if (txt) this.timer = setTimeout(() => { this.status.textContent = ''; }, 6000);
  }
}

/* 7. APPLICATION CONTROLLER */
const App = (() => {
  let router = null;
  let modals = null;

  function init() {
    new ParticleCanvas('bgCanvas');
    router = new Router();
    modals = new ModalMgr();

    const tel = document.getElementById('typeText');
    if (tel) new TypingEffect(tel, [
      'Sangare Saïd — Cybersécurité',
      'Analyste SOC · Pentester',
      'SysAdmin & Cloud · DevSecOps',
      'Security+ · Server+ · CCNA · CSA',
    ]);

    new FormHandler();

    document.querySelectorAll('.proj-card[data-pid]').forEach(card => {
      const open = () => {
        buildProjectModal(card.dataset.pid);
        modals.open('project');
      };
      card.addEventListener('click', open);
      card.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target === card) open(); });
    });
  }

  return {
    init,
    goTo: id => router?.go(id),
    openModal: id => modals?.open(id),
    closeModal: () => modals?.close(),
    copyEmail: btn => {
      navigator.clipboard.writeText('saidsangare10@gmail.com').then(() => {
        if (btn) { btn.textContent = 'Copié !'; setTimeout(() => { btn.textContent = 'Copier'; }, 2000); }
      });
    },
  };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}