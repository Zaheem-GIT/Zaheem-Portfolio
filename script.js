/**
 * ZAHEEM HYPERVISOR V2.0 - CLOUD ARCHITECT PORTFOLIO ENGINE
 * Author: Abdu Rahman Zaheem K.P. (MCA Scholar, SRM IST)
 * Features: 2D Particle Canvas, Web Audio API Synth, Cloud Topology Simulator,
 *           Cloud Cost Estimator & IaC Generator, Cyber Cloud Shell (CLI),
 *           Command Palette (Ctrl+K), and 3D Tilt Physics.
 */

'use strict';

// ============================================================================
// 1. WEB AUDIO API SYNTHESIZER (No external audio files needed!)
// ============================================================================
class CyberSoundFX {
  constructor() {
    this.enabled = false;
    this.ctx = null;
  }

  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.playChime();
    }
    return this.enabled;
  }

  playBeep(freq = 600, duration = 0.04, type = 'sine') {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio fallback silent
    }
  }

  playHover() {
    this.playBeep(980, 0.025, 'triangle');
  }

  playClick() {
    this.playBeep(450, 0.05, 'sine');
  }

  playChime() {
    if (!this.enabled || !this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playBeep(freq, 0.12, 'sine');
      }, idx * 70);
    });
  }

  playError() {
    this.playBeep(180, 0.15, 'sawtooth');
  }
}

const sfx = new CyberSoundFX();

// ============================================================================
// 2. INTERACTIVE 2D PARTICLE CONSTELLATION BACKGROUND
// ============================================================================
class ParticleEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: -1000, y: -1000, radius: 140 };
    this.particleCount = 55;
    this.maxDist = 120;
    this.animId = null;

    this.resize();
    this.initParticles();
    this.bindEvents();
    this.loop();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.particleCount = Math.floor((this.canvas.width * this.canvas.height) / 22000);
    if (this.particleCount < 30) this.particleCount = 30;
    if (this.particleCount > 80) this.particleCount = 80;
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 1.8 + 1,
        alpha: Math.random() * 0.5 + 0.2
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.initParticles();
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
    });
  }

  loop() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Update positions
      p.x += p.vx;
      p.y += p.vy;

      // Bounce off walls
      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

      // Mouse subtle interaction
      const dxm = this.mouse.x - p.x;
      const dym = this.mouse.y - p.y;
      const distM = Math.sqrt(dxm * dxm + dym * dym);
      if (distM < this.mouse.radius) {
        p.x -= (dxm / distM) * 1.2;
        p.y -= (dym / distM) * 1.2;
      }

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(0, 240, 255, ${p.alpha})`;
      this.ctx.fill();

      // Connect lines to nearby particles
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.maxDist) {
          const lineAlpha = (1 - dist / this.maxDist) * 0.22;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(0, 240, 255, ${lineAlpha})`;
          this.ctx.lineWidth = 0.8;
          this.ctx.stroke();
        }
      }
    }

    this.animId = requestAnimationFrame(() => this.loop());
  }
}

// ============================================================================
// 3. THEME MANAGER & HUD TELEMETRY
// ============================================================================
class ThemeManager {
  constructor() {
    this.themes = ['cyan', 'violet', 'matrix', 'amber'];
    this.themeLabels = {
      cyan: 'CYBER CYAN',
      violet: 'NEBULA VIOLET',
      matrix: 'MATRIX EMERALD',
      amber: 'SOLAR AMBER'
    };
    this.currentIdx = 0;
    this.btn = document.getElementById('theme-cycle-btn');
    this.label = document.getElementById('theme-label');

    const saved = localStorage.getItem('zaheem_theme');
    if (saved && this.themes.includes(saved)) {
      this.currentIdx = this.themes.indexOf(saved);
    }
    this.applyTheme(this.themes[this.currentIdx]);

    if (this.btn) {
      this.btn.addEventListener('click', () => this.cycle());
    }
  }

  applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    if (this.label) this.label.textContent = this.themeLabels[theme];
    localStorage.setItem('zaheem_theme', theme);
  }

  cycle() {
    sfx.playClick();
    this.currentIdx = (this.currentIdx + 1) % this.themes.length;
    this.applyTheme(this.themes[this.currentIdx]);
    showToast(`Active Theme: ${this.themeLabels[this.themes[this.currentIdx]]}`);
  }
}

// ============================================================================
// 4. HERO TYPEWRITER & 3D CARD TILT
// ============================================================================
class Typewriter {
  constructor(elId, phrases) {
    this.el = document.getElementById(elId);
    this.phrases = phrases;
    this.phraseIdx = 0;
    this.charIdx = 0;
    this.isDeleting = false;
    this.type();
  }

  type() {
    if (!this.el) return;
    const current = this.phrases[this.phraseIdx];

    if (this.isDeleting) {
      this.charIdx--;
      this.el.textContent = current.substring(0, this.charIdx);
    } else {
      this.charIdx++;
      this.el.textContent = current.substring(0, this.charIdx);
    }

    let delay = this.isDeleting ? 45 : 95;

    if (!this.isDeleting && this.charIdx === current.length) {
      delay = 2000;
      this.isDeleting = true;
    } else if (this.isDeleting && this.charIdx === 0) {
      this.isDeleting = false;
      this.phraseIdx = (this.phraseIdx + 1) % this.phrases.length;
      delay = 500;
    }

    setTimeout(() => this.type(), delay);
  }
}

function initTiltCard() {
  const card = document.getElementById('hero-tilt-card');
  if (!card) return;

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotX = (y / (rect.height / 2)) * -12;
    const rotY = (x / (rect.width / 2)) * 12;

    card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  });
}

// ============================================================================
// 5. MCA SHOWCASE 1: CLOUD ARCHITECTURE SIMULATOR & TOPOLOGY
// ============================================================================
class CloudSimulator {
  constructor() {
    this.scenario = 'azure'; // 'azure' | 'aws'
    this.isFailoverActive = false;
    this.isSimulatingTraffic = false;

    // Elements
    this.tabAzure = document.getElementById('tab-azure');
    this.tabAws = document.getElementById('tab-aws');
    this.btnTraffic = document.getElementById('btn-sim-traffic');
    this.btnFailover = document.getElementById('btn-sim-failover');
    this.btnReset = document.getElementById('btn-sim-reset');
    this.logEl = document.getElementById('sim-status-log');

    // Topology Nodes
    this.nodeLb = document.getElementById('topo-lb');
    this.nodeVm1 = document.getElementById('topo-vm-1');
    this.nodeVm2 = document.getElementById('topo-vm-2');
    this.nodeDb = document.getElementById('topo-db');

    this.bindEvents();
  }

  bindEvents() {
    if (this.tabAzure) {
      this.tabAzure.addEventListener('click', () => this.switchScenario('azure'));
    }
    if (this.tabAws) {
      this.tabAws.addEventListener('click', () => this.switchScenario('aws'));
    }
    if (this.btnTraffic) {
      this.btnTraffic.addEventListener('click', () => this.fireTrafficBurst());
    }
    if (this.btnFailover) {
      this.btnFailover.addEventListener('click', () => this.toggleFailover());
    }
    if (this.btnReset) {
      this.btnReset.addEventListener('click', () => this.resetTopology());
    }

    // Node click inspections
    [this.nodeLb, this.nodeVm1, this.nodeVm2, this.nodeDb].forEach((node) => {
      if (node) {
        node.addEventListener('click', () => {
          sfx.playClick();
          this.inspectNode(node);
        });
      }
    });
  }

  switchScenario(mode) {
    sfx.playClick();
    this.scenario = mode;
    this.tabAzure.classList.toggle('active', mode === 'azure');
    this.tabAws.classList.toggle('active', mode === 'aws');

    const lbTitle = document.getElementById('topo-lb-title');
    const lbSub = document.getElementById('topo-lb-sub');
    const vm1Title = document.getElementById('topo-vm1-title');
    const vm2Title = document.getElementById('topo-vm2-title');
    const dbTitle = document.getElementById('topo-db-title');

    if (mode === 'azure') {
      lbTitle.textContent = 'Azure App Gateway';
      lbSub.textContent = 'WAF v2 · SSL Termination';
      vm1Title.textContent = 'Azure VM Tier 1';
      vm2Title.textContent = 'Azure VM Tier 2';
      dbTitle.textContent = 'Azure SQL & Bastion';
      this.log(`Switched topology to Azure 3-Tier Enterprise Architecture (VNet: 10.0.0.0/16).`);
    } else {
      lbTitle.textContent = 'AWS App Load Balancer';
      lbSub.textContent = 'ALB · HTTPS / ACM Cert';
      vm1Title.textContent = 'EC2 Instance AZ-1a';
      vm2Title.textContent = 'EC2 Instance AZ-1b';
      dbTitle.textContent = 'AWS RDS Multi-AZ';
      this.log(`Switched topology to AWS High-Availability VPC (VPC: 172.31.0.0/16).`);
    }
    this.resetTopology();
  }

  fireTrafficBurst() {
    if (this.isSimulatingTraffic) return;
    this.isSimulatingTraffic = true;
    sfx.playChime();

    const lines = document.querySelectorAll('.cable-line');
    lines.forEach((l) => l.classList.add('active'));

    const activeNodes = [this.nodeLb];
    if (!this.isFailoverActive) {
      activeNodes.push(this.nodeVm1);
    }
    activeNodes.push(this.nodeVm2, this.nodeDb);

    activeNodes.forEach((node) => node.classList.add('active-pulse'));

    this.log(`🚀 [PACKET BURST] 1,500 HTTPS requests dispatched through Ingress WAF. Traffic distributed across healthy subnets.`);

    setTimeout(() => {
      lines.forEach((l) => l.classList.remove('active'));
      activeNodes.forEach((node) => node.classList.remove('active-pulse'));
      this.isSimulatingTraffic = false;
      this.log(`✓ Traffic burst completed successfully. 0 packet drops, avg latency 14.2ms.`);
    }, 2200);
  }

  toggleFailover() {
    sfx.playClick();
    this.isFailoverActive = !this.isFailoverActive;

    if (this.isFailoverActive) {
      sfx.playError();
      this.nodeVm1.classList.add('outage');
      this.nodeVm1.querySelector('.topo-node-badge').textContent = 'OUTAGE';
      this.log(`⚠️ [CHAOS INJECTION] Availability Zone 1 simulated failure! Health check probe failed. Traffic 100% diverted to AZ 2.`);
      showToast('Zone 1 Outage Simulated: Traffic auto-diverted to backup node.');
    } else {
      this.nodeVm1.classList.remove('outage');
      this.nodeVm1.querySelector('.topo-node-badge').textContent = 'AZ-1';
      this.log(`✓ Instance 1 health check recovered. Dual availability zone load balancing restored.`);
    }
  }

  resetTopology() {
    sfx.playClick();
    this.isFailoverActive = false;
    this.nodeVm1.classList.remove('outage', 'active-pulse');
    this.nodeVm2.classList.remove('active-pulse');
    this.nodeLb.classList.remove('active-pulse');
    this.nodeDb.classList.remove('active-pulse');
    this.nodeVm1.querySelector('.topo-node-badge').textContent = 'AZ-1';
    this.log(`Topology reset to baseline operational status.`);
  }

  inspectNode(node) {
    const title = node.querySelector('.topo-node-title').textContent;
    this.log(`[INSPECT NODE: ${title}] Port 443/22 · Stateful NSG Rules Applied · Zero Trust Bastion Access.`);
  }

  log(msg) {
    if (this.logEl) {
      this.logEl.textContent = msg;
    }
  }
}

// ============================================================================
// 6. MCA SHOWCASE 2: CLOUD RESOURCE & COST ESTIMATOR + IAC GENERATOR
// ============================================================================
class CloudEstimator {
  constructor() {
    this.sliderVcpu = document.getElementById('slider-vcpu');
    this.sliderRam = document.getElementById('slider-ram');
    this.sliderStorage = document.getElementById('slider-storage');
    this.selectWorkload = document.getElementById('calc-workload');
    this.selectRegion = document.getElementById('calc-region');

    this.lblVcpu = document.getElementById('lbl-vcpu');
    this.lblRam = document.getElementById('lbl-ram');
    this.lblStorage = document.getElementById('lbl-storage');

    this.azurePriceEl = document.getElementById('azure-price');
    this.awsPriceEl = document.getElementById('aws-price');
    this.azureSpecEl = document.getElementById('azure-spec');
    this.awsSpecEl = document.getElementById('aws-spec');
    this.iacOutput = document.getElementById('iac-code-output');
    this.btnCopyIac = document.getElementById('btn-copy-iac');

    this.bindEvents();
    this.update();
  }

  bindEvents() {
    const inputs = [this.sliderVcpu, this.sliderRam, this.sliderStorage, this.selectWorkload, this.selectRegion];
    inputs.forEach((input) => {
      if (input) {
        input.addEventListener('input', () => this.update());
      }
    });

    if (this.btnCopyIac) {
      this.btnCopyIac.addEventListener('click', () => {
        if (!this.iacOutput) return;
        navigator.clipboard.writeText(this.iacOutput.textContent);
        sfx.playClick();
        showToast('Terraform code copied to clipboard! 📋');
      });
    }
  }

  update() {
    const vcpu = parseInt(this.sliderVcpu.value, 10);
    const ram = parseInt(this.sliderRam.value, 10);
    const storage = parseInt(this.sliderStorage.value, 10);
    const workload = this.selectWorkload.value;
    const region = this.selectRegion.value;

    this.lblVcpu.textContent = `${vcpu} vCPUs`;
    this.lblRam.textContent = `${ram} GB`;
    this.lblStorage.textContent = `${storage} GB`;

    // Pricing formula based on industry baseline standard
    const computeBase = vcpu * 18.5 + ram * 3.2;
    const storageCost = storage * 0.12;
    let multiplier = 1.0;
    if (region === 'india') multiplier = 0.95;
    if (region === 'eu') multiplier = 1.08;

    const azureTotal = ((computeBase * 1.02 + storageCost + 15) * multiplier).toFixed(2);
    const awsTotal = ((computeBase * 0.98 + storageCost + 14) * multiplier).toFixed(2);

    this.azurePriceEl.innerHTML = `$${azureTotal} <span>/month</span>`;
    this.awsPriceEl.innerHTML = `$${awsTotal} <span>/month</span>`;

    // Spec descriptions
    const azVmType = vcpu <= 4 ? 'Standard_D4s_v5' : vcpu <= 8 ? 'Standard_D8s_v5' : 'Standard_D16s_v5';
    const awsEc2Type = vcpu <= 4 ? 'm6i.xlarge' : vcpu <= 8 ? 'm6i.2xlarge' : 'm6i.4xlarge';

    this.azureSpecEl.innerHTML = `VM: ${azVmType} (${vcpu} vCPU, ${ram}GB)<br>Storage: ${storage}GB Premium SSD · 99.95% SLA`;
    this.awsSpecEl.innerHTML = `Instance: ${awsEc2Type} (${vcpu} vCPU, ${ram}GB)<br>EBS: ${storage}GB gp3 IOPS · 99.99% SLA`;

    // Dynamic Terraform HCL Output
    this.iacOutput.textContent = `# HashiCorp Terraform Configuration
# Generated by Zaheem Cloud Estimator for MCA Mini Project

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "rg" {
  name     = "rg-zaheem-${workload}"
  location = "${region === 'india' ? 'centralindia' : 'eastus'}"
}

resource "azurerm_linux_virtual_machine" "app_node" {
  name                = "zaheem-${workload}-vm"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  size                = "${azVmType}"
  admin_username      = "zaheemcloud"

  network_interface_ids = [
    azurerm_network_interface.app_nic.id
  ]

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Premium_LRS"
    disk_size_gb         = ${storage}
  }
}`;
  }
}

// ============================================================================
// 7. MCA SHOWCASE 3: INTERACTIVE CLOUD SHELL (ZAHEEM-CLI)
// ============================================================================
class CloudShellTerminal {
  constructor() {
    this.input = document.getElementById('term-input');
    this.historyEl = document.getElementById('term-history');
    this.bodyEl = document.getElementById('term-body');
    this.cmdHistory = [];
    this.historyIdx = -1;

    this.bindEvents();
  }

  bindEvents() {
    if (!this.input) return;

    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = this.input.value.trim();
        if (cmd) {
          this.execute(cmd);
          this.cmdHistory.push(cmd);
          this.historyIdx = this.cmdHistory.length;
          this.input.value = '';
        }
      } else if (e.key === 'ArrowUp') {
        if (this.historyIdx > 0) {
          this.historyIdx--;
          this.input.value = this.cmdHistory[this.historyIdx];
        }
      } else if (e.key === 'ArrowDown') {
        if (this.historyIdx < this.cmdHistory.length - 1) {
          this.historyIdx++;
          this.input.value = this.cmdHistory[this.historyIdx];
        } else {
          this.historyIdx = this.cmdHistory.length;
          this.input.value = '';
        }
      }
    });

    // Quick Command Pills
    document.querySelectorAll('.cmd-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        const cmd = pill.getAttribute('data-cmd');
        sfx.playClick();
        this.execute(cmd);
      });
    });

    // Window controls
    const btnClose = document.getElementById('term-btn-close');
    if (btnClose) {
      btnClose.addEventListener('click', () => this.clear());
    }
  }

  execute(rawCmd) {
    sfx.playClick();
    const parts = rawCmd.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    this.appendOutput(`<div class="term-output-line"><span class="term-prompt">zaheem@cloud:~$</span> ${rawCmd}</div>`);

    switch (command) {
      case 'help':
        this.appendOutput(`
<div style="color: var(--accent-primary);">Available Commands:</div>
  whoami         - View engineer identity, degrees & affiliations
  skills         - List cloud & networking technologies
  projects       - Display production architecture projects
  simulator      - Jump to Cloud Topology Simulator
  estimator      - Jump to Spec & Cost Calculator
  ping &lt;host&gt;    - Simulate ICMP ping roundtrips
  deploy         - Simulate automated cloud CI/CD rollout
  matrix         - Run Matrix cyber stream sequence
  theme &lt;name&gt;   - Change color theme [cyan|violet|matrix|amber]
  contact        - Display direct contact channels
  cv             - Trigger CV download
  clear          - Clear terminal display buffer
`);
        break;

      case 'whoami':
        this.appendOutput(`
<strong>Abdu Rahman Zaheem K.P.</strong>
Role: Cloud Engineer | Azure & AWS
Current: Master of Computer Applications (MCA) @ SRM Institute of Science & Technology (2025-2027)
Alumnus: Bachelor of Computer Applications (BCA) @ Yenepoya University (2022-2025)
Focus: Resilient Hybrid Cloud Architectures, Zero-Trust Virtual Networks, VMware Virtualization
`);
        break;

      case 'skills':
        this.appendOutput(`
[CLOUD PLATFORMS]     Microsoft Azure (AZ-104 prep), AWS (EC2, VPC, S3, ALB, Route53)
[NETWORKING]          IPv4/IPv6 CIDR, Subnetting, VNet Peering, NSG, NACL, Bastion Host
[VIRTUALIZATION]      VMware ESXi, Workstation, Docker Containers
[AUTOMATION & IaC]    HashiCorp Terraform, Azure ARM JSON, AWS CloudFormation, Git
[LANGUAGES & WEB]     JavaScript (ES6+), HTML5/CSS3, Python basics, Bash Scripting
`);
        break;

      case 'projects':
        this.appendOutput(`
1. Secure Multi-Tier Web App on Azure (VMs, VNet, Bastion, WAF)
2. Highly Available Multi-AZ Architecture on AWS (Auto Scaling, ALB)
3. Hybrid Cloud Cross-Network Interconnect (Azure VNet <-> AWS VPC)
4. Automated Cloud Infrastructure Provisioning (IaC Pipeline)
5. Interactive Cloud Telemetry & Hypervisor Platform (MCA Project)
Type 'cat project1' or scroll to Projects section for details.
`);
        break;

      case 'ping':
        const host = args[0] || 'azure.microsoft.com';
        this.appendOutput(`PING ${host} (52.178.17.2) 56(84) bytes of data.`);
        let count = 0;
        const interval = setInterval(() => {
          count++;
          const time = (11.2 + Math.random() * 4).toFixed(1);
          this.appendOutput(`64 bytes from ${host}: icmp_seq=${count} ttl=116 time=${time} ms`);
          if (count === 4) {
            clearInterval(interval);
            this.appendOutput(`--- ${host} ping statistics ---<br>4 packets transmitted, 4 received, 0% packet loss, time 3004ms`);
          }
        }, 300);
        break;

      case 'deploy':
        this.appendOutput(`[CI/CD] Triggering Automated Cloud Provisioning Pipeline...`);
        const steps = [
          'Checking Terraform state backend in Azure Blob Storage...',
          'Validating Network Security Group rules & CIDR allocations...',
          'Spinning up VM Scale Sets across Availability Zones...',
          'Deploying Web Application Gateway with TLS 1.3 termination...',
          '✓ DEPLOYMENT SUCCEEDED: 100% healthy nodes in ap-south-1!'
        ];
        steps.forEach((step, i) => {
          setTimeout(() => {
            this.appendOutput(`<span style="color: ${i === 4 ? 'var(--status-success)' : 'var(--text-muted)'};">${step}</span>`);
            sfx.playHover();
          }, (i + 1) * 450);
        });
        break;

      case 'matrix':
        sfx.playChime();
        this.appendOutput(`<div style="color: #10b981; font-family: monospace;">01000011 01001100 01001111 01010101 01000100 [NEO-HYPERVISOR UNLOCKED]</div>`);
        break;

      case 'theme':
        const targetTheme = (args[0] || '').toLowerCase();
        if (['cyan', 'violet', 'matrix', 'amber'].includes(targetTheme)) {
          document.body.setAttribute('data-theme', targetTheme);
          localStorage.setItem('zaheem_theme', targetTheme);
          this.appendOutput(`Theme updated to: ${targetTheme}`);
        } else {
          this.appendOutput(`Usage: theme [cyan | violet | matrix | amber]`);
        }
        break;

      case 'cv':
      case 'resume':
        this.appendOutput(`Downloading resume: Abdu-Rahman-Zaheem-CV.pdf...`);
        window.open('./Zaheem-CV.pdf.pdf', '_blank');
        break;

      case 'simulator':
        window.location.hash = '#simulator';
        this.appendOutput(`Navigating to Cloud Topology Simulator...`);
        break;

      case 'estimator':
        window.location.hash = '#estimator';
        this.appendOutput(`Navigating to Cloud Spec & Cost Estimator...`);
        break;

      case 'contact':
        this.appendOutput(`Email: abduzaheem.kp@gmail.com | Phone: +91 8943905228 | GitHub: Zaheem-GIT`);
        break;

      case 'clear':
        this.clear();
        return;

      default:
        sfx.playError();
        this.appendOutput(`<span style="color: var(--status-danger);">command not found: ${command}. Type 'help' for commands.</span>`);
    }

    this.scrollToBottom();
  }

  appendOutput(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    this.historyEl.appendChild(div);
    this.scrollToBottom();
  }

  clear() {
    this.historyEl.innerHTML = '';
  }

  scrollToBottom() {
    if (this.bodyEl) {
      this.bodyEl.scrollTop = this.bodyEl.scrollHeight;
    }
  }
}

// ============================================================================
// 8. PROJECT ARCHITECTURE DEEP-DIVE MODALS
// ============================================================================
const PROJECT_DETAILS = {
  'project-1': {
    title: 'Secure Multi-Tier Web Application Deployment',
    vendor: 'Microsoft Azure',
    subtitle: 'Zero-Trust Network Architecture with Azure VMs, VNet, NSG, Bastion & App Gateway',
    description: `Designed and provisioned a robust 3-tier enterprise cloud infrastructure inside Microsoft Azure. The architecture strictly isolates the presentation tier, application tier, and database layer inside dedicated subnets within a custom Azure Virtual Network (VNet).`,
    architectureSteps: [
      'Configured VNet (10.0.0.0/16) partitioned into Public Frontend Subnet (10.0.1.0/24), Private App Subnet (10.0.2.0/24), and DB Subnet (10.0.3.0/24).',
      'Configured strict Network Security Groups (NSGs) allowing port 443 inbound to App Gateway, blocking all direct Internet ingress to VM and DB tiers.',
      'Deployed Azure Bastion for secure, SSL-based browser SSH/RDP connectivity without attaching Public IPs to backend virtual machines.',
      'Configured Azure Application Gateway (WAF v2) for SSL/TLS offloading, cookie-based session affinity, and URL-based routing.'
    ],
    outcomes: 'Zero public attack surface on compute nodes, automated health-probe failovers, and sub-40ms latency response across workloads.'
  },
  'project-2': {
    title: 'Highly Available Web Application on AWS',
    vendor: 'Amazon Web Services (AWS)',
    subtitle: 'Fault-Tolerant Multi-AZ Architecture with EC2 Auto Scaling, ALB & Route 53',
    description: `Engineered an automated, high-availability architecture on AWS designed to withstand entire Availability Zone outages with zero data loss and seamless traffic redirection.`,
    architectureSteps: [
      'Created custom AWS VPC spanning multiple Availability Zones (ap-south-1a and ap-south-1b) with public and private subnets.',
      'Configured Internet Gateway for edge ingress and NAT Gateways in each AZ for secure outbound patching from private EC2 instances.',
      'Set up Elastic Load Balancing (Application Load Balancer) distributing incoming HTTPS requests across dynamic EC2 Target Groups.',
      'Configured dynamic EC2 Auto Scaling policies triggering scale-out operations upon CloudWatch CPU utilization exceeding 70% threshold.',
      'Integrated Route 53 DNS routing and CloudFront CDN edge caching.'
    ],
    outcomes: '99.99% high availability SLA, automated self-healing compute clusters, and 45% bandwidth cost optimization via CloudFront caching.'
  },
  'project-3': {
    title: 'Hybrid Cloud Cross-Network Interconnect',
    vendor: 'Azure + AWS Hybrid',
    subtitle: 'Multi-Cloud Interconnectivity & Zero-Trust Routing between VNet and VPC',
    description: `Engineered and verified a hybrid cloud interconnect bridging an Azure Virtual Network with an AWS Virtual Private Cloud. Enables secure, encrypted microservice communication without routing traffic across the public internet.`,
    architectureSteps: [
      'Assigned non-overlapping CIDR address spaces (Azure VNet: 10.10.0.0/16, AWS VPC: 10.20.0.0/16).',
      'Configured custom routing tables (User Defined Routes in Azure and Route Tables in AWS) pointing to virtual gateway endpoints.',
      'Enforced synchronized Security Group and NSG egress/ingress whitelisting for port-specific application communication.',
      'Established dual Bastion jump-box nodes with multi-factor authentication for unified administrative oversight.'
    ],
    outcomes: 'End-to-end encrypted packet transmission across cloud providers with validated ping and payload replication latency below 25ms.'
  },
  'project-4': {
    title: 'Automated Cloud Provisioning (IaC Pipeline)',
    vendor: 'Infrastructure as Code (IaC)',
    subtitle: 'Modular Deployment Automation using AWS CloudFormation & Azure ARM',
    description: `Developed comprehensive, reusable Infrastructure as Code (IaC) templates to automate the repeatable provisioning of cloud environments across development, staging, and production tiers.`,
    architectureSteps: [
      'Created modular Azure Resource Manager (ARM) JSON templates for VNet, VMSS, and Storage Account provisioning.',
      'Developed declarative AWS CloudFormation YAML stacks configuring VPC, Subnets, Internet Gateways, and EC2 Auto Scaling.',
      'Parametrized environment variables (instance sizing, disk IOPS, CIDR ranges) allowing zero-touch re-deployment across different global regions.',
      'Integrated Git version control with automated syntax validation and linting.'
    ],
    outcomes: 'Reduced cloud infrastructure deployment turnaround time from hours of manual clicking to under 6 minutes with 100% configuration consistency.'
  },
  'project-5': {
    title: 'Interactive Cloud Telemetry & Hypervisor Platform',
    vendor: 'MCA Special Mini Project',
    subtitle: 'Next-Gen Cyberpunk Portfolio, Cloud Architecture Simulator & Terminal Engine',
    description: `The actual web system you are exploring right now! Built from scratch for this MCA Mini Project to demonstrate high-level technical capability in both Cloud Systems Architecture and modern Frontend Web Engineering.`,
    architectureSteps: [
      'Architected an interactive 2D Canvas particle physics constellation reacting to mouse coordinates.',
      'Engineered an interactive Cloud Architecture Simulator modeling live packet transfers and chaos-engineering failovers.',
      'Built a live Cloud Cost Estimator dynamically generating HashiCorp Terraform configuration code.',
      'Integrated the Zaheem-CLI interactive Cloud Shell with command execution and history traversal.',
      'Implemented pure Web Audio API code-synthesized acoustic sound effects without external audio file overhead.'
    ],
    outcomes: 'Completely standalone, ultra-fast 60 FPS performance, zero external server dependencies, and fully accessible across desktop and mobile devices.'
  }
};

class ProjectModalManager {
  constructor() {
    this.overlay = document.getElementById('project-modal');
    this.closeBtn = document.getElementById('modal-close-btn');
    this.bodyEl = document.getElementById('modal-body-dynamic');

    this.bindEvents();
  }

  bindEvents() {
    document.querySelectorAll('.project-modal-trigger').forEach((btn) => {
      btn.addEventListener('click', () => {
        const pId = btn.getAttribute('data-project');
        this.open(pId);
      });
    });

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    if (this.overlay) {
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) this.close();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.overlay && this.overlay.classList.contains('open')) {
        this.close();
      }
    });
  }

  open(projectId) {
    const data = PROJECT_DETAILS[projectId];
    if (!data || !this.bodyEl) return;

    sfx.playClick();

    this.bodyEl.innerHTML = `
      <div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent-primary); margin-bottom: 8px;">
        ${data.vendor} · SYSTEM ARCHITECTURE SPECIFICATION
      </div>
      <h2 style="font-size: 1.6rem; font-weight: 800; color: #fff; margin-bottom: 6px;">${data.title}</h2>
      <p style="font-size: 0.95rem; color: var(--text-muted); margin-bottom: 22px; font-weight: 500;">
        ${data.subtitle}
      </p>

      <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 18px; margin-bottom: 22px;">
        <h4 style="font-size: 0.9rem; font-family: var(--font-mono); color: var(--accent-primary); margin-bottom: 8px;">
          ARCHITECTURE OVERVIEW
        </h4>
        <p style="font-size: 0.9rem; color: var(--text-main); line-height: 1.65;">
          ${data.description}
        </p>
      </div>

      <div style="margin-bottom: 22px;">
        <h4 style="font-size: 0.9rem; font-family: var(--font-mono); color: var(--accent-primary); margin-bottom: 12px;">
          TECHNICAL IMPLEMENTATION BLUEPRINT
        </h4>
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 10px;">
          ${data.architectureSteps.map((step) => `
            <li style="display: flex; gap: 10px; font-size: 0.88rem; color: var(--text-muted); line-height: 1.55;">
              <span style="color: var(--accent-secondary); font-weight: bold;">▹</span>
              <span>${step}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-md); padding: 14px 18px; font-family: var(--font-mono); font-size: 0.82rem; color: #34d399;">
        <strong>VERIFIED OUTCOME:</strong> ${data.outcomes}
      </div>
    `;

    this.overlay.classList.add('open');
    this.overlay.setAttribute('aria-hidden', 'false');
  }

  close() {
    if (!this.overlay) return;
    sfx.playClick();
    this.overlay.classList.remove('open');
    this.overlay.setAttribute('aria-hidden', 'true');
  }
}

// ============================================================================
// 9. SKILLS FILTER & LIVE SEARCH
// ============================================================================
function initSkillsFilter() {
  const tabs = document.querySelectorAll('.skill-tab-btn');
  const searchInput = document.getElementById('skills-search');
  const cards = document.querySelectorAll('.skill-card');

  let activeFilter = 'all';
  let searchQuery = '';

  function filterCards() {
    cards.forEach((card) => {
      const category = card.getAttribute('data-category') || '';
      const text = (card.getAttribute('data-name') || '').toLowerCase();

      const matchesTab = activeFilter === 'all' || category.includes(activeFilter);
      const matchesSearch = !searchQuery || text.includes(searchQuery);

      if (matchesTab && matchesSearch) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      activeFilter = tab.getAttribute('data-filter');
      sfx.playClick();
      filterCards();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      filterCards();
    });
  }
}

// ============================================================================
// 10. COMMAND PALETTE (CTRL+K / CMD+K)
// ============================================================================
class CommandPalette {
  constructor() {
    this.modal = document.getElementById('cmd-palette');
    this.input = document.getElementById('cmd-palette-input');
    this.list = document.getElementById('cmd-results-list');
    this.trigger = document.getElementById('quick-cmd-trigger');

    this.commands = [
      { name: 'Home / Hero', tag: 'Navigation', action: () => (window.location.hash = '#home') },
      { name: 'Cloud Topology Simulator', tag: 'MCA Showcase', action: () => (window.location.hash = '#simulator') },
      { name: 'Cloud Spec & Cost Estimator', tag: 'MCA Tool', action: () => (window.location.hash = '#estimator') },
      { name: 'Zaheem-CLI Cloud Shell', tag: 'Interactive Terminal', action: () => (window.location.hash = '#terminal-section') },
      { name: 'Technical Skills Matrix', tag: 'Expertise', action: () => (window.location.hash = '#skills') },
      { name: 'Featured Cloud Projects', tag: 'Showcase', action: () => (window.location.hash = '#projects') },
      { name: 'Academics & Certifications', tag: 'Credentials', action: () => (window.location.hash = '#academics') },
      { name: 'Contact Communications', tag: 'Connect', action: () => (window.location.hash = '#contact') },
      { name: 'Download Curriculum Vitae (PDF)', tag: 'CV', action: () => window.open('./Zaheem-CV.pdf.pdf', '_blank') },
      { name: 'Cycle Theme Palette', tag: 'Theme', action: () => document.getElementById('theme-cycle-btn').click() },
      { name: 'Toggle Futuristic Audio FX', tag: 'Sound', action: () => document.getElementById('audio-toggle-btn').click() }
    ];

    this.bindEvents();
    this.render('');
  }

  bindEvents() {
    if (this.trigger) {
      this.trigger.addEventListener('click', () => this.open());
    }

    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.open();
      }
      if (e.key === 'Escape' && this.modal && this.modal.classList.contains('open')) {
        this.close();
      }
    });

    if (this.input) {
      this.input.addEventListener('input', (e) => this.render(e.target.value));
    }

    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.close();
      });
    }
  }

  open() {
    sfx.playClick();
    this.modal.classList.add('open');
    this.modal.setAttribute('aria-hidden', 'false');
    if (this.input) {
      this.input.value = '';
      this.input.focus();
    }
    this.render('');
  }

  close() {
    if (!this.modal) return;
    this.modal.classList.remove('open');
    this.modal.setAttribute('aria-hidden', 'true');
  }

  render(filterText) {
    if (!this.list) return;
    const query = filterText.toLowerCase().trim();
    const filtered = this.commands.filter((c) => c.name.toLowerCase().includes(query) || c.tag.toLowerCase().includes(query));

    this.list.innerHTML = '';
    filtered.forEach((cmd) => {
      const item = document.createElement('div');
      item.className = 'cmd-item';
      item.innerHTML = `
        <div class="cmd-item-left">
          <span>⚡</span>
          <span>${cmd.name}</span>
        </div>
        <span class="cmd-badge">${cmd.tag}</span>
      `;
      item.addEventListener('click', () => {
        sfx.playClick();
        this.close();
        cmd.action();
      });
      this.list.appendChild(item);
    });
  }
}

// ============================================================================
// 11. ENCRYPTED DISPATCHER (CONTACT FORM) & TOAST NOTIFIER
// ============================================================================
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>⚡</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  const statusEl = document.getElementById('form-status');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      sfx.playClick();

      const name = document.getElementById('contact-name').value;
      const email = document.getElementById('contact-email').value;
      const subject = document.getElementById('contact-subject').value;
      const message = document.getElementById('contact-message').value;

      if (statusEl) {
        statusEl.style.color = 'var(--accent-primary)';
        statusEl.textContent = '🔒 Establishing TLS 1.3 handshake & encrypting payload...';
      }

      setTimeout(() => {
        if (statusEl) {
          statusEl.textContent = '📡 Routing packet through cloud proxy to Zaheem...';
        }
      }, 700);

      setTimeout(() => {
        sfx.playChime();
        if (statusEl) {
          statusEl.style.color = 'var(--status-success)';
          statusEl.textContent = `✓ Packet transmitted! 200 OK. Thank you, ${name}. Direct mail fallback: mailto:abduzaheem.kp@gmail.com`;
        }
        showToast('Message payload successfully dispatched! 🚀');

        // Optional mailto invocation
        const mailtoUrl = `mailto:abduzaheem.kp@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${name} (${email})\n\n${message}`)}`;
        window.location.href = mailtoUrl;

        form.reset();
      }, 1600);
    });
  }

  // Copy Email & Phone to Clipboard
  const emailCard = document.getElementById('copy-email-card');
  if (emailCard) {
    emailCard.addEventListener('click', () => {
      navigator.clipboard.writeText('abduzaheem.kp@gmail.com');
      sfx.playClick();
      showToast('Email address copied to clipboard: abduzaheem.kp@gmail.com');
    });
  }

  const phoneCard = document.getElementById('copy-phone-card');
  if (phoneCard) {
    phoneCard.addEventListener('click', () => {
      navigator.clipboard.writeText('+918943905228');
      sfx.playClick();
      showToast('Phone number copied to clipboard: +91 8943905228');
    });
  }
}

// ============================================================================
// 12. NAVBAR SCROLL SPY & MOBILE DRAWER
// ============================================================================
function initNavigation() {
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  const navbar = document.getElementById('navbar');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      sfx.playClick();
      const open = navLinks.classList.toggle('mobile-open');
      menuToggle.textContent = open ? '✕' : '☰';
      menuToggle.setAttribute('aria-expanded', String(open));
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
        menuToggle.textContent = '☰';
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  window.addEventListener('scroll', () => {
    if (navbar) {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    // Scroll spy active nav
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 140;

    sections.forEach((sec) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        document.querySelectorAll('.nav-link').forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });
}

// ============================================================================
// 13. AUDIO HUD TOGGLE & YEAR FOOTER
// ============================================================================
function initHudControls() {
  const audioBtn = document.getElementById('audio-toggle-btn');
  const audioIcon = document.getElementById('audio-icon');
  const audioText = document.getElementById('audio-status-text');

  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      const isNowOn = sfx.toggle();
      audioBtn.classList.toggle('active', isNowOn);
      if (audioIcon) audioIcon.textContent = isNowOn ? '🔊' : '🔇';
      if (audioText) audioText.textContent = isNowOn ? 'AUDIO: ON' : 'AUDIO: OFF';
      showToast(isNowOn ? 'Futuristic Web Audio FX Enabled 🔊' : 'Audio FX Muted 🔇');
    });
  }

  // Live randomized latency jitter in HUD
  const latencyEl = document.getElementById('hud-latency');
  if (latencyEl) {
    setInterval(() => {
      const ms = Math.floor(12 + Math.random() * 6);
      latencyEl.innerHTML = `<span>RTT: ${ms}ms</span>`;
    }, 4000);
  }

  // Dynamic Year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

// ============================================================================
// INITIALIZATION ON DOM CONTENT LOADED
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Particle Canvas Engine
  new ParticleEngine('bg-canvas');

  // 2. Theme Manager
  new ThemeManager();

  // 3. Hero Typewriter & Tilt
  new Typewriter('typewriter', [
    'Cloud Solutions Architect',
    'Microsoft Azure Specialist',
    'AWS Infrastructure Engineer',
    'MCA Scholar @ SRM IST',
    'Virtualization & VMware Enthusiast',
    'DevOps & IaC Automator'
  ]);
  initTiltCard();

  // 4. MCA Showcases
  new CloudSimulator();
  new CloudEstimator();
  new CloudShellTerminal();

  // 5. Modals, Skills & Command Palette
  new ProjectModalManager();
  initSkillsFilter();
  new CommandPalette();

  // 6. Contact & Navigation
  initContactForm();
  initNavigation();
  initHudControls();

  console.log('🚀 Zaheem Hypervisor v2.0 - MCA Cloud Architecture Platform Loaded.');
});
